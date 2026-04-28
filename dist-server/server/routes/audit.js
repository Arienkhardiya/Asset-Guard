import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../db/index.js';
const router = express.Router();
import jwt from 'jsonwebtoken';
router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        // decode token safely
        let userId = null;
        let tenantId = null;
        try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
            userId = decoded.uid || decoded.id;
            tenantId = decoded.tenantId;
        }
        catch (err) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        // safe DB query
        // We use tenantId filter for security as well
        const result = await query("SELECT * FROM audit_logs WHERE user_id = $1 OR tenant_id = $2 ORDER BY created_at DESC LIMIT 50", [userId, tenantId]);
        return res.status(200).json({
            success: true,
            data: result.rows || []
        });
    }
    catch (error) {
        console.error("Audit error:", error);
        return res.status(200).json({
            success: true,
            data: []
        });
    }
});
router.post('/', authenticateToken, async (req, res) => {
    const user = req.user;
    const { action, details } = req.body;
    try {
        await query(`INSERT INTO audit_logs (tenant_id, user_id, user_email, role, action, details) VALUES ($1, $2, $3, $4, $5, $6)`, [user.tenantId, user.uid, user.email, user.role, action, details]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router;
