import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [addedAnimation, setAddedAnimation] = useState(false);

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);
  const isCompared = isInCompare(productId);

  // Derive realistic MRP & discount for authentic Amazon/Flipkart look
  const originalPrice = Math.round(Number(product.price) * 1.28);
  const discountPercent = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (window.confirm('Please sign in to save products to your wishlist. Would you like to sign in now?')) {
        navigate('/login');
      }
      return;
    }

    toggleWishlist(product);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, qty: 1 }));
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  return (
    <div className="product-card" id={`product-card-${productId}`} style={{ position: 'relative' }}>
      {/* Quick Compare Button (Top Left) */}
      <button
        id={`compare-toggle-btn-${productId}`}
        onClick={handleCompareClick}
        title={isCompared ? 'Remove from Comparison' : 'Add to Comparison Studio'}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          height: '30px',
          padding: '0 8px',
          borderRadius: '16px',
          background: isCompared ? 'rgba(37, 99, 235, 0.95)' : 'rgba(18, 18, 22, 0.8)',
          backdropFilter: 'blur(8px)',
          border: isCompared ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
          color: isCompared ? '#ffffff' : '#d4d4d8',
          fontSize: '11px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
        }}
      >
        <span>⚖️</span>
        <span>{isCompared ? 'Comparing' : 'Compare'}</span>
      </button>

      {/* Quick Wishlist Heart Button (Top Right) */}
      <button
        id={`wishlist-toggle-btn-${productId}`}
        onClick={handleWishlistClick}
        title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: isWishlisted ? 'rgba(244, 63, 94, 0.2)' : 'rgba(18, 18, 22, 0.8)',
          backdropFilter: 'blur(8px)',
          border: isWishlisted ? '1px solid rgba(244, 63, 94, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
          color: isWishlisted ? '#f43f5e' : '#a1a1aa',
          fontSize: isWishlisted ? '18px' : '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
        }}
      >
        {isWishlisted ? '♥' : '♡'}
      </button>

      {/* Product Image */}
      <Link to={`/product/${productId}`} style={{ display: 'block', overflow: 'hidden', background: '#121215' }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="product-image"
          style={{ height: '220px', objectFit: 'cover' }}
        />
      </Link>

      {/* Product Card Body */}
      <div className="product-info" style={{ padding: '16px' }}>
        {/* Category Tag & Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: '700', 
            color: '#f97316', 
            textTransform: 'uppercase', 
            letterSpacing: '0.6px',
            background: 'rgba(249, 115, 22, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {product.category || 'Featured'}
          </span>
          <span style={{
            color: '#fbbf24',
            fontSize: '0.82rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            ★ {Number(product.ratings || 4.5).toFixed(1)}
            <span style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: '400' }}>
              ({product.numReviews || Math.floor(product.price % 30 + 12)})
            </span>
          </span>
        </div>

        {/* Product Title */}
        <Link 
          to={`/product/${productId}`}
          style={{ textDecoration: 'none', color: '#ffffff' }}
        >
          <h3 
            title={product.name}
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              lineHeight: '1.4',
              marginBottom: '8px',
              color: '#f4f4f5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '2.8em'
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price, MRP and Discount % */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.28rem', fontWeight: '800', color: '#f97316' }}>
              ₹{Number(product.price).toFixed(2)}
            </span>
            <span style={{ fontSize: '0.84rem', color: '#71717a', textDecoration: 'line-through' }}>
              ₹{originalPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
              {discountPercent}% OFF
            </span>
          </div>
        </div>

        {/* Action Buttons: Quick Add to Cart & Details */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <button
            id={`quick-add-to-cart-btn-${productId}`}
            onClick={handleQuickAddToCart}
            style={{
              flex: 1,
              background: addedAnimation ? '#10b981' : '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 12px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)'
            }}
          >
            {addedAnimation ? (
              <span>✓ Added</span>
            ) : (
              <>
                <span>🛒</span>
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link 
            to={`/product/${productId}`} 
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#27272a',
              color: '#e4e4e7',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textDecoration: 'none',
              fontSize: '0.84rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="View Details"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
