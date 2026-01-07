'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThumbsUp, TrendingUp, Users, Settings } from 'lucide-react';
import { buttonStyles } from '@/lib/commonStyles';

export default function Home() {
  const router = useRouter();
  
  // Redirect to sentiment dashboard
  useEffect(() => {
    router.push('/dashboard/sentiment');
  }, [router]);
  
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111827' }}>
          Welcome to Pilot Pulse
        </h1>
        <p style={{ marginTop: 8, fontSize: 16, color: '#6b7280' }}>
          Real-time insights into pilot health and user sentiment
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 24,
        marginBottom: 32 
      }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThumbsUp size={32} color="#343ced" />
            </div>
            <CardTitle style={{ marginTop: 16 }}>User Sentiment</CardTitle>
            <CardDescription>
              Track thumbs up/down feedback and analyze user satisfaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/sentiment" style={{ textDecoration: 'none' }}>
              <button style={{
                ...buttonStyles.primary,
                width: '100%'
              }}>
                View Dashboard
              </button>
            </Link>
          </CardContent>
        </Card>

        <Card style={{ opacity: 0.6 }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <TrendingUp size={32} color="#9ca3af" />
            </div>
            <CardTitle style={{ marginTop: 16 }}>Adoption Metrics</CardTitle>
            <CardDescription>
              Monitor user adoption and engagement trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button style={{
              ...buttonStyles.disabled,
              width: '100%'
            }} disabled>
              Coming Soon
            </button>
          </CardContent>
        </Card>

        <Card style={{ opacity: 0.6 }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Users size={32} color="#9ca3af" />
            </div>
            <CardTitle style={{ marginTop: 16 }}>User Activity</CardTitle>
            <CardDescription>
              Analyze user behavior and activity patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button style={{
              ...buttonStyles.disabled,
              width: '100%'
            }} disabled>
              Coming Soon
            </button>
          </CardContent>
        </Card>
      </div>

      <Card style={{ background: '#ede9fe', borderColor: '#c4b5fd' }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={20} color="#343ced" />
            <CardTitle>Getting Started</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
            To get started, configure your Glean API credentials:
          </p>
          <ol style={{ 
            paddingLeft: 24, 
            marginBottom: 16,
            fontSize: 14,
            color: '#374151',
            lineHeight: 1.8
          }}>
            <li>
              Copy <code style={{ 
                background: 'white', 
                padding: '2px 6px', 
                borderRadius: 4,
                fontSize: 13,
                fontFamily: 'monospace'
              }}>.env.example</code> to <code style={{ 
                background: 'white', 
                padding: '2px 6px', 
                borderRadius: 4,
                fontSize: 13,
                fontFamily: 'monospace'
              }}>.env.local</code>
            </li>
            <li>Add your Glean API endpoint and key</li>
            <li>Restart the development server</li>
          </ol>
          <Link href="/settings" style={{ textDecoration: 'none' }}>
            <button style={buttonStyles.primary}>
              Go to Settings
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

