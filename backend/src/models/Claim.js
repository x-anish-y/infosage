import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  canonicalClaim: String,
  sourceType: {
    type: String,
    enum: ['rss', 'twitter', 'telegram', 'youtube', 'image', 'video', 'web', 'manual'],
    default: 'manual',
  },
  sourceLink: String,
  language: {
    type: String,
    default: 'en',
  },
  embedding: [Number],
  geo: {
    country: String,
    region: String,
    lat: Number,
    lng: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clusterId: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ['new', 'analyzing', 'analyzed', 'escalated'],
    default: 'new',
  },
  spreadCount: {
    type: Number,
    default: 1,
  },
  mentions: {
    type: Number,
    default: 1,
  },
  // Media/Image analysis data (OpenAI Vision)
  mediaAnalysis: {
    hasImage: { type: Boolean, default: false },
    imagePath: String,
    ocrText: String,
    extractedText: String,        // Raw text from image
    imageDescription: String,      // AI description of image content
    mainClaim: String,             // AI-identified main claim
    context: String,               // Additional context detected
    concerns: [String],            // Red flags or authenticity concerns
    // Person identification
    people: [{
      name: String,
      role: String,
      confidence: String,
      description: String
    }],
    objects: [String],             // Identified objects/logos
    scene: {
      location: String,
      event: String,
      timeframe: String
    },
    factCheckContext: String,      // Background info for fact-checking
    knownFacts: [String],          // Verified facts about people/event
    verificationSuggestions: [String],
    // Context search results
    contextInfo: {
      peopleInfo: [{
        name: String,
        verifiedFacts: [String],
        commonMisinformation: [String],
        relevantContext: String
      }],
      claimAnalysis: {
        likelyVerdict: String,
        confidence: String,
        reasoning: String
      },
      verificationSteps: [String],
      similarHoaxes: [String]
    },
    forensics: {
      deepfakeDetected: Boolean,
      manipulationScore: Number,
      artifacts: [String],
    },
  },
});

claimSchema.index({ text: 'text', canonicalClaim: 'text' });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ sourceType: 1 });
claimSchema.index({ clusterId: 1 });
claimSchema.index({ language: 1 });
claimSchema.index({ status: 1 });

export default mongoose.model('Claim', claimSchema);
