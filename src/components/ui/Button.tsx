import React from 'react';
import { buttonStyles } from '@/lib/commonStyles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  style: customStyle,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle = disabled 
    ? buttonStyles.disabled 
    : variant === 'secondary' 
      ? buttonStyles.secondary 
      : variant === 'success'
        ? buttonStyles.success
        : variant === 'warning'
          ? buttonStyles.warning
          : variant === 'danger'
            ? buttonStyles.danger
            : buttonStyles.primary;

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '10px 18px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 16 },
  };

  const hoverStyle = !disabled && isHovered && variant === 'primary'
    ? { background: '#2c32d9' }
    : !disabled && isHovered && variant === 'secondary'
      ? { background: '#f3f4f6' }
      : {};

  return (
    <button
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...hoverStyle,
        ...customStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
}

