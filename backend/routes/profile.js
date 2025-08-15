const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken'); // ✅ correct!
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');

// Get my profile
// Get my profile with correct vote summary
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const questions = await Question.find({ userId: req.user.id });
    const answers = await Answer.find({ userId: req.user.id });

    const questionIds = questions.map(q => q._id);
    const answerIds = answers.map(a => a._id);

    // Votes received
    const [upvotesOnQuestions, downvotesOnQuestions, upvotesOnAnswers, downvotesOnAnswers] =
      await Promise.all([
        Vote.countDocuments({ questionId: { $in: questionIds }, type: 'upvote' }),
        Vote.countDocuments({ questionId: { $in: questionIds }, type: 'downvote' }),
        Vote.countDocuments({ answerId: { $in: answerIds }, type: 'upvote' }),
        Vote.countDocuments({ answerId: { $in: answerIds }, type: 'downvote' })
      ]);

    const totalUpvotes = upvotesOnQuestions + upvotesOnAnswers;
    const totalDownvotes = downvotesOnQuestions + downvotesOnAnswers;
    const acceptedAnswersCount = answers.filter(a => a.isAccepted).length;

    // Votes cast (votes you made)
    const [
      votesCastUp,
      votesCastDown,
      votesCastUpQuestions,
      votesCastDownQuestions,
      votesCastUpAnswers,
      votesCastDownAnswers
    ] = await Promise.all([
      Vote.countDocuments({ userId: req.user.id, type: 'upvote' }),
      Vote.countDocuments({ userId: req.user.id, type: 'downvote' }),
      Vote.countDocuments({ userId: req.user.id, type: 'upvote', questionId: { $ne: null } }),
      Vote.countDocuments({ userId: req.user.id, type: 'downvote', questionId: { $ne: null } }),
      Vote.countDocuments({ userId: req.user.id, type: 'upvote', answerId: { $ne: null } }),
      Vote.countDocuments({ userId: req.user.id, type: 'downvote', answerId: { $ne: null } }),
    ]);

    res.json({
      user,
      stats: {
        totalQuestions: questions.length,
        totalAnswers: answers.length,
        acceptedAnswers: acceptedAnswersCount,
        totalVotes: totalUpvotes - totalDownvotes,
        totalUpvotes,
        totalDownvotes,
        totalUpvotesOnQuestions: upvotesOnQuestions,
        totalDownvotesOnQuestions: downvotesOnQuestions,
        totalUpvotesOnAnswers: upvotesOnAnswers,
        totalDownvotesOnAnswers: downvotesOnAnswers,
        // Votes you cast:
        totalVotesCast: votesCastUp - votesCastDown,
        totalUpvotesCast: votesCastUp,
        totalDownvotesCast: votesCastDown,
        totalUpvotesOnQuestionsCast: votesCastUpQuestions,
        totalDownvotesOnQuestionsCast: votesCastDownQuestions,
        totalUpvotesOnAnswersCast: votesCastUpAnswers,
        totalDownvotesOnAnswersCast: votesCastDownAnswers,
      }
    });

  } catch (error) {
    console.error('❌ Error in /me route:', error);
    res.status(500).json({ error: 'Failed to load profile stats' });
  }
});




// Get My Questions
router.get('/my-questions', verifyToken, async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user.id })
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
  await User.findByIdAndUpdate(req.user.id, updateData);
  res.json({ message: 'Profile updated' });
});

// Get my vote history
router.get('/my-votes', verifyToken, async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.user.id })
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
    const topQuestion = await Question.findOne({ userId: req.user.id })
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
    const answers = await Answer.find({ userId: req.user.id })
      .populate('questionId')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch answered questions' });
  }
});

module.exports = router;
