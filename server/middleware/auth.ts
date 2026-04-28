import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import logger from '../utils/logger.js';



export interface AuthRequest extends Request {
  user?: {
    id: string;
    uid: string;
    email: string;
    role: string;
    tenantId: string;
    tenantType?: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(200).json({
      success: true,
      demo: true
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = decoded;
    next();
  } catch (error: any) {
    logger.error('JWT Verification failed', { error: error.message });
    res.status(200).json({
      success: true,
      demo: true
    });
  }
};
