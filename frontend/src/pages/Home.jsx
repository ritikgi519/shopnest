import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Products', icon: '✦' },
  { id: 'Electronics', label: 'Electronics', icon: '⚡' },
  { id: 'Clothing', label: 'Clothing & Fashion', icon: '👔' },
  { id: 'Furniture', label: 'Furniture & Decor', icon: '🛋️' },
  { id: 'Kitchen', label: 'Kitchenware', icon: '🍳' },
  { id: 'Beauty', label: 'Beauty & Wellness', icon: '✨' }
];

const CURATED_HIGHLIGHTS = [
  {
    title: 'High-End Audio & Tech',
    subtitle: 'Noise-cancelling headsets, 4K OLED & mechanical keyboards',
    category: 'Electronics',
    tag: 'Trending',
    gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(24, 24, 27, 0.95) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    link: '/shop?category=Electronics'
  },
  {
    title: 'Modern Living & Decor',
    subtitle: 'Ergonomic task chairs, solid oak tables & artisan lamps',
    category: 'Furniture',
    tag: 'Crafted',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(24, 24, 27, 0.95) 100%)',
    borderColor: 'rgba(249, 115, 22, 0.25)',
    link: '/shop?category=Furniture'
  },
  {
    title: 'Artisan Kitchen & Dining',
    subtitle: '15-bar espresso machines & Japanese Damascus chef knives',
    category: 'Kitchen',
    tag: 'Top Rated',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(24, 24, 27, 0.95) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    link: '/shop?category=Kitchen'
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Real-time flash deal timer
  const [dealTime, setDealTime] = useState({ hours: 5, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setDealTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtered products for the showcase section
  const displayedProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Featured Deal of the Day items
  const dealProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* 1. SLEEK MODERN DARK HERO BANNER */}
      <div 
        className="hero-banner"
        id="home-hero-banner"
        style={{
          background: 'radial-gradient(circle at top right, rgba(249, 115, 22, 0.18), transparent 50%), linear-gradient(135deg, #18181b 0%, #0c0c0e 100%)',
          padding: '64px 44px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          textAlign: 'left',
          marginBottom: '40px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px'
        }}
      >
        <div style={{ flex: '1 1 540px', maxWidth: '680px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(249, 115, 22, 0.12)', 
            border: '1px solid rgba(249, 115, 22, 0.3)', 
            color: '#f97316', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.82rem', 
            fontWeight: '700',
            marginBottom: '18px',
            letterSpacing: '0.5px'
          }}>
            <span>✦</span> CURATED LUXURY & DAILY ESSENTIALS
          </div>

          <h1 style={{ 
            fontSize: '3.2rem', 
            fontWeight: '800', 
            lineHeight: 1.15, 
            color: '#ffffff', 
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            Elevate Your Living With <span style={{ color: '#f97316' }}>ShopNest.</span>
          </h1>

          <p style={{ 
            fontSize: '1.15rem', 
            color: '#a1a1aa', 
            margin: '0 0 28px 0', 
            lineHeight: 1.6,
            maxWidth: '560px'
          }}>
            Discover hand-crafted electronics, contemporary wardrobe pieces, artisanal kitchen tools, and designer furniture with verified doorstep fulfillment.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link 
              to="/shop" 
              id="hero-explore-catalog-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f97316',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Explore Catalog ({products.length || 57}+ Items)</span>
              <span>→</span>
            </Link>

            <Link 
              to="/return" 
              id="hero-returns-hub-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#e4e4e7',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '14px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '1rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🛡️ 30-Day Returns Hub</span>
            </Link>
          </div>

          {/* Stats Chips */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>{products.length || 57}+</div>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Curated Items</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>4.8 ★</div>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Customer Rating</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>100%</div>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Buyer Protected</div>
            </div>
          </div>
        </div>

        {/* Hero Spotlight Card */}
        {products.length > 0 && (
          <div 
            style={{
              flex: '0 0 340px',
              background: '#18181b',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '18px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '28px', 
              right: '28px', 
              background: '#f97316', 
              color: '#ffffff', 
              fontSize: '0.72rem', 
              fontWeight: '800', 
              padding: '4px 10px', 
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              zIndex: 3
            }}>
              FEATURED PICK
            </div>
            <Link to={`/product/${products[0]._id}`} style={{ textDecoration: 'none' }}>
              <img 
                src={products[0].imageUrl} 
                alt={products[0].name} 
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }} 
              />
              <div style={{ fontSize: '0.78rem', color: '#f97316', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                {products[0].category}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#ffffff', fontWeight: '700' }}>
                {products[0].name}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f97316' }}>
                  ₹{Number(products[0].price).toFixed(2)}
                </span>
                <span style={{ color: '#d4d4d8', fontSize: '0.85rem', fontWeight: '600' }}>
                  View Item →
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* 2. CURATED DEPARTMENTS (3-COLUMN BENTO) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {CURATED_HIGHLIGHTS.map((col, idx) => (
          <Link
            key={idx}
            to={col.link}
            id={`curated-box-${idx}`}
            style={{
              background: col.gradient,
              border: `1px solid ${col.borderColor}`,
              borderRadius: '16px',
              padding: '24px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '160px'
            }}
            className="curated-card"
          >
            <div>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.08)', 
                color: '#f4f4f5', 
                fontSize: '0.72rem', 
                fontWeight: '700', 
                padding: '3px 10px', 
                borderRadius: '12px',
                textTransform: 'uppercase' 
              }}>
                {col.tag}
              </span>
              <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: '800', margin: '12px 0 6px 0' }}>
                {col.title}
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                {col.subtitle}
              </p>
            </div>
            <div style={{ marginTop: '18px', color: '#f97316', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Browse Department →
            </div>
          </Link>
        ))}
      </div>

      {/* 3. FLASH DEALS RIBBON (SLEEK DARK LOOK WITH COUNTDOWN) */}
      <div 
        style={{
          background: '#18181b',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '44px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f97316' }}>⚡</span> Limited Time Offers
            </h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              <span>⏱ Ends in</span>
              <span>
                {String(dealTime.hours).padStart(2, '0')}h : {String(dealTime.minutes).padStart(2, '0')}m : {String(dealTime.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
          <Link 
            to="/shop" 
            style={{
              color: '#f97316',
              fontWeight: '700',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            View All Offers →
          </Link>
        </div>

        {/* 4 Featured Deals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          {dealProducts.map((product) => {
            const originalPrice = Math.round(Number(product.price) * 1.3);
            const discount = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);
            return (
              <Link 
                to={`/product/${product._id}`} 
                key={product._id}
                style={{
                  background: '#121215',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                className="deal-item-hover"
              >
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} 
                />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    color: '#f87171', 
                    fontSize: '0.68rem', 
                    fontWeight: '800', 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}>
                    {discount}% OFF
                  </span>
                  <div style={{ 
                    color: '#ffffff', 
                    fontWeight: '600', 
                    fontSize: '0.88rem', 
                    margin: '6px 0 4px 0', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ color: '#f97316', fontWeight: '800', fontSize: '1rem' }}>
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    <span style={{ color: '#71717a', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. CATEGORY SELECTOR PILLS */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.7rem', color: '#ffffff', fontWeight: '800' }}>
              Explore Our Collection
            </h2>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.92rem' }}>
              Filter by department or browse trending favorites
            </p>
          </div>
          <Link 
            to="/shop" 
            style={{
              color: '#f97316',
              fontWeight: '700',
              fontSize: '0.92rem',
              textDecoration: 'none'
            }}
          >
            Full Catalog ({products.length}) →
          </Link>
        </div>

        {/* Sleek Horizontal Category Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                id={`cat-pill-${tab.id}`}
                style={{
                  background: isSelected ? '#f97316' : '#18181b',
                  color: isSelected ? '#ffffff' : '#d4d4d8',
                  border: isSelected ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. PRODUCT GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
          Loading products...
        </div>
      ) : displayedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
          No products found in this category.
        </div>
      ) : (
        <div className="product-grid" id="home-product-grid">
          {displayedProducts.slice(0, 12).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* 6. TRUST & SERVICE HIGHLIGHTS (PREVIOUS SLEEK DARK LOOK) */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginTop: '60px',
          padding: '30px 24px',
          background: '#18181b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}
        id="trust-guarantees"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            background: 'rgba(249, 115, 22, 0.1)', 
            border: '1px solid rgba(249, 115, 22, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0 
          }}>
            🚚
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '0.98rem', fontWeight: '700' }}>Free Fast Delivery</h4>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.82rem' }}>On all orders with real-time tracking.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            background: 'rgba(249, 115, 22, 0.1)', 
            border: '1px solid rgba(249, 115, 22, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0 
          }}>
            🛡️
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '0.98rem', fontWeight: '700' }}>30-Day Easy Returns</h4>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.82rem' }}>Doorstep pickups & instant full refunds.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            background: 'rgba(249, 115, 22, 0.1)', 
            border: '1px solid rgba(249, 115, 22, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0 
          }}>
            🔒
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '0.98rem', fontWeight: '700' }}>100% Secure Checkout</h4>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.82rem' }}>PCI-DSS encrypted payment security.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            background: 'rgba(249, 115, 22, 0.1)', 
            border: '1px solid rgba(249, 115, 22, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0 
          }}>
            🎧
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '0.98rem', fontWeight: '700' }}>24/7 Dedicated Support</h4>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.82rem' }}>Priority customer care assistance anytime.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
