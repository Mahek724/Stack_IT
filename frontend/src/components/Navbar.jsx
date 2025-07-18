import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import '../assets/css/navbar.css';
import axios from 'axios';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState('');
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Toggle profile popup
  const handleToggleProfile = () => {
    setShowProfile((prev) => !prev);
  };

  // ✅ Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowProfile(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Fetch user on mount
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
      setUsername(res.data.username);
      setPreview(res.data.avatar && res.data.avatar.trim() !== '' ? res.data.avatar : '/avtar.png');

    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  fetchUser();
}, []);


  // ✅ Update image preview
  const handleFileChange = (e) => {

    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  // ✅ Save username + avatar
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { username };

      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);

        const uploadRes = await axios.post(
          'http://localhost:5000/api/users/upload-avatar',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        payload.avatar = uploadRes.data.avatar;
      }

      const res = await axios.put(
        'http://localhost:5000/api/user/update-profile',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setShowProfile(false);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile');
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowProfile(false);
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">Stack_IT</Link>
      </div>
      <div className="nav-right">
        <Link to="/">Home</Link>
        <span className="icon" aria-label="Notifications">
          <FaBell />
        </span>
        <span className="icon profile-icon" onClick={handleToggleProfile}>
          <FaUserCircle />
        </span>

        {/* ✅ Profile Popup */}
        {showProfile && user && (
          <div className="profile-popup" ref={popupRef}>
            <button className="close-popup" onClick={() => setShowProfile(false)}>×</button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <img
              src={preview && preview.trim() !== '' ? preview : '/avtar.png'}
              alt="avatar"
              className="profile-avatar"
              onClick={() => fileInputRef.current.click()}
            />


            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
              readOnly={!isEditing}
            />

            <div className="btn-group">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}>Edit</button>
              ) : (
                <button onClick={handleSave} className="save-btn">Save</button>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
