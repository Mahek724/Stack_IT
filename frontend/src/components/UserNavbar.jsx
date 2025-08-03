import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import '../assets/css/navbar.css';
import Notification from '../components/Notification';
import axios from '../../src/axios';


const UserNavbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await get('http://localhost:5000/api/auth/me', {
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

          <Notification /> 

          <Link to="/profile" className="icon profile-icon" aria-label="Profile">
            {user ? (
              <img
                src={
                  user.avatar
                    ? user.avatar.startsWith('/api/')
                      ? `http://localhost:5000${user.avatar}`
                      : `http://localhost:5000/api/uploads/${user.avatar}`
                    : '/default-avatar.png'
                }
                alt="Profile"
                className="navbar-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/avatar.png';
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
