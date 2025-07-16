require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPwd = await bcrypt.hash('admin123', 10);

    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPwd,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created');
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
