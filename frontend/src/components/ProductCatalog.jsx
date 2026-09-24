import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import '../styles/product.css';

/**
 * ProductCatalog Component
 * 
 * Fetches products from the backend API and displays responsive product cards
 * with image, title, price, category badges, rating, stock status, and cart/wishlist/compare actions.
 * 
 * Features:
 * - Prominent Search Bar at the top that filters displayed products by name in real-time
 * - Real-time matched term highlighting in product titles
 * - Popular search keyword chips for 1-click filtering
 * - Dynamic category tabs, sorting, and in-stock toggles
 * - Grid and List view switcher
 */
const ProductCatalog = ({
  apiUrl = '/api/products',
  title = 'Product Catalog',
  subtitle = 'Browse our curated collection with verified quality and doorstep fulfillment.',
  initialCategory = 'All',
  limit = null,
  showFilters = true,
  showSearch = true,
  defaultSort = 'featured',
  initialSearch = ''
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter states
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(defaultSort);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [addedItemMap, setAddedItemMap] = useState({});

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const { user } = useContext(AuthContext);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to load catalog (Status: ${response.status})`);
      }
      const data = await response.json();
      const productList = Array.isArray(data) ? data : data.products || [];
      setProducts(productList);
    } catch (err) {
      console.error('Error fetching product catalog:', err);
      setError(err.message || 'Unable to connect to the product service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [apiUrl]);

  // Extract unique categories dynamically from fetched products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const cat = p.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Popular search keywords based on catalog items
  const popularNameChips = useMemo(() => {
    const potentialChips = ['Headphones', 'Watch', 'Jacket', 'Sneakers', 'Chair', 'Desk', 'Lamp', 'Backpack', 'Coffee', 'Keyboard'];
    const existing = potentialChips.filter((kw) =>
      products.some((p) => (p.name || '').toLowerCase().includes(kw.toLowerCase()))
    );
    return existing.length > 0 ? existing.slice(0, 6) : potentialChips.slice(0, 5);
  }, [products]);

  // Filter products by NAME in real-time as user types
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = products.filter((p) => {
      const pName = (p.name || p.title || '').toLowerCase();

      // Real-time filtering by product name
      const matchesName = !query || pName.includes(query);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const stockCount = p.stock !== undefined ? p.stock : (p.countInStock !== undefined ? p.countInStock : 10);
      const matchesStock = !onlyInStock || stockCount > 0;

      return matchesName && matchesCat && matchesStock;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const ratingA = Number(a.ratings || a.rating || 0);
      const ratingB = Number(b.ratings || b.rating || 0);

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return ratingB - ratingA;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0; // Default/Featured
    });

    if (limit && limit > 0) {
      return result.slice(0, limit);
    }
    return result;
  }, [products, search, selectedCategory, sortBy, onlyInStock, limit]);

  // Helper to highlight matching text in product names in real-time
  const highlightMatch = (text, query) => {
    if (!query || !query.trim() || !text) return text;
    const trimmed = query.trim();
    const escaped = trimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === trimmed.toLowerCase() ? (
        <mark
          key={index}
          style={{
            backgroundColor: '#ea580c',
            color: '#ffffff',
            padding: '1px 4px',
            borderRadius: '3px',
            fontWeight: '700'
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Handle Quick Add to Cart
  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const pid = product._id || product.id;
    dispatch(addToCart({ ...product, qty: 1 }));

    setAddedItemMap((prev) => ({ ...prev, [pid]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [pid]: false }));
    }, 1800);
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (window.confirm('Please sign in to save items to your wishlist. Would you like to log in?')) {
        navigate('/login');
      }
      return;
    }
    toggleWishlist(product);
  };

  // Handle Compare Toggle
  const handleCompareToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('featured');
    setOnlyInStock(false);
  };

  return (
    <div className="product-catalog-wrapper" style={{ width: '100%', maxWidth: '1360px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* 1. HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          {title && (
            <h1 style={{ margin: '0 0 6px 0', fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.98rem', maxWidth: '680px', lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Counter & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ color: '#71717a', fontSize: '0.9rem' }}>
            Showing <strong style={{ color: '#f97316' }}>{filteredProducts.length}</strong> of {products.length} products
          </div>

          <div style={{ display: 'inline-flex', background: '#18181b', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '3px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                background: viewMode === 'grid' ? '#f97316' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : '#a1a1aa',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              ⊞ Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List View"
              style={{
                background: viewMode === 'list' ? '#f97316' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#a1a1aa',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TOP SEARCH BAR: REAL-TIME NAME FILTERING
         ======================================================== */}
      {showSearch && (
        <div
          className="catalog-top-search-section"
          id="catalog-top-search-section"
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #1a1a1e 100%)',
            border: search.trim() ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: search.trim() ? '0 8px 32px rgba(249, 115, 22, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            padding: '22px 24px',
            marginBottom: '24px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header Row for Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', color: '#f97316' }}>🔍</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                  Search Products by Name
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#a1a1aa' }}>
                  Filters the displayed products instantly in real-time as you type
                </p>
              </div>
            </div>

            {/* Real-time Status Badge */}
            {search.trim() ? (
              <div
                style={{
                  background: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                  color: '#fb923c',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>⚡ Real-Time:</span>
                <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'match' : 'matches'} found</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#71717a' }}>
                Type to start instant filtering
              </div>
            )}
          </div>

          {/* Top Search Input Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: search ? '#f97316' : '#71717a',
                fontSize: '1.15rem',
                pointerEvents: 'none',
                transition: 'color 0.2s ease'
              }}
            >
              🔎
            </span>

            <input
              id="catalog-search-input"
              data-testid="search-bar"
              type="text"
              role="searchbox"
              aria-label="Search products by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearch('');
              }}
              placeholder="Search products by name in real-time... (e.g., Wireless Headphones, Sneakers, Watch, Chair)"
              style={{
                width: '100%',
                padding: '16px 48px 16px 52px',
                background: '#09090b',
                border: search ? '1.5px solid #f97316' : '1px solid #3f3f46',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '500',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: search ? '0 0 0 3px rgba(249, 115, 22, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            />

            {/* Clear Input Button */}
            {search && (
              <button
                type="button"
                id="catalog-clear-search-btn"
                onClick={() => setSearch('')}
                title="Clear search query (Esc)"
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#e4e4e7',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  transition: 'all 0.15s ease'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Name Suggestions */}
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a', fontWeight: '600' }}>
              Suggested names:
            </span>
            {popularNameChips.map((nameChip) => {
              const isActive = search.toLowerCase() === nameChip.toLowerCase();
              return (
                <button
                  key={nameChip}
                  type="button"
                  onClick={() => setSearch(isActive ? '' : nameChip)}
                  style={{
                    background: isActive ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#d4d4d8',
                    border: isActive ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '14px',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {nameChip}
                </button>
              );
            })}

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  background: 'transparent',
                  color: '#f87171',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                Clear search ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SECONDARY CONTROLS (Category Tabs, Sort & Stock Toggle) */}
      {showFilters && (
        <div
          style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', color: '#71717a', marginRight: '4px', whiteSpace: 'nowrap' }}>
              Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: isSelected ? '#f97316' : '#09090b',
                    color: isSelected ? '#ffffff' : '#a1a1aa',
                    border: isSelected ? '1px solid #f97316' : '1px solid #27272a',
                    padding: '7px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: isSelected ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & In-Stock Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#71717a', fontSize: '0.86rem' }}>Sort order:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: '#09090b',
                  color: '#fafafa',
                  border: '1px solid #27272a',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d4d4d8',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  background: '#09090b',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #27272a',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  style={{ accentColor: '#f97316', cursor: 'pointer' }}
                />
                <span>In Stock Only</span>
              </label>

              {(search || selectedCategory !== 'All' || sortBy !== 'featured' || onlyInStock) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. LOADING SKELETON STATE */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              style={{
                background: '#18181b',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ width: '100%', height: '220px', background: '#27272a', borderRadius: '10px' }} />
              <div style={{ width: '40%', height: '14px', background: '#27272a', borderRadius: '4px' }} />
              <div style={{ width: '80%', height: '20px', background: '#27272a', borderRadius: '4px' }} />
              <div style={{ width: '50%', height: '24px', background: '#27272a', borderRadius: '4px', marginTop: 'auto' }} />
              <div style={{ width: '100%', height: '38px', background: '#27272a', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      )}

      {/* 5. ERROR STATE */}
      {!loading && error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center',
            color: '#fca5a5',
            margin: '40px 0'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.2rem' }}>Failed to Load Catalog</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem' }}>{error}</p>
          <button
            type="button"
            onClick={fetchProducts}
            style={{
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry Fetching
          </button>
        </div>
      )}

      {/* 6. EMPTY SEARCH STATE */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div
          id="catalog-empty-results"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#18181b',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#a1a1aa'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 8px 0' }}>
            No products found matching "{search}"
          </h3>
          <p style={{ margin: '0 auto 20px auto', fontSize: '0.95rem', maxWidth: '520px' }}>
            No item names currently contain this search term. Try adjusting your query or click below to view all available products.
          </p>
          <button
            type="button"
            id="catalog-clear-empty-filter-btn"
            onClick={handleResetFilters}
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Clear Search & View All
          </button>
        </div>
      )}

      {/* 7. PRODUCTS DISPLAY (GRID OR LIST) */}
      {!loading && !error && filteredProducts.length > 0 && (
        viewMode === 'grid' ? (
          /* GRID VIEW */
          <div
            className="product-grid"
            id="catalog-product-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginTop: '10px'
            }}
          >
            {filteredProducts.map((product) => {
              const pid = product._id || product.id;
              const originalPrice = Math.round(Number(product.price) * 1.28);
              const discountPercent = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);
              const isWishlisted = isInWishlist(pid);
              const isCompared = isInCompare(pid);
              const isAdded = addedItemMap[pid];
              const stock = product.stock !== undefined ? product.stock : (product.countInStock !== undefined ? product.countInStock : 10);
              const isOutOfStock = stock <= 0;

              return (
                <div
                  key={pid}
                  className="product-card"
                  id={`catalog-card-${pid}`}
                  style={{
                    background: '#18181b',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Compare Toggle (Top Left) */}
                  <button
                    type="button"
                    onClick={(e) => handleCompareToggle(e, product)}
                    title={isCompared ? 'Remove from Comparison' : 'Add to Comparison'}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      zIndex: 10,
                      height: '28px',
                      padding: '0 8px',
                      borderRadius: '14px',
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
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <span>⚖️</span>
                    <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  {/* Wishlist Toggle (Top Right) */}
                  <button
                    type="button"
                    onClick={(e) => handleWishlistToggle(e, product)}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 10,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isWishlisted ? 'rgba(244, 63, 94, 0.25)' : 'rgba(18, 18, 22, 0.8)',
                      backdropFilter: 'blur(8px)',
                      border: isWishlisted ? '1px solid rgba(244, 63, 94, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
                      color: isWishlisted ? '#f43f5e' : '#a1a1aa',
                      fontSize: isWishlisted ? '17px' : '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    {isWishlisted ? '♥' : '♡'}
                  </button>

                  {/* Product Image */}
                  <Link
                    to={`/product/${pid}`}
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      background: '#121215',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={product.imageUrl || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                      }}
                      style={{
                        width: '100%',
                        height: '230px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />

                    {isOutOfStock && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f87171',
                          fontWeight: '800',
                          fontSize: '1rem',
                          letterSpacing: '1px'
                        }}
                      >
                        OUT OF STOCK
                      </div>
                    )}
                  </Link>

                  {/* Product Card Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Category & Rating */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            color: '#f97316',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: 'rgba(249, 115, 22, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {product.category || 'Featured'}
                        </span>

                        <span
                          style={{
                            color: '#fbbf24',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          ★ {Number(product.ratings || product.rating || 4.5).toFixed(1)}
                          <span style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: '400' }}>
                            ({product.numReviews || Math.floor((Number(product.price) || 20) % 30 + 12)})
                          </span>
                        </span>
                      </div>

                      {/* Product Name with Real-Time Highlighting */}
                      <Link
                        to={`/product/${pid}`}
                        style={{ textDecoration: 'none', color: '#ffffff' }}
                      >
                        <h3
                          title={product.name}
                          style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            lineHeight: '1.4',
                            marginBottom: '10px',
                            color: '#f4f4f5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.8em'
                          }}
                        >
                          {highlightMatch(product.name, search)}
                        </h3>
                      </Link>

                      {/* Price, MRP and Discount */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ fontSize: '1.28rem', fontWeight: '800', color: '#f97316' }}>
                          ₹{Number(product.price).toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.84rem', color: '#71717a', textDecoration: 'line-through' }}>
                          ₹{originalPrice.toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: '700',
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.12)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {discountPercent}% OFF
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        type="button"
                        id={`catalog-add-btn-${pid}`}
                        disabled={isOutOfStock}
                        onClick={(e) => handleQuickAdd(e, product)}
                        style={{
                          flex: 1,
                          background: isOutOfStock ? '#3f3f46' : (isAdded ? '#10b981' : '#f97316'),
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: isOutOfStock ? 'none' : '0 2px 10px rgba(249, 115, 22, 0.3)'
                        }}
                      >
                        {isOutOfStock ? (
                          <span>Out of Stock</span>
                        ) : isAdded ? (
                          <span>✓ Added to Cart</span>
                        ) : (
                          <>
                            <span>🛒</span>
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <Link
                        to={`/product/${pid}`}
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
                        title="View Full Product Specifications"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {filteredProducts.map((product) => {
              const pid = product._id || product.id;
              const originalPrice = Math.round(Number(product.price) * 1.28);
              const discountPercent = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);
              const isWishlisted = isInWishlist(pid);
              const isCompared = isInCompare(pid);
              const isAdded = addedItemMap[pid];
              const stock = product.stock !== undefined ? product.stock : (product.countInStock !== undefined ? product.countInStock : 10);
              const isOutOfStock = stock <= 0;

              return (
                <div
                  key={pid}
                  style={{
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Left: Thumbnail & Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: '1 1 360px' }}>
                    <Link to={`/product/${pid}`} style={{ flexShrink: 0 }}>
                      <img
                        src={product.imageUrl || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
                        }}
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' }}
                      />
                    </Link>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: '700', textTransform: 'uppercase' }}>
                          {product.category || 'Featured'}
                        </span>
                        <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: '600' }}>
                          ★ {Number(product.ratings || product.rating || 4.5).toFixed(1)}
                        </span>
                      </div>

                      <Link to={`/product/${pid}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '600', color: '#fff' }}>
                          {highlightMatch(product.name, search)}
                        </h3>
                      </Link>

                      <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.84rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description || 'Premium quality verified item from ShopNest.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f97316' }}>
                        ₹{Number(product.price).toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: '#71717a' }}>
                        <span style={{ textDecoration: 'line-through' }}>₹{originalPrice.toFixed(2)}</span>
                        <span style={{ color: '#10b981', fontWeight: '700' }}>{discountPercent}% OFF</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Wishlist */}
                      <button
                        type="button"
                        onClick={(e) => handleWishlistToggle(e, product)}
                        title={isWishlisted ? 'Saved' : 'Save'}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: isWishlisted ? 'rgba(244, 63, 94, 0.2)' : '#27272a',
                          border: isWishlisted ? '1px solid #f43f5e' : '1px solid #3f3f46',
                          color: isWishlisted ? '#f43f5e' : '#a1a1aa',
                          fontSize: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        {isWishlisted ? '♥' : '♡'}
                      </button>

                      {/* Compare */}
                      <button
                        type="button"
                        onClick={(e) => handleCompareToggle(e, product)}
                        title="Compare"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: isCompared ? 'rgba(37, 99, 235, 0.2)' : '#27272a',
                          border: isCompared ? '1px solid #3b82f6' : '1px solid #3f3f46',
                          color: isCompared ? '#60a5fa' : '#a1a1aa',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        ⚖️
                      </button>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => handleQuickAdd(e, product)}
                        style={{
                          background: isOutOfStock ? '#3f3f46' : (isAdded ? '#10b981' : '#f97316'),
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          fontWeight: '700',
                          fontSize: '0.88rem',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isOutOfStock ? 'Out of Stock' : (isAdded ? '✓ Added' : 'Add to Cart')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default ProductCatalog;
