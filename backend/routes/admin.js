const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const router = express.Router();

router.get('/dashboard', verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

router.delete('/delete-user/:id', verifyToken, verifyAdmin, async (req, res) => {
  res.json({ message: 'User deleted by admin' });
});

module.exports = router;
