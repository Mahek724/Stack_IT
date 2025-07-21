import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/questionCard.css';

const QuestionCard = ({ question }) => {
  const upvotes = question.upvotes || [];
  const downvotes = question.downvotes || [];
  const answers = question.answers || [];
  const totalVotes = upvotes.length + downvotes.length;
  const votePercent = totalVotes === 0 ? '0%' : `${Math.round((upvotes.length / totalVotes) * 100)}%`;

  return (
    <div className="question-card">
      <div className="question-header">
        <Link to={`/question/${question._id}`} className="question-title">
          {question.title}
        </Link>
        <div
          className="question-desc"
          dangerouslySetInnerHTML={{
            __html: question.description
              ? question.description.replace(/<img[^>]*>/g, '').slice(0, 300) + '...'
              : ''
          }}
        />

      </div>

      <div className="question-footer">
        <div className="left-info">
          <div className="tags">
            {question.tags?.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <div className="author">
            <img
              src={question.userId?.avatar || '/default-avatar.png'}
              alt="avatar"
              className="avatar"
            />
            <span className="username">{question.userId?.username || 'User'}</span>
          </div>
        </div>

        <div className="right-info">
          <div className="metadata">
            📅 {new Date(question.createdAt).toLocaleDateString()} &nbsp;|&nbsp;
            👀 {question.views || 0} &nbsp;|&nbsp;
            💬 {answers.length}
            {question.acceptedAnswer && <span className="accepted"> ✅ Accepted</span>}
          </div>

          <div className="vote-box">
            <button className="vote-btn">👍</button>
            <span className="vote-count">{upvotes.length - downvotes.length}</span>
            <button className="vote-btn">👎</button>
            <span className="vote-percent">({votePercent})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
