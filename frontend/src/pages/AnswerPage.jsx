import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../assets/css/answerPage.css';

const AnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data.user));
    }

    axios.get(`/api/questions/${id}`).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  }, [id]);

  const handleVote = async (answerId, type) => {
    if (!user) return alert("Please log in to vote.");
    await axios.post(`/api/answers/${answerId}/${type}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  };

  const handleSubmitAnswer = async () => {
    if (!user) return alert("Please log in to submit an answer.");
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    await axios.post('/api/answers', {
      questionId: id,
      content
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setEditorState(EditorState.createEmpty());
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  };

  const handleAccept = async (answerId) => {
    await axios.put(`/api/questions/${id}/accept`, { answerId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    axios.get(`/api/questions/${id}`).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  };

  if (!question) return <div className="loading">Loading...</div>;

  return (
    <div className="answer-page-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>{question.title}</span>
      </div>

      <div className="question-box">
        <h2>{question.title}</h2>
        <div className="question-tags">
          {question.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <p className="question-desc">{question.description}</p>
        <div className="meta">
          <span><i className="fas fa-calendar"></i> {new Date(question.createdAt).toDateString()}</span>
          <span><i className="fas fa-user"></i> {question.username}</span>
        </div>
      </div>

      <div className="answers-section">
        <h3>{answers.length} Answers</h3>
        {answers.map(ans => (
          <div key={ans._id} className="answer-card">
            <div className="vote-column">
              <i className="fas fa-thumbs-up vote-btn" onClick={() => handleVote(ans._id, 'upvote')}></i>
              <div className="vote-count">{ans.upvotes.length - ans.downvotes.length}</div>
              <i className="fas fa-thumbs-down vote-btn" onClick={() => handleVote(ans._id, 'downvote')}></i>
            </div>
            <div className="answer-body">
              <div dangerouslySetInnerHTML={{ __html: ans.content }} />
              <div className="answer-footer">
                <span><i className="fas fa-user-circle"></i> {ans.username}</span>
                {question.userId === user?._id && !question.acceptedAnswer &&
                  <button className="accept-btn" onClick={() => handleAccept(ans._id)}>
                    <i className="fas fa-check-circle"></i> Accept
                  </button>
                }
                {question.acceptedAnswer === ans._id &&
                  <span className="accepted-badge"><i className="fas fa-check-circle"></i> Accepted</span>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="submit-answer">
        <h3>Submit Your Answer</h3>
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="rich-editor-wrapper"
          editorClassName="rich-editor"
        />
        <button className="submit-btn" onClick={handleSubmitAnswer}>Submit</button>
      </div>
    </div>
  );
};

export default AnswerPage;
