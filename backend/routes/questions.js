const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const verifyToken = require('../middlewares/verifyToken'); // ✅ import middleware
const Answer = require('../models/Answer'); 
const Vote = require('../models/Vote');

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

    let sortOption = { createdAt: -1 };
    if (filter === 'mostvoted') sortOption = { upvotes: -1 };

    // 🔍 Get all matching questions first
    let allQuestions = await Question.find(query)
      .sort(sortOption)
      .populate('userId', 'username avatar')
      .lean();

    // 🧠 If filter is 'unanswered', manually filter those
    if (filter === 'unanswered') {
      const unanswered = [];

      for (const q of allQuestions) {
        const answerCount = await Answer.countDocuments({ questionId: q._id });
        if (!q.acceptedAnswer && answerCount === 0) {
          unanswered.push({
            ...q,
            answers: [],
            views: q.views || 0
          });
        }
      }

      const paginated = unanswered.slice(skip, skip + limit);
      return res.json({ questions: paginated, total: unanswered.length });
    }

    // 📊 Add extra fields (answers count & views) to remaining filters
    const questionsWithExtras = await Promise.all(
      allQuestions.slice(skip, skip + limit).map(async (q) => {
        const answersCount = await Answer.countDocuments({ questionId: q._id });
        return {
          ...q,
          answers: Array(answersCount).fill({}), // just to mimic answer array
          views: q.views || 0
        };
      })
    );

    res.json({ questions: questionsWithExtras, total: allQuestions.length });
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
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Get viewer ID (logged-in user OR guest token)
    const userId = req.user?.id || req.headers['x-guest-id']; // support both
    const alreadyViewed = question.viewedBy.includes(userId);

    if (!alreadyViewed) {
      question.views += 1;
      question.viewedBy.push(userId);
      await question.save();
    }

    const populated = await Question.findById(req.params.id)
      .populate('userId', 'username avatar')
      .lean();

    res.json(populated);
  } catch (err) {
    console.error('❌ Error fetching question:', err);
    res.status(500).json({ error: 'Server error' });
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
    await Vote.findOneAndUpdate(
      { userId, questionId: question._id },
      { userId, questionId: question._id },
      { upsert: true, new: true }
    );
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
