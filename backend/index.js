require('dotenv').config();
require('./auth/passport');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const questionRoutes = require('./routes/questions');
const uploadRoutes = require('./routes/upload');
const profileRoutes = require('./routes/profile');
const answerRoutes = require('./routes/answerRoutes');
const notificationRoutes = require('./routes/notifications');

const app = express();
app.use(express.json());

// --- CORS setup ---
const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:5173"];

const allowedOrigins = rawOrigins.map(o => o.trim().replace(/\/$/, "")); // strip spaces + trailing slash

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman etc.
    if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    console.warn("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));


// Passport Auth
app.use(passport.initialize());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', uploadRoutes);  
app.use('/api/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

// --- Start server ---
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
