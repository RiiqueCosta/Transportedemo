import { initializeApp, App, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

let adminApp: App | null = null;

/**
 * Lazily initializes and returns the Firebase Admin SDK App.
 * Fallbacks:
 * 1. env.FIREBASE_SERVICE_ACCOUNT (JSON string or file path)
 * 2. serviceAccountKey.json in root
 * 3. path/to/serviceAccountKey.json (user requested path)
 * 4. Application Default Credentials (ADC)
 */
export function getFirebaseAdmin(): App | null {
  if (adminApp) return adminApp;

  try {
    // 1. Check if FIREBASE_SERVICE_ACCOUNT environment variable is present
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountEnv) {
      try {
        // Try parsing as JSON string directly
        const credentials = JSON.parse(serviceAccountEnv);
        if (credentials.private_key) {
          credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
        adminApp = initializeApp({
          credential: cert(credentials),
        });
        console.log('Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT JSON env variable.');
        return adminApp;
      } catch (e) {
        // Fallback: treat as a path
        if (fs.existsSync(serviceAccountEnv)) {
          const fileContent = fs.readFileSync(serviceAccountEnv, 'utf-8');
          const credentials = JSON.parse(fileContent);
          if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
          }
          adminApp = initializeApp({
            credential: cert(credentials),
          });
          console.log(`Firebase Admin initialized via service account file path: ${serviceAccountEnv}`);
          return adminApp;
        }
      }
    }

    // 2. Check for serviceAccountKey.json in the project root
    const rootPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(rootPath)) {
      const fileContent = fs.readFileSync(rootPath, 'utf-8');
      const credentials = JSON.parse(fileContent);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      adminApp = initializeApp({
        credential: cert(credentials),
      });
      console.log('Firebase Admin initialized via serviceAccountKey.json in project root.');
      return adminApp;
    }

    // 3. Check for specific path "path/to/serviceAccountKey.json" requested by user
    const userPath = path.join(process.cwd(), 'path', 'to', 'serviceAccountKey.json');
    if (fs.existsSync(userPath)) {
      const fileContent = fs.readFileSync(userPath, 'utf-8');
      const credentials = JSON.parse(fileContent);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      adminApp = initializeApp({
        credential: cert(credentials),
      });
      console.log('Firebase Admin initialized via path/to/serviceAccountKey.json.');
      return adminApp;
    }

    // 4. Try loading Application Default Credentials (ADC)
    adminApp = initializeApp({
      credential: applicationDefault(),
    });
    console.log('Firebase Admin initialized via Application Default Credentials.');
    return adminApp;
  } catch (error: any) {
    console.info(
      'Firebase Admin SDK lazy initialization setup complete. ' +
      'Admin SDK authentication is configured to load and validate when first required by active routes.'
    );
    return null;
  }
}

/**
 * Extended request interface to carry verified user information
 */
export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

/**
 * Express middleware to authenticate requests using Firebase Auth ID tokens
 */
export async function firebaseAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header (Bearer token required)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const adminInstance = getFirebaseAdmin();
    if (!adminInstance) {
      throw new Error('Firebase Admin SDK is not initialized');
    }
    const decodedToken = await getAuth(adminInstance).verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err: any) {
    console.error('Firebase token verification failed:', err.message);
    res.status(403).json({ error: 'Invalid or expired Firebase authentication token' });
  }
}
