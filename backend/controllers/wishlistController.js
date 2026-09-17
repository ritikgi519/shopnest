const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mockStore = require('../data/mockStore');

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (mongoose.connection.readyState === 1) {
      let userWishlist = await Wishlist.findOne({ userId }).populate('products');

      if (!userWishlist) {
        userWishlist = await Wishlist.create({ userId, products: [] });
      }

      // Filter out any null entries (in case referenced product was removed)
      const validProducts = (userWishlist.products || []).filter(Boolean);
      const productIds = validProducts.map((p) => p._id.toString());

      return res.json({
        wishlist: validProducts,
        productIds
      });
    }

    // In-memory mock fallback
    const items = mockStore.getWishlist(userId);
    return res.json({
      wishlist: items,
      productIds: items.map((p) => String(p._id))
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    const items = mockStore.getWishlist(userId);
    return res.json({
      wishlist: items,
      productIds: items.map((p) => String(p._id))
    });
  }
};

// @desc    Add product to user's wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const productId = req.body.productId || req.body.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      // Validate product exists
      let product = null;
      try {
        product = await Product.findById(productId);
      } catch (err) {
        // Invalid ObjectId or not found
      }

      if (!product) {
        product = mockStore.getProductById(productId);
      }

      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      // Atomically add product to user's wishlist collection using $addToSet (prevents duplicates)
      const updatedWishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $addToSet: { products: productId } },
        { upsert: true, new: true }
      ).populate('products');

      const validProducts = (updatedWishlist.products || []).filter(Boolean);
      const productIds = validProducts.map((p) => p._id.toString());

      return res.status(200).json({
        message: 'Product added to your wishlist',
        wishlist: validProducts,
        productIds
      });
    }

    // Fallback in-memory
    const items = mockStore.addToWishlist(userId, productId);
    return res.status(200).json({
      message: 'Product added to your wishlist',
      wishlist: items,
      productIds: items.map((p) => String(p._id))
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ message: error.message || 'Failed to add to wishlist' });
  }
};

// @desc    Remove product from user's wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const productId = req.params.productId || req.body.productId;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const updatedWishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $pull: { products: productId } },
        { new: true }
      ).populate('products');

      const validProducts = updatedWishlist
        ? (updatedWishlist.products || []).filter(Boolean)
        : [];
      const productIds = validProducts.map((p) => p._id.toString());

      return res.status(200).json({
        message: 'Product removed from your wishlist',
        wishlist: validProducts,
        productIds
      });
    }

    const items = mockStore.removeFromWishlist(userId, productId);
    return res.status(200).json({
      message: 'Product removed from your wishlist',
      wishlist: items,
      productIds: items.map((p) => String(p._id))
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ message: error.message || 'Failed to remove from wishlist' });
  }
};

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const productId = req.body.productId || req.body.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      let current = await Wishlist.findOne({ userId });
      if (!current) {
        current = await Wishlist.create({ userId, products: [] });
      }

      const isAlreadyIn = current.products.some(
        (p) => p.toString() === productId.toString()
      );

      let updatedWishlist;
      let inWishlist = false;

      if (isAlreadyIn) {
        // Remove
        updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId },
          { $pull: { products: productId } },
          { new: true }
        ).populate('products');
        inWishlist = false;
      } else {
        // Add
        updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId },
          { $addToSet: { products: productId } },
          { upsert: true, new: true }
        ).populate('products');
        inWishlist = true;
      }

      const validProducts = (updatedWishlist.products || []).filter(Boolean);
      const productIds = validProducts.map((p) => p._id.toString());

      return res.status(200).json({
        message: inWishlist ? 'Added to your wishlist' : 'Removed from your wishlist',
        inWishlist,
        wishlist: validProducts,
        productIds
      });
    }

    // Fallback
    const isAlreadyIn = mockStore.isInWishlist(userId, productId);
    let items;
    if (isAlreadyIn) {
      items = mockStore.removeFromWishlist(userId, productId);
    } else {
      items = mockStore.addToWishlist(userId, productId);
    }

    return res.status(200).json({
      message: !isAlreadyIn ? 'Added to your wishlist' : 'Removed from your wishlist',
      inWishlist: !isAlreadyIn,
      wishlist: items,
      productIds: items.map((p) => String(p._id))
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return res.status(500).json({ message: error.message || 'Failed to update wishlist' });
  }
};

// @desc    Clear all items in user's wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (mongoose.connection.readyState === 1) {
      await Wishlist.findOneAndUpdate(
        { userId },
        { $set: { products: [] } },
        { upsert: true }
      );
      return res.status(200).json({
        message: 'Wishlist cleared',
        wishlist: [],
        productIds: []
      });
    }

    // Mock
    const mockUserWishlist = mockStore.getWishlist(userId);
    mockUserWishlist.forEach((p) => mockStore.removeFromWishlist(userId, p._id));
    return res.status(200).json({
      message: 'Wishlist cleared',
      wishlist: [],
      productIds: []
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to clear wishlist' });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist
};
