import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GoogleCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = JSON.parse(decodeURIComponent(urlParams.get('user') || '{}'));

    if (token && user) {
      login(token, user); // save to context
      navigate('/');
    } else {
      alert('Login failed or invalid callback.');
      navigate('/login');
    }
  }, [login, navigate]);

  return <p>Logging in with Google...</p>;
}

export default GoogleCallback;
