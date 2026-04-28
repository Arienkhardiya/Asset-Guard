import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
const SALT_ROUNDS = 10;
const DEMO_USERS = [
    {
        id: "demo-1",
        uid: "demo-1",
        email: "admin@demo.com",
        password: "123456",
        role: "admin",
        tenantId: "ipl"
    },
    {
        id: "demo-2",
        uid: "demo-2",
        email: "analyst@demo.com",
        password: "123456",
        role: "analyst",
        tenantId: "ipl"
    }
];
// Register logic
router.post('/register', async (req, res) => {
    res.json({
        success: true,
        message: "Demo mode active. Use demo login (admin@demo.com / 123456)."
    });
});
// Login logic
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // 🔥 DEMO MODE CHECK
        const user = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (user) {
            const token = jwt.sign({
                id: user.id,
                uid: user.uid,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId
            }, process.env.JWT_SECRET, { expiresIn: "1d" });
            return res.json({
                success: true,
                token,
                user
            });
        }
        // fallback (optional real DB)
        const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length > 0) {
            const dbUser = rows[0];
            const isMatch = await bcrypt.compare(password, dbUser.password);
            if (isMatch) {
                const payload = {
                    uid: dbUser.uid,
                    email: dbUser.email,
                    role: dbUser.role,
                    tenantId: dbUser.tenant_id
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
                return res.status(200).json({ success: true, message: "Login successful", token, user: payload });
            }
        }
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
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
