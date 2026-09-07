const User = require('../entities/User');

module.exports = async function (req, res, next) {
  try {
    // req.user.id is set by authMiddleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authorized, no user info' });
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    next();
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    res.status(500).send('Server Error');
  }
};
