const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mockStore = require('../data/mockStore');

const getAdminStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalOrders = await Order.countDocuments({});
      const totalProducts = await Product.countDocuments({});
      const totalUsers = await User.countDocuments({ role: 'user' });

      const orders = await Order.find({});
      const totalRevenue = orders.reduce((acc, item) => acc + item.totalAmount, 0);

      return res.json({ totalOrders, totalProducts, totalUsers, totalRevenue });
    }
    res.json(mockStore.getStats());
  } catch (error) {
    res.json(mockStore.getStats());
  }
};

module.exports = { getAdminStats };
