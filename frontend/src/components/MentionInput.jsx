import React, { useState, useEffect } from 'react';
import '../assets/css/mention.css'; 
import axios from '../../src/axios';

export default function MentionInput({ value, onChange }) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [user, setUser] = useState(null);
  const [cursor, setCursor] = useState(-1);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(res.data.user); 
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
