import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_HEADPHONES_IMAGE =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

// Robust image resolver supporting remote URLs and guaranteed local vector assets
export const resolveCartItemImage = (item) => {
  if (!item || typeof item !== 'object') return '/placeholder.svg';

  const candidates = [
    item.imageUrl,
    item.image,
    item.img,
    item.thumbnail,
    typeof item.productId === 'object' && item.productId ? item.productId.imageUrl || item.productId.image : null
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 5 && !c.includes('undefined') && !c.includes('null') && !c.includes('/placeholder.png')) {
      return c.trim();
    }
  }

  const name = String(item.name || '').toLowerCase();
  if (name.includes('headphone') || name.includes('noise-cancelling') || name.includes('audio')) {
    return DEFAULT_HEADPHONES_IMAGE;
  }

  return '/placeholder.svg';
};

// Helper to normalize cart item schema with image and imageUrl always populated
export const normalizeCartItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  const id = item._id || item.id || item.productId || item.product;
  const resolvedImage = resolveCartItemImage(item);

  return {
    ...item,
    _id: id,
    productId: id,
    imageUrl: resolvedImage,
    image: resolvedImage,
    name: item.name || 'Wireless Noise-Cancelling Headphones',
    qty: Math.max(1, Number(item.qty) || 1),
    price: Number(item.price) || 299.99,
  };
};

const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem('cartItems');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalizedList = parsed.map(normalizeCartItem);
    // Write back normalized version so stale or broken objects in storage get immediately repaired
    try {
      localStorage.setItem('cartItems', JSON.stringify(normalizedList));
    } catch (_) {}
    return normalizedList;
  } catch (e) {
    console.error('Error loading cart from localStorage:', e);
    return [];
  }
};

const initialState = {
  cartItems: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const normalized = normalizeCartItem(action.payload);
      const targetId = String(normalized._id);

      const existingIndex = state.cartItems.findIndex(
        (item) => String(item._id || item.id || item.productId || item.product) === targetId
      );

      if (existingIndex >= 0) {
        const existing = state.cartItems[existingIndex];
        const newQty = (Number(existing.qty) || 1) + (Number(normalized.qty) || 1);
        state.cartItems[existingIndex] = {
          ...existing,
          ...normalized,
          qty: newQty,
          image: normalized.image || existing.image || DEFAULT_HEADPHONES_IMAGE,
          imageUrl: normalized.imageUrl || existing.imageUrl || DEFAULT_HEADPHONES_IMAGE,
        };
      } else {
        state.cartItems.push(normalized);
      }

      try {
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    },

    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      const targetId = String(id);
      const item = state.cartItems.find(
        (i) => String(i._id || i.id || i.productId || i.product) === targetId
      );
      if (item) {
        item.qty = Math.max(1, Number(qty) || 1);
        try {
          localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        } catch (_) {}
      }
    },

    removeFromCart: (state, action) => {
      const targetId =
        typeof action.payload === 'object' && action.payload !== null
          ? action.payload._id || action.payload.id || action.payload.productId || action.payload.product
          : action.payload;

      state.cartItems = state.cartItems.filter((item) => {
        const currentId = item._id || item.id || item.productId || item.product;
        return String(currentId) !== String(targetId);
      });

      try {
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      } catch (_) {}
    },

    clearCart: (state) => {
      state.cartItems = [];
      try {
        localStorage.removeItem('cartItems');
      } catch (_) {}
    },
  },
});

export const { addToCart, updateCartQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
