'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
          Settings
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
          Configure API connections and dashboard preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={20} color="#343ced" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure your Glean API and other service connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Environment Variables
            </h3>
            <div style={{ 
              borderRadius: 6, 
              background: '#f9fafb', 
              padding: 16, 
              fontFamily: 'monospace', 
              fontSize: 13 
            }}>
              <p style={{ color: '#374151', margin: 0 }}>
                NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://your-instance-be.glean.com
              </p>
              <p style={{ color: '#374151', margin: '8px 0 0 0' }}>
                NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=your_oauth_token_here
              </p>
              <p style={{ color: '#374151', margin: '8px 0 0 0' }}>
                NEXT_PUBLIC_NEGATIVE_AGENT_ID={process.env.NEXT_PUBLIC_NEGATIVE_AGENT_ID || 'not_set'}
              </p>
              <p style={{ color: '#374151', margin: '8px 0 0 0' }}>
                NEXT_PUBLIC_POSITIVE_AGENT_ID={process.env.NEXT_PUBLIC_POSITIVE_AGENT_ID || 'not_set'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Configuration File
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              You can also configure API endpoints programmatically in{' '}
              <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                src/lib/config.ts
              </code>
            </p>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Adding New Dashboards
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              To add a new dashboard, update the{' '}
              <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                DASHBOARD_CONFIGS
              </code>{' '}
              array in{' '}
              <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                src/lib/config.ts
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

