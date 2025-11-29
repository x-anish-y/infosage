import express from 'express';
import Claim from '../models/Claim.js';
import Cluster from '../models/Cluster.js';
import AuditLog from '../models/AuditLog.js';
import { generateCorrectiveOutput } from '../services/llmService.js';
import Analysis from '../models/Analysis.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Generate corrective output
router.post('/generate', async (req, res, next) => {
  try {
    const { claimId, clusterId, outputTypes = ['whatsapp', 'sms', 'social', 'explainer'] } = req.body;

    if (!claimId && !clusterId) {
      return res.status(400).json({ error: 'ClaimId or clusterId required' });
    }

    let claim, analysis;

    if (claimId) {
      claim = await Claim.findById(claimId);
      analysis = await Analysis.findOne({ claimId });
    } else {
      const cluster = await Cluster.findById(clusterId);
      const claimId = cluster?.claimIds?.[0];
      claim = await Claim.findById(claimId);
      analysis = await Analysis.findOne({ claimId });
    }

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found for this claim' });
    }

    // Prepare verdict object for LLM
    const verdict = {
      verdict: analysis.verdict || 'unverified',
      confidence: analysis.confidence || 0.5,
      rationale: analysis.rationale || 'Unable to determine',
      keyFindings: analysis.keyFindings || [],
    };

    const outputs = {};
    const errors = [];

    for (const outputType of outputTypes) {
      try {
        const text = await generateCorrectiveOutput(claim.text, verdict, outputType);
        outputs[outputType] = text;
        logger.info('Output generated', { claimId, outputType, length: text?.length });
      } catch (error) {
        logger.warn('Output generation failed', { claimId, outputType, error: error.message });
        outputs[outputType] = null;
        errors.push({ type: outputType, error: error.message });
      }
    }

    // Log to audit trail
    try {
      await AuditLog.create({
        action: 'CORRECTIVE_OUTPUT_GENERATED',
        claimId,
        outputTypes,
        timestamp: new Date(),
      });
    } catch (auditError) {
      logger.warn('Failed to log audit', { error: auditError.message });
    }

    res.json({
      success: true,
      claimId: claim._id,
      verdict: analysis.verdict,
      outputs,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Corrective output generation failed', { error: error.message });
    next(error);
  }
});

export default router;

