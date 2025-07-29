const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const verifyToken = require('../middlewares/verifyToken');
const Vote = require('../models/Vote');

// Get all answers for a question
router.get('/question/:questionId', async (req, res) => {
  const answers = await Answer.find({ questionId: req.params.questionId })
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 });
  res.json(answers);
});

// Post an answer
router.post('/', verifyToken, async (req, res) => {
  const { questionId, content } = req.body;
  const newAnswer = new Answer({
    questionId,
    content,
    userId: req.user.id
  });
  await newAnswer.save();
  res.status(201).json(newAnswer);
});

// Upvote/Downvote
// Upvote/Downvote
router.post('/vote/:answerId', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type: voteType } = req.body;
    const answerId = req.params.answerId;

    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const opposite = voteType === 'upvote' ? 'downvote' : 'upvote';
    const hasOpposite = answer[opposite + 's'].includes(userId);
    if (hasOpposite) {
      answer[opposite + 's'] = answer[opposite + 's'].filter(id => id.toString() !== userId.toString());
    }

    const hasVoted = answer[voteType + 's'].includes(userId);
    if (hasVoted) {
      answer[voteType + 's'] = answer[voteType + 's'].filter(id => id.toString() !== userId.toString());
      await Vote.deleteOne({ userId, answerId });
    } else {
      answer[voteType + 's'].push(userId);
      await Vote.findOneAndUpdate(
        { userId, answerId },
        { userId, answerId },
        { upsert: true, new: true }
      );
    }

    await answer.save();

    // ✅ NEW: Update totalVotes in User
    const totalVotes = await Vote.countDocuments({ userId });
    await User.findByIdAndUpdate(userId, { totalVotes });

    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});




// Accept Answer
router.post('/accept/:answerId', verifyToken, async (req, res) => {
  const answer = await Answer.findById(req.params.answerId);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });

  const question = await Question.findById(answer.questionId);
  if (!question || question.userId.toString() !== req.user.id)
    return res.status(403).json({ error: 'Only the asker can accept an answer' });

  question.acceptedAnswer = answer._id;
  await question.save();
  res.json({ message: 'Answer accepted' });
});

// Get answer by ID
router.get('/:answerId', async (req, res) => {
  const answer = await Answer.findById(req.params.answerId);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });
  res.json(answer);
});

// Update answer
router.put('/:answerId', verifyToken, async (req, res) => {
  const { answerId } = req.params;
  const { content } = req.body;
  const answer = await Answer.findById(answerId);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });
  if (answer.userId.toString() !== req.user.id)
    return res.status(403).json({ error: 'Unauthorized' });

  answer.content = content;
  await answer.save();
  res.json({ message: 'Answer updated' });
});

// Delete answer by ID
router.delete('/:answerId', verifyToken, async (req, res) => {
  const { answerId } = req.params;

  const answer = await Answer.findById(answerId);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });

  if (answer.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const question = await Question.findById(answer.questionId);

  // ✅ If the deleted answer was accepted, clear it from question
  if (question && question.acceptedAnswer?.toString() === answer._id.toString()) {
    question.acceptedAnswer = null;
    await question.save();
  }

  await answer.deleteOne();
  res.json({ message: 'Answer deleted successfully' });
});



module.exports = router;
