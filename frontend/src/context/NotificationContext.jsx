import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const NotificationContext = createContext();
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const token = localStorage.getItem('token');


  const fetchUnreadCount = async () => {
  const res = await axios.get('http://localhost:5000/api/notifications/unread-count', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  setUnread(res.data.count);
};

const fetchNotifications = async () => {
  const res = await axios.get('http://localhost:5000/api/notifications', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  setNotifications(res.data);
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
