import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', style: customStyle }: BadgeProps) {
  const variants = {
    default: { 
      background: '#ede9fe', 
      color: '#5b21b6', 
      border: '1px solid #c4b5fd' 
    },
    success: { 
      background: '#d1fae5', 
      color: '#065f46', 
      border: '1px solid #6ee7b7' 
    },
    warning: { 
      background: '#fef3c7', 
      color: '#92400e', 
      border: '1px solid #fcd34d' 
    },
    danger: { 
      background: '#fee2e2', 
      color: '#991b1b', 
      border: '1px solid #fca5a5' 
    },
    secondary: { 
      background: '#f3f4f6', 
      color: '#1f2937', 
      border: '1px solid #d1d5db' 
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 12,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.2s',
        ...variants[variant],
        ...customStyle
      }}
    >
      {children}
    </span>
  );
}

