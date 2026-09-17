const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockStore = require('../data/mockStore');

const getJwtSecret = () => process.env.JWT_SECRET || 'shopnest_default_jwt_secret_key_2026';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      }
      if (!req.user) {
        req.user = mockStore.getUserById(decoded.id);
      }
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
