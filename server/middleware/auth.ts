import { Request, Response, NextFunction } from 'express';

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

/**
 * TEMPORARILY DISABLED AUTH FOR DEBUGGING
 * Allows all requests and attaches a mock user.
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Attach mock user as requested
  req.user = {
    id: "1",
    uid: "1",
    email: "test@demo.com",
    role: "Admin",
    tenantId: "mock-tenant-id",
    tenantType: "Organization"
  };
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Temporarily bypass role checks
    next();
  };
};
