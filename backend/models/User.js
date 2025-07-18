const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: false }, // ✅ made optional
  avatar: { type: String, default: '/avtar.png' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String, unique: true, sparse: true }, // ✅ added sparse for indexing
});

// Hash password only if present
UserSchema.pre('save', async function () {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.comparePassword = function (inputPwd) {
  return bcrypt.compare(inputPwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
