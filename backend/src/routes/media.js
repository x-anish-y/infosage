import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Media from '../models/Media.js';
import Claim from '../models/Claim.js';
import { extractOCRText, detectManipulation, reverseImageSearch, searchContextInfo } from '../services/mediaService.js';
import { analyzeImageForManipulation } from '../services/huggingFaceService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Setup multer
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Analyze image (standalone - for image upload before claim creation)
router.post('/analyze', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    const filePath = req.file.path;

    let extractedText = '';
    let fullAnalysis = null;
    let contextInfo = null;
    let forensics = {
      deepfakeDetected: false,
      manipulationScore: 0,
      artifacts: [],
      reverseImage: [],
    };

    if (mediaType === 'image') {
      try {
        logger.info('Starting comprehensive OpenAI Vision analysis', { filePath });
        const ocrResult = await extractOCRText(filePath);
        
        // Handle response format from OpenAI Vision
        if (typeof ocrResult === 'object' && ocrResult !== null) {
          extractedText = ocrResult.text || '';
          fullAnalysis = ocrResult.fullAnalysis || null;
        } else {
          extractedText = ocrResult || '';
        }
        
        logger.info('Image analysis complete', { 
          filePath, 
          textLength: extractedText?.length || 0,
          hasFullAnalysis: !!fullAnalysis,
          peopleIdentified: fullAnalysis?.people?.length || 0
        });

        // Step 2: Search for context info about identified people/claims
        if (fullAnalysis) {
          logger.info('Searching for context information...');
          contextInfo = await searchContextInfo(
            fullAnalysis.people,
            fullAnalysis.mainClaim,
            fullAnalysis.imageDescription
          );
          
          if (contextInfo) {
            logger.info('Context search complete', {
              peopleInfo: contextInfo.peopleInfo?.length || 0,
              verdict: contextInfo.claimAnalysis?.likelyVerdict
            });
          }
        }

        const detection = await detectManipulation(filePath);
        forensics.deepfakeDetected = detection.deepfakeDetected;
        forensics.manipulationScore = detection.manipulationScore;
        forensics.artifacts = detection.artifacts;
        
        // Add AI-detected concerns to forensics
        if (fullAnalysis?.concerns?.length > 0) {
          forensics.artifacts = [...forensics.artifacts, ...fullAnalysis.concerns];
        }
        
        // Add similar hoaxes if found
        if (contextInfo?.similarHoaxes?.length > 0) {
          forensics.artifacts = [...forensics.artifacts, ...contextInfo.similarHoaxes.map(h => `Similar hoax: ${h}`)];
        }
        
        // Run reverse image search
        if (extractedText && extractedText.trim()) {
          forensics.reverseImage = await reverseImageSearch(filePath, extractedText);
        }
      } catch (error) {
        logger.warn('Media analysis failed', { error: error.message });
      }
    }

    // Build comprehensive response
    const response = {
      success: true,
      mediaType,
      filePath,
      ocrText: extractedText || '',
      fullAnalysis,
      contextInfo,
      forensics,
      message: extractedText 
        ? `AI analyzed image: ${extractedText.substring(0, 100)}${extractedText.length > 100 ? '...' : ''}` 
        : 'No text or claims detected in image',
    };

    // Add summary of identified people
    if (fullAnalysis?.people?.length > 0) {
      response.identifiedPeople = fullAnalysis.people.filter(p => p.name !== 'Unknown person');
    }

    // Add preliminary verdict if available
    if (contextInfo?.claimAnalysis) {
      response.preliminaryVerdict = contextInfo.claimAnalysis;
    }

    res.json(response);
  } catch (error) {
    logger.error('Image analysis error', { error: error.message });
    next(error);
  }
});

// Upload media (attached to existing claim)
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const { claimId } = req.body;

    if (!claimId || !req.file) {
      return res.status(400).json({ error: 'ClaimId and file required' });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    const filePath = req.file.path;

    let extractedText = '';
    let fullAnalysis = null;
    let forensics = {
      deepfakeDetected: false,
      manipulationScore: 0,
      artifacts: [],
      reverseImage: [],
    };

    if (mediaType === 'image') {
      try {
        const ocrResult = await extractOCRText(filePath);
        
        // Handle new response format from OpenAI Vision
        if (typeof ocrResult === 'object' && ocrResult !== null) {
          extractedText = ocrResult.text || '';
          fullAnalysis = ocrResult.fullAnalysis || null;
        } else {
          extractedText = ocrResult || '';
        }
        
        const detection = await detectManipulation(filePath);
        forensics.deepfakeDetected = detection.deepfakeDetected;
        forensics.manipulationScore = detection.manipulationScore;
        forensics.artifacts = detection.artifacts;
        
        if (fullAnalysis?.concerns?.length > 0) {
          forensics.artifacts = [...forensics.artifacts, ...fullAnalysis.concerns];
        }
        
        forensics.reverseImage = await reverseImageSearch(filePath, extractedText);
      } catch (error) {
        logger.warn('Media analysis failed', { error: error.message });
      }
    }

    const media = await Media.create({
      claimId,
      mediaType,
      filePath,
      ocrText: extractedText,
      forensics,
    });

    res.json({
      _id: media._id,
      claimId,
      mediaType,
      ocrText: extractedText,
      fullAnalysis,
      forensics,
    });
  } catch (error) {
    next(error);
  }
});

// Get media by ID
router.get('/:id', async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    next(error);
  }
});

export default router;
