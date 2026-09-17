import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

const CompareDock = () => {
  const {
    compareList,
    compareCount,
    maxItems,
    removeFromCompare,
    clearCompare,
    isDockMinimized,
    setIsDockMinimized,
    toastMessage
  } = useCompare();

  const location = useLocation();

  // If on the /compare page itself, we don't need to obscure the view with the bottom dock
  if (location.pathname === '/compare') {
    return (
      <>
        {toastMessage && (
          <div
            id="compare-toast-notification"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#2563eb',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 99999,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            ⚖️ {toastMessage}
          </div>
        )}
      </>
    );
  }

  // Only display dock when there are items in the list or toast active
  if (compareCount === 0 && !toastMessage) {
    return null;
  }

  return (
    <>
      {toastMessage && (
        <div
          id="compare-toast-notification"
          style={{
            position: 'fixed',
            bottom: isDockMinimized || compareCount === 0 ? '24px' : '100px',
            right: '24px',
            background: '#2563eb',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 99999,
            transition: 'bottom 0.3s ease'
          }}
        >
          ⚖️ {toastMessage}
        </div>
      )}

      {compareCount > 0 && (
        <div
          id="floating-compare-dock"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9990,
            width: 'calc(100% - 32px)',
            maxWidth: '860px',
            background: 'rgba(24, 24, 27, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '16px',
            padding: isDockMinimized ? '10px 18px' : '14px 20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 20px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: '#f4f4f5'
          }}
        >
          {isDockMinimized ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>
                  Comparing {compareCount} of {maxItems} items
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/compare"
                  id="dock-compare-minimized-link"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  View Matrix →
                </Link>
                <button
                  onClick={() => setIsDockMinimized(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#a1a1aa',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  title="Expand Compare Dock"
                >
                  ▲ Expand
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Dock Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#60a5fa',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    COMPARE STUDIO
                  </div>
                  <span style={{ color: '#a1a1aa', fontSize: '0.88rem' }}>
                    {compareCount} / {maxItems} products selected
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    id="dock-clear-all-btn"
                    onClick={clearCompare}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.82rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                  >
                    Clear All
                  </button>
                  <button
                    id="dock-minimize-btn"
                    onClick={() => setIsDockMinimized(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#a1a1aa',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    title="Collapse Dock"
                  >
                    ▼ Hide
                  </button>
                </div>
              </div>

              {/* Items row + Action Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}
              >
                {/* Thumbnails Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    paddingBottom: '2px'
                  }}
                >
                  {compareList.map((item) => {
                    const itemId = item._id || item.id;
                    return (
                      <div
                        key={itemId}
                        id={`dock-item-${itemId}`}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '6px 10px 6px 6px',
                          minWidth: '150px',
                          maxWidth: '190px'
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ overflow: 'hidden', flexGrow: 1 }}>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: '700' }}>
                            ₹{Number(item.price).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCompare(itemId)}
                          title="Remove item"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            color: '#ef4444',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11px',
                            flexShrink: 0
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {/* Empty Slot Placeholders */}
                  {Array.from({ length: maxItems - compareCount }).map((_, idx) => (
                    <div
                      key={`empty-slot-${idx}`}
                      style={{
                        width: '100px',
                        height: '48px',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#71717a',
                        fontSize: '0.75rem',
                        flexShrink: 0
                      }}
                    >
                      + Add slot
                    </div>
                  ))}
                </div>

                {/* Primary CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to="/compare"
                    id="open-comparison-matrix-btn"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>⚖️ Compare ({compareCount})</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CompareDock;
