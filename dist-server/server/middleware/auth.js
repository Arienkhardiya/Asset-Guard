import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import logger from '../utils/logger.js';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-production-key-change-this';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Verify user still exists in DB
        const { rows } = await query('SELECT uid, email, role, tenant_id, tenant_type FROM users WHERE uid = $1', [decoded.uid]);
        if (rows.length === 0) {
            res.status(401).json({ error: 'Unauthorized: User no longer exists' });
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
    }
    catch (error) {
        logger.error('JWT Verification failed', { error: error.message });
        res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
