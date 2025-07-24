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
    const { search = '', filter = 'newest', page = 1 } = req.query;
    const limit = 5;
    const skip = (parseInt(page) - 1) * limit;

    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ],
    };

    if (filter === 'unanswered') {
      query.status = 'open'; // or: answers.length === 0 depending on model
    }

    let sortOption = { createdAt: -1 }; // default newest
    if (filter === 'mostvoted') {
      sortOption = { upvotes: -1 };
    }

    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar')
      .lean();

    res.json({ questions, total });
  } catch (err) {
    console.error('Error fetching paginated questions:', err);
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

// GET /api/questions/:id - fetch single question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('userId', 'username avatar')
      .lean();

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (err) {
    console.error('❌ Error fetching question by ID:', err);
    res.status(500).json({ error: 'Server error fetching question' });
  }
});

// PUT /api/questions/:id - Edit Question (title, description, tags)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, tags, imageFileName } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Only the original user can edit
    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to edit this question' });
    }

    // Update fields
    if (title !== undefined) question.title = title;
    if (description !== undefined) question.description = description;
    if (tags !== undefined) question.tags = tags;
    if (imageFileName !== undefined) question.imageFileName = imageFileName;

    question.updatedAt = new Date(); // ✅ update timestamp

    await question.save();

    res.json({ message: 'Question updated successfully', question });
  } catch (err) {
    console.error('❌ Error updating question:', err);
    res.status(500).json({ error: 'Server error while updating question' });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this question' });
    }

    await question.deleteOne();
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting question:', err);
    res.status(500).json({ error: 'Server error while deleting question' });
  }
});

// POST /api/questions/:id/vote
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { type } = req.body; // "upvote" or "downvote"
    const userId = req.user.id;
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json({ error: 'Question not found' });

    const hasUpvoted = question.upvotes.includes(userId);
    const hasDownvoted = question.downvotes.includes(userId);

    if (type === 'upvote') {
      if (hasUpvoted) {
        question.upvotes.pull(userId); // remove upvote (toggle off)
      } else {
        question.upvotes.push(userId); // add upvote
        if (hasDownvoted) question.downvotes.pull(userId); // remove downvote if exists
      }
    } else if (type === 'downvote') {
      if (hasDownvoted) {
        question.downvotes.pull(userId); // remove downvote (toggle off)
      } else {
        question.downvotes.push(userId); // add downvote
        if (hasUpvoted) question.upvotes.pull(userId); // remove upvote if exists
      }
    }

    await question.save();
    const updated = await Question.findById(req.params.id)
      .populate('userId', 'username avatar')
      .lean();

    res.json(updated);
  } catch (err) {
    console.error('❌ Vote error:', err);
    res.status(500).json({ error: 'Voting failed' });
  }
});


module.exports = router;
