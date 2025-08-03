import { createContext, useState, useEffect } from 'react';
import axios from '../../src/axios';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token'); // ✅ moved inside
    if (!token) return; // 🔒 skip if not logged in

    try {
      const res = await axios.get('/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUnread(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err.message);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token'); // ✅ moved inside
    if (!token) return;

    try {
      const res = await axios.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unread, fetchNotifications, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
