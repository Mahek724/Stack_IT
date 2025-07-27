const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const verifyToken = require('../middlewares/verifyToken');

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
router.post('/vote/:answerId', verifyToken, async (req, res) => {
  const { answerId } = req.params;
  const { type } = req.body; // 'upvote' or 'downvote'
  const userId = req.user.id;

  const answer = await Answer.findById(answerId);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });

  if (type === 'upvote') {
    answer.downvotes.pull(userId);
    if (!answer.upvotes.includes(userId)) answer.upvotes.push(userId);
  } else {
    answer.upvotes.pull(userId);
    if (!answer.downvotes.includes(userId)) answer.downvotes.push(userId);
  }

  await answer.save();
  res.json({ upvotes: answer.upvotes.length, downvotes: answer.downvotes.length });
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
