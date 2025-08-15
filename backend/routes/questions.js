const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const verifyToken = require('../middlewares/verifyToken'); // ✅ import middleware
const Answer = require('../models/Answer'); 
const Vote = require('../models/Vote');

// Get all questions
router.post('/', verifyToken, async (req, res) => {  // ✅ apply middleware
  try {
    const { title, description, tags, status } = req.body;

    const newQuestion = new Question({
      title,
      description,
      tags,
      status: status || 'open',
      userId: req.user.id, 
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('❌ Error while posting question:', error);
    res.status(500).json({ error: 'Server error while creating question' });
  }
});

// Get all questions with pagination and filtering
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

    let allQuestions = await Question.find(query)
      .sort(sortOption)
      .populate('userId', 'username avatar')
      .lean();

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
    //
    const questionsWithExtras = await Promise.all(
      allQuestions.slice(skip, skip + limit).map(async (q) => {
        const answersCount = await Answer.countDocuments({ questionId: q._id });
        return {
          ...q,
          answers: Array(answersCount).fill({}), 
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

// Get all questions by a user
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

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json({ error: 'Question not found' });

    const userId = req.user?.id || req.headers['x-guest-id']; 
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

// Update question by ID
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, tags, imageFileName } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

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

// Delete question by ID
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

// Vote on a question
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { type: voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const hasUpvoted = (question.upvotes || []).some(id => id.toString() === userId);
    const hasDownvoted = (question.downvotes || []).some(id => id.toString() === userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
        await Vote.deleteOne({ userId, questionId: question._id });
      } else {
        question.upvotes.push(userId);
        if (hasDownvoted) {
          question.downvotes = question.downvotes.filter(id => id.toString() !== userId);
        }
        await Vote.findOneAndUpdate(
          { userId, questionId: question._id },
          { userId, questionId: question._id, type: 'upvote' },
          { upsert: true, new: true }
        );
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        question.downvotes = question.downvotes.filter(id => id.toString() !== userId);
        await Vote.deleteOne({ userId, questionId: question._id });
      } else {
        question.downvotes.push(userId);
        if (hasUpvoted) {
          question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
        }
        await Vote.findOneAndUpdate(
          { userId, questionId: question._id },
          { userId, questionId: question._id, type: 'downvote' },
          { upsert: true, new: true }
        );
      }
    } else {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    await question.save();

    const updated = await Question.findById(req.params.id)
      .populate('userId', 'username avatar')
      .lean();

    const upvotes = (updated.upvotes || []).length;
    const downvotes = (updated.downvotes || []).length;
    const userVote = (updated.upvotes || []).some(id => id.toString() === userId)
      ? 'upvote'
      : (updated.downvotes || []).some(id => id.toString() === userId)
      ? 'downvote'
      : null;

    // ✅ Recompute FULL owner stats
    const ownerId = updated.userId && updated.userId._id ? updated.userId._id : updated.userId;
    const ownerQuestions = await Question.find({ userId: ownerId });
    const ownerAnswers = await Answer.find({ userId: ownerId });

    const totalUpvotesOnQuestions = ownerQuestions.reduce((s, q) => s + ((q.upvotes || []).length), 0);
    const totalDownvotesOnQuestions = ownerQuestions.reduce((s, q) => s + ((q.downvotes || []).length), 0);
    const totalUpvotesOnAnswers = ownerAnswers.reduce((s, a) => s + ((a.upvotes || []).length), 0);
    const totalDownvotesOnAnswers = ownerAnswers.reduce((s, a) => s + ((a.downvotes || []).length), 0);

    const ownerStats = {
      totalUpvotes: totalUpvotesOnQuestions + totalUpvotesOnAnswers,
      totalDownvotes: totalDownvotesOnQuestions + totalDownvotesOnAnswers,
      totalUpvotesOnQuestions,
      totalDownvotesOnQuestions,
      totalUpvotesOnAnswers,
      totalDownvotesOnAnswers,
      totalVotes: (totalUpvotesOnQuestions + totalUpvotesOnAnswers) -
                  (totalDownvotesOnQuestions + totalDownvotesOnAnswers)
    };

    res.json({
      success: true,
      question: updated,
      upvotes,
      downvotes,
      userVote,
      ownerStats
    });
  } catch (err) {
    console.error('❌ Vote error (question):', err);
    res.status(500).json({ error: 'Voting failed' });
  }
});




module.exports = router;
