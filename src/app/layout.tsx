import './globals.css';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Glean Pilot Pulse',
  description: 'Real-time insights into pilot health and user sentiment',
  icons: {
    icon: '/logos/pilotpulse.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', 
        background: '#f9fafb', 
        color: '#111827', 
        margin: 0,
        minHeight: '100vh',
        paddingTop: 80,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      } as React.CSSProperties}>
        <header style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'white', 
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          zIndex: 1000
        }}>
          <div style={{ 
            maxWidth: 1440, 
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <Link href="/sentiment" style={{ color: '#1f2937', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Image 
                  src="/logos/glean.svg" 
                  alt="Glean" 
                  width={36} 
                  height={36}
                />
                <div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: '#1f2937' }}>
                    {metadata.title}
                  </h1>
                  <p style={{ margin: '2px 0 0 0', fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
                    {metadata.description}
                  </p>
                </div>
              </Link>
            </div>
            <Navigation />
          </div>
        </header>
        
        <div style={{ 
          maxWidth: 1440, 
          margin: '0 auto',
          width: '100%',
          padding: '24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <main style={{ 
            flex: 1,
            background: 'white',
            borderRadius: 8,
            padding: '32px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            marginBottom: 24
          }}>
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

