const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vote', VoteSchema);
