import React, { useEffect } from 'react';

interface DetailDrawerProps {
  feedback: any | null;
  onClose: () => void;
}

export function DetailDrawer({ feedback, onClose }: DetailDrawerProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!feedback) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '500px',
        maxWidth: '90vw',
        background: 'white',
        zIndex: 1000,
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        overflowY: 'auto',
        padding: 24,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Feedback Details
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                color: '#64748b',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <a
            href={feedback.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none' }}
          >
            {feedback.ticketKey} →
          </a>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Timestamp */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Timestamp</div>
            <div style={{ fontSize: 14, color: '#334155' }}>{feedback.date || 'Unknown'}</div>
          </div>

          {/* User Email */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>User</div>
            <div style={{ fontSize: 14, color: '#334155', fontFamily: 'monospace' }}>
              {feedback.user || 'Unknown'}
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Sentiment</div>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              background: feedback.sentiment === 'positive' ? '#d1fae5' : '#fed7aa',
              color: feedback.sentiment === 'positive' ? '#065f46' : '#92400e',
            }}>
              {feedback.sentiment === 'positive' ? '👍 Positive' : '👎 Negative'}
            </span>
          </div>

          {/* Issue Type */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Issue Type</div>
            <div style={{ fontSize: 14, color: '#334155' }}>{feedback.issueType || 'Unknown'}</div>
          </div>

          {/* Full Comment */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Comment</div>
            <div style={{
              fontSize: 14,
              color: '#334155',
              lineHeight: 1.7,
              padding: 16,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {feedback.comments || 'No comment provided'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
