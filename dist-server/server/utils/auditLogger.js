import { query } from '../db/index.js';
import logger from './logger.js';
export const logAuditAction = async (data) => {
    try {
        await query('INSERT INTO audit_logs (action, user_id, tenant_id, role, details) VALUES ($1, $2, $3, $4, $5)', [data.action, data.userId, data.tenantId, data.role, typeof data.details === 'string' ? data.details : JSON.stringify(data.details)]);
    }
    catch (error) {
        logger.error('Failed to write audit log to Postgres:', { error });
    }
};
