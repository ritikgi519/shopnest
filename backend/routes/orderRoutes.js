const express = require('express');
const { 
  addOrderItems, 
  getMyOrders, 
  getOrders, 
  getOrderById, 
  updateOrderStatus,
  requestReturn,
  cancelReturn,
  getMyReturns,
  updateReturnStatus,
  lookupOrderForReturn
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/my-returns').get(protect, getMyReturns);
router.route('/lookup-return').post(lookupOrderForReturn);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/return').post(protect, requestReturn);
router.route('/:id/cancel-return').post(protect, cancelReturn);
router.route('/:id/return-status').put(protect, admin, updateReturnStatus);

module.exports = router;
