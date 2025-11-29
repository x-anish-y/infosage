import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  filePath: String,
  fileHash: String,
  ocrText: String,
  forensics: {
    deepfakeDetected: {
      type: Boolean,
      default: false,
    },
    manipulationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    artifictsFound: [String],
    reverseImage: [
      {
        url: String,
        firstSeen: Date,
        similarity: Number,
        source: String,
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

mediaSchema.index({ claimId: 1 });
mediaSchema.index({ mediaType: 1 });
mediaSchema.index({ fileHash: 1 });

export default mongoose.model('Media', mediaSchema);
