const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true }, // ✅ made optional
  avatar: { type: String, default: '/avatar.png' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  reputation: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  googleId: { type: String, unique: true, sparse: true }, // ✅ added sparse for indexing
});

// Hash password only if present
UserSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


UserSchema.methods.comparePassword = function (inputPwd) {
  return bcrypt.compare(inputPwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
