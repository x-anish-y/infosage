import express from 'express';
import Cluster from '../models/Cluster.js';
import Claim from '../models/Claim.js';
import { updateClustering } from '../services/clusteringService.js';
import { roleMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get trending clusters
router.get('/', async (req, res, next) => {
  try {
    const { riskTier, trend, limit = 20, skip = 0 } = req.query;

    const filter = {};
    if (riskTier) filter.riskTier = riskTier;
    if (trend) filter.trend = trend;

    const clusters = await Cluster.find(filter)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Cluster.countDocuments(filter);

    res.json({
      clusters,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
});

// Get cluster by ID with details
router.get('/:id', async (req, res, next) => {
  try {
    const cluster = await Cluster.findById(req.params.id);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    const claims = await Claim.find({ _id: { $in: cluster.claimIds } });

    res.json({
      ...cluster.toObject(),
      claims,
    });
  } catch (error) {
    next(error);
  }
});

// Recompute clustering
router.post('/recompute', roleMiddleware(['admin']), async (req, res, next) => {
  try {
    const result = await updateClustering();
    logger.info('Clustering recomputed', result);

    if (req.app.locals.io) {
      req.app.locals.io.emit('clusteringUpdated', result);
    }

    res.json({
      message: 'Clustering recomputed',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
