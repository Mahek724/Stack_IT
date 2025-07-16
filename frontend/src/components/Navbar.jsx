import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import '../assets/css/navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <div className="nav-left">
      <Link to="/" className="brand">Stack_IT</Link>
    </div>
    <div className="nav-right">
      <Link to="/">Home</Link>
      <FaBell className="icon" />
      <FaUserCircle className="icon" />
    </div>
  </nav>
);

export default Navbar;
