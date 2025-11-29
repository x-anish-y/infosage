import express from 'express';
import Claim from '../models/Claim.js';
import Cluster from '../models/Cluster.js';
import Analysis from '../models/Analysis.js';
import AuditLog from '../models/AuditLog.js';
import { shouldEscalate, getRiskTier } from '../services/analysisService.js';
import { roleMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Escalate claim/cluster
router.post('/escalate', roleMiddleware(['reviewer', 'admin']), async (req, res, next) => {
  try {
    const { claimId, clusterId, reason } = req.body;

    if (!claimId && !clusterId) {
      return res.status(400).json({ error: 'ClaimId or clusterId required' });
    }

    if (claimId) {
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      claim.status = 'escalated';
      await claim.save();

      await AuditLog.create({
        actorUserId: req.user?._id,
        action: 'escalate',
        targetType: 'claim',
        targetId: claimId,
        metadata: { reason },
      });

      // Emit socket event
      if (req.app.locals.io) {
        req.app.locals.io.emit('reviewRequested', {
          type: 'claim',
          id: claimId,
          reason,
        });
      }

      res.json({ message: 'Claim escalated', claimId });
    } else {
      const cluster = await Cluster.findById(clusterId);
      if (!cluster) {
        return res.status(404).json({ error: 'Cluster not found' });
      }

      // Escalate all claims in cluster
      await Claim.updateMany({ clusterId }, { status: 'escalated' });

      await AuditLog.create({
        actorUserId: req.user?._id,
        action: 'escalate',
        targetType: 'cluster',
        targetId: clusterId,
        metadata: { reason },
      });

      if (req.app.locals.io) {
        req.app.locals.io.emit('reviewRequested', {
          type: 'cluster',
          id: clusterId,
          reason,
        });
      }

      res.json({ message: 'Cluster escalated', clusterId });
    }
  } catch (error) {
    next(error);
  }
});

// Resolve escalation
router.post('/resolve', roleMiddleware(['reviewer', 'admin']), async (req, res, next) => {
  try {
    const { claimId, verdict, notes } = req.body;

    if (!claimId || !verdict) {
      return res.status(400).json({ error: 'ClaimId and verdict required' });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const analysis = await Analysis.findOne({ claimId });
    if (analysis) {
      analysis.verdict = verdict;
      await analysis.save();
    }

    claim.status = 'analyzed';
    await claim.save();

    await AuditLog.create({
      actorUserId: req.user?._id,
      action: 'resolve',
      targetType: 'claim',
      targetId: claimId,
      metadata: { verdict, notes },
    });

    res.json({ message: 'Escalation resolved', claimId });
  } catch (error) {
    next(error);
  }
});

export default router;
