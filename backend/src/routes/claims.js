import express from 'express';
import Claim from '../models/Claim.js';
import Analysis from '../models/Analysis.js';
import AuditLog from '../models/AuditLog.js';
import { analyzeClaimFull } from '../services/analysisService.js';
import { generateEmbedding, generateMultilingualEmbedding } from '../services/huggingFaceService.js';
import { findSimilarClaims } from '../services/clusteringService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Create new claim
router.post('/', async (req, res, next) => {
  try {
    const { text, sourceType = 'manual', sourceLink, language = 'en', geo, mediaAnalysis } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Claim text is required' });
    }

    // Generate embedding
    let embedding = [];
    try {
      embedding =
        language === 'en'
          ? await generateEmbedding(text)
          : await generateMultilingualEmbedding(text);
    } catch (error) {
      logger.warn('Embedding generation failed, proceeding without', { error: error.message });
    }

    // Check for similar claims
    let clusterId;
    if (embedding.length > 0) {
      const similar = await findSimilarClaims(embedding, 0.8);
      if (similar.length > 0) {
        clusterId = similar[0].clusterId;
      }
    }

    // Create claim with optional media analysis
    const claimData = {
      text,
      canonicalClaim: text,
      sourceType,
      sourceLink,
      language,
      embedding,
      geo,
      status: 'new',
    };

    // Add media analysis if provided (with all new fields)
    if (mediaAnalysis) {
      claimData.mediaAnalysis = {
        hasImage: mediaAnalysis.hasImage || false,
        imagePath: mediaAnalysis.imagePath || '',
        ocrText: mediaAnalysis.ocrText || '',
        extractedText: mediaAnalysis.extractedText || '',
        imageDescription: mediaAnalysis.imageDescription || '',
        mainClaim: mediaAnalysis.mainClaim || '',
        context: mediaAnalysis.context || '',
        concerns: mediaAnalysis.concerns || [],
        people: mediaAnalysis.people || [],
        objects: mediaAnalysis.objects || [],
        scene: mediaAnalysis.scene || {},
        factCheckContext: mediaAnalysis.factCheckContext || '',
        knownFacts: mediaAnalysis.knownFacts || [],
        verificationSuggestions: mediaAnalysis.verificationSuggestions || [],
        contextInfo: mediaAnalysis.contextInfo || {},
        forensics: mediaAnalysis.forensics || {},
      };
    }

    const claim = await Claim.create(claimData);

    // Log audit
    await AuditLog.create({
      actorUserId: req.user?._id,
      action: 'create',
      targetType: 'claim',
      targetId: claim._id,
      metadata: { sourceType },
    });

    res.status(201).json({
      _id: claim._id,
      text: claim.text,
      status: claim.status,
      message: 'Claim created. Analysis in progress.',
    });

    // Trigger analysis asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        await analyzeClaimFull(claim);
        claim.status = 'analyzed';
        await claim.save();
        // Emit socket event
        if (req.app.locals.io) {
          req.app.locals.io.emit('analysisReady', {
            claimId: claim._id,
            status: 'completed',
          });
        }
      } catch (error) {
        logger.error('Background analysis failed', { claimId: claim._id, error: error.message });
      }
    });
  } catch (error) {
    logger.error('Error creating claim', { error: error.message });
    next(error);
  }
});

// Get claim by ID
router.get('/:id', async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const analysis = await Analysis.findOne({ claimId: claim._id });
    
    logger.info('Claim detail fetched', {
      claimId: claim._id,
      hasAnalysis: !!analysis,
      verdict: analysis?.verdict,
      confidence: analysis?.confidence,
    });

    res.json({
      ...claim.toObject(),
      analysis: analysis?.toObject ? analysis.toObject() : analysis,
    });
  } catch (error) {
    next(error);
  }
});

// Search claims
router.get('/', async (req, res, next) => {
  try {
    const { query = '', sourceType, language, limit = 20, skip = 0 } = req.query;

    const filter = {};
    if (sourceType) filter.sourceType = sourceType;
    if (language) filter.language = language;

    let claimsQuery = Claim.find(filter);

    if (query) {
      claimsQuery = claimsQuery.find({ $text: { $search: query } });
    }

    const total = await Claim.countDocuments(filter);
    const claims = await claimsQuery.sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));

    res.json({
      claims,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
