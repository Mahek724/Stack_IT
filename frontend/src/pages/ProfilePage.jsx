import React, { useEffect, useState, useRef } from 'react';
import axios from '../../src/axios';
import '../assets/css/profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [questions, setQuestions] = useState([]);
  const [mostViewed, setMostViewed] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [showVotes, setShowVotes] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showMostViewed, setShowMostViewed] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [votedQuestions, setVotedQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showVoteDetails, setShowVoteDetails] = useState(false);


// ...other code
useEffect(() => {
  const handleStatsUpdated = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('/api/profile/me', config)
      .then(res => {
        if (res.data && res.data.user) {
          setStats(res.data.stats);
        }
      });
  };

  window.addEventListener('profileStatsUpdated', handleStatsUpdated);
  return () => window.removeEventListener('profileStatsUpdated', handleStatsUpdated);
}, []);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const config = { headers: { Authorization: `Bearer ${token}` } };

  axios.get('/api/profile/me', config)
    .then(res => {
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setNewUsername(res.data.user.username || '');
        setStats(res.data.stats);  
      }
    })
    .catch(err => console.error("Error fetching profile:", err));

  axios.get('/api/profile/my-questions', config)
    .then(res => {
      const allQuestions = res.data;
      setQuestions(allQuestions);
      // DO NOT CALL setStats HERE!
    })
    .catch(err => console.error("Error fetching questions:", err));

  axios.get('/api/profile/most-viewed', config)
    .then(res => setMostViewed(res.data))
    .catch(err => console.error("Error fetching most viewed question", err));

  axios.get('/api/profile/my-votes', config)
    .then(res => setVotedQuestions(res.data))
    .catch(err => console.error("Error fetching vote history", err));

  axios.get('/api/profile/my-answers', config)
    .then(res => setAnsweredQuestions(res.data))
    .catch(err => console.error("Error fetching answered questions", err));
}, []);

  const handleProfileUpdate = async (selectedFile) => {
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  let avatarUrl = user.avatar;
  let avatarUpdated = false;
  let usernameUpdated = false;

  if (selectedFile) {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const uploadRes = await axios.post('/api/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      avatarUrl = uploadRes.data.data.link;
      avatarUpdated = true;
    } catch (err) {
      console.error('Image upload failed:', err);
      return;
    }
  }

  const updateData = {};

  if (avatarUpdated && avatarUrl !== user.avatar) {
    updateData.avatar = avatarUrl;
  }

  if (newUsername.trim() && newUsername.trim() !== user.username) {
    // Optional: Add frontend validation here (e.g., no special characters, min length)
    updateData.username = newUsername.trim();
    usernameUpdated = true;
  }

  if (!avatarUpdated && !usernameUpdated) {
    console.log("No changes to update.");
    setIsEditing(false);
    return;
  }

  try {
    await axios.put('/api/profile/update', updateData, config);
    setUser(prev => ({ ...prev, ...updateData }));
  } catch (err) {
    console.error('Profile update failed:', err);
  }

  setIsEditing(false);
};



  const calculateReputation = () => {
    const score = stats.totalVotes + (stats.acceptedAnswers * 10);
    if (score >= 100) return { label: 'Expert', color: 'gold' };
    if (score >= 50) return { label: 'Contributor', color: 'dodgerblue' };
    return { label: 'Beginner', color: 'gray' };
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-stats-row">
  <section className="card user-info-card">
    <div className="avatar-section">
        <img
          // src={user.avatar ? `${user.avatar}?t=${Date.now()}` : '/avatar.png'}
          
  src={
    user.avatar?.startsWith('http')
      ? `${user.avatar}?t=${Date.now()}`
      : `https://stackit-backend-6nrt.onrender.com${user.avatar || '/avatar.png'}?t=${Date.now()}`
  }

          alt="Avatar"
          className="clickable-avatar"
          onClick={() => fileInputRef.current.click()}
        />

      <div className="reputation-box">
  <div className="rep-header">
    <i className="fas fa-star rep-icon"></i>
    <span className="rep-title">Reputation</span>
  </div>
  <p className="rep-score">Score: {stats.totalVotes + (stats.acceptedAnswers * 10)}</p>
  <p className="rep-next">
    {(() => {
      const score = stats.totalVotes + (stats.acceptedAnswers * 10);
      if (score < 50) return `${50 - score} pts to reach Contributor badge!`;
      if (score < 100) return `${100 - score} pts to reach Expert badge!`;
      return `You're at the highest badge! 🎉`;
    })()}
  </p>
</div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          setAvatarFile(file);

          setTimeout(() => {
            handleProfileUpdate(file);  
          }, 100); 
        }
      }}

      />
    </div>

    <div className="info-section">
      <div className="username-row">
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="username-input"
          disabled={!isEditing}
        />
        <button
          onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
          className="save-btn"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <p><strong>Email: </strong>{user.email}</p>
      <p><strong>Role: </strong> {user.role}</p>
      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}</p>

      <div>
  <strong>Reputation:</strong>
  <div className="rep-tooltip">
    <div className={`rep-badge ${calculateReputation().label.toLowerCase()}`}>
      <i className="fas fa-medal" />
      {calculateReputation().label}
    </div>
    <span className="rep-tooltip-text">
      {(() => {
        const score = stats.totalVotes + (stats.acceptedAnswers * 10);
        if (score < 50) return `${50 - score} points to reach Contributor!`;
        if (score < 100) return `${100 - score} points to reach Expert!`;
        return `Max badge achieved 🎉`;
      })()}
    </span>
  </div>
