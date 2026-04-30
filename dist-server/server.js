import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/auth.js';
import scanRoutes from './server/routes/scan.js';
import actionRoutes from './server/routes/actions.js';
import auditRoutes from './server/routes/audit.js';
import { setupSocket } from './server/socket.js';
import logger from './server/utils/logger.js';
dotenv.config();
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
});
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
    const app = express();
    // 🔥 FIX: convert PORT to number
    const PORT = Number(process.env.PORT) || 8080;
    console.log("🚀 Starting server...");
    const httpServer = createServer(app);
    // Socket.IO
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    setupSocket(io);
    app.set('trust proxy', 1);
    // Logging
    app.use((req, res, next) => {
        console.log(`[API] ${req.method} ${req.url}`);
        next();
    });
    // Security
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json({ limit: '10mb' }));
    // Rate limit
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api/', limiter);
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/scan', scanRoutes);
    app.use('/api/actions', actionRoutes);
    app.use('/api/audit', auditRoutes);
    // Health
    app.get('/health', (req, res) => {
        res.send("OK");
    });
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok' });
    });
    // Static
    const distPath = path.join(__dirname, fs.existsSync(path.join(__dirname, 'dist')) ? 'dist' : '../dist');
    app.use(express.static(distPath));
    // Root
    app.get('/', (req, res) => {
        if (fs.existsSync(path.join(distPath, 'index.html'))) {
            return res.sendFile(path.join(distPath, 'index.html'));
        }
        return res.send("Backend running 🚀");
    });
    // SPA fallback
    app.get('*', (req, res) => {
        if (fs.existsSync(path.join(distPath, 'index.html'))) {
            return res.sendFile(path.join(distPath, 'index.html'));
        }
        return res.status(404).send("Not Found");
    });
    // Error handler
    app.use((err, req, res, next) => {
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    });
    // ✅ FIXED LISTEN
    httpServer.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running on port ${PORT}`);
        console.log(`✅ Running on port ${PORT}`);
    });
}
startServer().catch((err) => {
    console.error("❌ Failed to start server:", err);
});
