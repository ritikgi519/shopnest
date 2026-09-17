const mongoose = require('mongoose');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
const mockStore = require('../data/mockStore');

const addOrderItems = async (req, res) => {
  try {
    const rawItems = req.body.items || req.body.orderItems;
    const totalAmount = req.body.totalAmount !== undefined ? req.body.totalAmount : req.body.totalPrice;
    const rawAddress = req.body.address || {};
    const address = {
      fullName: rawAddress.fullName || req.user?.name || 'Customer',
      street: rawAddress.street || 'Standard Delivery',
      city: rawAddress.city || 'Online Order',
      postalCode: rawAddress.postalCode || '000000',
      country: rawAddress.country || 'India'
    };
    const paymentId = req.body.paymentId || req.body.paymentResult?.id || ('pay_' + Date.now());

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Format items so that productId, name, image, qty, and price are all preserved
    const items = rawItems.map(item => {
      const pId = item.productId?._id || item.productId || item._id || item.id || item.product || ('prod_' + Date.now());
      return {
        productId: pId,
        name: item.name || item.title || item.productId?.name || 'ShopNest Product',
        image: item.image || item.imageUrl || item.productId?.imageUrl || '',
        imageUrl: item.imageUrl || item.image || item.productId?.imageUrl || '',
        qty: Number(item.qty || item.quantity || 1),
        price: Number(item.price || 0)
      };
    });

    if (mongoose.connection.readyState === 1) {
      const order = new Order({
        userId: req.user._id,
        items,
        totalAmount: Number(totalAmount),
        address,
        paymentId
      });
      const createdOrder = await order.save();

      const message = `
        <h2>Order Confirmation</h2>
        <p>Hello ${req.user.name || 'Customer'},</p>
        <p>Your order has been successfully placed! Order ID: <strong>${createdOrder._id}</strong></p>
        <p>Total Amount Paid: ₹${Number(totalAmount).toFixed(2)}</p>
        <p>It will be shipped to: ${address?.street || ''}, ${address?.city || ''}</p>
        <p>Thank you for shopping with ShopNest!</p>
      `;

      sendEmail({
        email: req.user.email,
        subject: 'ShopNest - Order Confirmation',
        message
      }).catch(() => {});

      return res.status(201).json(createdOrder);
    }

    const createdOrder = mockStore.createOrder({
      userId: req.user._id || req.user,
      items,
      totalAmount: Number(totalAmount),
      address,
      paymentId
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    let orders = [];

    if (mongoose.connection.readyState === 1) {
      const conditions = [{ userId: userId }];
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      } else {
        conditions.push({ userId: String(userId) });
      }

      orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 });
    }

    // Merge in any mockStore orders for this user if available
    const userMockOrders = mockStore.getUserOrders(userId);
    if (Array.isArray(userMockOrders) && userMockOrders.length > 0) {
      const existingIds = new Set(orders.map(o => String(o._id)));
      for (const mOrder of userMockOrders) {
        if (!existingIds.has(String(mOrder._id))) {
          orders.push(mOrder);
        }
      }
    }

    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json(orders);
  } catch (error) {
    console.error('getMyOrders error:', error);
    const userOrders = mockStore.getUserOrders(req.user._id);
    return res.json(Array.isArray(userOrders) ? [...userOrders].reverse() : []);
  }
};

const getOrders = async (req, res) => {
  try {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find({}).sort({ createdAt: -1 });
    }
    const mockOrders = mockStore.getOrders();
    if (Array.isArray(mockOrders) && mockOrders.length > 0) {
      const existingIds = new Set(orders.map(o => String(o._id)));
      for (const mOrder of mockOrders) {
        if (!existingIds.has(String(mOrder._id))) {
          orders.push(mOrder);
        }
      }
    }
    return res.json(orders);
  } catch (error) {
    res.json(mockStore.getOrders());
  }
};

