'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Sentiment', href: '/dashboard/sentiment' },
  { name: 'Settings', href: '/settings' },
];

export function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Handle sentiment dashboard as the default (root also redirects there)
    if (href === '/dashboard/sentiment') {
      return pathname === '/' || pathname.startsWith('/dashboard/sentiment');
    }
    return pathname.startsWith(href);
  };

  return (
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: active ? '#343ced' : '#6b7280',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              background: active ? '#ede9fe' : 'transparent',
              transition: 'all 0.2s',
              border: active ? '1px solid #c4b5fd' : '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }
            }}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}


