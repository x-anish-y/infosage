import mongoose from 'mongoose';

const clusterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: String,
  claimIds: [mongoose.Schema.Types.ObjectId],
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  riskTier: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  trend: {
    type: String,
    enum: ['accelerating', 'stable', 'declining'],
    default: 'stable',
  },
  geoSpread: [
    {
      region: String,
      country: String,
      count: Number,
      lat: Number,
      lng: Number,
    },
  ],
  channelSpread: [
    {
      platform: String,
      count: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  totalMentions: {
    type: Number,
    default: 0,
  },
  tags: [String],
});

clusterSchema.index({ title: 'text', summary: 'text' });
clusterSchema.index({ createdAt: -1 });
clusterSchema.index({ riskTier: 1 });
clusterSchema.index({ trend: 1 });
clusterSchema.index({ riskScore: -1 });
clusterSchema.index({ updatedAt: -1 });

export default mongoose.model('Cluster', clusterSchema);
