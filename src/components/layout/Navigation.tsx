'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const tabs = [
  { name: 'Sentiment', href: '/sentiment' },
  { name: 'Settings', href: '/settings' },
];

export function Navigation() {
  const pathname = usePathname();
  let customer: string | null = null;
  
  // Try to get customer from URL (client-side only)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    customer = params.get('customer');
  }

  const isActive = (href: string) => {
    // Handle sentiment as the default (root also redirects there)
    if (href === '/sentiment') {
      return pathname === '/' || pathname.startsWith('/sentiment');
    }
    return pathname.startsWith(href);
  };

  // Build URL with customer parameter preserved
  const buildHref = (baseHref: string) => {
    if (customer) {
      return `${baseHref}?customer=${customer}`;
    }
    return baseHref;
  };

  return (
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={buildHref(tab.href)}
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


