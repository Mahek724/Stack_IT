import React, { useState, useRef } from 'react';
import axios from 'axios';
import defaultAvatar from '../../public/avtar.png'; // ✅ Add default avatar to assets
import './ProfilePopup.css';

const ProfilePopup = ({ user, onLogout, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [preview, setPreview] = useState(user.avatar || defaultAvatar);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('username', username);
      if (fileInputRef.current.files[0]) {
        formData.append('avatar', fileInputRef.current.files[0]);
      }

      const res = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-popup">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <img
        src={preview || '/avtar.png'}
        alt="Profile"
        className="profile-img"
      />
      <input
        className="username-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="btn-group">
        <button onClick={handleSave}>Save</button>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default ProfilePopup;
