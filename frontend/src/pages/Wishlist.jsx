import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import '../styles/product.css';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleAddToCart = (product, removeAfter = false) => {
    dispatch(
      addToCart({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1
      })
    );

    if (removeAfter) {
      removeFromWishlist(product._id || product.id);
      showNotification(`Moved "${product.name}" to your shopping cart!`);
    } else {
      showNotification(`Added "${product.name}" to your shopping cart!`);
    }
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;

    let addedCount = 0;
    wishlist.forEach((product) => {
      if (product.stock > 0) {
        dispatch(
          addToCart({
            productId: product._id || product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            qty: 1
          })
        );
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showNotification(`Added ${addedCount} available item(s) to your shopping cart!`);
    } else {
      showNotification('No items in stock to add to cart.');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
      showNotification('Wishlist cleared.');
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div
        id="wishlist-guest-screen"
        style={{
          maxWidth: '800px',
          margin: '60px auto',
          padding: '60px 30px',
          textAlign: 'center',
          background: '#18181b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          color: '#f4f4f5'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            fontSize: '36px',
            color: '#f43f5e'
          }}
        >
          ♥
        </div>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '14px', color: '#fff' }}>
          Sign In to View Your Wishlist
        </h2>
        <p
          style={{
            color: '#a1a1aa',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '520px',
            margin: '0 auto 30px auto'
          }}
        >
          Your wishlist lets you save items for later across your devices. Sign in to your account
          to view or update your saved favorites.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            id="wishlist-login-btn"
            onClick={() => navigate('/login')}
            className="btn"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              background: '#f97316',
              color: '#fff',
              borderRadius: '8px'
            }}
          >
            Sign In to Account
          </button>
          <Link
            to="/shop"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#a1a1aa',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      id="my-wishlist-page"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px 80px 20px',
        color: '#f4f4f5'
      }}
    >
      {/* Toast Notification */}
      {notification && (
        <div
          id="wishlist-toast-notification"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: '#10b981',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '0.95rem' }}>
        <Link to="/" style={{ color: '#f97316', textDecoration: 'none' }}>Home</Link>
        {' '}/ <Link to="/shop" style={{ color: '#f97316', textDecoration: 'none' }}>Shop</Link>
        {' '}/ <span style={{ color: '#fff' }}>My Wishlist</span>
      </div>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '24px',
          marginBottom: '35px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              My Wishlist
            </h1>
            <span
              id="wishlist-counter-badge"
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}
            >
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: '1rem' }}>
            Saved products to review and order at your convenience.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              id="move-all-cart-btn"
              onClick={handleMoveAllToCart}
              style={{
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🛒</span> Move All to Cart
            </button>
            <button
              id="clear-wishlist-btn"
              onClick={handleClearWishlist}
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && wishlist.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#f97316', fontSize: '1.2rem' }}>
          Loading your saved wishlist items...
        </div>
      )}

      {/* Empty State */}
      {!loading && wishlist.length === 0 && (
        <div
          id="wishlist-empty-state"
          style={{
            background: '#18181b',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '70px 30px',
            textAlign: 'center',
            maxWidth: '650px',
            margin: '40px auto'
          }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '34px',
              color: '#71717a'
            }}
          >
            ♡
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '12px' }}>
            Your Wishlist is Empty
          </h3>
          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              maxWidth: '440px',
              margin: '0 auto 30px auto'
            }}
          >
            Explore our curated catalog and click the heart icon on any product to save it here for
            later purchase!
          </p>
          <Link
            id="explore-products-empty-btn"
            to="/shop"
            className="btn"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              background: '#f97316',
              color: '#fff',
              borderRadius: '8px',
              display: 'inline-block',
              textDecoration: 'none'
            }}
          >
            Discover Products
          </Link>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {wishlist.length > 0 && (
        <div
          id="wishlist-items-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '28px'
          }}
        >
          {wishlist.map((product) => {
            if (!product) return null;
            const productId = product._id || product.id;
            const isOutOfStock = product.stock <= 0;
            const ratingScore = product.ratings ? Number(product.ratings).toFixed(1) : '5.0';

            return (
              <div
                key={productId}
                id={`wishlist-card-${productId}`}
                style={{
                  background: '#18181b',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Remove from Wishlist Button in Corner */}
                <button
                  id={`remove-wishlist-item-${productId}`}
                  onClick={() => removeFromWishlist(productId)}
                  title="Remove from wishlist"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 5,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(9, 9, 11, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f43f5e',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f43f5e';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(9, 9, 11, 0.75)';
                    e.currentTarget.style.color = '#f43f5e';
                  }}
                >
                  ✕
                </button>

                {/* Product Image */}
                <Link
                  to={`/product/${productId}`}
                  style={{ display: 'block', overflow: 'hidden', background: '#09090b' }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '230px',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </Link>

                {/* Card Content */}
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Category pill & Stock status */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          fontWeight: '700',
                          color: '#f97316',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {product.category || 'General'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          color: isOutOfStock ? '#ef4444' : '#10b981',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isOutOfStock ? '#ef4444' : '#10b981'
                          }}
                        />
                        {isOutOfStock ? 'Out of stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      to={`/product/${productId}`}
                      style={{
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '1.15rem',
                        fontWeight: '600',
                        lineHeight: '1.4',
                        marginBottom: '8px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.name}
                    </Link>

                    {/* Ratings */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px'
                      }}
                    >
                      <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>★</span>
                      <span style={{ color: '#f4f4f5', fontSize: '0.9rem', fontWeight: '600' }}>
                        {ratingScore}
                      </span>
                      {product.numReviews > 0 && (
                        <span style={{ color: '#71717a', fontSize: '0.82rem' }}>
                          ({product.numReviews})
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ marginBottom: '18px' }}>
                      <span
                        style={{
                          fontSize: '1.45rem',
                          fontWeight: '700',
                          color: '#f97316'
                        }}
                      >
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      id={`wishlist-add-to-cart-${productId}`}
                      onClick={() => handleAddToCart(product, false)}
                      disabled={isOutOfStock}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: isOutOfStock ? '#3f3f46' : '#f97316',
                        color: isOutOfStock ? '#a1a1aa' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <span>🛒</span> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <button
                      id={`wishlist-move-to-cart-${productId}`}
                      onClick={() => handleAddToCart(product, true)}
                      disabled={isOutOfStock}
                      style={{
                        width: '100%',
                        padding: '9px',
                        background: 'transparent',
                        color: isOutOfStock ? '#52525b' : '#a1a1aa',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isOutOfStock) {
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.borderColor = '#f97316';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOutOfStock) {
                          e.currentTarget.style.color = '#a1a1aa';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      Move to Cart & Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
