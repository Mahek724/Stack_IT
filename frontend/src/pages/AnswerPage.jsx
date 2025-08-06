import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../src/axios';
import { EditorState, convertToRaw, Modifier } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../assets/css/answer.css';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';



const AnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [user, setUser] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionActive, setMentionActive] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const location = useLocation();
  const editorContentRef = useRef();

  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data.user));
    }
    axios.get(`/api/questions/${id}`).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  }, [id]);

  // Handle click outside to close mention dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.mention-dropdown')) {
        setMentionActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch question and answers on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const guestIdKey = 'guestId';
    let headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      let guestId = localStorage.getItem(guestIdKey);
      if (!guestId) {
        guestId = `guest_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(guestIdKey, guestId);
      }
      headers['x-guest-id'] = guestId;
    }
    axios.get(`/api/questions/${id}`, { headers }).then(res => setQuestion(res.data));
    axios.get(`/api/answers/question/${id}`).then(res => setAnswers(res.data));
  }, [id]);

  // Scroll to answer if answerId is in URL
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const answerId = params.get("answerId");
  if (answerId) {
    setTimeout(() => {
      const el = document.getElementById(`answer-${answerId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlighted");
        setTimeout(() => el.classList.remove("highlighted"), 2500);
      }
    }, 400);
  }
}, [answers]);

  // Handle vote logic
  const handleVote = async (targetId, type, isQuestion = false) => {
    if (!user) {
      toast.info("Login required to vote");
      navigate('/login');
      return;
    }

    try {
      const url = isQuestion
        ? `/api/questions/${targetId}/vote`
        : `/api/answers/vote/${targetId}`;

      await axios.post(url, { type }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const [questionRes, answersRes] = await Promise.all([
        axios.get(`/api/questions/${id}`),
        axios.get(`/api/answers/question/${id}`)
      ]);
      setQuestion(questionRes.data);
      setAnswers(answersRes.data);

      const token = localStorage.getItem('token');
      const res = await axios.get('/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.dispatchEvent(new CustomEvent('profileStatsUpdated', {
        detail: res.data.stats
      }));
    } catch (err) {
      toast.error("Vote failed");
      console.error(err);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!user) {
      toast.error("Please log in to submit an answer.");
      navigate('/login');
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

  // Handle accepting an answer
  const handleAccept = async (answerId) => {
    await axios.post(`/api/answers/accept/${answerId}`, {}, {
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

  // Handle share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };
  const handleEditorChange = useCallback((newState) => {
  setEditorState(newState);

  const content = newState.getCurrentContent();
  const selection = newState.getSelection();
  const block = content.getBlockForKey(selection.getStartKey());
  const text = block.getText();
  const anchorOffset = selection.getAnchorOffset();
  const charBeforeCursor = text.slice(0, anchorOffset);
  const match = charBeforeCursor.match(/@([a-zA-Z0-9\s]*)$/);

  if (match) {
    const query = match[1].trim();

    axios.get(`/api/auth/search?q=${query}`)
      .then(res => {
        setMentionSuggestions(res.data);
        setMentionActive(true);
        setMentionQuery(query);

          setTimeout(() => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();
  const editorRect = editorContentRef.current?.getBoundingClientRect();

  if (rect && editorRect) {
    setDropdownPos({
      top: rect.top - editorRect.top + 24,
      left: rect.left - editorRect.left,
    });
  }
}, 0);

        })
        .catch(() => {
          setMentionSuggestions([]);
          setMentionActive(false);
        });
    } else {
      setMentionSuggestions([]);
      setMentionActive(false);
    }
  }, []);

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


  const insertMention = (user) => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const block = contentState.getBlockForKey(selection.getStartKey());
  const text = block.getText().slice(0, selection.getAnchorOffset());
  const match = text.match(/@([a-zA-Z0-9\s]*)$/);
  if (!match) return;

  const start = selection.getStartOffset() - match[0].length;
  const end = selection.getStartOffset();

  const newSelection = selection.merge({
    anchorOffset: start,
    focusOffset: end,
  });

  const newContentState = Modifier.replaceText(
    contentState,
    newSelection,
    `@${user.username} `,
    editorState.getCurrentInlineStyle()
  );

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'insert-characters'
  );

  setEditorState(
  EditorState.forceSelection(
    EditorState.push(
      editorState,
      newContentState,
      'insert-characters'
    ),
    newContentState.getSelectionAfter()
  )
);

  setMentionActive(false);
};

const highlightMentions = (html) => {
  return html.replace(/@([a-zA-Z0-9._-]+)/g, '<span class="mention-highlight">@$1</span>');

};

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
  src={
    question.userId?.avatar?.startsWith('/api/')
      ? `${import.meta.env.VITE_API_BASE_URL}${question.userId.avatar}`
      : question.userId?.avatar || '/avatar.png'
  }
  alt="avatar"
  className="avatar"
/>



              <span className="username">{question.userId?.username || "User"}</span>
            </div>
          </div>
        </div>
      </div>

      {answers.map(ans => (
          <div key={ans._id} id={`answer-${ans._id}`} className="answer-card">

          <div className="answer-body">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightMentions(ans.content)) }} />


            <div className="answer-vote-block">
              <button
                className={`vote-icon ${ans.upvotes.includes(user?._id) ? 'active-up' : ''}`}
                onClick={() => handleVote(ans._id, 'upvote')}
              > 👍 </button>

              <div className="vote-count">{ans.upvotes.length - ans.downvotes.length}</div>

              <button
                className={`vote-icon ${ans.downvotes.includes(user?._id) ? 'active-down' : ''}`}
                onClick={() => handleVote(ans._id, 'downvote')}
              > 👎 </button>
            </div>

            <div className="answer-footer-horizontal">
              <div className="question-user-inline">
                <img
  src={
    ans.userId?.avatar?.startsWith('/api/')
      ? `${import.meta.env.VITE_API_BASE_URL}${ans.userId.avatar}`
      : ans.userId?.avatar || '/avatar.png'
  }
  alt="avatar"
  className="avatar"
/>





                 
                <span className="username">{ans.userId?.username || "User"}</span>
              </div>

              <span className="answer-meta">
                📅 {new Date(ans.createdAt).toDateString()} &nbsp; | &nbsp;
                <strong>{ans.upvotes.length - ans.downvotes.length} votes</strong>
              </span>

              {user?._id === ans.userId?._id && (
                <div className="answer-controls">
                  <button onClick={() => navigate(`/edit-answer/${ans._id}`)}>Edit</button>
                  <button onClick={() => handleDelete('answer', ans._id)}>Delete</button>
                </div>
              )}

              {question.userId?._id === user?._id && !question.acceptedAnswer && (
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

      <div className="submit-answer">
        <h3>Submit Your Answer</h3>
        <div style={{ position: 'relative' }}>
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorChange}
            wrapperClassName="rich-editor-wrapper"
            editorClassName="rich-editor"
            editorRef={(ref) => {
              if (ref) editorContentRef.current = ref.editor;
            }}
          />

          {/* Mention Dropdown */}
          {mentionActive && mentionSuggestions.length > 0 && (
            <div
              className="mention-dropdown"
              style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left,
                zIndex: 9999
              }}
            >
              {mentionSuggestions.map((user, idx) => (
                <div
                  key={user._id}
                  className="mention-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault(); 
                    insertMention(user); 
                  }}
                >
                  <img
                    src={user.avatar?.startsWith('/api/')
                      ? `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`
                      : user.avatar || '/avatar.png'}
                    alt="avatar"
                    className="avatar small-avatar"
                  />
                  @{user.username}
                </div>

              ))}
            </div>
          )}
        </div>

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