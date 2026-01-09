import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, style, className, onClick }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        boxShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.08)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
        ...style
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style, className }: CardProps) {
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4, 
        padding: '18px 20px',
        ...style 
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, style, className }: CardProps) {
  return (
    <h3 
      className={className}
      style={{
        margin: 0,
        fontSize: 18,
        fontWeight: 600,
        color: '#111827',
        lineHeight: 1.2,
        ...style
      }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, style, className }: CardProps) {
  return (
    <p 
      className={className}
      style={{ 
        margin: 0, 
        fontSize: 13, 
        color: '#6b7280',
        ...style 
      }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, style, className }: CardProps) {
  return (
    <div 
      className={className}
      style={{ 
        padding: '0 20px 20px 20px',
        ...style 
      }}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, style, className }: CardProps) {
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 20px 20px 20px',
        ...style 
      }}
    >
      {children}
    </div>
  );
}