const getOrderById = async (req, res) => {
  try {
    let order = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id);
      } else {
        order = await Order.findOne({ _id: req.params.id });
      }
    }
    if (!order) {
      order = mockStore.getOrderById(req.params.id);
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security check: ensure user owns order or is admin
    const orderUserId = typeof order.userId === 'object' && order.userId !== null
      ? (order.userId._id ? String(order.userId._id) : String(order.userId))
      : String(order.userId);

    const currentUserId = String(req.user._id);
    if (orderUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    return res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        return res.json(updatedOrder);
      }
    }
    const updated = mockStore.updateOrderStatus(req.params.id, req.body.status);
    if (updated) {
      return res.json(updated);
    }
    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestReturn = async (req, res) => {
  try {
    const { reason, comments, refundMethod, items } = req.body;
    const rmaCode = 'RMA-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      const orderUserId = typeof order.userId === 'object' && order.userId !== null
        ? (order.userId._id ? String(order.userId._id) : String(order.userId))
        : String(order.userId);

      if (orderUserId !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to return this order' });
      }
      if (order.status !== 'Delivered') {
        return res.status(400).json({ message: 'Only delivered orders are eligible for return.' });
      }
      if (order.returnStatus && !['None', 'Cancelled', 'Rejected'].includes(order.returnStatus)) {
        return res.status(400).json({ message: `A return request is already ${order.returnStatus.toLowerCase()}.` });
      }

      order.returnStatus = 'Requested';
      order.returnReason = reason || 'General Return';
      order.returnComments = comments || '';
      order.refundMethod = refundMethod || 'Original Payment Method';
      order.rmaCode = rmaCode;
      order.returnItems = items && items.length > 0 ? items : order.items;
      order.returnRequestedAt = new Date();
      const updatedOrder = await order.save();

      // Send automated acknowledgment email
      const emailMsg = `
        <h2>Return Request Received (#${rmaCode})</h2>
        <p>Dear ${req.user.name},</p>
        <p>We have successfully logged your return request for Order <strong>#${order._id}</strong>.</p>
        <p><strong>RMA Reference:</strong> ${rmaCode}</p>
        <p><strong>Return Reason:</strong> ${reason}</p>
        <p><strong>Refund Preference:</strong> ${refundMethod}</p>
        <p>Our logistics partner will contact you within 24-48 hours to schedule a complimentary pickup from your delivery address.</p>
        <p>Thank you for choosing ShopNest.</p>
      `;
      sendEmail({
        email: req.user.email,
        subject: `ShopNest Return Request Received - RMA #${rmaCode}`,
        message: emailMsg
      }).catch(() => {});

      return res.json({ success: true, message: 'Return request submitted successfully', order: updatedOrder, rmaCode });
    }

    // mockStore fallback
    const result = mockStore.requestOrderReturn(req.params.id, req.user._id, {
      reason,
      comments,
      refundMethod,
      items
    });
    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (result.error) {
      return res.status(403).json({ message: result.error });
    }
    return res.json({ success: true, message: 'Return request submitted successfully', order: result, rmaCode: result.rmaCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelReturn = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      const orderUserId = typeof order.userId === 'object' && order.userId !== null
        ? (order.userId._id ? String(order.userId._id) : String(order.userId))
        : String(order.userId);

      if (orderUserId !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to cancel this return' });
      }
      if (order.returnStatus !== 'Requested') {
        return res.status(400).json({ message: 'Cannot cancel a return that is already in progress or completed' });
      }
      order.returnStatus = 'Cancelled';
      const updatedOrder = await order.save();
      return res.json({ success: true, message: 'Return request cancelled', order: updatedOrder });
    }

    const updated = mockStore.cancelOrderReturn(req.params.id, req.user._id);
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json({ success: true, message: 'Return request cancelled', order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReturns = async (req, res) => {
  try {
    const userId = req.user._id;
    let ordersWithReturns = [];
    if (mongoose.connection.readyState === 1) {
      const conditions = [{ userId: userId }];
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      } else {
        conditions.push({ userId: String(userId) });
      }

      ordersWithReturns = await Order.find({
        $or: conditions,
        returnStatus: { $exists: true, $nin: ['None', null, 'Cancelled'] }
      }).sort({ updatedAt: -1 });
    }

    const mockReturns = mockStore.getUserReturns(userId);
    if (Array.isArray(mockReturns) && mockReturns.length > 0) {
      const existingIds = new Set(ordersWithReturns.map(o => String(o._id)));
      for (const mOrder of mockReturns) {
        if (!existingIds.has(String(mOrder._id))) {
          ordersWithReturns.push(mOrder);
        }
      }
    }
    return res.json(ordersWithReturns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReturnStatus = async (req, res) => {
  try {
    const { returnStatus } = req.body;
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order.returnStatus = returnStatus;
      if (returnStatus === 'Refunded') {
        order.returnResolvedAt = new Date();
      }
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    }

    const updated = mockStore.updateOrderReturnStatus(req.params.id, returnStatus);
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const lookupOrderForReturn = async (req, res) => {
  try {
    const { orderId, email } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    let foundOrder = null;
    if (mongoose.connection.readyState === 1) {
      foundOrder = await Order.findById(orderId).populate('items.productId');
    } else {
      foundOrder = mockStore.getOrderById(orderId);
    }

    if (!foundOrder) {
      return res.status(404).json({ message: 'No matching order found for this Order ID.' });
    }

    // Check delivery eligibility (must be delivered within 30 days)
    const orderCreated = new Date(foundOrder.createdAt || Date.now());
    const daysSince = Math.floor((Date.now() - orderCreated.getTime()) / (1000 * 60 * 60 * 24));
    const isEligible = foundOrder.status === 'Delivered' && daysSince <= 30;

    return res.json({
      order: foundOrder,
      isEligible,
      daysSince,
      maxReturnDays: 30
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
