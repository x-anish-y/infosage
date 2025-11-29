import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    unique: true,
  },
  verdict: {
    type: String,
    enum: ['true', 'false', 'mixed', 'unverified', 'misleading', 'out-of-context', 'satire'],
    default: 'unverified',
  },
  verdictPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  rationale: String,
  features: {
    sentiment: {
      type: String,
      enum: ['fear', 'anger', 'neutral', 'hope', 'sadness', 'confusion', 'surprise', 'disgust', 'trust'],
      default: 'neutral',
    },
    manipulationLikelihood: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    sourceReliability: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    spreadVelocity: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    toxicity: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  sources: [
    {
      type: {
        type: String,
        enum: ['fact-check', 'news', 'research', 'official', 'social', 'academic', 'government', 'expert'],
      },
      title: String,
      url: String,
      reliability: {
        type: String,
        enum: ['high', 'medium', 'low'],
      },
      snippet: String,
      date: String,
    },
  ],
  // Web search results from AI
  webSearchResults: {
    peopleInfo: [{
      name: String,
      title: String,
      verifiedFacts: [String],
      relevantNews: String,
    }],
    imageOrigin: {
      found: Boolean,
      originalSource: String,
      dateFirstSeen: String,
      previousUsage: [String],
      isManipulated: Boolean,
      manipulationDetails: String,
    },
    factCheckResults: [{
      organization: String,
      verdict: String,
      url: String,
      summary: String,
    }],
    warnings: [String],
  },
  charts: {
    riskTrend: [Number],
    mentionsOverTime: [
      {
        t: Date,
        count: Number,
        sources: Number,
        engagement: Number,
        trend: String,
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

analysisSchema.index({ claimId: 1 });
analysisSchema.index({ verdict: 1 });
analysisSchema.index({ confidence: -1 });
analysisSchema.index({ riskScore: -1 });
analysisSchema.index({ createdAt: -1 });

export default mongoose.model('Analysis', analysisSchema);
