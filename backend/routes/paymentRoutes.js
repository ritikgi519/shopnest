const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayClient = null;
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

// 1. Create Razorpay Order
const handleCreateOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR
    const rzp = getRazorpay();

    const numAmount = Number(amount) || 1;
    const paiseAmount = Math.max(100, Math.round(numAmount * 100)); // minimum 100 paise (₹1.00)

    if (!rzp) {
      // Mock order if Razorpay keys are not configured
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: paiseAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created'
      };
      return res.status(200).json({
        success: true,
        order: mockOrder,
        id: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        keyId: 'rzp_test_mockKey',
        mock: true
      });
    }

    const options = {
      amount: paiseAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await rzp.orders.create(options);
    res.status(200).json({
      success: true,
      order,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/create-order', handleCreateOrder);
router.post('/order', handleCreateOrder);

// 2. Verify Razorpay Payment Signature
const handleVerifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET || (razorpay_order_id && razorpay_order_id.startsWith('order_mock_'))) {
      return res.status(200).json({ success: true, message: 'Payment verified successfully (mock)' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/verify-payment', handleVerifyPayment);
router.post('/verify', handleVerifyPayment);

module.exports = router;