import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import '../styles/product.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare, addToCompare } = useCompare();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState(null);

  // Frequently Bought Together (Smart Bundle)
  const [bundleProducts, setBundleProducts] = useState([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [bundleNotice, setBundleNotice] = useState(null);

  const isWishlisted = isInWishlist(id);
  const isCompared = isInCompare(id);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);

      // Fetch all products to create a smart "Frequently Bought Together" bundle
      try {
        const allRes = await fetch('/api/products');
        if (allRes.ok) {
          const allData = await allRes.json();
          if (Array.isArray(allData)) {
            const others = allData.filter((p) => String(p._id || p.id) !== String(id));
            const sameCat = others.filter((p) => p.category === data.category);
            const picks = sameCat.length >= 2
              ? sameCat.slice(0, 2)
              : [...sameCat, ...others.filter((p) => p.category !== data.category)].slice(0, 2);
            setBundleProducts(picks);
            setSelectedBundleIds([String(id), ...picks.map((p) => String(p._id || p.id))]);
          }
        }
      } catch (bErr) {
        console.warn('Bundle fetch notice:', bErr);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchase = async () => {
    if (!user) {
      setHasPurchased(false);
      return;
    }
    setCheckingPurchase(true);
    try {
      const res = await fetch(`/api/products/${id}/has-purchased`, {
        headers: {
          Authorization: `Bearer ${user.token || user.accessToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setHasPurchased(!!data.hasPurchased);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setCheckingPurchase(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkPurchase();
    } else {
      setHasPurchased(false);
    }
  }, [user, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        productId: product._id,
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.image,
        imageUrl: product.imageUrl || product.image,
        category: product.category,
        qty: 1
      }));
      alert('Successfully added to your cart!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please share your thoughts in the review comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewMessage(null);
    setReviewError(null);

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token || user.accessToken}`
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMessage('Your review has been posted successfully!');
        setComment('');
        if (data.product) {
          setProduct(data.product);
        } else {
          fetchProduct();
        }
      } else {
        setReviewError(data.message || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      setReviewError('Network error while posting review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (score, interactive = false, onSelect = null) => {
    const stars = [];
    const currentScore = interactive ? (hoverRating || rating) : score;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= currentScore;
      const isHalf = !isFilled && i - 0.5 <= currentScore;

      stars.push(
        <span
          key={i}
          id={interactive ? `star-rating-btn-${i}` : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          onClick={interactive && onSelect ? () => onSelect(i) : undefined}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            color: isFilled || isHalf ? '#f59e0b' : '#3f3f46',
            fontSize: interactive ? '1.8rem' : '1.1rem',
            marginRight: '3px',
            transition: 'color 0.15s ease, transform 0.15s ease',
            display: 'inline-block'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <div style={{ textAlign: 'center', margin: '100px', color: '#f97316' }}>Loading Product...</div>;
  if (!product) return <div style={{ textAlign: 'center', margin: '100px', color: '#ef4444' }}>Product Not Found</div>;

  const reviewsList = product.reviews || [];
  const averageRating = product.ratings ? Number(product.ratings).toFixed(1) : '0.0';
  const totalReviews = product.numReviews || reviewsList.length;

  return (
    <div className="product-detail-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: '#f4f4f5' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '0.95rem' }}>
        <Link to="/" style={{ color: '#f97316', textDecoration: 'none' }}>Home</Link> / <Link to="/shop" style={{ color: '#f97316', textDecoration: 'none' }}>Shop</Link> / {product.category} / <span style={{ color: '#fff' }}>{product.name}</span>
      </div>

      {/* Main Product Card */}
      <div className="product-detail" style={{ marginBottom: '50px' }}>
        {/* Left Side: Image */}
        <div className="detail-image-container">
          <img src={product.imageUrl} alt={product.name} className="detail-image" />
        </div>

        {/* Right Side: Information Block */}
        <div className="detail-info">
          
          <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', color: '#ffffff' }}>{product.name}</h2>

          {/* Aggregate Star Rating & Review Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {renderStars(Number(averageRating))}
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b' }}>
              {averageRating}
            </span>
            <span style={{ color: '#71717a', fontSize: '0.9rem' }}>
              ({totalReviews} {totalReviews === 1 ? 'customer review' : 'customer reviews'})
            </span>
          </div>

          <p className="detail-price" style={{ fontSize: '2.3rem', margin: '15px 0', color: '#f97316', fontWeight: '700' }}>
            ₹{Number(product.price).toFixed(2)}
          </p>

          {/* Description */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.05rem' }}>Product Description</h4>
            <p style={{ color: '#a1a1aa', lineHeight: '1.7', fontSize: '1rem' }}>{product.description}</p>
          </div>

          {/* Cart & Wishlist Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              id="add-to-cart-detail-btn"
              onClick={handleAddToCart}
              className="btn"
              style={{
                flex: '1 1 220px',
                padding: '16px',
                fontSize: '1.1rem',
                background: '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add to Shopping Cart
            </button>

            <button
              id="wishlist-toggle-detail-btn"
              onClick={async () => {
                if (!user) {
                  if (window.confirm('Please sign in to save products to your wishlist. Proceed to login?')) {
                    navigate('/login');
                  }
                  return;
                }
                const res = await toggleWishlist(product);
                if (res && res.message) {
                  setWishlistMsg(res.message);
                  setTimeout(() => setWishlistMsg(null), 3000);
                }
              }}
              style={{
                padding: '16px 24px',
                fontSize: '1.05rem',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isWishlisted ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isWishlisted ? '#f43f5e' : '#e4e4e7',
                border: isWishlisted ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.3rem', color: isWishlisted ? '#f43f5e' : '#a1a1aa' }}>
                {isWishlisted ? '♥' : '♡'}
              </span>
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <button
              id="compare-toggle-detail-btn"
              onClick={() => toggleCompare(product)}
              style={{
                padding: '16px 22px',
                fontSize: '1.05rem',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isCompared ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isCompared ? '#60a5fa' : '#e4e4e7',
                border: isCompared ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚖️</span>
              <span>{isCompared ? 'In Compare Studio' : 'Compare Product'}</span>
            </button>
          </div>

          {wishlistMsg && (
            <p id="wishlist-feedback-msg" style={{ marginTop: '12px', color: '#10b981', fontSize: '0.95rem', fontWeight: '500' }}>
              ✓ {wishlistMsg}
            </p>
          )}
          
          <p style={{ marginTop: '20px', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {product.stock > 0 ? `● In Stock (${product.stock} units available)` : `● Temporarily Out of Stock`}
          </p>

        </div>
      </div>

      {/* FREQUENTLY BOUGHT TOGETHER / SMART BUNDLE & SAVE */}
      {bundleProducts.length > 0 && (
        <div
          id="frequently-bought-bundle-section"
          style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '35px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>🎁</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#fff' }}>
                  Frequently Bought Together
                </h3>
                <span style={{ color: '#10b981', fontSize: '0.88rem', fontWeight: '600' }}>
                  Bundle & Save 10% on combined order!
                </span>
              </div>
            </div>

            <button
              id="compare-bundle-items-btn"
              onClick={() => {
                const allItems = [product, ...bundleProducts];
                allItems.forEach((item) => addToCompare(item));
                navigate('/compare');
              }}
              style={{
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ⚖️ Compare These {1 + bundleProducts.length} Items Side-by-Side →
            </button>
          </div>

          {bundleNotice && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '10px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.92rem',
                fontWeight: '600'
              }}
            >
              ✓ {bundleNotice}
            </div>
          )}

          {/* Bundle Visual Pipeline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              padding: '16px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {/* Primary Product */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: '700' }}>THIS ITEM</div>
                <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem', maxWidth: '160px' }}>
                  {product.name}
                </div>
                <div style={{ color: '#d4d4d8', fontWeight: '700', fontSize: '0.9rem' }}>
                  ₹{Number(product.price).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Plus Signs & Bundle Items */}
            {bundleProducts.map((bItem) => {
              const bId = String(bItem._id || bItem.id);
              const isChecked = selectedBundleIds.includes(bId);
              return (
                <React.Fragment key={bId}>
                  <span style={{ fontSize: '1.5rem', color: '#71717a', fontWeight: 'bold' }}>+</span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      opacity: isChecked ? 1 : 0.45,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <Link to={`/product/${bId}`}>
                      <img
                        src={bItem.imageUrl}
                        alt={bItem.name}
                        style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.12)'
                        }}
                      />
                    </Link>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '700' }}>RECOMMENDED</div>
                      <Link
                        to={`/product/${bId}`}
                        style={{
                          textDecoration: 'none',
                          fontWeight: '600',
                          color: '#fff',
                          fontSize: '0.95rem',
                          display: 'block',
                          maxWidth: '160px'
                        }}
                      >
                        {bItem.name}
                      </Link>
                      <div style={{ color: '#d4d4d8', fontWeight: '700', fontSize: '0.9rem' }}>
                        ₹{Number(bItem.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Bundle Checklist and Checkout Calculation */}
          {(() => {
            const allItems = [product, ...bundleProducts];
            const activeItems = allItems.filter((item) =>
              selectedBundleIds.includes(String(item._id || item.id))
            );
            const totalRaw = activeItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            const isDiscountEligible = activeItems.length >= 2;
            const savings = isDiscountEligible ? totalRaw * 0.1 : 0;
            const bundleTotal = totalRaw - savings;

            const handleToggleCheckbox = (targetId) => {
              setSelectedBundleIds((prev) =>
                prev.includes(targetId)
                  ? prev.filter((idVal) => idVal !== targetId)
                  : [...prev, targetId]
              );
            };

            const handleBuyBundle = () => {
              if (activeItems.length === 0) return;
              activeItems.forEach((item) => {
                dispatch(
                  addToCart({
                    productId: item._id || item.id,
                    _id: item._id || item.id,
                    name: item.name,
                    price: isDiscountEligible ? Number((item.price * 0.9).toFixed(2)) : item.price,
                    image: item.imageUrl || item.image,
                    imageUrl: item.imageUrl || item.image,
                    qty: 1
                  })
                );
              });
              setBundleNotice(
                `Successfully added ${activeItems.length} bundle items to your cart with 10% discount!`
              );
              setTimeout(() => setBundleNotice(null), 3500);
            };

            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '24px',
                  marginTop: '20px'
                }}
              >
                {/* Checkboxes List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allItems.map((item, idx) => {
                    const strId = String(item._id || item.id);
                    const isChecked = selectedBundleIds.includes(strId);
                    return (
                      <label
                        key={strId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: isChecked ? '#fff' : '#71717a',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCheckbox(strId)}
                          style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                        />
                        <span>
                          <strong>{idx === 0 ? 'This Item: ' : ''}</strong>
                          {item.name} -{' '}
                          <span style={{ color: '#f97316', fontWeight: '600' }}>
                            ₹{Number(item.price).toFixed(2)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Price Box and Add Bundle Button */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '18px 24px',
                    textAlign: 'right',
                    minWidth: '260px'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                    Total for {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'}:
                  </div>
                  {isDiscountEligible && (
                    <div style={{ fontSize: '0.9rem', color: '#71717a', textDecoration: 'line-through' }}>
                      ₹{totalRaw.toFixed(2)}
                    </div>
                  )}
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f97316' }}>
                    ₹{bundleTotal.toFixed(2)}
                  </div>
                  {isDiscountEligible && (
                    <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', marginBottom: '10px' }}>
                      You Save ₹{savings.toFixed(2)} (10% OFF)!
                    </div>
                  )}

                  <button
                    id="add-bundle-to-cart-btn"
                    onClick={handleBuyBundle}
                    disabled={activeItems.length === 0}
                    style={{
                      width: '100%',
                      background: activeItems.length === 0 ? '#3f3f46' : 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 18px',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      cursor: activeItems.length === 0 ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)'
                    }}
                  >
                    🛒 Add Bundle to Cart
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* REVIEWS & RATINGS SECTION */}
      <div id="reviews-section" style={{
        background: '#18181b',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#ffffff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⭐</span> Ratings & Customer Feedback
            </h3>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem' }}>
              Verified purchase reviews and feedback from our community.
            </p>
          </div>

          {/* Rating Snapshot Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#121214',
            padding: '14px 22px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f59e0b', lineHeight: '1' }}>
                {averageRating}
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>
                Out of 5
              </p>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>
              <div style={{ marginBottom: '4px' }}>
                {renderStars(Number(averageRating))}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#d4d4d8', fontWeight: '500' }}>
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left (Leave Review Form) & Right (Review List) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '36px' }}>
          
          {/* Column 1: Leave a Review Form */}
          <div>
            <div style={{
              background: '#121214',
              borderRadius: '14px',
              padding: '24px 28px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#ffffff' }}>
                Leave Your Feedback
              </h4>

              {/* Purchase Badge / Notice */}
              {user ? (
                hasPurchased ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '18px'
                  }}>
                    <span>✓</span> Verified Buyer — You purchased this item!
                  </div>
                ) : (
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#93c5fd',
                    fontSize: '0.85rem',
                    marginBottom: '18px'
                  }}>
                    ℹ️ Leave a review as <strong>{user.name}</strong>.
                  </div>
                )
              ) : (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: '#27272a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '18px',
                  fontSize: '0.9rem',
                  color: '#d4d4d8'
                }}>
                  Please <Link to="/login" style={{ color: '#f97316', fontWeight: '600' }}>sign in</Link> to share a rating and review for this product.
                </div>
              )}

              {user && (
                <form id="review-feedback-form" onSubmit={handleSubmitReview}>
                  {/* Star Selector */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e4e4e7', fontWeight: '500' }}>
                      Overall Rating: <strong style={{ color: '#f59e0b' }}>{hoverRating || rating} / 5 Stars</strong>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderStars(rating, true, (r) => setRating(r))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e4e4e7', fontWeight: '500' }}>
                      Your Review & Comments:
                    </label>
                    <textarea
                      id="review-comment-input"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike? How was the quality, fit, or performance?"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#18181b',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Success / Error Messages */}
                  {reviewMessage && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#6ee7b7',
                      fontSize: '0.88rem',
                      marginBottom: '16px'
                    }}>
                      ✓ {reviewMessage}
                    </div>
                  )}

                  {reviewError && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#f87171',
                      fontSize: '0.88rem',
                      marginBottom: '16px'
                    }}>
                      ⚠️ {reviewError}
                    </div>
                  )}

                  <button
                    id="submit-review-btn"
                    type="submit"
                    disabled={submittingReview}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: submittingReview ? '#9a3412' : '#f97316',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: submittingReview ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{submittingReview ? '⏳' : '✍️'}</span>
                    {submittingReview ? 'Posting Review...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Reviews List */}
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💬</span> Customer Reviews ({reviewsList.length})
            </h4>

            {reviewsList.length === 0 ? (
              <div style={{
                background: '#121214',
                borderRadius: '12px',
                padding: '40px 24px',
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌟</div>
                <h5 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#ffffff' }}>No reviews yet</h5>
                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>
                  Be the first verified customer to share your experience with this item!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviewsList.map((rev, index) => {
                  const revDate = new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={rev._id || index}
                      id={`review-item-${index}`}
                      style={{
                        background: '#121214',
                        borderRadius: '12px',
                        padding: '18px 20px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      {/* Review Top Row: Name, Verified Badge, Date, Rating */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '1rem' }}>
                              {rev.name}
                            </span>
                            {rev.verifiedPurchase && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}>
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#71717a' }}>
                            Reviewed on {revDate}
                          </span>
                        </div>

                        {/* Stars for this review */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {renderStars(rev.rating)}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p style={{
                        margin: 0,
                        color: '#d4d4d8',
                        lineHeight: '1.6',
                        fontSize: '0.95rem'
                      }}>
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
