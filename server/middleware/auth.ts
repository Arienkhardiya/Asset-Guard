import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase.js';
import { query } from '../db/index.js';
import logger from '../utils/logger.js';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
    tenantType: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    if (process.env.NODE_ENV === 'development' && req.headers['x-user-id']) {
      req.user = { 
        uid: req.headers['x-user-id'] as string, 
        email: req.headers['x-user-email'] as string || 'mock@example.com', 
        role: req.headers['x-user-role'] as string || 'Admin', 
        tenantId: req.headers['x-tenant-id'] as string || 'mock-tenant', 
        tenantType: req.headers['x-tenant-type'] as string || 'Organization' 
      };
      return next();
    }
    
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Once verified, get user details from PostgreSQL to respect tenant bounds
    const { rows } = await query('SELECT * FROM users WHERE uid = $1', [decodedToken.uid]);
    
    if (rows.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        // Fallback for sandboxed preview when DB isn't seeded/reachable
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || 'mock@example.com',
          role: 'Admin',
          tenantId: 'mock-tenant',
          tenantType: 'Organization'
        };
        return next();
      }
      res.status(403).json({ error: 'Forbidden: User identity not found in database' });
      return;
    }
    
    const userData = rows[0];
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      role: userData.role || 'Cybersecurity Analyst',
      tenantId: userData.tenant_id,
      tenantType: userData.tenant_type || 'Organization'
    };
    
    next();
  } catch (error: any) {
    logger.error('Authentication error', { error: error.message });
    res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient clearance' });
      return;
    }
    next();
  };
};
