import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const newId = newItem._id || newItem.id || newItem.product;

      const existingItem = state.cartItems.find(
        (item) => String(item._id || item.id || item.product) === String(newId)
      );

      if (existingItem) {
        state.cartItems = state.cartItems.map((item) =>
          String(item._id || item.id || item.product) === String(newId)
            ? { ...item, qty: (Number(item.qty) || 1) + (Number(newItem.qty) || 1) }
            : item
        );
      } else {
        state.cartItems.push({
          ...newItem,
          _id: newId,
          qty: Number(newItem.qty) || 1,
        });
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      const targetId =
        typeof action.payload === 'object' && action.payload !== null
          ? action.payload._id || action.payload.id || action.payload.product
          : action.payload;

      state.cartItems = state.cartItems.filter((item) => {
        const currentId = item._id || item.id || item.product;
        return String(currentId) !== String(targetId);
      });

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;