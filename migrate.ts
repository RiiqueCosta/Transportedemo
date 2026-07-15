import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('Error: POSTGRES_URL or POSTGRES_URL_NON_POOLING environment variable is not defined.');
  process.exit(1);
}

const { Client } = pg;

async function runMigration() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected to database.');

    // 1. Create Table (if not exists)
    console.log('Creating "notes" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title TEXT NOT NULL
      );
    `);
    console.log('"notes" table created or already existed.');

    // 2. Check if table is empty, if so, insert sample data
    const countRes = await client.query('SELECT COUNT(*) FROM notes;');
    const count = parseInt(countRes.rows[0].count, 10);
    
    if (count === 0) {
      console.log('Seeding initial sample data...');
      await client.query(`
        INSERT INTO notes (title)
        VALUES
          ('Today I created a Supabase project.'),
          ('I added some data and queried it from Next.js.'),
          ('It was awesome!');
      `);
      console.log('Sample data seeded successfully.');
    } else {
      console.log('Table already has data. Skipping seed.');
    }

    // 3. Enable RLS
    console.log('Enabling Row Level Security...');
    await client.query(`
      ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    `);
    console.log('Row Level Security enabled.');

    // 4. Create Policy
    console.log('Creating policy "public can read notes" if not exists...');
    // We run this in a try/catch in case the policy already exists to avoid throwing an error
    try {
      await client.query(`
        CREATE POLICY "public can read notes"
        ON public.notes
        FOR SELECT TO anon
        USING (true);
      `);
      console.log('Policy created successfully.');
    } catch (policyErr: any) {
      if (policyErr.message && policyErr.message.includes('already exists')) {
        console.log('Policy already exists. Skipping.');
      } else {
        console.warn('Non-fatal warning creating policy:', policyErr.message);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
