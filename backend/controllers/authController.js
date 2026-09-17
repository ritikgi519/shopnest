const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const mockStore = require('../data/mockStore');

const getJwtSecret = () => process.env.JWT_SECRET || 'shopnest_default_jwt_secret_key_2026';

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ 
        email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } 
      });
      if (userExists) return res.status(400).json({ message: 'User already exists' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({ name: cleanName, email: cleanEmail, password: hashedPassword });
      if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const message = `
          <h2>Welcome to ShopNest, ${cleanName}!</h2>
          <p>Thank you for registering on our platform.</p>
          <p>Your one-time verification/discount OTP is: <strong>${otp}</strong></p>
        `;
        sendEmail({ email: user.email, subject: 'Welcome to ShopNest - Your OTP', message }).catch(() => {});

        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        });
      }
    }

    // Fallback store
    const existing = mockStore.getUserByEmail(cleanEmail) || mockStore.getUserByEmail(email.trim());
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = mockStore.createUser({ name: cleanName, email: cleanEmail, password: hashedPassword, role: 'user' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ 
        email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } 
      });
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        });
      }
    }

    const mockUser = mockStore.getUserByEmail(cleanEmail) || mockStore.getUserByEmail(email.trim());
    if (mockUser && (await bcrypt.compare(password, mockUser.password))) {
      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id)
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({}).select('-password');
      return res.json(users);
    }
    res.json(mockStore.getUsers());
  } catch (error) {
    res.json(mockStore.getUsers());
  }
};

module.exports = { registerUser, loginUser, getUsers };
