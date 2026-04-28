import { Server, Socket } from 'socket.io';
import { adminAuth } from './config/firebase.js';
import { query } from './db/index.js';
import logger from './utils/logger.js';

let ioInstance: Server;

export const setupSocket = (io: Server) => {
  ioInstance = io;
  
  // Middleware for authenticating socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      // In dev with mock tests, we allow bypassing, else error
      if (process.env.NODE_ENV === 'development' && socket.handshake.auth.mockTenantId) {
        socket.data.user = { tenantId: socket.handshake.auth.mockTenantId };
        return next();
      }
      return next(new Error('Authentication error'));
    }
    
    try {
      const decodedUser = await adminAuth.verifyIdToken(token);
      const { rows } = await query('SELECT * FROM users WHERE uid = $1', [decodedUser.uid]);
      if (rows.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          socket.data.user = { ...decodedUser, tenantId: 'mock-tenant' };
          return next();
        }
        return next(new Error('User not found in DB'));
      }
      socket.data.user = { ...decodedUser, tenantId: rows[0].tenant_id };
      next();
    } catch (err) {
      logger.error('Socket auth failed', { error: err });
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
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
export const emitToTenant = (tenantId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`tenant_${tenantId}`).emit(event, data);
  }
};
