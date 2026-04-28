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
    const { email, password, tenant_id } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    try {
        // Check if user exists
        const existing = await query('SELECT uid FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        // Determine role: admin if first user, else user
        const userCountRes = await query('SELECT count(*) FROM users');
        const isFirstUser = parseInt(userCountRes.rows[0].count) === 0;
        const assignedRole = isFirstUser ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const uid = crypto.randomUUID();
        const finalTenantId = tenant_id || crypto.randomUUID(); // From request or fallback
        // As requested: INSERT INTO users (email, password, uid, tenant_id, role) VALUES ($1, $2, $3, $4, $5)
        // We include id since the schema requires a UUID primary key without default specified in user prompt
        await query(`INSERT INTO users (id, email, password, uid, tenant_id, role) 
       VALUES ($1, $2, $3, $4, $5, $6)`, [crypto.randomUUID(), email, hashedPassword, uid, finalTenantId, assignedRole]);
        const user = { uid, email, role: assignedRole, tenant_id: finalTenantId };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, token, user, message: "Registration successful" });
    }
    catch (error) {
        console.error('[Auth Register Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Login logic
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    try {
        // Exact requested query
        const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const dbUser = rows[0];
        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const user = {
            uid: dbUser.uid,
            email: dbUser.email,
            role: dbUser.role,
            tenant_id: dbUser.tenant_id
        };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, message: "Login successful", token, user });
    }
    catch (error) {
        console.error('[Auth Login Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    res.json({ success: true, data: req.user });
});
router.put('/role', authenticateToken, async (req, res) => {
    const { role } = req.body;
    try {
        await query('UPDATE users SET role = $1 WHERE uid = $2', [role, req.user.uid]);
        res.json({ success: true, data: { role } });
    }
    catch (err) {
        console.error('[Auth Role Update Error]:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router;
