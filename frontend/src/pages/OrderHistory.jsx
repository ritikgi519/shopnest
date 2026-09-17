import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Stepper from 'react-stepper-horizontal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderHistory = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [cancellingReturn, setCancellingReturn] = useState(false);

  const getAuthToken = () => {
    if (user && (user.token || user.accessToken)) return user.token || user.accessToken;
    try {
      const saved = localStorage.getItem('userInfo');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) return parsed.token;
      }
    } catch (e) {}
    return localStorage.getItem('token') || '';
  };

  const handleCancelReturn = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this return request?')) return;
    setCancellingReturn(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/orders/${orderId}/cancel-return`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        fetchOrders();
        fetchSingleOrder(orderId);
      } else {
        alert(data.message || 'Could not cancel return.');
      }
    } catch (err) {
      alert('Network error cancelling return.');
    } finally {
      setCancellingReturn(false);
    }
  };

  const getReturnStepperIndex = (returnStatus) => {
    const s = (returnStatus || 'Requested').toLowerCase();
    if (s === 'refunded') return 3;
    if (s === 'picked up' || s === 'inspected') return 2;
    if (s === 'approved') return 1;
    return 0; // Requested
  };

  const returnSteps = [
    { title: 'Return Logged' },
    { title: 'Pickup Scheduled' },
    { title: 'Quality Verified' },
    { title: 'Refund Settled' }
  ];

  // Fetch all orders for current user
  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token && !user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/myorders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const orderList = Array.isArray(data) ? data : [];
        setOrders(orderList);

        // Check if there is an orderId query param to automatically view
        const orderIdParam = searchParams.get('orderId');
        if (orderIdParam) {
          const match = orderList.find(o => String(o._id) === String(orderIdParam));
          if (match) {
            setSelectedOrder(match);
          } else {
            fetchSingleOrder(orderIdParam);
          }
        }
      } else {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        setError(data.message || 'Failed to fetch order history.');
      }
    } catch (err) {
      setError('Unable to load orders at this moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleOrder = async (orderId) => {
    setDetailLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!user && !token) {
      // Allow render to show guest prompt
      return;
    }
    fetchOrders();
  }, [user]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setSearchParams({ orderId: order._id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setSearchParams({});
  };

  // Convert status to 0-indexed step for Stepper (0: Processing / Placed, 1: Shipped, 2: Delivered)
  const getStepperActiveIndex = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'delivered') return 2;
    if (s === 'shipped') return 1;
    return 0; // Pending / Processing / Placed
  };

  const getStatusColor = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'delivered') return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    if (s === 'shipped') return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
    return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
  };

  // Client-side PDF Invoice Generator using jsPDF & autoTable
  const handleDownloadInvoice = (order) => {
    if (!order) return;
    setGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const orderId = String(order._id || 'INV-000');
      const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const customerName = order.address?.fullName || user?.name || 'Customer';
      const street = order.address?.street || 'Standard Delivery';
      const cityDetails = [order.address?.city, order.address?.postalCode, order.address?.country].filter(Boolean).join(', ') || 'Online Order';

      // --- Header Brand Banner ---
      doc.setFillColor(24, 24, 27); // #18181b Dark Slate
      doc.rect(0, 0, 595.28, 90, 'F');

      doc.setTextColor(249, 115, 22); // ShopNest Accent Orange
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('ShopNest', 40, 48);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(161, 161, 170);
      doc.text('Premium E-Commerce Platform | shopnest.com', 40, 68);

      // Invoice Title & Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('TAX INVOICE', 555, 45, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(16, 185, 129); // Green paid badge
      doc.text(`STATUS: ${(order.status || 'PAID').toUpperCase()}`, 555, 65, { align: 'right' });

      // --- Meta Data Grid (Billed To & Order Details) ---
      let y = 120;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO:', 40, y);
      doc.text('ORDER DETAILS:', 340, y);

      y += 16;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(customerName, 40, y);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Order ID: #${orderId.slice(-8).toUpperCase()}`, 340, y);

      y += 14;
      doc.setTextColor(71, 85, 105);
      doc.text(user?.email || 'N/A', 40, y);
      doc.text(`Invoice Date: ${formattedDate}`, 340, y);

      y += 14;
      doc.text(street, 40, y);
      doc.text(`Full Ref: ${orderId}`, 340, y);

      y += 14;
      doc.text(cityDetails, 40, y);
      if (order.paymentId) {
        doc.text(`Payment Ref: ${order.paymentId}`, 340, y);
      }

      // --- Itemized Items Table ---
      y += 24;
      const tableRows = (order.items || []).map((item, idx) => {
        const title = item.name || item.title || item.productId?.name || 'ShopNest Item';
        const qty = item.qty || item.quantity || 1;
        const price = Number(item.price || 0);
        const lineTotal = price * qty;
        return [
          String(idx + 1),
          title,
          String(qty),
          `INR ${price.toFixed(2)}`,
          `INR ${lineTotal.toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [39, 39, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 260 },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 90, halign: 'right' },
          4: { cellWidth: 90, halign: 'right' }
        },
        styles: {
          fontSize: 9,
          textColor: [30, 41, 59],
          cellPadding: 8,
          lineColor: [226, 232, 240],
          lineWidth: 0.75
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 40, right: 40 }
      });

      const finalY = doc.lastAutoTable.finalY + 20;

      // --- Summary / Totals Box ---
      const totalAmount = Number(order.totalAmount || 0);
      const totalsX = 350;
      let totalsY = finalY;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);

      doc.text('Subtotal:', totalsX, totalsY);
      doc.text(`INR ${totalAmount.toFixed(2)}`, 555, totalsY, { align: 'right' });

      totalsY += 16;
      doc.text('Shipping & Handling:', totalsX, totalsY);
      doc.setTextColor(16, 185, 129);
      doc.text('FREE', 555, totalsY, { align: 'right' });

      totalsY += 16;
      doc.setTextColor(100, 116, 139);
      doc.text('Estimated GST / Taxes:', totalsX, totalsY);
      doc.text('Included (0.00)', 555, totalsY, { align: 'right' });

      totalsY += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(totalsX, totalsY, 555, totalsY);

      totalsY += 18;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Total Settled:', totalsX, totalsY);
      doc.setTextColor(249, 115, 22);
      doc.text(`INR ${totalAmount.toFixed(2)}`, 555, totalsY, { align: 'right' });

      // --- Footer Notice ---
      const footerY = 780;
      doc.setDrawColor(240, 240, 240);
      doc.line(40, footerY - 15, 555, footerY - 15);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing ShopNest. For customer support or return inquiries, contact support@shopnest.com', 297.5, footerY, { align: 'center' });
      doc.text('This document is an electronically generated receipt verified by the ShopNest payment gateway.', 297.5, footerY + 12, { align: 'center' });

      // Trigger instant client-side download
      doc.save(`ShopNest-Invoice-${orderId.slice(-8).toUpperCase()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF invoice. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Returns') {
      return order.returnStatus && order.returnStatus !== 'None' && order.returnStatus !== 'Cancelled';
    }
    return (order.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
  });

  const stepperSteps = [
    { title: 'Order Placed' },
    { title: 'Shipped' },
    { title: 'Delivered' }
  ];

  const currentToken = getAuthToken();
  if (!user && !currentToken) {
    return (
      <div id="order-login-prompt" style={{ maxWidth: '600px', margin: '80px auto', padding: '50px 30px', textAlign: 'center', background: '#18181b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '12px' }}>Track Your Orders</h2>
        <p style={{ color: '#a1a1aa', fontSize: '1rem', marginBottom: '28px', lineHeight: 1.6 }}>
          Please log in to your ShopNest account to view your past purchases, shipment progress, and tax invoices.
        </p>
        <button
          id="go-to-login-btn"
          onClick={() => navigate('/login')}
          style={{
            background: '#f97316',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Sign In to ShopNest
        </button>
      </div>
    );
  }

  return (
    <div id="order-history-view" style={{ maxWidth: '1120px', margin: '40px auto', padding: '0 20px', color: '#f4f4f5' }}>
      
      {/* 1. ORDER DETAILS VIEW (when an order is clicked) */}
      {selectedOrder ? (
        <div id="order-details-card" style={{
          background: '#18181b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Top Bar with Back Navigation & PDF Download Button */}
          <div style={{
            padding: '20px 28px',
            background: '#1f1f23',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                id="back-to-orders-btn"
                onClick={handleCloseDetails}
                style={{
                  padding: '8px 16px',
                  background: '#27272a',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← All Orders
              </button>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: '0.05em' }}>
                  Order Details
                </span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', color: '#ffffff', fontFamily: 'monospace' }}>
                  #{selectedOrder._id}
                </h2>
              </div>
            </div>

            {/* Action Buttons: Status Badge & PDF Invoice Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {(() => {
                const color = getStatusColor(selectedOrder.status);
                return (
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    background: color.bg,
                    color: color.text,
                    border: `1px solid ${color.border}`
                  }}>
                    ● {selectedOrder.status || 'Pending'}
                  </span>
                );
              })()}

              <button
                id="download-invoice-btn"
                onClick={() => handleDownloadInvoice(selectedOrder)}
                disabled={generatingPdf}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: generatingPdf ? '#9a3412' : '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: generatingPdf ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{generatingPdf ? '⏳' : '📄'}</span>
                {generatingPdf ? 'Generating PDF...' : 'Download Invoice (PDF)'}
              </button>
            </div>
          </div>

          {/* Detailed Progress Stepper using react-stepper-horizontal */}
          <div style={{ padding: '32px 28px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#121214' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🚚</span> Order Status Tracking
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                Placed: <strong style={{ color: '#ffffff' }}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</strong>
              </span>
            </div>

            <div id="order-details-stepper" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <Stepper
                steps={stepperSteps}
                activeStep={getStepperActiveIndex(selectedOrder.status)}
                activeColor="#f97316"
                completeColor="#10b981"
                defaultColor="#27272a"
                activeTitleColor="#f97316"
                completeTitleColor="#10b981"
                defaultTitleColor="#71717a"
                circleFontColor="#ffffff"
                completeBarColor="#10b981"
                defaultBarColor="#27272a"
                circleFontSize={14}
                titleFontSize={13}
                size={34}
                lineMarginOffset={4}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>
                {getStepperActiveIndex(selectedOrder.status) === 2
                  ? 'Your package has been successfully delivered.'
                  : getStepperActiveIndex(selectedOrder.status) === 1
                  ? 'Your shipment is on the way to the delivery address.'
                  : 'Your order has been placed and is currently being processed.'}
              </p>
            </div>
          </div>

          {/* Breakdown Section: Items and Price Summary */}
          <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* Left: Purchased Items Breakdown */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f97316', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛒</span> Purchased Items ({(selectedOrder.items || []).length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(selectedOrder.items || []).map((item, index) => {
                  const title = item.name || item.title || item.productId?.name || 'ShopNest Product';
                  const imgUrl = item.image || item.imageUrl || item.productId?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                  const qty = item.qty || item.quantity || 1;
                  const price = item.price || 0;
                  const lineTotal = price * qty;
                  const pId = item.productId?._id || item.productId || item._id;

                  return (
                    <div
                      key={index}
                      id={`order-detail-item-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: '#121214',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img
                          src={imgUrl}
                          alt={title}
                          style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'; }}
                        />
                        <div>
                          <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#ffffff', fontSize: '1rem' }}>
                            {title}
                          </p>
                          <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
                            Quantity: <strong>{qty}</strong> × ₹{Number(price).toFixed(2)}
                          </span>
                          {pId && typeof pId === 'string' && !pId.startsWith('bypass') && (
                            <Link to={`/product/${pId}`} style={{ display: 'block', fontSize: '0.8rem', color: '#60a5fa', marginTop: '4px', textDecoration: 'none' }}>
                              View Product Page →
                            </Link>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', fontWeight: '700', fontSize: '1.05rem', color: '#10b981' }}>
                          ₹{lineTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Price Breakdown & Shipping Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Shipping Address Card */}
              <div id="order-shipping-breakdown" style={{
                background: '#121214',
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📍</span> Shipping Address
                </h4>
                <div style={{ color: '#d4d4d8', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#ffffff' }}>
                    {selectedOrder.address?.fullName || user.name}
                  </p>
                  <p style={{ margin: '0 0 4px 0' }}>
                    {selectedOrder.address?.street || 'Standard Home Delivery'}
                  </p>
                  <p style={{ margin: '0' }}>
                    {[
                      selectedOrder.address?.city,
                      selectedOrder.address?.postalCode,
                      selectedOrder.address?.country
                    ].filter(Boolean).join(', ') || 'Standard Destination'}
                  </p>
                </div>
              </div>

              {/* Total Price & Payment Breakdown Card */}
              <div id="order-price-breakdown" style={{
                background: '#121214',
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💳</span> Payment & Cost Breakdown
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '12px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Items Subtotal</span>
                    <span style={{ color: '#ffffff' }}>₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Shipping Charges</span>
                    <span style={{ color: '#10b981' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Estimated Tax (GST)</span>
                    <span style={{ color: '#ffffff' }}>Included</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#ffffff' }}>Total Paid:</span>
                  <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#10b981' }}>
                    ₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.85rem',
                  color: '#a7f3d0',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '600' }}>Payment Status: Verified & Settled</p>
                  {selectedOrder.paymentId && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6ee7b7' }}>Transaction Ref: {selectedOrder.paymentId}</p>
                  )}
                </div>

                {/* Secondary invoice download button inside breakdown */}
                <button
                  id="download-invoice-breakdown-btn"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  disabled={generatingPdf}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#27272a',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: generatingPdf ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📄</span> Download Formal Invoice PDF
                </button>
              </div>

            </div>
          </div>

          {/* RETURN & REFUND STATUS / INITIATION CARD */}
          <div style={{
            margin: '0 28px 28px 28px',
            padding: '22px 26px',
            borderRadius: '12px',
            background: selectedOrder.returnStatus && selectedOrder.returnStatus !== 'None' && selectedOrder.returnStatus !== 'Cancelled'
              ? 'rgba(37, 99, 235, 0.08)'
              : '#121214',
            border: selectedOrder.returnStatus && selectedOrder.returnStatus !== 'None' && selectedOrder.returnStatus !== 'Cancelled'
              ? '1px solid rgba(59, 130, 246, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {selectedOrder.returnStatus && selectedOrder.returnStatus !== 'None' && selectedOrder.returnStatus !== 'Cancelled' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🔄</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>
                        Return Request Active ({selectedOrder.rmaCode || 'RMA Pending'})
                      </h4>
                      <span style={{ color: '#60a5fa', fontSize: '0.85rem' }}>
                        Status: <strong>{selectedOrder.returnStatus}</strong> • Preference: {selectedOrder.refundMethod || 'Original Payment'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                      to={`/return?orderId=${selectedOrder._id}&tab=track`}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      View Full Return Hub →
                    </Link>
                    {selectedOrder.returnStatus === 'Requested' && (
                      <button
                        id="cancel-return-request-btn"
                        onClick={() => handleCancelReturn(selectedOrder._id)}
                        disabled={cancellingReturn}
                        style={{
                          background: '#27272a',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: cancellingReturn ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {cancellingReturn ? 'Cancelling...' : 'Cancel Return'}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ maxWidth: '640px', margin: '14px auto 0 auto' }}>
                  <Stepper
                    steps={returnSteps}
                    activeStep={getReturnStepperIndex(selectedOrder.returnStatus)}
                    activeColor="#f97316"
                    completeColor="#10b981"
                    defaultColor="#27272a"
                    activeTitleColor="#f97316"
                    completeTitleColor="#10b981"
                    defaultTitleColor="#71717a"
                    circleFontColor="#ffffff"
                    completeBarColor="#10b981"
                    defaultBarColor="#27272a"
                    circleFontSize={12}
                    titleFontSize={11}
                    size={28}
                  />
                </div>
              </div>
            ) : (selectedOrder.status || '').toLowerCase() === 'delivered' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>
                      Eligible for 30-Day Money-Back Return
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>
                    Complimentary doorstep pickup with 100% refund or +5% bonus store credit.
                  </p>
                </div>

                <Link
                  id="start-return-from-order-btn"
                  to={`/return?orderId=${selectedOrder._id}&tab=request`}
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🔄</span> Request Return / Refund
                </Link>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>ℹ️</span> Standard 30-day return window activates immediately upon delivery.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* 2. ORDER LIST HEADER */}
      <div style={{
        background: '#18181b',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>📦</span>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>My Orders</h1>
          </div>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.95rem' }}>
            Track live progress with the status stepper, or inspect item breakdowns, delivery details, and download PDF invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            id="refresh-orders-btn"
            onClick={fetchOrders}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#27272a',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔄</span> Refresh
          </button>
          <Link
            to="/return"
            id="order-history-returns-hub-link"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#d4d4d8',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔄</span> Returns & Refunds Hub
          </Link>
          <Link
            to="/shop"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#f97316',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Shop More
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Shipped', 'Delivered', 'Returns'].map(status => {
          const count = status === 'All' 
            ? orders.length 
            : status === 'Returns'
            ? orders.filter(o => o.returnStatus && o.returnStatus !== 'None' && o.returnStatus !== 'Cancelled').length
            : orders.filter(o => (o.status || 'Pending').toLowerCase() === status.toLowerCase()).length;

          return (
            <button
              key={status}
              id={`filter-${status.toLowerCase()}`}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: statusFilter === status ? '1px solid #f97316' : '1px solid #27272a',
                background: statusFilter === status ? '#f97316' : '#18181b',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: statusFilter === status ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Order List Display */}
      {loading ? (
        <div style={{
          background: '#18181b',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: 0 }}>Loading your order history from database...</p>
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#f87171'
        }}>
          <p style={{ margin: '0 0 14px 0' }}>{error}</p>
          <button onClick={fetchOrders} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          background: '#18181b',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍️</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.4rem', marginBottom: '8px' }}>
            {statusFilter === 'All' ? 'No purchases on record yet' : `No ${statusFilter.toLowerCase()} orders found`}
          </h3>
          <p style={{ color: '#a1a1aa', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            Explore our collection and make your first purchase!
          </p>
          <Link
            to="/shop"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#f97316',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(order => {
            const statusConfig = getStatusColor(order.status);
            const isCurrentSelected = selectedOrder && String(selectedOrder._id) === String(order._id);
            const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const itemCount = (order.items || []).reduce((acc, itm) => acc + (itm.qty || itm.quantity || 1), 0);
            const stepIndex = getStepperActiveIndex(order.status);

            return (
              <div
                key={order._id}
                id={`order-row-${order._id}`}
                onClick={() => handleSelectOrder(order)}
                style={{
                  background: isCurrentSelected ? '#27272a' : '#18181b',
                  border: isCurrentSelected ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrentSelected ? '0 0 15px rgba(249, 115, 22, 0.15)' : 'none'
                }}
              >
                {/* Order Row Header */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#121214',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      📦
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a' }}>
                        Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#ffffff', fontSize: '1rem' }}>
                        Placed on {orderDate}
                      </p>
                      <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} • Ships to: {order.address?.city || 'India'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a' }}>Total Amount</span>
                      <p style={{ margin: '2px 0 0 0', color: '#10b981', fontWeight: '700', fontSize: '1.15rem' }}>
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </p>
                    </div>

                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      background: statusConfig.bg,
                      color: statusConfig.text,
                      border: `1px solid ${statusConfig.border}`
                    }}>
                      ● {order.status || 'Pending'}
                    </span>

                    {/* Return Status Badge if Active */}
                    {order.returnStatus && order.returnStatus !== 'None' && order.returnStatus !== 'Cancelled' && (
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        🔄 Return: {order.returnStatus}
                      </span>
                    )}

                    {/* Direct Return Button for Delivered Orders without return */}
                    {(!order.returnStatus || order.returnStatus === 'None' || order.returnStatus === 'Cancelled') && (order.status || '').toLowerCase() === 'delivered' && (
                      <Link
                        to={`/return?orderId=${order._id}&tab=request`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'rgba(249, 115, 22, 0.12)',
                          color: '#f97316',
                          border: '1px solid rgba(249, 115, 22, 0.3)',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>🔄</span> Return
                      </Link>
                    )}

                    <button
                      id={`invoice-btn-${order._id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadInvoice(order);
                      }}
                      title="Download PDF Invoice"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#27272a',
                        color: '#d4d4d8',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📄</span> Invoice
                    </button>

                    <button
                      id={`view-order-${order._id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOrder(order);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: isCurrentSelected ? '#f97316' : '#27272a',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                    >
                      {isCurrentSelected ? 'Viewing Details' : 'View Details →'}
                    </button>
                  </div>
                </div>

                {/* Visual Progress Stepper for every order row using react-stepper-horizontal */}
                <div style={{
                  background: '#121214',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}>
                  <Stepper
                    steps={stepperSteps}
                    activeStep={stepIndex}
                    activeColor="#f97316"
                    completeColor="#10b981"
                    defaultColor="#27272a"
                    activeTitleColor="#f97316"
                    completeTitleColor="#10b981"
                    defaultTitleColor="#71717a"
                    circleFontColor="#ffffff"
                    completeBarColor="#10b981"
                    defaultBarColor="#27272a"
                    circleFontSize={12}
                    titleFontSize={12}
                    size={28}
                    lineMarginOffset={2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
