import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 8080;
  
  const httpServer = createServer(app);
  
  const ALLOWED_ORIGINS = [
    "https://gen-lang-client-0817240706.web.app",
    "https://gen-lang-client-0817240706.firebaseapp.com",
    ...(process.env.NODE_ENV !== 'production' ? ["http://localhost:5173", "http://localhost:3000"] : [])
  ];

  // Set up socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
  setupSocket(io);

  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite dev server compatibility
  }));
  app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    validate: { xForwardedForHeader: false }
  });
  app.use('/api/', apiLimiter);

  // Logging Middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/scan', scanRoutes);
  app.use('/api/actions', actionRoutes);
  app.use('/api/audit', auditRoutes);
  
  // Health check
  app.get('/health', (req, res) => {
    res.status(200).send("AssetGuard Backend Running 🚀");
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Asset Guard AI Backend' });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled JSON exception', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT as number, '0.0.0.0', () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => logger.error('Server failed to start', { error: err }));
