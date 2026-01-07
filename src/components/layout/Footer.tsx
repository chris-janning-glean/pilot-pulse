import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      textAlign: 'center',
      padding: '20px',
      fontSize: 13,
      color: '#6b7280',
      borderTop: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: 8,
    }}>
      <p style={{ margin: 0 }}>
        © {currentYear} Pilot Command. Built for monitoring Glean pilot health.
      </p>
    </footer>
  );
}
