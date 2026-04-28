import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key-change-in-prod';

// Simple register logic
router.post('/register', async (req, res) => {
  const { email, password, role, tenantName, tenantType } = req.body;
  try {
    const uid = crypto.randomUUID();
    const tenantId = crypto.randomUUID();
    
    await query(
      `INSERT INTO users (uid, email, role, tenant_id, tenant_type) 
       VALUES ($1, $2, $3, $4, $5)`,
      [uid, email, role || 'Cybersecurity Analyst', tenantId, tenantType || 'Organization']
    );
    
    const token = jwt.sign(
      { uid, email, role: role || 'Cybersecurity Analyst', tenantId, tenantType: tenantType || 'Organization' }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { uid, email, role, tenantId, tenantType } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pseudo-login logic. 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Fetch user from DB
    const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    
    let user;
    if (rows.length === 0) {
      // Auto-register for mock/preview purposes if user doesn't exist
      const uid = crypto.randomUUID();
      const tenantId = crypto.randomUUID();
      const role = email.includes('admin') ? 'Admin' : 'Cybersecurity Analyst';
      const tenantType = 'Organization';

      await query(
        `INSERT INTO users (uid, email, role, tenant_id, tenant_type) 
         VALUES ($1, $2, $3, $4, $5)`,
        [uid, email, role, tenantId, tenantType]
      );

      user = { uid, email, role, tenantId, tenantType };
    } else {
      const dbUser = rows[0];
      user = {
        uid: dbUser.uid,
        email: dbUser.email,
        role: dbUser.role,
        tenantId: dbUser.tenant_id,
        tenantType: dbUser.tenant_type
      };
    }

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  res.json(req.user);
});

router.put('/role', authenticateToken, async (req: AuthRequest, res) => {
  const { role } = req.body;
  try {
    await query('UPDATE users SET role = $1 WHERE uid = $2', [role, req.user!.uid]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
