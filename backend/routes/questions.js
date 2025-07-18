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

module.exports = router;
