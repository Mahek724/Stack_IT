const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const verifyToken = require('../middlewares/verifyToken');

// Signup 
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ 1. Check if username or email already exists BEFORE saving
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // ✅ 2. Create a new User instance (will trigger pre-save hook for password hashing)
    const newUser = new User({
      username,
      email,
      password,  // pre-save hook will hash this
    });

    await newUser.save(); // ✅ safe save, no duplicate issues

    // ✅ 3. Generate token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ 4. Return success
    res.status(201).json({
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      }
    });

 } catch (err) {
  console.error('🔥 Signup Error:', err.message);
  console.error('🔥 Full error:', err);
  return res.status(500).json({ error: err.message || 'Server error during signup' });
}

});


// Login 
router.post('/login', async (req, res) => {
  const { email, password, remember } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ error: 'Please log in using Google' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Token lifespan
    const expiresIn = remember ? '30d' : '1d';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '/avatar.png', 
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"StackIt Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello ${user.username},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });
    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error sending reset email' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = password; // plain password
    await user.save();         // pre-save hook will hash it
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Google login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_login_failed`,
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.clearCookie('connect.sid');
    res.send('Logged out');
  });
});

// Get currently authenticated user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
