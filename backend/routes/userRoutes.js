const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/User');
const axios = require('axios');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const base64Image = file.buffer.toString('base64');

    const imgbbRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY`,
      new URLSearchParams({
        image: base64Image
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const imageUrl = imgbbRes.data.data.url;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: imageUrl },
      { new: true }
    );

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Avatar upload failed' });
  }
});

module.exports = router;
