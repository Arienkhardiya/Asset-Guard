import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let projectId = process.env.FIREBASE_PROJECT_ID;

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    projectId = config.projectId;
  }
} catch (e) {
  console.error('Could not read firebase-applet-config.json', e);
}

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id
      });
    } else {
      admin.initializeApp({
        projectId: projectId || 'ais-development'
      });
    }
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
