const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = verifyAdmin;
