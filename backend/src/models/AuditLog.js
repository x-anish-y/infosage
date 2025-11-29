import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    enum: ['create', 'update', 'escalate', 'publish', 'login', 'delete', 'resolve'],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['claim', 'cluster', 'analysis', 'user', 'media'],
    required: true,
  },
  targetId: mongoose.Schema.Types.ObjectId,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

auditLogSchema.index({ actorUserId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetType: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
