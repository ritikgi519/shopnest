import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Furniture', 'Kitchen', 'Beauty'];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    if (qParam !== null) setSearch(qParam);
    if (catParam && CATEGORIES.includes(catParam)) setSelectedCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const cat = p.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesStock = !onlyInStock || (p.stock > 0);
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.ratings || 0) - (a.ratings || 0);
        return 0; // Default/Featured order
      });
  }, [products, search, selectedCategory, sortBy, onlyInStock]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('featured');
    setOnlyInStock(false);
  };

  return (
    <div className="shop-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>Explore Catalog</h2>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem' }}>
            Browse through our curated collection of premium electronics, fashion, home decor, and culinary essentials.
          </p>
        </div>
        <div style={{ color: '#71717a', fontSize: '0.9rem' }}>
          Showing <strong style={{ color: '#f97316' }}>{filteredProducts.length}</strong> of {products.length} products
        </div>
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#18181b',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '480px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontSize: '0.95rem' }}>
            🔍
          </span>
          <input 
            id="shop-search-input"
            type="text" 
            placeholder="Search products by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 38px 10px 40px',
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#fafafa',
              fontSize: '0.92rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls: Sort & Stock Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="shop-sort-select" style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Sort:</label>
            <select
              id="shop-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#09090b',
                color: '#f4f4f5',
                border: '1px solid #27272a',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="featured">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#d4d4d8', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={onlyInStock} 
              onChange={(e) => setOnlyInStock(e.target.checked)}
              style={{ accentColor: '#f97316', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            In Stock Only
          </label>

          {(search || selectedCategory !== 'All' || sortBy !== 'featured' || onlyInStock) && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              id={`category-filter-btn-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                background: isSelected ? '#f97316' : '#18181b',
                color: isSelected ? '#ffffff' : '#a1a1aa',
                border: isSelected ? '1px solid #ea580c' : '1px solid rgba(255, 255, 255, 0.08)',
                fontWeight: isSelected ? '700' : '500',
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(249, 115, 22, 0.25)' : 'none'
              }}
            >
              <span>{cat}</span>
              <span style={{
                fontSize: '0.75rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(0,0,0,0.2)' : '#27272a',
                color: isSelected ? '#ffffff' : '#71717a'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* PRODUCT LISTING */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <p>Loading catalog products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#18181b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          margin: '40px 0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#ffffff' }}>No matching products found</h3>
          <p style={{ margin: '0 0 20px 0', color: '#a1a1aa', fontSize: '0.92rem' }}>
            We couldn't find any products matching your current search or filters.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              background: '#f97316',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="product-grid" style={{ marginTop: '10px' }}>
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
