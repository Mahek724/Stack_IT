const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken'); // ✅ correct!
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');

// Get my profile
router.get('/me', verifyToken, async (req, res) => {
  console.log("Decoded userId:", req.userId);

  try {
    const user = await User.findById(req.userId);
    const questions = await Question.find({ userId: req.userId });
    const answers = await Answer.find({ userId: req.userId });

    // Split votes by type
    const totalUpvotesOnQuestions = questions.reduce((sum, q) => sum + q.upvotes.length, 0);
    const totalDownvotesOnQuestions = questions.reduce((sum, q) => sum + q.downvotes.length, 0);
    const totalUpvotesOnAnswers = answers.reduce((sum, a) => sum + a.upvotes.length, 0);
    const totalDownvotesOnAnswers = answers.reduce((sum, a) => sum + a.downvotes.length, 0);
    const totalUpvotes = totalUpvotesOnQuestions + totalUpvotesOnAnswers;
    const totalDownvotes = totalDownvotesOnQuestions + totalDownvotesOnAnswers;
    const totalVotes = totalUpvotes - totalDownvotes;
    const accepted = questions.filter(q => q.acceptedAnswer).length;

    res.json({
      user,
      stats: {
        totalQuestions: questions.length,
        totalAnswers: answers.length,
        acceptedAnswers: accepted,
        totalVotes, 
        totalUpvotes,
        totalDownvotes,
        totalUpvotesOnQuestions,
        totalDownvotesOnQuestions,
        totalUpvotesOnAnswers,
        totalDownvotesOnAnswers
      }
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ error: 'Failed to load profile stats' });
  }
});


// Get My Questions
router.get('/my-questions', verifyToken, async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    const updatedQuestions = questions.map(q => {
      return {
        ...q,
        status: q.acceptedAnswer ? 'answered' : 'open'
      };
    });

    res.json(updatedQuestions);
  } catch (err) {
    console.error("❌ Error in /my-questions:", err);
    res.status(500).json({ error: 'Failed to fetch your questions' });
  }
});

// Update profile
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

// Get my vote history
router.get('/my-votes', verifyToken, async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('questionId')
      .populate({
        path: 'answerId',
        populate: { path: 'questionId' } 
      })

    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vote history' });
  }
});

// Get most viewed question by the user
router.get('/most-viewed', verifyToken, async (req, res) => {
  try {
    const topQuestion = await Question.findOne({ userId: req.userId })
      .sort({ views: -1 })
      .lean(); 

    if (!topQuestion) {
      return res.json(null); 
    }

    res.json(topQuestion);
  } catch (err) {
    console.error("❌ Error fetching most viewed question:", err);
    res.status(500).json({ error: 'Failed to fetch most viewed question' });
  }
});

// Logout from all devices
router.post('/logout-all', verifyToken, async (req, res) => {
  // Your logic for token blacklist or cookie invalidation
  res.clearCookie('token').json({ message: 'Logged out from all devices' });
});

// Get answered questions
router.get('/my-answers', verifyToken, async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.userId })
      .populate('questionId')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch answered questions' });
  }
});

module.exports = router;