</div>


    </div>
  </section>

  <section className="card stats-card">
    <h3>Basic Stats</h3>
    <ul className="stats-list">
  <li>
    <i className="fas fa-circle-question icon"></i>
    <span>Total Questions:</span>
    <strong>{stats.totalQuestions}</strong>
  </li>
  <li>
  <i className="fas fa-pen icon"></i>
  <span>Total Answers:</span>
  <strong>{stats.totalAnswers}</strong>
</li>
 <li>
    <i className="fas fa-check-circle icon"></i>
    <span>Accepted Answers:</span>
    <strong>{stats.acceptedAnswers}</strong>
  </li>

  <li>
  <i className="fas fa-thumbs-up icon"></i>
  <span>Total Votes:</span>
  <strong>{stats.totalVotes}</strong>
  <div style={{ marginTop: '0.5rem' }}>
  <button
    style={{
      padding: '6px 12px',
      background: '#1d4ed8',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      cursor: 'pointer'
    }}
    onClick={() => setShowVoteDetails(true)}
  >
    Summary
  </button>
</div>
</li>
</ul>
  </section>
</div>

<section className="card activity-summary">
  <h3>My Activity Summary</h3>

  <div className="activity-item">
  <div
    className="activity-header"
    onClick={() => setShowVotes(prev => !prev)}
  >
    <strong>Recently Upvoted/Downvoted Questions/Answers</strong>
    <span>{showVotes ? '▲' : '▼'}</span>
  </div>
  {showVotes && (
    <ul className="activity-list">
      {votedQuestions.slice(0, 5).map(vote => (
        <li key={vote._id}>
          {vote.questionId ? (
            <a href={`/questions/${vote.questionId._id}`}>Voted on: {vote.questionId.title}</a>
          ) : vote.answerId && vote.answerId.questionId ? (
            <a href={`/questions/${vote.answerId.questionId._id}`}>Voted on: Answer in "{vote.answerId.questionId.title}"</a>
          ) : (
            <span>Unknown vote</span>
          )}
        </li>
      ))}

    </ul>
  )}
</div>


  <div className="activity-item">
  <div
    className="activity-header"
    onClick={() => setShowAnswers(prev => !prev)}
  >
    <strong>Recently Answered Questions</strong>
    <span>{showAnswers ? '▲' : '▼'}</span>
  </div>
  {showAnswers && (
    <ul className="activity-list">
      {answeredQuestions.slice(0, 5).map(answer => (
        <li key={answer._id}>
          <a href={`/questions/${answer.questionId._id}`}>
            {answer.questionId.title}
          </a>
        </li>
      ))}
    </ul>
  )}
</div>


  <div className="activity-item">
    <div
      className="activity-header"
      onClick={() => setShowMostViewed(prev => !prev)}
    >
      <strong>Most Viewed Question</strong>
      <span>{showMostViewed ? '▲' : '▼'}</span>
    </div>
    {showMostViewed && mostViewed && (
      <ul className="activity-list">
        <li>
          <a href={`/questions/${mostViewed._id}`}>{mostViewed.title}</a>
        </li>
      </ul>
    )}

  </div>
</section>

<section className="card questions">
  <div className="activity-header" onClick={() => setShowQuestions(prev => !prev)}>
    <h3>My Questions</h3>
    <span>{showQuestions ? '▲' : '▼'}</span>
  </div>
  {showQuestions && (
    <div className="question-list">
      {questions.map(q => (
        <div key={q._id} className="question-card">
  <a href={`/questions/${q._id}`} className="q-title">{q.title}</a>
  <p
  className="q-desc"
  dangerouslySetInnerHTML={{
    __html: q.description.length > 100
      ? q.description.slice(0, 100) + '...'
      : q.description
  }}
></p>

  <div className="q-meta">
    <span><strong>Tags:</strong> {q.tags.map(tag => (
      <span key={tag} style={{
        backgroundColor: '#dbeafe',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        marginLeft: '6px',
        color: '#1e40af'
      }}>{tag}</span>
    ))}</span>
    <span>
  <strong>Date:</strong>{' '}
  {new Date(q.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}
</span>

    <span><strong>Status:</strong>
      <span className="q-status-pill">{q.status}</span>
    </span>
    <span><strong>Votes:</strong> {q.upvotes.length - q.downvotes.length}</span>
  </div>
</div>

      ))}
    </div>
  )}
</section>

      <section className="card logout">
  <button
    onClick={() => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      axios.post('/api/profile/logout-all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      })
      .catch(err => {
        console.error("Logout failed:", err.response?.data || err.message);
      });
    }}
  >
    Logout
  </button>
</section>
{showVoteDetails && (
  <div className="modal-overlay" onClick={() => setShowVoteDetails(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <span className="close-btn" onClick={() => setShowVoteDetails(false)}>×</span>
      <h2>Voting Summary</h2>
      <ul className="vote-details-dropdown" style={{ marginTop: '1rem' }}>
        <li><span style={{fontWeight: 'bold'}}>👍 Total Upvotes:</span> <strong>{stats.totalUpvotes}</strong></li>
        <li><span style={{fontWeight: 'bold'}}>👎 Total Downvotes:</span> <strong>{stats.totalDownvotes}</strong></li>
        <li><span>👍 On Questions:</span> <strong>{stats.totalUpvotesOnQuestions}</strong></li>
        <li><span>👎 On Questions:</span> <strong>{stats.totalDownvotesOnQuestions}</strong></li>
        <li><span>👍 On Answers:</span> <strong>{stats.totalUpvotesOnAnswers}</strong></li>
        <li><span>👎 On Answers:</span> <strong>{stats.totalDownvotesOnAnswers}</strong></li>
      </ul>
    </div>
  </div>
)}
    </div>
  );
};

export default ProfilePage;
