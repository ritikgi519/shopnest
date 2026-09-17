import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, clearCart } from '../redux/cartSlice';
import '../styles/cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart) || {};
  const cartItems = cart.cartItems || [];
  const userLogin = useSelector((state) => state.auth || state.userLogin) || {};
  const { userInfo } = userLogin;

  const totalPrice = cartItems
    .reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
    .toFixed(2);

  const handleRemove = (item) => {
    const targetIdentifier = item._id || item.id || item.product;
    dispatch(removeFromCart(targetIdentifier));
  };

  const handleCheckout = async () => {
    try {
      let token = localStorage.getItem('token');

      if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const val = localStorage.getItem(key);
          try {
            const parsed = JSON.parse(val);
            if (parsed?.token) token = parsed.token;
            if (parsed?.accessToken) token = parsed.accessToken;
          } catch {
            if (val && val.startsWith('ey')) token = val;
          }
        }
      }

      if (!token && userInfo) {
        token = userInfo.token || userInfo.accessToken;
      }

      const placeOrderDirectly = async (paymentId = 'direct_order_' + Date.now()) => {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            items: cartItems,
            totalAmount: Number(totalPrice),
            paymentId,
            address: { fullName: userInfo?.name || 'Customer', street: 'Direct Delivery', city: 'Online' },
          }),
        });

        if (orderRes.ok) {
          dispatch(clearCart());
          alert('Order placed successfully!');
          navigate('/ordersuccess');
          return true;
        }
        return false;
      };

      if (!window.Razorpay) {
        const confirmDirect = window.confirm('Razorpay checkout is unavailable. Would you like to place this test order directly?');
        if (confirmDirect) {
          await placeOrderDirectly();
        }
        return;
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: Number(totalPrice) }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to initialize payment');
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.order?.amount || Math.round(Number(totalPrice) * 100),
        currency: 'INR',
        name: 'ShopNest',
        description: 'Order Payment',
        order_id: data.order?.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                items: cartItems,
                paymentId: response.razorpay_payment_id,
                totalAmount: Number(totalPrice),
                address: { fullName: userInfo?.name || 'Customer', street: 'Online Order', city: 'Online City' }
              }),
            });

            dispatch(clearCart());
            alert('Payment Successful! Order placed.');
            navigate('/ordersuccess');
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: userInfo?.name || 'Ritik Kumar',
          email: userInfo?.email || 'ritik@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#EA580C',
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong during checkout');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>Your cart is currently empty.</p>
          <Link
            to="/"
            style={{
              color: '#EA580C',
              textDecoration: 'underline',
              display: 'inline-block',
              marginTop: '1rem',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <div>
            {cartItems.map((item, index) => {
              const itemKey = item._id || item.id || item.product || index;
              return (
                <div
                  key={itemKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderBottom: '1px solid #333',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1, marginLeft: '1rem' }}>
                    <Link
                      to={`/product/${itemKey}`}
                      style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      {item.name}
                    </Link>
                    <p style={{ color: '#EA580C', marginTop: '4px' }}>₹{item.price}</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Total: ₹{totalPrice}</h2>
            <button
              type="button"
              onClick={handleCheckout}
              style={{
                backgroundColor: '#EA580C',
                color: '#fff',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;