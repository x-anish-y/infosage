import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    // For localhost dev, allow public access with mock user
    req.user = {
      _id: 'dev-user-id',
      username: 'dev-user',
      role: 'analyst',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('JWT verification failed', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function errorHandler(err, req, res, next) {
  logger.error('Request error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(500).json({ error: 'Internal server error' });
}

export function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });

  next();
}

export default {
  authMiddleware,
  roleMiddleware,
  errorHandler,
  requestLogger,
};
