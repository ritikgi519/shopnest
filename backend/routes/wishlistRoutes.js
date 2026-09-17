const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All wishlist operations require an authenticated user
router.use(protect);

router
  .route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.post('/toggle', toggleWishlist);

router.route('/:productId').delete(removeFromWishlist);

module.exports = router;
