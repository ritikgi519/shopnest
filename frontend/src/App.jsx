import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Disclaimer from './pages/Disclaimer';
import ReturnPolicy from './pages/ReturnPolicy';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import CompareDock from './components/CompareDock';
import AdminDashboard from './admin/AdminDashboard';
import AddProduct from './admin/AddProduct';
import AdminProducts from './admin/AdminProducts';
import EditProduct from './admin/EditProduct';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';

function App() {
  return (
    <Router>
      <WishlistProvider>
        <CompareProvider>
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/products" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/comparison" element={<Compare />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/my-wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/ordersuccess" element={<OrderSuccess />} />
              <Route path="/about" element={<About />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/return" element={<ReturnPolicy />} />
              <Route path="/returns" element={<ReturnPolicy />} />
              <Route path="/returns-and-refunds" element={<ReturnPolicy />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/add-product" element={<AddProduct />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/edit-product/:id" element={<EditProduct />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Routes>
          </div>
          <CompareDock />
          <Footer />
        </CompareProvider>
      </WishlistProvider>
    </Router>
  );
}

export default App;
