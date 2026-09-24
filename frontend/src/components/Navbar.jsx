import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useSelector } from 'react-redux';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccountMenu(false);
    navigate('/login');
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);

  return (
    <nav className="navbar" id="main-site-navbar">
      {/* BRAND LOGO */}
      <div className="navbar-brand">
        <Link to="/" id="navbar-brand-link">
          <img 
            src="/ShopNestLogo.png" 
            alt="ShopNest" 
            style={{ 
              height: '36px', 
              width: '36px', 
              borderRadius: '8px', 
              objectFit: 'cover', 
              filter: 'drop-shadow(0 2px 8px rgba(249, 115, 22, 0.4))' 
            }} 
          />
          <span>
            ShopNest<span className="navbar-brand-dot">.</span>
          </span>
        </Link>
      </div>

      {/* SEARCH BAR (INTEGRATED SLEEK DARK PILL) */}
      <div className="nav-search-wrapper">
        <form onSubmit={handleSearchSubmit} className="nav-search-box" id="nav-search-form">
          <span style={{ color: '#71717a', fontSize: '0.9rem', marginRight: '4px' }}>🔍</span>
          <input
            id="nav-search-input"
            type="text"
            placeholder="Search products, brands and departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" id="nav-search-btn" title="Search catalog">
            →
          </button>
        </form>
      </div>

      {/* NAVIGATION LINKS & UTILITIES */}
      <ul className="navbar-links">
        <li>
          <Link to="/shop" id="nav-link-shop">
            Shop
          </Link>
        </li>

        <li>
          <Link to="/catalog" id="nav-link-catalog" title="Product Catalog">
            Catalog
          </Link>
        </li>

        <li>
          <Link to="/return" id="nav-link-returns" title="Returns & Refunds Hub">
            <span>Returns</span>
          </Link>
        </li>

        <li>
          <Link to="/compare" id="nav-compare-link" title="Comparison Studio">
            <span>⚖️ Compare</span>
            {compareCount > 0 && (
              <span 
                className="nav-link-badge"
                style={{
                  background: 'rgba(37, 99, 235, 0.25)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)'
                }}
              >
                {compareCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link to="/wishlist" id="nav-wishlist-link" title="Your Saved Wishlist">
            <span style={{ color: wishlistCount > 0 ? '#f43f5e' : '#a1a1aa' }}>♥</span>
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span 
                className="nav-link-badge"
                style={{
                  background: 'rgba(244, 63, 94, 0.2)',
                  color: '#f43f5e',
                  border: '1px solid rgba(244, 63, 94, 0.4)'
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>

        {/* CART PILL */}
        <li>
          <Link to="/cart" id="nav-cart-link" className="nav-cart-pill" title="Shopping Cart">
            <span>🛒</span>
            <span>Cart</span>
            <span className="nav-cart-badge" id="nav-cart-count-badge">
              {totalCartQty}
            </span>
          </Link>
        </li>

        {/* USER ACCOUNT DROPDOWN / SIGN IN */}
        <li>
          {user ? (
            <div 
              className="nav-account-container"
              onMouseEnter={() => setShowAccountMenu(true)}
              onMouseLeave={() => setShowAccountMenu(false)}
            >
              <button 
                className="nav-account-btn"
                id="nav-account-dropdown-btn"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <span>Hi, {user.name ? user.name.split(' ')[0] : 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>▾</span>
              </button>

              {showAccountMenu && (
                <div className="nav-account-menu" id="nav-account-menu">
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>
                  <Link to="/profile" className="nav-account-item" onClick={() => setShowAccountMenu(false)}>
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/orders" className="nav-account-item" onClick={() => setShowAccountMenu(false)}>
                    <span>📦</span> My Orders & Tracking
                  </Link>
                  <Link to="/return" className="nav-account-item" onClick={() => setShowAccountMenu(false)}>
                    <span>🔄</span> Returns & Refunds Hub
                  </Link>
                  <Link to="/wishlist" className="nav-account-item" onClick={() => setShowAccountMenu(false)}>
                    <span>♥</span> Saved Items ({wishlistCount})
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="nav-account-item" style={{ color: '#f97316', fontWeight: '700' }} onClick={() => setShowAccountMenu(false)}>
                      <span>⚙️</span> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn-logout" id="nav-logout-btn">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-btn-login" id="nav-login-link">
              Sign In
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
