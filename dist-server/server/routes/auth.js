import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-production-key-change-this';
const SALT_ROUNDS = 10;
// Register logic
router.post('/register', async (req, res) => {
    const { email, password, role, tenantName, tenantType } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        // Check if user exists
        const existing = await query('SELECT uid FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const uid = crypto.randomUUID();
        const tenantId = crypto.randomUUID();
        await query(`INSERT INTO users (uid, email, password, role, tenant_id, tenant_type, tenant_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [uid, email, hashedPassword, role || 'Cybersecurity Analyst', tenantId, tenantType || 'Organization', tenantName || 'Default Tenant']);
        const user = { uid, email, role: role || 'Cybersecurity Analyst', tenantId, tenantType: tenantType || 'Organization' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Login logic
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const dbUser = rows[0];
        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = {
            uid: dbUser.uid,
            email: dbUser.email,
            role: dbUser.role,
            tenantId: dbUser.tenant_id,
            tenantType: dbUser.tenant_type
        };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    res.json(req.user);
});
router.put('/role', authenticateToken, async (req, res) => {
    const { role } = req.body;
    try {
        await query('UPDATE users SET role = $1 WHERE uid = $2', [role, req.user.uid]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
