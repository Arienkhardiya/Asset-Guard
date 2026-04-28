import { adminDb } from '../config/firebase.js';
import logger from './logger.js';

interface AuditLog {
  action: string;
  userId: string;
  tenantId: string;
  role: string;
  details?: Record<string, any>;
}

export const logAuditAction = async (data: AuditLog) => {
  try {
    if (!adminDb) return;
    
    await adminDb.collection('audit_logs').add({
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to write audit log to Firestore:', { error });
  }
};
