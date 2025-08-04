import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../src/axios';
import '../assets/css/signup.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';


function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

   const { login } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
     const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, form);
      localStorage.setItem('token', res.data.token);
      login(res.data.token, res.data.user); 
      navigate('/login'); 
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <div className="input-icon-wrapper">
          <FaUser className="input-icon" />
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        </div>

        <div className="input-icon-wrapper">
          <FaEnvelope className="input-icon" />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        </div>

        <div className="input-icon-wrapper">
          <FaLock className="input-icon" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        </div>

        <button type="submit">Sign Up</button>
        <div className="auth-bottom-link">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Log In</Link>
        </div>

      </form>
    </div>
  );
}

export default Signup;
