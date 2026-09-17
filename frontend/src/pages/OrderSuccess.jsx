import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '50px 30px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#10b981' }}>Payment Successful!</h2>
      <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '40px' }}>
        Thank you for your order. We have securely received your payment and will process your shipment shortly.
      </p>
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn" style={{ background: '#f97316' }}>View & Track Orders</Link>
        <Link to="/shop" className="btn" style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)' }}>Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
