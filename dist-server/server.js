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
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
    const app = express();
    const PORT = process.env.PORT || 8080;
    const httpServer = createServer(app);
    // Set up socket.io
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    setupSocket(io);
    app.set('trust proxy', 1);
    // API Logging Middleware
    app.use((req, res, next) => {
        console.log(`[API CALL] ${req.method} ${req.url}`);
        next();
    });
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    app.use(cors({ origin: "*" }));
    app.use(express.json({ limit: '10mb' }));
    // Rate Limiting
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000, // Increased for stability
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, error: 'Too many requests, please try again later.' },
        validate: { xForwardedForHeader: false }
    });
    app.use('/api/', apiLimiter);
    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/scan', scanRoutes);
    app.use('/api/actions', actionRoutes);
    app.use('/api/audit', auditRoutes);
    // Health check
    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'ok', service: 'AssetGuard AI' });
    });
    app.get('/health', (req, res) => {
        res.status(200).send("OK");
    });
    // Serve Frontend Static Files
    // In development (tsx), __dirname is root. In production (dist-server), __dirname is dist-server.
    const distPath = path.join(__dirname, fs.existsSync(path.join(__dirname, 'dist')) ? 'dist' : '../dist');
    app.use(express.static(distPath));
    app.get('/', (req, res, next) => {
        if (fs.existsSync(path.join(distPath, 'index.html'))) {
            return next(); // Let the catch-all handle it
        }
        res.send("Backend running");
    });
    // Catch-all for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
    // Global Error Handler
    app.use((err, req, res, next) => {
        logger.error('Unhandled exception', { error: err.message, stack: err.stack });
        res.status(500).json({ error: 'Internal Server Error' });
    });
    httpServer.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running on port ${PORT}`);
    });
}
startServer().catch((err) => logger.error('Server failed to start', { error: err }));
