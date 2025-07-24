import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
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

  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get('/api/profile/me', config)
      .then(res => {
        if (res.data && res.data.user) {
          console.log('Avatar URL:', res.data.user.avatar);
          setUser(res.data.user);
          setNewUsername(res.data.user.username || '');
        }
      })
      .catch(err => console.error("Error fetching profile:", err));

    axios.get('/api/profile/my-questions', config)
      .then(res => {
        const allQuestions = res.data;
        setQuestions(allQuestions);

        const totalVotes = allQuestions.reduce(
          (sum, q) => sum + (q.upvotes.length - q.downvotes.length),
          0
        );
        const acceptedAnswers = allQuestions.filter(q => q.acceptedAnswer).length;

        setStats({
          totalQuestions: allQuestions.length,
          totalVotes,
          acceptedAnswers
        });
      })
      .catch(err => console.error("Error fetching questions:", err));

    axios.get('/api/profile/most-viewed', config)
      .then(res => setMostViewed(res.data))
      .catch(err => console.error("Error fetching most viewed question", err));
  }, []);

  const handleProfileUpdate = async (selectedFile) => {
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  let avatarUrl = user.avatar;

  // ✅ Upload to GridFS
  if (selectedFile) {
  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const uploadRes = await axios.post(
  '/api/upload-image',
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);


    avatarUrl = uploadRes.data.data.link;  // ✅ FIXED
  } catch (err) {
    console.error('Image upload failed:', err);
    return;
  }
}


  // ✅ Send update to backend
  const updateData = {
    avatar: avatarUrl,
  };

  if (newUsername && newUsername !== user.username) {
    updateData.username = newUsername;
  }

  try {
    await axios.put('/api/profile/update', updateData, config);
    window.location.reload(); // ✅ reload to reflect changes
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
      {/* Profile + Stats Row */}
      <div className="profile-stats-row">
  {/* Profile Card */}
  <section className="card user-info-card">
    <div className="avatar-section">
        <img
          src={user.avatar ? `${user.avatar}?t=${Date.now()}` : '/default-avatar.png'}
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

          // Call update only after setting state
          setTimeout(() => {
            handleProfileUpdate(file);  // pass file directly
          }, 100); // small delay ensures file is updated
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
      <p>{user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}</p>

      <p>
        <strong>Reputation:</strong>
        <span
          className="reputation-badge"
          style={{ color: calculateReputation().color }}
        >
          <i className="fas fa-award" /> {calculateReputation().label}
        </span>
      </p>
    </div>
  </section>

  {/* Separate Stats Card beside it */}
  <section className="card stats-card">
    <h3>Basic Stats</h3>
    <ul className="stats-list">
  <li>
    <i className="fas fa-circle-question icon"></i>
    <span>Total Questions:</span>
    <strong>{stats.totalQuestions}</strong>
  </li>
  <li>
    <i className="fas fa-thumbs-up icon"></i>
    <span>Total Votes:</span>
    <strong>{stats.totalVotes}</strong>
  </li>
  <li>
    <i className="fas fa-check-circle icon"></i>
    <span>Accepted Answers:</span>
    <strong>{stats.acceptedAnswers}</strong>
  </li>
</ul>

  </section>
</div>

{/* My Activity Summary */}
<section className="card activity-summary">
  <h3>My Activity Summary</h3>

  <div className="activity-item">
    <div
      className="activity-header"
      onClick={() => setShowVotes(prev => !prev)}
    >
      <strong>Recently Upvoted/Downvoted Questions</strong>
      <span>{showVotes ? '▲' : '▼'}</span>
    </div>
    {showVotes && (
      <ul className="activity-list">
        {questions.slice(0, 5).map(q => (
          <li key={q._id}>
            <a href={`/questions/${q._id}`}>{q.title}</a>
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
        {questions
          .filter(q => q.answers && q.answers.length > 0)
          .slice(0, 5)
          .map(q => (
            <li key={q._id}>
              <a href={`/questions/${q._id}`}>{q.title}</a>
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



      {/* My Questions */}
      {/* My Questions (Toggleable) */}
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
  <p className="q-desc">{q.description.slice(0, 100)}...</p>
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
    <span><strong>Date:</strong> {new Date(q.createdAt).toDateString()}</span>
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


      {/* Logout */}
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

    </div>
  );
};

export default ProfilePage;
