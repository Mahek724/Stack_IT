import React, { useState, useContext, useEffect } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/notification.css';

export default function Notification() {
  const { notifications, unread, fetchNotifications, fetchUnreadCount } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');
  const [openIndex, setOpenIndex] = useState(null);


  const toggleDropdown = async () => {
  setOpen(!open);
  if (!open) {
    await fetchNotifications();

    await axios.put('http://localhost:5000/api/notifications/mark-read', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchUnreadCount();
  }
};

  return (
    <div className="notification-container">
      <div className="icon" onClick={toggleDropdown}>
        🔔
        {unread > 0 && <span className="badge">{unread}</span>}
      </div>

      {open && (
  <div className="dropdown">
    <button className="close-btn" onClick={() => setOpen(false)}>×</button>

    {notifications.length === 0 ? (
      <div className="empty">No new notifications</div>
    ) : (

      notifications.map((n, idx) => (
        <div
          className={`notification-item ${openIndex === idx ? 'show-dropdown' : ''}`}
          key={idx}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to={n.link} style={{ textDecoration: 'none', color: '#0d6efd', fontWeight: 'medium' }}>
              {n.message}
            </Link>

            <button
              className="item-dropdown-toggle"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              ⋯
            </button>
          </div>

          {openIndex === idx && (
            <div className="item-dropdown">
              <div>Mark as read</div>
              <div>Delete</div>
              <div>Mute</div>
            </div>
          )}

          <span className="time">{new Date(n.createdAt).toLocaleString()}</span>
        </div>
      ))

    )}
  </div>
)}
    </div>
  );
}
