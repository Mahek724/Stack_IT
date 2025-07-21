import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

      axios
      .get('http://localhost:5000/api/auth/me', {   // ✅ unified
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(err => {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);

        // Redirect to login if unauthorized (token expired or invalid)
        if (err.response?.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return { user, loading, logout };
};

export default useAuth;