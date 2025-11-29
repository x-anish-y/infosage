import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import claimsRoutes from './routes/claims.js';
import clustersRoutes from './routes/clusters.js';
import analysisRoutes from './routes/analysis.js';
import mediaRoutes from './routes/media.js';
import outputsRoutes from './routes/outputs.js';
import reviewRoutes from './routes/review.js';
import { authMiddleware, errorHandler, requestLogger } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.REACT_APP_API_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);
app.use(apiLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// Store io instance for routes
app.locals.io = io;

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/infosage', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', authMiddleware, claimsRoutes);
app.use('/api/clusters', authMiddleware, clustersRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/outputs', authMiddleware, outputsRoutes);
app.use('/api/review', authMiddleware, reviewRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// WebSocket handlers
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });

  // Listen for client events
  socket.on('refreshDashboard', () => {
    logger.debug('Dashboard refresh requested');
  });

  socket.on('subscribeToCluster', (clusterId) => {
    socket.join(`cluster:${clusterId}`);
    logger.debug('Client subscribed to cluster', { clusterId });
  });
});

// Start server
const PORT = process.env.BACKEND_PORT || 4000;

async function start() {
  await connectDB();

  httpServer.listen(PORT, () => {
    logger.info(`InfoSage backend running on port ${PORT}`);
  });
}

start().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});

export default app;
