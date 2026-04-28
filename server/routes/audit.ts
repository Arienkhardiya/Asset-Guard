import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const user = req.user!;
  try {
    let result;
    if (user.role === 'Admin') {
      result = await query('SELECT * FROM audit_logs WHERE tenant_id = $1 ORDER BY timestamp DESC LIMIT 50', [user.tenantId]);
    } else {
      result = await query('SELECT * FROM audit_logs WHERE tenant_id = $1 AND user_id = $2 ORDER BY timestamp DESC LIMIT 20', [user.tenantId, user.uid]);
    }
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const user = req.user!;
  const { action, details } = req.body;
  try {
    await query(
      `INSERT INTO audit_logs (tenant_id, user_id, user_email, role, action, details) VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.tenantId, user.uid, user.email, user.role, action, details]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
