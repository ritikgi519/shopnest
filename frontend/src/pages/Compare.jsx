import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';

const Compare = () => {
  const {
    compareList,
    compareCount,
    maxItems,
    removeFromCompare,
    clearCompare,
    addToCompare
  } = useCompare();

  const { isInWishlist, toggleWishlist } = useWishlist();
  const dispatch = useDispatch();

  const [allProducts, setAllProducts] = useState([]);
  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all products so user can quickly add other items to compare
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setAllProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load products for comparison studio', err);
      }
    };
    fetchAll();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1
      })
    );
    showNotice(`Added "${product.name}" to cart!`);
  };

  const handleAddAllToCart = () => {
    let count = 0;
    compareList.forEach((product) => {
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
        count++;
      }
    });
    if (count > 0) {
      showNotice(`Added all ${count} available items to your cart!`);
    } else {
      showNotice('No items in stock to add.');
    }
  };

  const showNotice = (msg) => {
    setCopiedNotification(msg);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 3000);
  };

  const handleCopySummary = () => {
    if (compareList.length === 0) return;
    const summaryLines = [
      'ShopNest Product Comparison Summary:',
      '------------------------------------',
      ...compareList.map(
        (p) =>
          `• ${p.name}: ₹${Number(p.price).toFixed(2)} | Rating: ${p.ratings || 5}★ (${p.numReviews || 0} reviews) | Stock: ${p.stock > 0 ? 'In Stock (' + p.stock + ')' : 'Out of Stock'}`
      ),
      '------------------------------------',
      `Compared on ShopNest: ${window.location.origin}/compare`
    ];

    navigator.clipboard?.writeText(summaryLines.join('\n'));
    showNotice('Comparison summary copied to clipboard!');
  };

  // Calculations for badges
  const prices = compareList.map((p) => Number(p.price) || 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const priceSpread = (maxPrice - minPrice).toFixed(2);

  const ratings = compareList.map((p) => Number(p.ratings) || 0);
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;

  // Attributes helper for differences detection
  const isDifferent = (getter) => {
    if (compareList.length <= 1) return false;
    const firstVal = getter(compareList[0]);
    return compareList.some((p) => getter(p) !== firstVal);
  };

  const diffFlags = {
    price: isDifferent((p) => Number(p.price)),
    category: isDifferent((p) => p.category),
    rating: isDifferent((p) => Number(p.ratings || 0)),
    stock: isDifferent((p) => (p.stock > 0 ? 'instock' : 'out')),
    stockCount: isDifferent((p) => Number(p.stock))
  };

  // Filtered available products to add
  const availableToAdd = allProducts.filter(
    (p) => !compareList.some((item) => String(item._id || item.id) === String(p._id || p.id))
  );

  const searchedAvailable = availableToAdd.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      id="product-comparison-studio"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '30px 20px 80px 20px',
        color: '#f4f4f5'
      }}
    >
      {/* Toast Notification */}
      {copiedNotification && (
        <div
          id="compare-action-toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#10b981',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '8px',
            fontWeight: '600',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          ✓ {copiedNotification}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '0.95rem' }}>
        <Link to="/" style={{ color: '#f97316', textDecoration: 'none' }}>Home</Link>
        {' '}/ <Link to="/shop" style={{ color: '#f97316', textDecoration: 'none' }}>Shop</Link>
        {' '}/ <span style={{ color: '#fff' }}>Comparison Studio</span>
      </div>

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '24px',
          marginBottom: '30px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '2rem' }}>⚖️</span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Comparison Studio
            </h1>
            <span
              id="compare-badge-count"
              style={{
                background: 'rgba(37, 99, 235, 0.18)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.88rem',
                fontWeight: '700'
              }}
            >
              {compareCount} of {maxItems} Selected
            </span>
          </div>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: '1.02rem' }}>
            Evaluate side-by-side specifications, rating metrics, pricing spreads, and value benchmarks.
          </p>
        </div>

        {/* Global Toolbar */}
        {compareCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Toggle Highlight Differences */}
            {compareCount > 1 && (
              <button
                id="toggle-differences-btn"
                onClick={() => setHighlightDiffs(!highlightDiffs)}
                style={{
                  background: highlightDiffs ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                  color: highlightDiffs ? '#fff' : '#d4d4d8',
                  border: highlightDiffs ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>✨</span>
                <span>{highlightDiffs ? 'Differences Highlighted' : 'Highlight Differences'}</span>
              </button>
            )}

            {/* Add Product Modal trigger */}
            {compareCount < maxItems && (
              <button
                id="open-add-product-modal-btn"
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'rgba(249, 115, 22, 0.15)',
                  color: '#f97316',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>+</span>
                <span>Add Product</span>
              </button>
            )}

            {/* Share / Copy Summary */}
            <button
              id="copy-comparison-summary-btn"
              onClick={handleCopySummary}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#d4d4d8',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
              title="Copy comparison summary"
            >
              📋 Copy Summary
            </button>

            {/* Clear All */}
            <button
              id="clear-all-comparison-btn"
              onClick={clearCompare}
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* When 0 products selected: Empty State & Quick Pickers */}
      {compareCount === 0 && (
        <div
          id="compare-empty-state"
          style={{
            background: '#18181b',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '60px 30px',
            textAlign: 'center',
            maxWidth: '750px',
            margin: '40px auto'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '36px',
              color: '#3b82f6'
            }}
          >
            ⚖️
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>
            No Products Selected for Comparison
          </h2>
          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              maxWidth: '520px',
              margin: '0 auto 30px auto'
            }}
          >
            Select 2 to 4 products across our catalog to compare specifications, ratings, pricing,
            and value side-by-side in real time!
          </p>

          <div style={{ marginBottom: '40px' }}>
            <Link
              to="/shop"
              className="btn"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                background: '#f97316',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Browse Catalog to Compare
            </Link>
          </div>

          {/* Quick Suggestions */}
          {allProducts.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '25px' }}>
              <h4 style={{ fontSize: '1rem', color: '#e4e4e7', marginBottom: '15px' }}>
                Quick Add Popular Items:
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '14px'
                }}
              >
                {allProducts.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: '700' }}>
                          ₹{Number(item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCompare(item)}
                      style={{
                        background: '#2563eb',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      + Add to Compare
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* When 1 product selected: Single Item Helper */}
      {compareCount === 1 && (
        <div
          id="compare-single-notice"
          style={{
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '18px 24px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px'
          }}
        >
          <div>
            <strong style={{ color: '#60a5fa', fontSize: '1rem' }}>
              Add at least 1 more product to unlock side-by-side spec comparison!
            </strong>
            <p style={{ margin: '4px 0 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>
              Select a 2nd product from the suggestions below or choose from the catalog.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Choose Product
          </button>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {compareCount > 0 && (
        <div
          id="comparison-matrix-container"
          style={{
            background: '#18181b',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Price Spread Insight Banner */}
          {compareCount > 1 && Number(priceSpread) > 0 && (
            <div
              id="compare-price-spread-banner"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                <span style={{ color: '#10b981', fontWeight: '700' }}>💡 Price Spread:</span>
                <span style={{ color: '#d4d4d8' }}>
                  There is a <strong>₹{priceSpread}</strong> difference between the most affordable and highest-tier options.
                </span>
              </div>
              <button
                id="add-all-compared-btn"
                onClick={handleAddAllToCart}
                style={{
                  background: 'transparent',
                  color: '#f97316',
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🛒 Add All {compareCount} Items to Cart
              </button>
            </div>
          )}

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: compareCount > 2 ? '900px' : '650px'
            }}
          >
            {/* Top Product Header Cards */}
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th
                  style={{
                    padding: '24px 20px',
                    width: '200px',
                    color: '#71717a',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    verticalAlign: 'top',
                    background: 'rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Product Overview
                </th>
                {compareList.map((product) => {
                  const productId = product._id || product.id;
                  const isLowestPrice = compareCount > 1 && Number(product.price) === minPrice;
                  const isHighestRating = compareCount > 1 && Number(product.ratings) === maxRating;
                  const isSavedWishlist = isInWishlist(productId);

                  return (
                    <th
                      key={productId}
                      id={`compare-column-${productId}`}
                      style={{
                        padding: '24px 20px',
                        verticalAlign: 'top',
                        minWidth: '220px',
                        width: `${100 / (compareCount + 1)}%`
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCompare(productId)}
                          title="Remove product"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          ✕
                        </button>

                        {/* Product Image */}
                        <Link to={`/product/${productId}`}>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '180px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              marginBottom: '14px',
                              border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          />
                        </Link>

                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {isLowestPrice && (
                            <span
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}
                            >
                              ✓ Best Value
                            </span>
                          )}
                          {isHighestRating && maxRating > 0 && (
                            <span
                              style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}
                            >
                              ★ Top Rated
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <Link
                          to={`/product/${productId}`}
                          style={{
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '1.05rem',
                            fontWeight: '600',
                            display: 'block',
                            marginBottom: '8px',
                            lineHeight: '1.4'
                          }}
                        >
                          {product.name}
                        </Link>

                        {/* Price */}
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#f97316',
                            marginBottom: '16px'
                          }}
                        >
                          ₹{Number(product.price).toFixed(2)}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            id={`compare-add-cart-${productId}`}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: product.stock <= 0 ? '#3f3f46' : '#f97316',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>🛒</span>
                            <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                          </button>

                          <button
                            id={`compare-toggle-wishlist-${productId}`}
                            onClick={() => toggleWishlist(product)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: isSavedWishlist ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                              color: isSavedWishlist ? '#f43f5e' : '#a1a1aa',
                              border: isSavedWishlist
                                ? '1px solid rgba(244, 63, 94, 0.4)'
                                : '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              fontWeight: '500',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{isSavedWishlist ? '♥' : '♡'}</span>
                            <span>{isSavedWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Slot to add another product if < max */}
                {compareCount < maxItems && (
                  <th
                    style={{
                      padding: '24px 20px',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.01)',
                      borderLeft: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div
                      onClick={() => setShowAddModal(true)}
                      style={{
                        border: '2px dashed rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        padding: '40px 16px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        color: '#a1a1aa'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.color = '#60a5fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.color = '#a1a1aa';
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>+</div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Add Product</div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '4px' }}>
                        Compare up to {maxItems}
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            {/* Spec Matrix Rows */}
            <tbody>
              {/* Row: Category */}
              <tr
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: highlightDiffs && diffFlags.category ? 'rgba(59, 130, 246, 0.08)' : 'transparent'
                }}
              >
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Category
                </td>
                {compareList.map((p) => (
                  <td key={p._id} style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: '600', color: '#e4e4e7' }}>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.5px', color: '#f97316' }}>
                      {p.category}
                    </span>
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>

              {/* Row: Customer Rating */}
              <tr
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: highlightDiffs && diffFlags.rating ? 'rgba(59, 130, 246, 0.08)' : 'transparent'
                }}
              >
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Customer Rating
                </td>
                {compareList.map((p) => (
                  <td key={p._id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>★</span>
                      <strong style={{ fontSize: '1.05rem', color: '#fff' }}>
                        {p.ratings ? Number(p.ratings).toFixed(1) : '5.0'}
                      </strong>
                      <span style={{ color: '#71717a', fontSize: '0.85rem' }}>
                        ({p.numReviews || 0} reviews)
                      </span>
                    </div>
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>

              {/* Row: Availability & Stock Count */}
              <tr
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: highlightDiffs && diffFlags.stock ? 'rgba(59, 130, 246, 0.08)' : 'transparent'
                }}
              >
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Stock Availability
                </td>
                {compareList.map((p) => (
                  <td key={p._id} style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: p.stock > 0 ? '#10b981' : '#ef4444',
                        fontWeight: '600',
                        fontSize: '0.92rem'
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: p.stock > 0 ? '#10b981' : '#ef4444'
                        }}
                      />
                      {p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}
                    </span>
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>

              {/* Row: Delivery Estimate */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Shipping & Delivery
                </td>
                {compareList.map((p) => (
                  <td key={p._id} style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#d4d4d8' }}>
                    <div style={{ fontWeight: '600', color: '#60a5fa', marginBottom: '2px' }}>
                      🚚 Free Express Delivery
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#71717a' }}>
                      Dispatched within 24 hours
                    </div>
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>

              {/* Row: Warranty & Protection */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Warranty Coverage
                </td>
                {compareList.map((p) => (
                  <td key={p._id} style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#d4d4d8' }}>
                    <div style={{ fontWeight: '600', color: '#10b981' }}>
                      🛡️ 1-Year Comprehensive
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#71717a' }}>
                      Official Manufacturer Warranty
                    </div>
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>

              {/* Row: Return Policy */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Return Window
                </td>
                {compareList.map((p) => (
                  <td key={p._id} style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#d4d4d8' }}>
                    <div style={{ fontWeight: '600', color: '#f59e0b' }}>
                      🔄 30-Day Money-Back
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#71717a' }}>
                      No-questions-asked returns
                    </div>
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>

              {/* Row: Full Description Highlights */}
              <tr>
                <td style={{ padding: '16px 20px', color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)' }}>
                  Key Features & Description
                </td>
                {compareList.map((p) => (
                  <td
                    key={p._id}
                    style={{
                      padding: '16px 20px',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      color: '#a1a1aa'
                    }}
                  >
                    {p.description}
                  </td>
                ))}
                {compareCount < maxItems && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Quick Add Product to Compare */}
      {showAddModal && (
        <div
          id="add-product-to-compare-modal"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>
                  Add Product to Comparison
                </h3>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>
                  ({compareCount} / {maxItems} slots currently filled)
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <input
                type="text"
                placeholder="Search catalog by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Product List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flexGrow: 1 }}>
              {searchedAvailable.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
                  No available products found matching your search.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {searchedAvailable.map((product) => (
                    <div
                      key={product._id}
                      id={`modal-pick-product-${product._id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontWeight: '600',
                              color: '#fff',
                              fontSize: '0.95rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {product.name}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: '#f97316', fontWeight: '700', fontSize: '0.85rem' }}>
                              ₹{Number(product.price).toFixed(2)}
                            </span>
                            <span style={{ color: '#71717a', fontSize: '0.78rem' }}>
                              • {product.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCompare(product);
                          if (compareCount + 1 >= maxItems) {
                            setShowAddModal(false);
                          }
                        }}
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        + Compare
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
