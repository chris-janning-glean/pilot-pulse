import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  bg?: string;
  style?: React.CSSProperties;
}

export function Stat({ label, value, icon: Icon, trend, color = '#343ced', bg = '#ede9fe', style }: StatProps) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 20,
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      ...style
    }}>
      {Icon && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Icon size={16} color="#9ca3af" />
        </div>
      )}
      <div style={{ 
        fontSize: 32, 
        fontWeight: 700, 
        color: color,
        marginBottom: 8,
        background: bg,
        width: 64,
        height: 64,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px'
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: 13, 
        color: '#6b7280',
        fontWeight: 600,
        marginBottom: trend ? 8 : 0
      }}>
        {label}
      </div>
      {trend && (
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: trend.isPositive ? '#10b981' : '#ef4444'
        }}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

