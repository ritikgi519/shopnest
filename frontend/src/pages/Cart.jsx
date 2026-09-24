import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartQty } from '../redux/cartSlice';
import '../styles/cart.css';

// Embedded SVG data URI for headphones guaranteed to render offline, online, and under strict adblockers
const INLINE_HEADPHONES_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' rx='16' fill='%2318181b'/%3E%3Cpath d='M60 110 C60 50 140 50 140 110' fill='none' stroke='%23f97316' stroke-width='10' stroke-linecap='round'/%3E%3Crect x='50' y='105' width='22' height='45' rx='10' fill='%2327272a' stroke='%23f97316' stroke-width='2'/%3E%3Crect x='128' y='105' width='22' height='45' rx='10' fill='%2327272a' stroke='%23f97316' stroke-width='2'/%3E%3Ctext x='100' y='175' fill='%23f97316' font-size='11' font-weight='bold' font-family='sans-serif' text-anchor='middle'%3EANC HEADPHONES%3C/text%3E%3C/svg%3E";

const DEFAULT_UNSPLASH_HEADPHONES =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart) || {};
  const cartItems = cart.cartItems || [];

  // Product image lookup cache from catalog
  const [productCatalogImages, setProductCatalogImages] = useState({});

  useEffect(() => {
    // Fetch live catalog to populate accurate image URLs for any stored items
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.products || [];
        const map = {};
        list.forEach((p) => {
          const img = p.imageUrl || p.image;
          if (img) {
            if (p._id) map[p._id] = img;
            if (p.id) map[p.id] = img;
            if (p.name) map[p.name.toLowerCase().trim()] = img;
          }
        });
        setProductCatalogImages(map);
      })
      .catch((err) => console.warn('Catalog fetch for cart images warning:', err));
  }, []);

  const totalPrice = cartItems
    .reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
    .toFixed(2);

  const handleRemove = (item) => {
    const targetIdentifier = item._id || item.id || item.productId || item.product;
    dispatch(removeFromCart(targetIdentifier));
  };

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1) return;
    const targetIdentifier = item._id || item.id || item.productId || item.product;
    dispatch(updateCartQty({ id: targetIdentifier, qty: newQty }));
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // Resilient multi-tiered image selector
  const getItemImageSrc = (item) => {
    const itemId = item._id || item.id || item.productId || item.product;
    const itemName = String(item.name || '').toLowerCase().trim();

    // 1. Direct matched image from live backend catalog
    if (itemId && productCatalogImages[itemId]) {
      return productCatalogImages[itemId];
    }
    if (itemName && productCatalogImages[itemName]) {
      return productCatalogImages[itemName];
    }

    // 2. Existing valid imageUrl/image properties on the item
    const candidates = [item.imageUrl, item.image, item.img];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim().length > 8 && !c.includes('undefined') && !c.includes('null')) {
        return c.trim();
      }
    }

    // 3. Known product types
    if (itemName.includes('headphone') || itemName.includes('noise-cancelling') || itemName.includes('audio')) {
      return DEFAULT_UNSPLASH_HEADPHONES;
    }

    return '/placeholder.svg';
  };

  // Graceful fallback chain on <img> load error
  const handleImageError = (e, item) => {
    const imgEl = e.currentTarget;
    const currentSrc = imgEl.src || '';

    // Step 1: If an external Unsplash or custom URL failed, try local /headphones.svg
    if (!currentSrc.includes('/headphones.svg') && !currentSrc.includes('data:image/svg+xml')) {
      const itemName = String(item.name || '').toLowerCase();
      if (itemName.includes('headphone') || itemName.includes('noise-cancelling')) {
        imgEl.src = '/headphones.svg';
        return;
      }
      imgEl.src = '/placeholder.svg';
      return;
    }

    // Step 2: If local SVG file failed, use 100% inline SVG data URI
    imgEl.src = INLINE_HEADPHONES_SVG;
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Shopping Cart
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#a1a1aa', fontSize: '0.92rem' }}>
            Review your selected items and proceed to secure checkout.
          </p>
        </div>
        <Link
          to="/shop"
          style={{
            color: '#f97316',
            textDecoration: 'none',
            fontSize: '0.92rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#18181b',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: '1.5rem'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginBottom: '24px' }}>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/shop"
            style={{
              background: '#f97316',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              display: 'inline-block'
            }}
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cartItems.map((item, index) => {
              const itemKey = item._id || item.id || item.productId || item.product || index;
              const productDetailLink = `/product/${item.productId || item._id || item.id || ''}`;
              const itemPrice = Number(item.price) || 0;
              const itemQty = Number(item.qty) || 1;
              const lineTotal = (itemPrice * itemQty).toFixed(2);
              const imgSrc = getItemImageSrc(item);

              return (
                <div
                  key={itemKey}
                  id={`cart-item-${itemKey}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: '#18181b',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Left: Product Image & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: '1 1 320px' }}>
                    <Link to={productDetailLink} style={{ flexShrink: 0 }}>
                      <img
                        src={imgSrc}
                        alt={item.name || 'Wireless Noise-Cancelling Headphones'}
                        onError={(e) => handleImageError(e, item)}
                        style={{
                          width: '95px',
                          height: '95px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          background: '#1f1f23',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'block'
                        }}
                      />
                    </Link>

                    <div>
                      <Link
                        to={productDetailLink}
                        style={{
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontWeight: '700',
                          fontSize: '1.05rem',
                          display: 'inline-block',
                          marginBottom: '4px',
                          lineHeight: 1.4
                        }}
                      >
                        {item.name || 'Wireless Noise-Cancelling Headphones'}
                      </Link>
                      <div style={{ color: '#f97316', fontWeight: '700', fontSize: '1.05rem' }}>
                        ₹{itemPrice.toFixed(2)}
                      </div>
                      {item.category && (
                        <div style={{ color: '#71717a', fontSize: '0.78rem', textTransform: 'uppercase', marginTop: '2px' }}>
                          {item.category}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item, itemQty - 1)}
                      disabled={itemQty <= 1}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        color: itemQty <= 1 ? '#71717a' : '#fff',
                        cursor: itemQty <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem' }}>
                      {itemQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item, itemQty + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Right: Subtotal & Remove Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#a1a1aa', fontSize: '0.75rem', textTransform: 'uppercase' }}>Subtotal</div>
                      <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.15rem' }}>
                        ₹{lineTotal}
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`remove-cart-item-${itemKey}`}
                      onClick={() => handleRemove(item)}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.86rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary & Checkout */}
          <div
            style={{
              background: '#18181b',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Estimated Total:</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
                  ₹{totalPrice}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                id="cart-proceed-checkout-btn"
                style={{
                  backgroundColor: '#f97316',
                  color: '#ffffff',
                  padding: '14px 36px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
