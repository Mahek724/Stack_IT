const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/User');
const axios = require('axios');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Unified route: Update username + avatar
router.put('/update-profile', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { username } = req.body;
    const updates = {};

    // Update username if provided
    if (username) updates.username = username;

    // If avatar image is uploaded
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');

      const imgbbRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY`,
        new URLSearchParams({ image: base64Image }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const imageUrl = imgbbRes.data.data.url;
      updates.avatar = imageUrl;
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

    res.json({
      username: updatedUser.username,
      avatar: updatedUser.avatar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router;
