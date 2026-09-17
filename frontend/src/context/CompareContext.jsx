import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const CompareContext = createContext();

const STORAGE_KEY = 'shopnest_compare_list';
const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_COMPARE_ITEMS);
      }
    } catch (e) {
      console.warn('Could not parse saved compare list', e);
    }
    return [];
  });

  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (e) {
      console.warn('Could not save compare list to localStorage', e);
    }
  }, [compareList]);

  const showNotification = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const isInCompare = useCallback(
    (productId) => {
      if (!productId) return false;
      const strId = String(productId);
      return compareList.some((p) => String(p._id || p.id) === strId);
    },
    [compareList]
  );

  const addToCompare = useCallback(
    (product) => {
      if (!product) return { success: false, message: 'Invalid product' };
      const productId = String(product._id || product.id);

      if (compareList.some((p) => String(p._id || p.id) === productId)) {
        showNotification(`"${product.name}" is already in your comparison list.`);
        return { success: false, message: 'Already in comparison list' };
      }

      if (compareList.length >= MAX_COMPARE_ITEMS) {
        showNotification(`You can compare up to ${MAX_COMPARE_ITEMS} products at a time.`);
        return {
          success: false,
          message: `Maximum of ${MAX_COMPARE_ITEMS} products reached. Remove one first.`
        };
      }

      setCompareList((prev) => [...prev, product]);
      showNotification(`Added "${product.name}" to comparison.`);
      setIsDockMinimized(false);
      return { success: true, message: 'Added to comparison' };
    },
    [compareList, showNotification]
  );

  const removeFromCompare = useCallback(
    (productId) => {
      const strId = String(productId);
      setCompareList((prev) => prev.filter((p) => String(p._id || p.id) !== strId));
    },
    []
  );

  const toggleCompare = useCallback(
    (product) => {
      if (!product) return { success: false };
      const productId = String(product._id || product.id);
      if (isInCompare(productId)) {
        removeFromCompare(productId);
        showNotification(`Removed "${product.name}" from comparison.`);
        return { success: true, inCompare: false };
      } else {
        const res = addToCompare(product);
        return { success: res.success, inCompare: res.success };
      }
    },
    [isInCompare, removeFromCompare, addToCompare, showNotification]
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
    showNotification('Comparison list cleared.');
  }, [showNotification]);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        maxItems: MAX_COMPARE_ITEMS,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isDockMinimized,
        setIsDockMinimized,
        toastMessage
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
