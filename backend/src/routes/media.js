import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Media from '../models/Media.js';
import Claim from '../models/Claim.js';
import { extractOCRText, detectManipulation, reverseImageSearch } from '../services/mediaService.js';
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
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload media
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

    let ocrText = '';
    let forensics = {
      deepfakeDetected: false,
      manipulationScore: 0,
      artifacts: [],
      reverseImage: [],
    };

    if (mediaType === 'image') {
      try {
        ocrText = await extractOCRText(filePath);
        const detection = await detectManipulation(filePath);
        forensics.deepfakeDetected = detection.deepfakeDetected;
        forensics.manipulationScore = detection.manipulationScore;
        forensics.artifacts = detection.artifacts;
        forensics.reverseImage = await reverseImageSearch(filePath, ocrText);
      } catch (error) {
        logger.warn('Media analysis failed', { error: error.message });
      }
    }

    const media = await Media.create({
      claimId,
      mediaType,
      filePath,
      ocrText,
      forensics,
    });

    res.json({
      _id: media._id,
      claimId,
      mediaType,
      ocrText,
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
