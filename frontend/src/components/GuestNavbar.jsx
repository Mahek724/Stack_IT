import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/navbar.css';

const GuestNavbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">Stack_IT</Link>
      </div>
      <div className="nav-right">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </nav>
  );
};

export default GuestNavbar;
