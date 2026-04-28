import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-production-key-change-this';

export interface AuthRequest extends Request {
  user?: {
    id: string;
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
    res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists in DB
    const { rows } = await query(
      `SELECT u.uid, u.email, u.role, u.tenant_id, t.type as tenant_type 
       FROM users u 
       LEFT JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.uid = $1`, 
      [decoded.uid]
    );
    
    if (rows.length === 0) {
      res.status(401).json({ success: false, error: 'Unauthorized: User no longer exists' });
      return;
    }

    const user = rows[0];
    req.user = {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      tenantType: user.tenant_type
    };
    
    next();
  } catch (error: any) {
    logger.error('JWT Verification failed', { error: error.message });
    res.status(403).json({ success: false, error: 'Forbidden: Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};
