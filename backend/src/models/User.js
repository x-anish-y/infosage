import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'reviewer', 'analyst', 'public'],
    default: 'public',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
