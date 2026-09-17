const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const mockStore = require('../data/mockStore');

const getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({});
      if (products && products.length > 0) {
        return res.json(products);
      }
    }
    res.json(mockStore.getProducts());
  } catch (error) {
    res.json(mockStore.getProducts());
  }
};

const getProductById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) {
        return res.json(product);
      }
    }
    const fallback = mockStore.getProductById(req.params.id);
    if (fallback) {
      return res.json(fallback);
    }
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    const fallback = mockStore.getProductById(req.params.id);
    if (fallback) {
      return res.json(fallback);
    }
    res.status(404).json({ message: 'Product not found' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const stock = req.body.stock !== undefined ? Number(req.body.stock) : (req.body.countInStock !== undefined ? Number(req.body.countInStock) : 0);
    let imageUrl = req.body.imageUrl || req.body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    if (req.file && process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      } catch (err) {
        console.warn('Cloudinary upload skipped:', err.message);
      }
    }
    if (mongoose.connection.readyState === 1) {
      const product = new Product({
        name, description, price: Number(price) || 0, category, stock, imageUrl
      });
      const createdProduct = await product.save();
      return res.status(201).json(createdProduct);
    }
    const createdProduct = mockStore.createProduct({
      name, description, price: Number(price) || 0, category, stock, imageUrl
    });
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const stock = req.body.stock !== undefined ? Number(req.body.stock) : (req.body.countInStock !== undefined ? Number(req.body.countInStock) : undefined);
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? Number(price) : product.price;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        if (req.body.imageUrl || req.body.image) {
          product.imageUrl = req.body.imageUrl || req.body.image;
        }

        if (req.file && process.env.CLOUDINARY_API_KEY) {
          try {
            const result = await cloudinary.uploader.upload(req.file.path);
            product.imageUrl = result.secure_url;
          } catch (err) {
            console.warn('Cloudinary upload skipped:', err.message);
          }
        }
        const updatedProduct = await product.save();
        return res.json(updatedProduct);
      }
    }
    const updated = mockStore.updateProduct(req.params.id, {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(category && { category }),
      ...(stock !== undefined && { stock: Number(stock) })
    });
    if (updated) {
      return res.json(updated);
    }
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) {
        await product.deleteOne();
        return res.json({ message: 'Product removed' });
      }
    }
    const deleted = mockStore.deleteProduct(req.params.id);
    if (deleted) {
      return res.json({ message: 'Product removed' });
    }
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product review & rating (with purchase checking)
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user._id || req.user.id;
  const userName = req.user.name || 'Verified Customer';

  if (!rating || !comment || !comment.trim()) {
    return res.status(400).json({ message: 'Rating (1-5) and comment text are required.' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5 stars.' });
  }

  try {
    // Check purchase status in both DB and mock store
    let hasPurchased = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const orderMatch = await Order.findOne({
          userId,
          'items.productId': productId
        });
        hasPurchased = !!orderMatch;
      } catch (err) {
        hasPurchased = mockStore.hasUserPurchasedProduct(userId, productId);
      }
    } else {
      hasPurchased = mockStore.hasUserPurchasedProduct(userId, productId);
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId);
      if (product) {
        if (!product.reviews) product.reviews = [];
        const alreadyReviewed = product.reviews.find(
          (r) => r.user.toString() === userId.toString()
        );

        if (alreadyReviewed) {
          alreadyReviewed.rating = numRating;
          alreadyReviewed.comment = comment.trim();
          alreadyReviewed.verifiedPurchase = hasPurchased;
        } else {
          product.reviews.unshift({
            user: userId,
            name: userName,
            rating: numRating,
            comment: comment.trim(),
            verifiedPurchase: hasPurchased
          });
        }

        product.numReviews = product.reviews.length;
        product.ratings = Number(
          (product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1)
        );

        await product.save();
        return res.status(201).json({
          message: 'Review submitted successfully!',
          product,
          verifiedPurchase: hasPurchased
        });
      }
    }

    // Mock store mode or fallback if DB doesn't have this item
    const result = mockStore.addProductReview(productId, {
      user: userId,
      name: userName,
      rating: numRating,
      comment: comment.trim(),
      verifiedPurchase: hasPurchased
    });

    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(201).json({
      message: 'Review submitted successfully!',
      product: result.product,
      review: result.review,
      verifiedPurchase: hasPurchased
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if current user has purchased this product
const checkUserPurchaseStatus = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user._id || req.user.id;

  try {
    let hasPurchased = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const orderMatch = await Order.findOne({
          userId,
          'items.productId': productId
        });
        hasPurchased = !!orderMatch;
      } catch (err) {
        hasPurchased = mockStore.hasUserPurchasedProduct(userId, productId);
      }
    } else {
      hasPurchased = mockStore.hasUserPurchasedProduct(userId, productId);
    }
    return res.json({ hasPurchased });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  checkUserPurchaseStatus
};
