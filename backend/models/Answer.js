const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',           // ✅ Links to the Question model
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',               // Optional: if you have users
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Answer', AnswerSchema);
