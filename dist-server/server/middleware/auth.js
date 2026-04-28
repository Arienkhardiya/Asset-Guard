import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import logger from '../utils/logger.js';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key-change-in-prod';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        if (process.env.NODE_ENV === 'development' && req.headers['x-user-id']) {
            req.user = {
                uid: req.headers['x-user-id'],
                email: req.headers['x-user-email'] || 'mock@example.com',
                role: req.headers['x-user-role'] || 'Admin',
                tenantId: req.headers['x-tenant-id'] || 'mock-tenant',
                tenantType: req.headers['x-tenant-type'] || 'Organization'
            };
            return next();
        }
        res.status(401).json({ error: 'Unauthorized: Missing token' });
        return;
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        // Once verified, get user details from PostgreSQL to respect tenant bounds
        const { rows } = await query('SELECT * FROM users WHERE uid = $1', [decodedToken.uid]);
        if (rows.length === 0) {
            if (process.env.NODE_ENV !== 'production') {
                // Fallback for sandboxed preview when DB isn't seeded/reachable
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email || 'mock@example.com',
                    role: decodedToken.role || 'Admin',
                    tenantId: decodedToken.tenantId || 'mock-tenant',
                    tenantType: decodedToken.tenantType || 'Organization'
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
    }
    catch (error) {
        logger.error('Authentication error', { error: error.message });
        res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient clearance' });
            return;
        }
        next();
    };
};
