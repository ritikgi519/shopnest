const Razorpay = require('razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Mock Razorpay order for development/testing without live keys
      return res.json({
        id: `order_mock_${Date.now()}`,
        entity: 'order',
        amount: (req.body.amount || 0) * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created'
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Razorpay accepts amount in paise
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
    };
    
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: "Some error occurred" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || "Payment error" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!process.env.RAZORPAY_KEY_SECRET || razorpay_order_id?.startsWith('order_mock_')) {
      return res.status(200).json({ message: "Payment verified successfully (mock)" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Verification error" });
  }
};

module.exports = { createOrder, verifyPayment };
