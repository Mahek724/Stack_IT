// src/pages/AnswerPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../assets/css/answer.css';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [user, setUser] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [answersVisible, setAnswersVisible] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data.user));
    }
    axios.get(`/api/questions/${id}`).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  }, [id]);

  const handleVote = async (targetId, type, isQuestion = false) => {
  if (!user) {
    toast.info("Login required to vote"); // ✅ Show toast
    navigate('/login'); // ✅ Or redirect to login
    return;
  }

  try {
    const url = isQuestion ? `/api/questions/${targetId}/vote` : `/api/answers/${targetId}/${type}`;
    const payload = isQuestion ? { type } : {};
    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    // Refresh data
    axios.get(`/api/questions/${id}`).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  } catch (err) {
    toast.error("Vote failed");
    console.error(err);
  }
};


  const handleSubmitAnswer = async () => {
  if (!user) {
    toast.error("Please log in to submit an answer.");
    navigate('/login'); // 🔁 redirect guest to login page
    return;
  }

  const contentState = editorState.getCurrentContent();
  const rawContent = convertToRaw(contentState);
  const isEmpty = !rawContent.blocks.some(block => block.text.trim() !== "");

  if (isEmpty) {
    toast.error("Answer content cannot be empty.");
    return;
  }

  const content = draftToHtml(rawContent);

  try {
    await axios.post('/api/answers', { questionId: id, content }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    toast.success("Answer submitted successfully!");
    setEditorState(EditorState.createEmpty());
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  } catch (err) {
    toast.error("Failed to submit your answer. Try again.");
  }
};


  const handleAccept = async (answerId) => {
    await axios.put(`/api/questions/${id}/accept/${answerId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    axios.get(`/api/questions/${id}`).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  };

  const handleDelete = async (type, targetId) => {
  if (!window.confirm("Are you sure you want to delete?")) return;
  const url = type === 'question'
    ? `/api/questions/${targetId}`
    : `/api/answers/${targetId}`;

  try {
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (type === 'question') {
      toast.success("Question deleted successfully!");
      navigate('/');
    } else {
      toast.success("Answer deleted successfully!");
      axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
    }
  } catch (err) {
    toast.error("Failed to delete.");
    console.error(err);
  }
};


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (!question) return <div className="loading">Loading...</div>;

  const statusBadge = {
    Answered: { label: '🔵 Answered', className: 'status-answered' },
    Open: { label: '🟢 Open', className: 'status-open' },
    Unanswered: { label: '⚪ Unanswered', className: 'status-unanswered' },
  };

  const questionStatus = question.acceptedAnswer
    ? 'Answered'
    : answers.length === 0
    ? 'Unanswered'
    : 'Open';

  return (
    <div className="answer-page-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>{question.title}</span>
      </div>

      <div className="question-box">
        <div className="question-header-top">
  <div className="question-actions-left">
    <span className={`status-badge ${statusBadge[questionStatus].className}`}>
      {statusBadge[questionStatus].label}
    </span>
    {user?._id === question.userId?._id && (
      <>
        <button onClick={() => navigate(`/edit-question/${question._id}`)} className="edit-btn">✏️ Edit</button>
        <button onClick={() => handleDelete('question', question._id)} className="delete-btn">🗑️ Delete</button>
      </>
    )}
  </div>
  <div className="question-actions-right">
    <button className="share-link-btn" onClick={handleShare}>🔗 Share</button>
  </div>
</div>

<h2 className="question-heading">{question.title}</h2>


        <div className="question-desc"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.description) }}
        />

        {question.imageUrl && (
          <div className="question-image-wrapper">
            <img src={question.imageUrl} alt="question" className="question-image" />
          </div>
        )}

        {question.tags?.length > 0 && (
          <div className="question-tags">
            {question.tags.map((tag, idx) => (
              <span className="tag" key={idx}>{tag}</span>
            ))}
          </div>
        )}

        <div className="question-meta-row">
          <div className="question-status-date">
            <span className="last-activity">
              ⏱️ Last activity: {new Date(question.updatedAt || question.createdAt).toDateString()}
            </span>
            <span className="question-date">
              📅 {new Date(question.createdAt).toDateString()}
            </span>
          </div>

          <div className="question-votes-username">
            <div className="question-vote-block">
              <button
                className={`vote-icon ${question.upvotes.includes(user?._id) ? 'active-up' : ''}`}
                onClick={() => handleVote(id, 'upvote', true)}
              > 👍 </button>

              <div className="vote-count">{question.upvotes.length - question.downvotes.length}</div>

              <button
                className={`vote-icon ${question.downvotes.includes(user?._id) ? 'active-down' : ''}`}
                onClick={() => handleVote(id, 'downvote', true)}
              > 👎 </button>
            </div>

            <div className="question-user-inline">
              <img
                src={question.userId?.avatar?.startsWith('/api/')
                  ? `http://localhost:5000${question.userId.avatar}`
                  : question.userId?.avatar
                  ? `http://localhost:5000/api/uploads/${question.userId.avatar}`
                  : '/avatar.png'}
                alt="avatar"
                className="avatar small-avatar"
              />
              <span className="username">{question.userId?.username || "User"}</span>
            </div>
          </div>
        </div>
      </div>

      {answersVisible && (
        <div className="answers-section">
          <h3>{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h3>
          {answers.map(ans => (
            <div key={ans._id} className="answer-card">
              <div className="answer-body">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ans.content) }} />
                <div className="answer-footer-horizontal">
                  <span><i className="fas fa-user-circle"></i> {ans.username}</span>
                  <span className="answer-meta">
                    📅 {new Date(ans.createdAt).toDateString()} &nbsp; | &nbsp;
                    <strong>{ans.upvotes.length - ans.downvotes.length} votes</strong>
                  </span>
                  {user?._id === ans.userId && (
                    <div className="answer-controls">
                      <button onClick={() => navigate(`/edit-answer/${ans._id}`)}>Edit</button>
                      <button onClick={() => handleDelete('answer', ans._id)}>Delete</button>
                    </div>
                  )}
                  {question.userId === user?._id && !question.acceptedAnswer && (
                    <button className="accept-btn" onClick={() => handleAccept(ans._id)}>
                      <i className="fas fa-check-circle"></i> Accept
                    </button>
                  )}
                  {question.acceptedAnswer === ans._id && (
                    <span className="accepted-badge">
                      <i className="fas fa-check-circle"></i> Accepted
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="submit-answer">
        <h3>Submit Your Answer</h3>
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="rich-editor-wrapper"
          editorClassName="rich-editor"
        />
        <button className="preview-toggle-btn" onClick={() => setShowPreview(prev => !prev)}>
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
        {showPreview && (
          <div
            className="preview-box"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(draftToHtml(convertToRaw(editorState.getCurrentContent())))
            }}
          />
        )}
        <button className="submit-btn" onClick={handleSubmitAnswer}>Submit</button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default AnswerPage;
