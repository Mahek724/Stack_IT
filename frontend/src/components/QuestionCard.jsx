import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/questionCard.css';

const QuestionCard = ({ question }) => {
  const upvotes = question.upvotes || [];
  const downvotes = question.downvotes || [];
  const answers = question.answers || [];
  const netVotes = upvotes.length - downvotes.length;

let questionStatus = 'Open';
if (question.acceptedAnswer) {
  questionStatus = 'Answered';
} else if ((question.answers?.length || 0) === 0) {
  questionStatus = 'Unanswered';
}

const statusBadge = {
  Answered: { label: '🔵 Answered', className: 'status-answered' },
  Open: { label: '🟢 Open', className: 'status-open' },
  Unanswered: { label: '⚪ Unanswered', className: 'status-unanswered' },
};


  return (
    <div className="question-card">
      <span className={`status-badge ${statusBadge[questionStatus].className}`}>
        {statusBadge[questionStatus].label}
      </span>
      <div className="question-header">
        <Link to={`/questions/${question._id}`} className="question-title">
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
              src={
                question.userId?.avatar
                  ? question.userId.avatar.startsWith('/api/')
                    ? `${import.meta.env.VITE_API_BASE_URL}${question.userId.avatar}`
                    : `${import.meta.env.VITE_API_BASE_URL}/api/uploads/${question.userId.avatar}`
                  : '/avatar.png'
              }
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

          <div className="vote-display">
            👍 Votes: <span className="vote-count">{netVotes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
