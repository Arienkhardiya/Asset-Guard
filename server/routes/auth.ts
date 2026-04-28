import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { adminAuth } from '../config/firebase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key-change-in-prod';

// Pseudo-login logic. In reality, you'd hash passwords with bcrypt.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Fetch user from DB
    const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    
    // Fallback Mock Authentication for preview and testing without actual DB seed
    let user;
    if (rows.length === 0) {
      if (email && password) {
        user = {
          uid: 'mock-user-123',
          email: email,
          role: email.includes('admin') ? 'Admin' : 'Cybersecurity Analyst',
          tenantId: 'tenant-1',
          tenantType: 'Organization'
        };
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
    } else {
      user = rows[0];
      // Compare password (use bcrypt in prod)
    }

    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email, 
        role: user.role, 
        tenantId: user.tenantId,
        tenantType: user.tenantType
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync Firebase user to PostgreSQL
router.post('/sync', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { email, role, tenantType, tenantName, tenantId } = req.body;
    
    const uid = decodedToken.uid;
    const finalEmail = email || decodedToken.email;
    
    // Check if user exists
    const { rows } = await query('SELECT * FROM users WHERE uid = $1', [uid]);
    
    if (rows.length === 0) {
      // Insert
      await query(
        `INSERT INTO users (uid, email, role, tenant_id, tenant_type) 
         VALUES ($1, $2, $3, $4, $5)`,
        [uid, finalEmail, role, tenantId, tenantType]
      );
    } else {
      // If logging in, just return success
    }
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { rows } = await query('SELECT * FROM users WHERE uid = $1', [decodedToken.uid]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];
    res.json({
      uid: user.uid,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      tenantType: user.tenant_type
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/role', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { role } = req.body;
    await query('UPDATE users SET role = $1 WHERE uid = $2', [role, decodedToken.uid]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
