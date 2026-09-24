import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cart = useSelector((state) => state.cart) || {};
  const cartItems = cart.cartItems || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '9999999999',
    street: '',
    city: '',
    postalCode: '',
    country: 'India'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill user data if user logs in or updates
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );

  // Helper to dynamically ensure Razorpay checkout script is loaded
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper to extract or fallback JWT token
  const getAuthToken = () => {
    let token = user?.token || user?.accessToken;
    if (token) return token;

    token = localStorage.getItem('token');
    if (token) return token;

    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
      } catch (e) {
        // ignore
      }
    }
    return null;
  };

  // 1. Pay with Razorpay
  const handleRazorpayPayment = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!address.fullName || !address.street || !address.city) {
      setErrorMessage('Please fill in your shipping name, street, and city.');
      return;
    }

    setIsProcessing(true);

    try {
      const token = getAuthToken();

      // Step 1: Create Order on Backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: Number(totalPrice) })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment order on server.');
      }

      // Step 2: Ensure Razorpay SDK is loaded
      const isSDKReady = await loadRazorpaySDK();
      if (!isSDKReady || !window.Razorpay) {
        const proceedDirect = window.confirm(
          'Razorpay SDK could not load in your browser (likely due to ad blockers or offline network). Would you like to complete this test order directly?'
        );
        if (proceedDirect) {
          return await placeOrderDirectly('sdk_blocked_bypass_' + Date.now());
        }
        setIsProcessing(false);
        return;
      }

      // Step 3: Configure Razorpay Checkout Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ShopNest',
        description: 'Order Payment',
        order_id: orderData.id,
        prefill: {
          name: address.fullName,
          email: address.email || user?.email || 'customer@example.com',
          contact: address.phone || '9999999999'
        },
        theme: {
          color: '#ea580c'
        },
        handler: async function (response) {
          try {
            // Verify signature on backend
            const verifyRes = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
              setErrorMessage('Payment verification signature check failed.');
              setIsProcessing(false);
              return;
            }

            // Save order to database
            await saveOrderToDatabase(response.razorpay_payment_id);
          } catch (err) {
            console.error('Payment verification error:', err);
            setErrorMessage('Error recording order after payment. Please contact support.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (resp) {
        console.warn('Razorpay payment failed or cancelled:', resp.error);
        setIsProcessing(false);
        const reason = resp.error?.description || resp.error?.reason || 'Payment was cancelled or could not be completed.';
        setErrorMessage(`Razorpay Notice: ${reason} If testing, select a bank and click "Success". Or click "Instant Test Order" below.`);
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment system error. You can use the Instant Test Order option below.');
    }
  };

  // Helper to save finalized order
  const saveOrderToDatabase = async (paymentId) => {
    const token = getAuthToken();

    const normalizedItems = cartItems.map((item) => ({
      productId: item.productId?._id || item.productId || item._id || item.id,
      name: item.name || item.title || 'Product',
      imageUrl: item.imageUrl || item.image || '',
      price: Number(item.price || 0),
      qty: Number(item.qty || item.quantity || 1)
    }));

    const saveRes = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        items: normalizedItems,
        totalAmount: Number(totalPrice),
        address: {
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country
        },
        paymentId: paymentId || 'txn_' + Date.now(),
        paymentStatus: 'Paid'
      })
    });

    if (saveRes.ok) {
      dispatch(clearCart());
      setIsProcessing(false);
      navigate('/ordersuccess');
    } else {
      const errData = await saveRes.json().catch(() => ({}));
      setIsProcessing(false);
      if (saveRes.status === 401) {
        setErrorMessage('Session expired or login required. Please sign in to finalize saving this order.');
      } else {
        setErrorMessage(errData.message || 'Failed to save order in database.');
      }
    }
  };

  // 2. Direct 1-Click Instant Test Order Bypass
  const placeOrderDirectly = async (customPaymentId) => {
    if (!address.fullName || !address.street || !address.city) {
      setErrorMessage('Please fill in your shipping name, street, and city.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage('');
    try {
      await saveOrderToDatabase(customPaymentId || 'demo_bypass_' + Date.now());
    } catch (err) {
      console.error('Direct bypass order error:', err);
      setIsProcessing(false);
      setErrorMessage('Could not place test order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '30px', color: '#fff' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>Add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          style={{
            backgroundColor: '#ea580c',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none'
          }}
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>Checkout</h1>

      {/* Guest warning banner if not logged in */}
      {!user && (
        <div
          style={{
            backgroundColor: 'rgba(234, 88, 12, 0.1)',
            border: '1px solid rgba(234, 88, 12, 0.3)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <span style={{ fontWeight: '600', color: '#ea580c', marginRight: '8px' }}>⚠️ Guest Checkout:</span>
            <span style={{ color: '#d4d4d8', fontSize: '0.92rem' }}>
              Sign in to link this order with your Account, Invoice Downloads, and Tracking.
            </span>
          </div>
          <Link
            to="/login?redirect=/checkout"
            style={{
              backgroundColor: '#ea580c',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Sign In Now
          </Link>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.95rem'
          }}
        >
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* LEFT COLUMN: Shipping Form */}
        <div
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '24px'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>
            1. Shipping Information
          </h2>

          <form onSubmit={handleRazorpayPayment}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                placeholder="Ritik Kumar"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#09090b',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#09090b',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="9999999999"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#09090b',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="123 Shopping Avenue, Floor 2"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#09090b',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Mumbai"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#09090b',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  placeholder="400001"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#09090b',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px' }}>
                Country
              </label>
              <input
                type="text"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                placeholder="India"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#09090b',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary & Payment Triggers */}
        <div
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>
              2. Order Summary
            </h2>

            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #27272a'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120';
                      }}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#fff' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Qty: {item.qty || 1}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#ea580c', fontSize: '0.95rem' }}>
                    ₹{((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 0', borderTop: '1px solid #3f3f46', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#a1a1aa' }}>
                <span>Subtotal:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#a1a1aa' }}>
                <span>Shipping:</span>
                <span style={{ color: '#22c55e' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginTop: '12px' }}>
                <span>Total:</span>
                <span style={{ color: '#ea580c' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Test Simulation Information Callout */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '0.82rem',
                color: '#93c5fd',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>💡 Razorpay Test Mode Note:</div>
              When the Razorpay modal opens, select <strong>Netbanking</strong> or <strong>Card</strong>, choose any test bank, and click the green <strong>"Success"</strong> button in the simulation screen to authorize. Clicking "Failure" or closing cancels the transaction.
            </div>
          </div>

          {/* PAYMENT BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleRazorpayPayment}
              id="pay-razorpay-btn"
              style={{
                width: '100%',
                backgroundColor: '#ea580c',
                color: '#fff',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
              }}
            >
              <span>💳</span>
              <span>{isProcessing ? 'Processing...' : 'Pay with Razorpay'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => placeOrderDirectly('instant_test_' + Date.now())}
              id="instant-test-checkout-btn"
              style={{
                width: '100%',
                backgroundColor: '#27272a',
                color: '#d4d4d8',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid #3f3f46',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.7 : 1
              }}
            >
              ⚡ Instant Demo Order (Direct Test Bypass)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
