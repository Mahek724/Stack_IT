import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/login.css';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // adjust path if needed


function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 extract the `login` function


  // ✅ 1. On load, check for saved credentials
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('rememberedCredentials'));
    if (saved) {
      setForm({
        email: saved.email || '',
        password: saved.password ? atob(saved.password) : '', // decode Base64 password
        remember: true
      });
    }
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCheckbox = e => setForm({ ...form, remember: e.target.checked });

  // ✅ 2. Save/remove credentials on submit based on "remember"
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: form.email,
          password: form.password,
          remember: form.remember,
        },
        {
          withCredentials: true,
        }
      );

      // ✅ Save or remove credentials with password Base64-encoded
      if (form.remember) {
        localStorage.setItem(
          'rememberedCredentials',
          JSON.stringify({
            email: form.email,
            password: btoa(form.password), // encode password
          })
        );
      } else {
        localStorage.removeItem('rememberedCredentials');
      }

     login(res.data.token, res.data.user); // 👈 update context
      navigate('/');

    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.open('http://localhost:5000/api/auth/google', '_self');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Log In</h2>

        <div className="input-icon-wrapper">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-icon-wrapper">
          <FaLock className="input-icon" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="remember-forgot-row">
            <label className="remember-me">
              <input
                type="checkbox"
                className="remember-checkbox"
                checked={form.remember}
                onChange={handleCheckbox}
              />
              Remember me
            </label>

            <div className="forgot-password-link-inline">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>


        <div className="login-btn-wrapper">
        <button type="submit">Log In</button>
        </div>

        <p style={{ textAlign: 'center', margin: '0.1rem 0', color: '#213547' }}>or Login with</p>

        <div className="google-btn-wrapper">
          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              className="google-logo"
            />
            Login with Google
          </button>
        </div>

        <div className="auth-bottom-link">
          <span>Don't have an account?</span>
          <Link to="/signup" className="auth-link">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
