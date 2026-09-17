import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Stepper from 'react-stepper-horizontal';

const ReturnPolicy = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: 'policy' | 'request' | 'track' | 'my-returns'
  const initialTab = searchParams.get('tab') || (searchParams.get('orderId') ? 'request' : 'policy');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Return Request Form State
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('Damaged or defective item');
  const [returnComments, setReturnComments] = useState('');
  const [refundMethod, setRefundMethod] = useState('Original Payment Method');
  const [pickupSlot, setPickupSlot] = useState('Tomorrow (10:00 AM - 2:00 PM)');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [returnError, setReturnError] = useState(null);

  // Manual Order Lookup State
  const [lookupOrderId, setLookupOrderId] = useState(searchParams.get('orderId') || '');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Tracking State
  const [trackingQuery, setTrackingQuery] = useState(searchParams.get('orderId') || '');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  // My Returns State
  const [myReturns, setMyReturns] = useState([]);
  const [myReturnsLoading, setMyReturnsLoading] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabName);
    setSearchParams(newParams);
    setReturnError(null);
  };

  // Fetch delivered user orders eligible for return
  const fetchDeliveredOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders/myorders', {
        headers: {
          Authorization: `Bearer ${user.token || user.accessToken}`
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUserOrders(data);
        // If orderId in search params, pre-select it
        const paramId = searchParams.get('orderId');
        if (paramId) {
          const match = data.find(o => String(o._id) === String(paramId));
          if (match) {
            handleSelectOrderForReturn(match);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch active returns for user
  const fetchMyReturns = async () => {
    if (!user) return;
    setMyReturnsLoading(true);
    try {
      const res = await fetch('/api/orders/my-returns', {
        headers: {
          Authorization: `Bearer ${user.token || user.accessToken}`
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMyReturns(data);
      }
    } catch (err) {
      console.error('Failed to fetch returns:', err);
    } finally {
      setMyReturnsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeliveredOrders();
      fetchMyReturns();
    }
  }, [user]);

  // When order is selected for return
  const handleSelectOrderForReturn = (order) => {
    setSelectedOrder(order);
    setReturnError(null);
    setSubmissionSuccess(null);
    // Default select all items
    if (order.items && order.items.length > 0) {
      setSelectedItems(order.items.map(i => i.productId?._id || i.productId || i._id));
    }
  };

  // Manual lookup
  const handleManualLookup = async (e) => {
    e.preventDefault();
    if (!lookupOrderId.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await fetch('/api/orders/lookup-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: lookupOrderId.trim() })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        handleSelectOrderForReturn(data.order);
        if (!data.isEligible) {
          setLookupError(
            `Order #${data.order._id.slice(-8)} status is '${data.order.status}'. Only delivered orders within 30 days are eligible for standard returns.`
          );
        }
      } else {
        setLookupError(data.message || 'No matching order found. Please verify the Order ID.');
      }
    } catch (err) {
      setLookupError('Network error looking up order. Please check the ID and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Submit return request
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedOrder) {
      setReturnError('Please select an order to return.');
      return;
    }
    if (selectedItems.length === 0) {
      setReturnError('Please select at least one item from the order to return.');
      return;
    }

    setSubmittingReturn(true);
    setReturnError(null);

    const itemsToReturn = (selectedOrder.items || []).filter(item => {
      const pId = item.productId?._id || item.productId || item._id;
      return selectedItems.includes(pId);
    });

    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token || user.accessToken}`
        },
        body: JSON.stringify({
          reason: returnReason,
          comments: returnComments,
          refundMethod,
          pickupSlot,
          items: itemsToReturn
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissionSuccess({
          rmaCode: data.rmaCode || ('RMA-' + Math.floor(100000 + Math.random() * 900000)),
          orderId: selectedOrder._id,
          refundMethod,
          pickupSlot,
          itemsCount: itemsToReturn.length
        });
        fetchMyReturns();
        fetchDeliveredOrders();
      } else {
        setReturnError(data.message || 'Failed to submit return request.');
      }
    } catch (err) {
      setReturnError('Failed to connect to server. Please try again.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Track return by Order ID or RMA
  const handleTrackReturn = async (e) => {
    if (e) e.preventDefault();
    const query = trackingQuery.trim();
    if (!query) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedOrder(null);

    try {
      // Lookup order
      const res = await fetch('/api/orders/lookup-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: query })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        if (!data.order.returnStatus || data.order.returnStatus === 'None') {
          setTrackingError('This order does not currently have an active return request.');
        } else {
          setTrackedOrder(data.order);
        }
      } else {
        // Search in user's returns
        const match = myReturns.find(
          r => String(r._id) === query || (r.rmaCode && r.rmaCode.toUpperCase() === query.toUpperCase())
        );
        if (match) {
          setTrackedOrder(match);
        } else {
          setTrackingError('No return record found for that reference ID or RMA code.');
        }
      }
    } catch (err) {
      setTrackingError('Unable to check return tracking right now.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Stepper helper for return progress
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

  return (
    <div id="return-policy-hub" style={{ maxWidth: '1060px', margin: '36px auto', padding: '0 20px', color: '#f4f4f5' }}>
      
      {/* 1. HERO HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '36px 40px',
        marginBottom: '32px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.2rem' }}>🔄</span>
              <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: '800', color: '#ffffff' }}>
                Returns & Refund Center
              </h1>
            </div>
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.05rem', maxWidth: '640px', lineHeight: '1.6' }}>
              Shop with absolute peace of mind. We offer a 30-day money-back guarantee with complimentary doorstep pickup and hassle-free refund options.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="quick-start-return-hero-btn"
              onClick={() => switchTab('request')}
              style={{
                background: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '0.98rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📦</span> Start a Return Request
            </button>
            <button
              id="quick-track-return-hero-btn"
              onClick={() => switchTab('track')}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔍 Track Existing Return
            </button>
          </div>
        </div>

        {/* 4 Feature Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#f97316' }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>30-Day Guarantee</div>
              <div style={{ color: '#71717a', fontSize: '0.8rem' }}>On all delivered orders</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#10b981' }}>
              🚚
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>Free Doorstep Pickup</div>
              <div style={{ color: '#71717a', fontSize: '0.8rem' }}>No return shipping fees</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#60a5fa' }}>
              ⚡
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>Fast Refunds</div>
              <div style={{ color: '#71717a', fontSize: '0.8rem' }}>To original payment or wallet</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#c084fc' }}>
              🎁
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>+5% Store Credit Bonus</div>
              <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Extra refund value in wallet</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE TABS */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '14px',
        marginBottom: '28px',
        flexWrap: 'wrap'
      }}>
        <button
          id="tab-request-return-btn"
          onClick={() => switchTab('request')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: activeTab === 'request' ? '1px solid #f97316' : '1px solid transparent',
            background: activeTab === 'request' ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'request' ? '700' : '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
        >
          <span>📦</span>
          <span>Start a Return</span>
        </button>

        <button
          id="tab-track-return-btn"
          onClick={() => switchTab('track')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: activeTab === 'track' ? '1px solid #f97316' : '1px solid transparent',
            background: activeTab === 'track' ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'track' ? '700' : '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
        >
          <span>🔍</span>
          <span>Track Return Status</span>
        </button>

        {user && (
          <button
            id="tab-my-returns-btn"
            onClick={() => switchTab('my-returns')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: activeTab === 'my-returns' ? '1px solid #f97316' : '1px solid transparent',
              background: activeTab === 'my-returns' ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontWeight: activeTab === 'my-returns' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            <span>📋</span>
            <span>My Active Returns ({myReturns.length})</span>
          </button>
        )}

        <button
          id="tab-policy-guidelines-btn"
          onClick={() => switchTab('policy')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: activeTab === 'policy' ? '1px solid #f97316' : '1px solid transparent',
            background: activeTab === 'policy' ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'policy' ? '700' : '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
        >
          <span>📜</span>
          <span>Policy & FAQs</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: START A RETURN WIZARD */}
      {/* ========================================================================= */}
      {activeTab === 'request' && (
        <div id="request-return-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {submissionSuccess ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div style={{
              background: '#18181b',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                ✓
              </div>
              <h2 style={{ color: '#ffffff', fontSize: '1.6rem', margin: '0 0 8px 0' }}>
                Return Request Successfully Logged!
              </h2>
              <p style={{ color: '#a1a1aa', maxWidth: '540px', margin: '0 auto 24px auto', fontSize: '1rem' }}>
                Your return authorization code (RMA) has been generated. Our courier partner will pick up your package during your chosen time slot.
              </p>

              <div style={{
                background: '#121214',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px 24px',
                maxWidth: '480px',
                margin: '0 auto 28px auto',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#71717a', fontSize: '0.9rem' }}>RMA Authorization #:</span>
                  <strong style={{ color: '#f97316', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                    {submissionSuccess.rmaCode}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Order Reference:</span>
                  <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    #{submissionSuccess.orderId.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Refund Preference:</span>
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>
                    {submissionSuccess.refundMethod}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Pickup Window:</span>
                  <span style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                    {submissionSuccess.pickupSlot}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  id="view-tracked-return-btn"
                  onClick={() => {
                    setTrackingQuery(submissionSuccess.orderId);
                    switchTab('track');
                    handleTrackReturn();
                  }}
                  style={{
                    background: '#f97316',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🚚 Track Return Status
                </button>
                <button
                  id="start-another-return-btn"
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setSelectedOrder(null);
                  }}
                  style={{
                    background: '#27272a',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  Return Another Item
                </button>
                <Link
                  to="/orders"
                  style={{
                    background: 'transparent',
                    color: '#a1a1aa',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  View Order History →
                </Link>
              </div>
            </div>
          ) : (
            /* RETURN FORM STEPS */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* LEFT COLUMN: Order Selection */}
              <div style={{
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#f97316', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
                  Select Order to Return
                </h3>

                {user ? (
                  <div>
                    {ordersLoading ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#a1a1aa' }}>
                        Loading your orders...
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div style={{ padding: '20px', background: '#121214', borderRadius: '10px', textAlign: 'center', color: '#a1a1aa' }}>
                        <p style={{ margin: '0 0 10px 0' }}>No orders found in your account.</p>
                        <Link to="/shop" style={{ color: '#f97316', fontWeight: '600' }}>Browse Catalog</Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                        {userOrders.map((order) => {
                          const isSelected = selectedOrder && String(selectedOrder._id) === String(order._id);
                          const isDelivered = (order.status || '').toLowerCase() === 'delivered';
                          const hasReturn = order.returnStatus && order.returnStatus !== 'None' && order.returnStatus !== 'Cancelled';

                          return (
                            <div
                              key={order._id}
                              id={`select-return-order-${order._id}`}
                              onClick={() => {
                                if (hasReturn) return;
                                handleSelectOrderForReturn(order);
                              }}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: isSelected ? 'rgba(249, 115, 22, 0.12)' : '#121214',
                                border: isSelected ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.06)',
                                cursor: hasReturn ? 'not-allowed' : 'pointer',
                                opacity: hasReturn ? 0.6 : 1,
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#ffffff', fontSize: '0.9rem' }}>
                                  #{order._id.slice(-8).toUpperCase()}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: '600',
                                  background: isDelivered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: isDelivered ? '#10b981' : '#fbbf24'
                                }}>
                                  {order.status}
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a1a1aa' }}>
                                <span>{(order.items || []).length} items • ₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>

                              {hasReturn && (
                                <div style={{ color: '#60a5fa', fontSize: '0.78rem', marginTop: '6px', fontWeight: '600' }}>
                                  ⚠️ Return already in progress ({order.returnStatus})
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Guest lookup prompt */
                  <div style={{ padding: '16px', background: '#121214', borderRadius: '10px', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#d4d4d8' }}>
                      Sign in to view your orders automatically, or lookup by Order ID below:
                    </p>
                    <Link
                      to="/login"
                      style={{
                        display: 'inline-block',
                        background: '#27272a',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      Sign In to Account →
                    </Link>
                  </div>
                )}

                {/* Manual Order ID Lookup Form */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px' }}>
                    Or enter Order ID manually:
                  </div>
                  <form onSubmit={handleManualLookup} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="lookup-order-id-input"
                      type="text"
                      placeholder="e.g. 650000000000000000000101"
                      value={lookupOrderId}
                      onChange={(e) => setLookupOrderId(e.target.value)}
                      style={{
                        flex: 1,
                        background: '#121214',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button
                      id="lookup-order-submit-btn"
                      type="submit"
                      disabled={lookupLoading}
                      style={{
                        background: '#27272a',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '0 16px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: lookupLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {lookupLoading ? 'Checking...' : 'Find'}
                    </button>
                  </form>
                  {lookupError && (
                    <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '8px' }}>
                      {lookupError}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Return Details Form */}
              <div style={{
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#f97316', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
                  Return Details & Refund Choice
                </h3>

                {selectedOrder ? (
                  <form onSubmit={handleSubmitReturn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Item checklist */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: '600' }}>
                        Select Items to Return:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#121214', padding: '12px', borderRadius: '8px' }}>
                        {(selectedOrder.items || []).map((item, idx) => {
                          const pId = item.productId?._id || item.productId || item._id;
                          const isChecked = selectedItems.includes(pId);
                          const title = item.name || item.title || item.productId?.name || `Item #${idx + 1}`;
                          const price = item.price || 0;

                          return (
                            <label
                              key={pId || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: isChecked ? '#fff' : '#71717a'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedItems(prev =>
                                    prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
                                  );
                                }}
                                style={{ accentColor: '#f97316', width: '16px', height: '16px' }}
                              />
                              <span style={{ flex: 1 }}>{title} (Qty: {item.qty || item.quantity || 1})</span>
                              <span style={{ fontWeight: '600', color: '#f97316' }}>₹{Number(price).toFixed(2)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reason for return */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>
                        Reason for Return:
                      </label>
                      <select
                        id="return-reason-select"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121214',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      >
                        <option value="Damaged or defective item">Damaged or defective item</option>
                        <option value="Received wrong item/color">Received wrong item/color</option>
                        <option value="Item does not match description">Item does not match description</option>
                        <option value="Size or fit issue">Size or fit issue</option>
                        <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                        <option value="Better price found elsewhere">Better price found elsewhere</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>
                        Additional Notes / Feedback (Optional):
                      </label>
                      <textarea
                        id="return-comments-textarea"
                        rows="2"
                        placeholder="Provide details to assist our inspection team..."
                        value={returnComments}
                        onChange={(e) => setReturnComments(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121214',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '0.88rem',
                          resize: 'vertical',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Refund Method Choice */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: '600' }}>
                        Preferred Refund Method:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: refundMethod === 'Original Payment Method' ? 'rgba(37, 99, 235, 0.15)' : '#121214',
                            border: refundMethod === 'Original Payment Method' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            value="Original Payment Method"
                            checked={refundMethod === 'Original Payment Method'}
                            onChange={(e) => setRefundMethod(e.target.value)}
                            style={{ accentColor: '#3b82f6' }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.9rem' }}>
                              Original Payment Method (Razorpay / Card)
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                              Credited within 3–5 business days after pickup inspection
                            </div>
                          </div>
                        </label>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: refundMethod === 'ShopNest Store Credit (+5% Bonus)' ? 'rgba(16, 185, 129, 0.15)' : '#121214',
                            border: refundMethod === 'ShopNest Store Credit (+5% Bonus)' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            value="ShopNest Store Credit (+5% Bonus)"
                            checked={refundMethod === 'ShopNest Store Credit (+5% Bonus)'}
                            onChange={(e) => setRefundMethod(e.target.value)}
                            style={{ accentColor: '#10b981' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>
                              ShopNest Wallet / Store Credit (+5% Bonus!) 🎁
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                              Instant store credit immediately on courier handover + 5% extra value
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Doorstep Pickup Slot */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>
                        Select Complimentary Doorstep Pickup Window:
                      </label>
                      <select
                        id="pickup-slot-select"
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121214',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      >
                        <option value="Tomorrow (10:00 AM - 2:00 PM)">Tomorrow (10:00 AM - 2:00 PM)</option>
                        <option value="Tomorrow (2:00 PM - 6:00 PM)">Tomorrow (2:00 PM - 6:00 PM)</option>
                        <option value="Day After Tomorrow (10:00 AM - 2:00 PM)">Day After Tomorrow (10:00 AM - 2:00 PM)</option>
                        <option value="Weekend Slot (Saturday 10:00 AM - 2:00 PM)">Weekend Slot (Saturday 10:00 AM - 2:00 PM)</option>
                      </select>
                    </div>

                    {returnError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem' }}>
                        ⚠️ {returnError}
                      </div>
                    )}

                    <button
                      id="submit-return-request-btn"
                      type="submit"
                      disabled={submittingReturn}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: submittingReturn ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: submittingReturn ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
                        marginTop: '6px'
                      }}
                    >
                      {submittingReturn ? 'Submitting Return Request...' : 'Confirm & Request Free Pickup →'}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: '#71717a' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👈</div>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      Please select an order from the list on the left to initiate your return request.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRACK RETURN STATUS */}
      {/* ========================================================================= */}
      {activeTab === 'track' && (
        <div id="track-return-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tracking Search Box */}
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px 32px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#ffffff' }}>
              Track Your Return & Refund Progress
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.92rem', margin: '0 0 20px 0' }}>
              Enter your Order ID or RMA authorization code to see live inspection and refund updates.
            </p>

            <form onSubmit={handleTrackReturn} style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
              <input
                id="track-return-input"
                type="text"
                placeholder="e.g. 650000000000000000000101 or RMA-XXXX-XXXX"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: '#121214',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                id="track-return-submit-btn"
                type="submit"
                disabled={trackingLoading}
                style={{
                  background: '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: trackingLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {trackingLoading ? 'Checking...' : 'Track'}
              </button>
            </form>

            {trackingError && (
              <div style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '14px' }}>
                ⚠️ {trackingError}
              </div>
            )}
          </div>

          {/* Tracked Return Card with Stepper */}
          {trackedOrder && (
            <div style={{
              background: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#71717a', textTransform: 'uppercase' }}>Return Tracking</span>
                  <h3 style={{ margin: '2px 0 0 0', color: '#ffffff', fontFamily: 'monospace', fontSize: '1.2rem' }}>
                    {trackedOrder.rmaCode || `ORDER #${trackedOrder._id.slice(-8).toUpperCase()}`}
                  </h3>
                </div>

                <div style={{
                  background: trackedOrder.returnStatus === 'Refunded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: trackedOrder.returnStatus === 'Refunded' ? '#10b981' : '#60a5fa',
                  border: trackedOrder.returnStatus === 'Refunded' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  ● {trackedOrder.returnStatus}
                </div>
              </div>

              {/* Stepper */}
              <div style={{ maxWidth: '700px', margin: '0 auto 30px auto' }}>
                <Stepper
                  steps={returnSteps}
                  activeStep={getReturnStepperIndex(trackedOrder.returnStatus)}
                  activeColor="#f97316"
                  completeColor="#10b981"
                  defaultColor="#27272a"
                  activeTitleColor="#f97316"
                  completeTitleColor="#10b981"
                  defaultTitleColor="#71717a"
                  circleFontColor="#ffffff"
                  completeBarColor="#10b981"
                  defaultBarColor="#27272a"
                  circleFontSize={13}
                  titleFontSize={12}
                  size={32}
                />
              </div>

              {/* Status Explanation */}
              <div style={{ background: '#121214', borderRadius: '12px', padding: '18px 22px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Reason</span>
                    <strong style={{ color: '#ffffff' }}>{trackedOrder.returnReason || 'General Return'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Refund Method</span>
                    <strong style={{ color: '#10b981' }}>{trackedOrder.refundMethod || 'Original Payment'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Requested On</span>
                    <strong style={{ color: '#ffffff' }}>
                      {trackedOrder.returnRequestedAt ? new Date(trackedOrder.returnRequestedAt).toLocaleDateString() : 'Recent'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Estimated Value</span>
                    <strong style={{ color: '#f97316', fontSize: '1rem' }}>
                      ₹{Number(trackedOrder.totalAmount || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link
                  to={`/orders?orderId=${trackedOrder._id}`}
                  style={{
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  View Full Order & Invoice Details →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY ACTIVE RETURNS */}
      {/* ========================================================================= */}
      {activeTab === 'my-returns' && user && (
        <div id="my-returns-panel">
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px'
          }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.25rem', color: '#ffffff' }}>
              Your Return History & Active Claims
            </h3>

            {myReturnsLoading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a1a1aa' }}>
                Loading returns...
              </div>
            ) : myReturns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#71717a' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛍️</div>
                <h4 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '1.1rem' }}>No Active Returns</h4>
                <p style={{ margin: '0 0 18px 0', fontSize: '0.9rem' }}>
                  All your past orders are in good standing with no open return requests.
                </p>
                <button
                  onClick={() => switchTab('request')}
                  style={{
                    background: '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Start a Return Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myReturns.map((ret) => (
                  <div
                    key={ret._id}
                    style={{
                      background: '#121214',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '18px 22px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#f97316' }}>
                          {ret.rmaCode || `RMA-${ret._id.slice(-6).toUpperCase()}`}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: '600',
                          background: ret.returnStatus === 'Refunded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: ret.returnStatus === 'Refunded' ? '#10b981' : '#60a5fa'
                        }}>
                          {ret.returnStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                        Order #{ret._id.slice(-8).toUpperCase()} • Reason: {ret.returnReason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '1rem' }}>
                        ₹{Number(ret.totalAmount || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          setTrackedOrder(ret);
                          switchTab('track');
                        }}
                        style={{
                          background: '#27272a',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Track Stepper →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: POLICY GUIDELINES & FAQS */}
      {/* ========================================================================= */}
      {activeTab === 'policy' && (
        <div id="policy-guidelines-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Policy Overview Card */}
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '32px',
            lineHeight: '1.7'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#ffffff' }}>
              ShopNest 30-Day Return & Refund Policy
            </h2>
            <p style={{ color: '#a1a1aa', margin: '0 0 20px 0' }}>
              We design every experience to be risk-free. If you are not completely satisfied with your purchase, you can return your item within 30 days of delivery with 100% free doorstep pickup and zero restocking fees.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
              
              <div style={{ background: '#121214', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span> Eligible for Return
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                  <li>Unused products in original packaging with intact tags</li>
                  <li>Electronics in working order with all cables and accessories</li>
                  <li>Defective or transit-damaged items reported within 30 days</li>
                  <li>Apparel and shoes unworn with original brand boxes</li>
                </ul>
              </div>

              <div style={{ background: '#121214', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✗</span> Non-Returnable Items
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                  <li>Digital downloads, software licenses, or gift cards</li>
                  <li>Personal care or hygiene items with broken seals</li>
                  <li>Customized or personalized merchandise</li>
                  <li>Items missing serial numbers or factory barcodes</li>
                </ul>
              </div>
            </div>

            {/* 4 Step Process Visual */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#ffffff' }}>
                How Returns Work (4 Simple Steps)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#121214', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ color: '#f97316', fontWeight: '800', fontSize: '1.2rem', marginBottom: '4px' }}>01</div>
                  <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>Request Online</strong>
                  <span style={{ color: '#71717a', fontSize: '0.82rem' }}>Select your delivered order and choose your preferred refund option.</span>
                </div>
                <div style={{ background: '#121214', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ color: '#f97316', fontWeight: '800', fontSize: '1.2rem', marginBottom: '4px' }}>02</div>
                  <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>Free Doorstep Pickup</strong>
                  <span style={{ color: '#71717a', fontSize: '0.82rem' }}>Our courier partner collects the boxed package directly from your door.</span>
                </div>
                <div style={{ background: '#121214', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ color: '#f97316', fontWeight: '800', fontSize: '1.2rem', marginBottom: '4px' }}>03</div>
                  <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>Quick Quality Check</strong>
                  <span style={{ color: '#71717a', fontSize: '0.82rem' }}>Our fulfillment team verifies the item condition within 24 hours of arrival.</span>
                </div>
                <div style={{ background: '#121214', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ color: '#f97316', fontWeight: '800', fontSize: '1.2rem', marginBottom: '4px' }}>04</div>
                  <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>Instant Refund</strong>
                  <span style={{ color: '#71717a', fontSize: '0.82rem' }}>Get credited to original payment or wallet with a 5% bonus.</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#ffffff' }}>
              Frequently Asked Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  q: 'Do I have to pay for return shipping?',
                  a: 'No! ShopNest provides 100% complimentary doorstep pickup for all eligible returns. You never have to pay return postage or logistical restocking fees.'
                },
                {
                  q: 'How long will it take to receive my refund?',
                  a: 'If you choose ShopNest Store Credit, your refund is credited instantly upon pickup handover with an extra 5% bonus! If you prefer your original payment method (card / net banking), the credit reflects in 3–5 business days.'
                },
                {
                  q: 'Do I need the original shipping box?',
                  a: 'You do not need the brown exterior shipping carton, but the internal product manufacturer box, tags, and all included manuals or accessories must be enclosed.'
                },
                {
                  q: 'Can I cancel my return request if I change my mind?',
                  a: 'Yes! You can cancel any return request from your Order Details page or Returns Hub as long as the courier has not yet completed the physical pickup.'
                }
              ].map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    id={`faq-accordion-item-${idx}`}
                    style={{
                      background: '#121214',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{faq.q}</span>
                      <span style={{ color: '#f97316', fontSize: '1.2rem', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 20px 16px 20px', color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReturnPolicy;
