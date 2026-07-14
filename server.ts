import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs/promises';
import { getFirebaseAdmin } from './src/lib/firebase-admin';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface DbState {
  records: any[];
  config: {
    id: string;
    companyName: string;
    companyPhone: string;
    companyEmail: string;
    companyCnpj: string;
    theme: string;
  };
}

const DEFAULT_DB: DbState = {
  records: [],
  config: {
    id: 'default',
    companyName: 'Lori-TI Solutions',
    companyPhone: '(11) 98525-8655',
    companyEmail: 'loritisolutions@gmail.com',
    companyCnpj: '59.914.130/0001-82',
    theme: 'light'
  }
};

async function loadDb(): Promise<DbState> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If not found or error, write and return default
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

async function saveDb(state: DbState) {
  await fs.writeFile(DB_FILE, JSON.stringify(state, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Ensure DB gets initialized
  await loadDb();

  // --- API Routes ---

  // Records CRUD
  app.get('/api/records', async (req, res) => {
    try {
      const dbState = await loadDb();
      // Sort records by dateCreated descending (or UUID/IDs if missing)
      const sortedRecords = [...dbState.records].sort((a, b) => {
        const dateA = a.dateCreated || '';
        const dateB = b.dateCreated || '';
        return dateB.localeCompare(dateA);
      });
      res.json(sortedRecords);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  });

  app.post('/api/records', async (req, res) => {
    const r = req.body;
    try {
      const dbState = await loadDb();
      dbState.records.push(r);
      await saveDb(dbState);
      res.status(201).json(r);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create record' });
    }
  });

  app.put('/api/records/:id', async (req, res) => {
    const { id } = req.params;
    const r = req.body;
    try {
      const dbState = await loadDb();
      const index = dbState.records.findIndex(x => x.id === id);
      if (index !== -1) {
        dbState.records[index] = { ...dbState.records[index], ...r };
        await saveDb(dbState);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update record' });
    }
  });

  app.delete('/api/records/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const dbState = await loadDb();
      dbState.records = dbState.records.filter(x => x.id !== id);
      await saveDb(dbState);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  });

  // Config routes
  app.get('/api/config', async (req, res) => {
    try {
      const dbState = await loadDb();
      res.json(dbState.config);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  });

  app.put('/api/config', async (req, res) => {
    const c = req.body;
    try {
      const dbState = await loadDb();
      dbState.config = { ...dbState.config, ...c };
      await saveDb(dbState);
      res.json(dbState.config);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update config' });
    }
  });

  // --- Vite & SPA Handling ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
