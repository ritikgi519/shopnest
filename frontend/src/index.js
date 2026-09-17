// Safe guard against environments where window.fetch has only a getter
(function ensureWritableFetch() {
  if (typeof window !== 'undefined') {
    try {
      let currentFetch = window.fetch ? window.fetch.bind(window) : null;
      Object.defineProperty(window, 'fetch', {
        get: () => currentFetch,
        set: (fn) => { currentFetch = fn; },
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      try {
        let orig = window.fetch;
        Object.defineProperty(window, 'fetch', {
          value: orig,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (err) {}
    }
  }
})();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>
);
