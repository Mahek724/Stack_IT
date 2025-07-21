const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [String],
  imageFileName: { type: String, default: null }, // or imageId for GridFS ObjectId
  views: { type: Number, default: 0},
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  status: { type: String, enum: ['open', 'answered', 'closed', 'resolved', 'flagged', 'pending'], default: 'open'},
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null},
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
