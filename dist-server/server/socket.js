import jwt from 'jsonwebtoken';
import { query } from './db/index.js';
import logger from './utils/logger.js';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key-change-in-prod';
let ioInstance;
export const setupSocket = (io) => {
    ioInstance = io;
    // Middleware for authenticating socket connections
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            if (process.env.NODE_ENV === 'development' && socket.handshake.auth.mockTenantId) {
                socket.data.user = { tenantId: socket.handshake.auth.mockTenantId };
                return next();
            }
            return next(new Error('Authentication error'));
        }
        try {
            const decodedUser = jwt.verify(token, JWT_SECRET);
            const { rows } = await query('SELECT * FROM users WHERE uid = $1', [decodedUser.uid]);
            if (rows.length === 0) {
                if (process.env.NODE_ENV !== 'production') {
                    socket.data.user = { ...decodedUser, tenantId: decodedUser.tenantId || 'mock-tenant' };
                    return next();
                }
                return next(new Error('User not found in DB'));
            }
            socket.data.user = { ...decodedUser, tenantId: rows[0].tenant_id };
            next();
        }
        catch (err) {
            logger.error('Socket auth failed', { error: err });
            return next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const tenantId = socket.data.user?.tenantId;
        // Join tenant-specific room for isolated real-time updates
        if (tenantId) {
            socket.join(`tenant_${tenantId}`);
            logger.info(`Socket connected: ${socket.id} (Tenant: ${tenantId})`);
        }
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
};
/**
 * Emit an event to a specific tenant
 */
export const emitToTenant = (tenantId, event, data) => {
    if (ioInstance) {
        ioInstance.to(`tenant_${tenantId}`).emit(event, data);
    }
};
