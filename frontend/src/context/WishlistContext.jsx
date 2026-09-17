import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!user || (!user.token && !user.accessToken)) {
      setWishlist([]);
      setWishlistIds([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = user.token || user.accessToken;
      const res = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const validWishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
        const validIds = Array.isArray(data.productIds)
          ? data.productIds
          : validWishlist.map((p) => (p ? p._id || p.id : '')).filter(Boolean);

        setWishlist(validWishlist);
        setWishlistIds(validIds);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to load wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Network error while loading wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setWishlistIds([]);
    }
  }, [user, fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const strId = String(productId);
      return wishlistIds.some((id) => String(id) === strId);
    },
    [wishlistIds]
  );

  const addToWishlist = async (product) => {
    if (!user) return { success: false, requireAuth: true };
    const productId = product._id || product.id || product;

    try {
      const token = user.token || user.accessToken;
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
        setWishlistIds(data.productIds || []);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Could not add to wishlist' };
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return { success: false, message: 'Network error adding to wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return { success: false, requireAuth: true };
    const strId = String(productId);

    // Optimistic local update
    setWishlist((prev) => prev.filter((p) => String(p._id || p.id) !== strId));
    setWishlistIds((prev) => prev.filter((id) => String(id) !== strId));

    try {
      const token = user.token || user.accessToken;
      const res = await fetch(`/api/wishlist/${strId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
        setWishlistIds(data.productIds || []);
        return { success: true, message: data.message };
      } else {
        // Rollback
        fetchWishlist();
        return { success: false, message: data.message || 'Could not remove from wishlist' };
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      fetchWishlist();
      return { success: false, message: 'Network error removing from wishlist' };
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) return { success: false, requireAuth: true };
    const productId = product._id || product.id || product;
    const strId = String(productId);
    const currentlyIn = isInWishlist(strId);

    // Optimistic update
    if (currentlyIn) {
      setWishlist((prev) => prev.filter((p) => String(p._id || p.id) !== strId));
      setWishlistIds((prev) => prev.filter((id) => String(id) !== strId));
    } else if (typeof product === 'object' && product !== null && product.name) {
      setWishlist((prev) => [product, ...prev]);
      setWishlistIds((prev) => [strId, ...prev]);
    }

    try {
      const token = user.token || user.accessToken;
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: strId })
      });

      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
        setWishlistIds(data.productIds || []);
        return {
          success: true,
          inWishlist: data.inWishlist,
          message: data.message
        };
      } else {
        // Rollback
        fetchWishlist();
        return { success: false, message: data.message || 'Error updating wishlist' };
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      fetchWishlist();
      return { success: false, message: 'Network error' };
    }
  };

  const clearWishlist = async () => {
    if (!user) return { success: false };
    setWishlist([]);
    setWishlistIds([]);

    try {
      const token = user.token || user.accessToken;
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      return { success: false };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        error,
        fetchWishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
