require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const authRoutes = require('./routes/auth'); 
// const userRoutes = require('./routes/user'); 
// const adminRoutes = require('./routes/admin');
// const questionRoutes = require('./routes/questions');
// const notificationRoutes = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

// routes
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/questions', questionRoutes);
// app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });




app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
