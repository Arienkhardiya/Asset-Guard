import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
// Mock User Data as per user request
const MOCK_USER = {
    id: "1",
    uid: "1",
    email: "test@demo.com",
    role: "Admin",
    tenantId: "mock-tenant-id",
    tenantType: "Organization",
    tenantName: "Demo Org"
};
// Simple register logic (returns mock)
router.post('/register', async (req, res) => {
    res.json({ token: "mock-token", user: MOCK_USER });
});
// Mock login logic
router.post('/login', async (req, res) => {
    res.json({ token: "mock-token", user: MOCK_USER });
});
// Mock /me logic
router.get('/me', authenticateToken, async (req, res) => {
    res.json(MOCK_USER);
});
router.put('/role', authenticateToken, async (req, res) => {
    res.json({ success: true });
});
export default router;
