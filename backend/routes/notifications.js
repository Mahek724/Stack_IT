const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middlewares/verifyToken');

// Get all notifications for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
  res.json(notifs);
});

// Get unread count
router.get('/unread-count', verifyToken, async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
  res.json({ count });
});

// Mark all as read
router.put('/mark-read', verifyToken, async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });
  res.json({ success: true });
});

module.exports = router;
