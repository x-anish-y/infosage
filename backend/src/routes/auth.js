import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    let user = await User.findOne({ username });

    // For dev: create user if doesn't exist
    if (!user) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      user = await User.create({
        username,
        email: `${username}@localhost`,
        passwordHash: hashedPassword,
        role: 'analyst',
      });
      logger.info('New user created (dev)', { username });
    } else {
      const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Log audit
    await AuditLog.create({
      actorUserId: user._id,
      action: 'login',
      targetType: 'user',
      targetId: user._id,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res) => {
  // JWT is stateless, logout is client-side
  res.json({ message: 'Logged out' });
});

export default router;
