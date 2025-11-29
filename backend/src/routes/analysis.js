import express from 'express';
import Analysis from '../models/Analysis.js';
import Claim from '../models/Claim.js';
import AuditLog from '../models/AuditLog.js';
import { analyzeClaimFull, getRiskTier } from '../services/analysisService.js';
import { generateMetricRecommendation } from '../services/llmService.js';
import { roleMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get analysis for a claim
router.get('/:claimId', async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ claimId: req.params.claimId });
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Run/re-run analysis
router.post('/run/:claimId', roleMiddleware(['reviewer', 'admin', 'analyst']), async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Delete old analysis
    await Analysis.deleteOne({ claimId: claim._id });

    // Run new analysis
    const analysis = await analyzeClaimFull(claim);

    // Update claim with risk tier
    const riskTier = getRiskTier(analysis.riskScore);
    claim.status = 'analyzed';
    await claim.save();

    // Log audit
    await AuditLog.create({
      actorUserId: req.user?._id,
      action: 'update',
      targetType: 'analysis',
      targetId: analysis._id,
      metadata: { verdict: analysis.verdict },
    });

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('analysisReady', {
        claimId: claim._id,
        analysisId: analysis._id,
        verdict: analysis.verdict,
      });
    }

    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Recommend which metrics to display based on claim analysis
router.post('/recommend-metrics', async (req, res, next) => {
  try {
    const { claimId, dataPoints, hasEngagement, hasSources, hasTrend } = req.body;

    if (!claimId) {
      return res.status(400).json({ error: 'claimId is required' });
    }

    // Get the claim to pass context to LLM
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Get AI recommendation on which metrics to display
    const recommendation = await generateMetricRecommendation({
      claimText: claim.text,
      verdict: claim.verdict || 'under review',
      hasEngagement,
      hasSources,
      hasTrend,
      dataPoints,
    });

    res.json({
      recommendedMetrics: recommendation.metrics,
      analysis: recommendation.reasoning,
    });
  } catch (error) {
    logger.error('Error recommending metrics:', error);
    // Fallback to default metrics if error
    res.json({
      recommendedMetrics: ['mentions', 'engagement', 'sources'],
      analysis: 'Using default metrics due to analysis unavailability',
    });
  }
});

export default router;

