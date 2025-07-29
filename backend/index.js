require('dotenv').config();
require('./auth/passport');

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
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

// ✅ Allow frontend to access backend
const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

// ✅ Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: false, // change to true in prod HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// ✅ Passport Auth
app.use(passport.initialize());
app.use(passport.session());

// ✅ Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', uploadRoutes);  
app.use('/api/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);
// must come after DB init

// ✅ Static folder
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

// ✅ Start Server
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
