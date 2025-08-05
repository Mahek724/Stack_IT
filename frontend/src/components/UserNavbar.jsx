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

      const res = await axios.get('/api/auth/me', {
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
  src={user.avatar ? user.avatar : defaultAvatar}
//  src={user.avatar || '/avatar.png'}
  alt="User Avatar"
  style={{
    height: '32px',
    width: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
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
