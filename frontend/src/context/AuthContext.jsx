import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      localStorage.removeItem('userInfo');
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('userInfo', JSON.stringify(userData));
      if (userData && userData.token) {
        localStorage.setItem('token', userData.token);
      }
    } catch (e) {
      console.warn('Failed to save user session to localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    } catch (e) {
      console.warn('Failed to clear user session from localStorage', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
