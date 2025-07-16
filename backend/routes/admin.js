// 📁 routes/admin.js
const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

const router = express.Router();

// Example: Only admin can access this
router.get('/dashboard', verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

// Example: Only admin can delete a user
router.delete('/delete-user/:id', verifyToken, verifyAdmin, async (req, res) => {
  // ...code to delete user
  res.json({ message: 'User deleted by admin' });
});

module.exports = router;
