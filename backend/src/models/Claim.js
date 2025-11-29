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
});

claimSchema.index({ text: 'text', canonicalClaim: 'text' });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ sourceType: 1 });
claimSchema.index({ clusterId: 1 });
claimSchema.index({ language: 1 });
claimSchema.index({ status: 1 });

export default mongoose.model('Claim', claimSchema);
