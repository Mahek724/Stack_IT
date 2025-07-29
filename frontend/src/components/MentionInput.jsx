import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/mention.css'; // Assuming you have a CSS file for styling

export default function MentionInput({ value, onChange }) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [user, setUser] = useState(null);
  const [cursor, setCursor] = useState(-1);

  // components/MentionInput.jsx
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(res.data.user); // ✅ updated for your actual response structure
    } catch (err) {
      console.error('❌ Failed to fetch user:', err);
    }
  };

  fetchUser();
}, []);


  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    const lastWord = val.split(/\s/).pop();
    if (lastWord.startsWith('@')) setShowSuggest(true);
    else setShowSuggest(false);
  };

  const handleSelect = () => {
    if (!user) return;
    const words = value.split(/\s/);
    words[words.length - 1] = `@${user.username}`;
    onChange(words.join(' ') + ' ');
    setShowSuggest(false);
  };

  return (
    <div className="mention-container">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Type your answer and mention @username..."
        rows={6}
        className="mention-input"
      />
      {showSuggest && user && (
        <div className="mention-suggestions">
          <div onClick={handleSelect}>@{user.username}</div>
        </div>
      )}
    </div>
  );
}
