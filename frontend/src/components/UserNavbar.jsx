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

        setUser(res.data);
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
          <FaUserCircle />
        </Link>
      </div>
    </nav>
  );
};

export default UserNavbar;
