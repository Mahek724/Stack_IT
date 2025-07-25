import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import '../assets/css/navbar.css';
import axios from 'axios';

const UserNavbar = () => {
  const [user, setUser] = useState(null);

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

console.log('Fetched user:', res.data);
setUser(res.data.user);

      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

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
        <Link to="/profile" className="icon profile-icon" aria-label="Profile">
          {user ? (
  <img
    src={
      user.avatar
        ? user.avatar.startsWith('/api/')
          ? `http://localhost:5000${user.avatar}`
          : `http://localhost:5000/api/uploads/${user.avatar}`
        : '/default-avatar.png' // ✅ fallback to default image
    }
    alt="Profile"
    className="navbar-avatar"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/avatar.png'; // ✅ fallback if broken image
    }}
  />
) : (
  <FaUserCircle />
)}


        </Link>
      </div>
    </nav>
  );
};

export default UserNavbar;
