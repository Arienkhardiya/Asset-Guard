import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
const SALT_ROUNDS = 10;
const DEMO_USERS = [
    {
        id: "demo-admin-id",
        uid: "demo-admin-uid",
        email: "demo@assetguard.ai",
        password: "demo123",
        role: "admin",
        tenantId: "demo-tenant"
    }
];
// Register logic
router.post('/register', async (req, res) => {
    res.json({
        success: true,
        message: "Demo mode active. Use demo login (admin@demo.com / 123456)."
    });
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. 🔥 DEMO MODE CHECK (ALWAYS WORKS)
        const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (demoUser) {
            const token = jwt.sign({
                id: demoUser.id,
                uid: demoUser.uid,
                email: demoUser.email,
                role: demoUser.role,
                tenantId: demoUser.tenantId
            }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.status(200).json({
                success: true,
                token,
                user: demoUser
            });
        }
        // 2. REAL DB ATTEMPT
        try {
            const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
            if (rows.length > 0) {
                const dbUser = rows[0];
                const isMatch = await bcrypt.compare(password, dbUser.password);
                if (isMatch) {
                    const payload = {
                        id: dbUser.id || dbUser.uid,
                        uid: dbUser.uid,
                        email: dbUser.email,
                        role: dbUser.role,
                        tenantId: dbUser.tenant_id
                    };
                    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
                    return res.status(200).json({
                        success: true,
                        message: "Login successful",
                        token,
                        user: payload
                    });
                }
            }
        }
        catch (dbErr) {
            console.error("[DB Login Error - Falling back]:", dbErr);
            // If DB fails, we still checked demo above, so we just continue to 401
        }
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }
    catch (err) {
        console.error("[Global Login Error]:", err);
        return res.status(500).json({
            success: false,
            message: "Authentication server error"
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
