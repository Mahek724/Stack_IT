const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const verifyToken = require('../middlewares/verifyToken'); // ✅ import middleware

router.post('/', verifyToken, async (req, res) => {  // ✅ apply middleware
  try {
    const { title, description, tags, status } = req.body;

    const newQuestion = new Question({
      title,
      description,
      tags,
      status: status || 'open',
      userId: req.user.id, // ✅ real authenticated user ID
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('❌ Error while posting question:', error);
    res.status(500).json({ error: 'Server error while creating question' });
  }
});

router.get('/', async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .lean();

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});


// PUT /api/questions/:questionId/accept/:answerId
router.put('/:questionId/accept/:answerId', verifyToken, async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (question.userId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized to accept answer' });

    question.acceptedAnswer = answerId;
    question.status = 'answered';
    await question.save();

    res.json({ message: 'Answer accepted', question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept answer' });
  }
});


module.exports = router;
