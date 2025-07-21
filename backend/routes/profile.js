const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken'); // ✅ correct!

const Vote = require('../models/Vote');



// Get Profile Info
router.get('/me', verifyToken, async (req, res) => {
  console.log("Decoded userId:", req.userId);
  const user = await User.findById(req.userId);
  const questions = await Question.find({ userId: req.userId });
  const totalVotes = questions.reduce((sum, q) => sum + q.upvotes.length - q.downvotes.length, 0);
  const accepted = questions.filter(q => q.acceptedAnswer).length;

  res.json({
    user,
    stats: {
      totalQuestions: questions.length,
      totalVotes,
      acceptedAnswers: accepted
    }
  });
});

// Get My Questions
router.get('/my-questions', verifyToken, async (req, res) => {
  const questions = await Question.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(questions);
});

// Update Username + Avatar
// Update Username + Avatar (GridFS only, no multer)
router.put('/update', verifyToken, async (req, res) => {
  const updateData = {};

if (req.body.username && req.body.username.trim() !== '') {
  updateData.username = req.body.username;
}

if (req.body.email && req.body.email.trim() !== '') {
  updateData.email = req.body.email;
}

if (req.body.avatar && req.body.avatar.trim() !== '') {
  updateData.avatar = req.body.avatar; // GridFS URL
}


  await User.findByIdAndUpdate(req.userId, updateData);
  res.json({ message: 'Profile updated' });
});

router.get('/my-votes', verifyToken, async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('questionId');
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vote history' });
  }
});

router.get('/most-viewed', verifyToken, async (req, res) => {
  try {
    const topQuestion = await Question.findOne({ userId: req.userId })
      .sort({ views: -1 });
    res.json(topQuestion);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch most viewed question' });
  }
});


// Logout All Devices (invalidate tokens)
router.post('/logout-all', verifyToken, async (req, res) => {
  // Your logic for token blacklist or cookie invalidation
  res.clearCookie('token').json({ message: 'Logged out from all devices' });
});

module.exports = router;
