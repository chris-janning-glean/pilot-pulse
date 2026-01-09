'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Settings } from 'lucide-react';
import { buttonStyles } from '@/lib/commonStyles';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const customer = searchParams.get('customer') || 'whirlpool';
  
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResults, setApiTestResults] = useState<any>(null);

  const testApiConnection = async () => {
    setTestingApi(true);
    setApiTestResults(null);
    
    try {
      // Test negative feedback search
      const negativeResponse = await fetch('/api/glean/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `glean-${customer}`,
          pageSize: 10,
          requestOptions: {
            datasourcesFilter: ['jira'],
            facetFilters: [{
              fieldName: 'label',
              values: [
                { value: 'gleanchat-bad-queries', relationType: 'EQUALS' }
              ]
            }]
          }
        })
      });
      
      const negativeData = await negativeResponse.json();
      
      // Test agent call
      const agentResponse = await fetch('/api/glean/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: process.env.NEXT_PUBLIC_NEGATIVE_AGENT_ID,
          customerName: customer,
          timeframe: 'past_week'
        })
      });
      
      const agentData = await agentResponse.json();
      
      setApiTestResults({
        searchApi: {
          status: negativeResponse.status,
          resultCount: negativeData.results?.length || 0,
          response: negativeData
        },
        agentApi: {
          status: agentResponse.status,
          hasMessages: !!agentData.messages,
          response: agentData
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setApiTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setTestingApi(false);
    }
  };
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
          Settings ({customer})
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
          Configure API connections and test endpoints
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
              Current Agent IDs
            </h3>
            <div style={{ 
              borderRadius: 6, 
              background: '#f9fafb', 
              padding: 16, 
              fontFamily: 'monospace', 
              fontSize: 13 
            }}>
              <p style={{ color: '#374151', margin: 0 }}>
                Negative: {process.env.NEXT_PUBLIC_NEGATIVE_AGENT_ID || 'not_set'}
              </p>
              <p style={{ color: '#374151', margin: '8px 0 0 0' }}>
                Positive: {process.env.NEXT_PUBLIC_POSITIVE_AGENT_ID || 'not_set'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card style={{ marginTop: 24 }}>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>
            Manually test your Glean API connection and agent responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Testing Customer:</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{customer}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              Change customer via URL: /settings?customer=whirlpool
            </div>
          </div>

          <button
            onClick={testApiConnection}
            disabled={testingApi}
            style={{
              ...buttonStyles.primary,
              opacity: testingApi ? 0.6 : 1,
              cursor: testingApi ? 'wait' : 'pointer'
            }}
          >
            {testingApi ? '⏳ Testing APIs...' : '🧪 Test API Connection'}
          </button>

          {apiTestResults && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                Test Results
              </h3>
              
              {apiTestResults.error ? (
                <div style={{ 
                  padding: 16, 
                  background: '#fef2f2', 
                  border: '1px solid #fca5a5', 
                  borderRadius: 8,
                  color: '#991b1b',
                  fontSize: 13
                }}>
                  <strong>Error:</strong> {apiTestResults.error}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Search API Results */}
                  <div style={{ 
                    padding: 16, 
                    background: apiTestResults.searchApi.status === 200 ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${apiTestResults.searchApi.status === 200 ? '#86efac' : '#fca5a5'}`,
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      Search API
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                      Status: {apiTestResults.searchApi.status} | Results: {apiTestResults.searchApi.resultCount}
                    </div>
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: 11, color: '#9ca3af' }}>
                        View Response
                      </summary>
                      <pre style={{ 
                        fontSize: 10, 
                        background: 'white', 
                        padding: 8, 
                        borderRadius: 4, 
                        overflow: 'auto',
                        maxHeight: 300,
                        marginTop: 8
                      }}>
                        {JSON.stringify(apiTestResults.searchApi.response, null, 2)}
                      </pre>
                    </details>
                  </div>

                  {/* Agent API Results */}
                  <div style={{ 
                    padding: 16, 
                    background: apiTestResults.agentApi.status === 200 ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${apiTestResults.agentApi.status === 200 ? '#86efac' : '#fca5a5'}`,
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      Agent API
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                      Status: {apiTestResults.agentApi.status} | Has Messages: {apiTestResults.agentApi.hasMessages ? 'Yes' : 'No'}
                    </div>
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: 11, color: '#9ca3af' }}>
                        View Response
                      </summary>
                      <pre style={{ 
                        fontSize: 10, 
                        background: 'white', 
                        padding: 8, 
                        borderRadius: 4, 
                        overflow: 'auto',
                        maxHeight: 300,
                        marginTop: 8
                      }}>
                        {JSON.stringify(apiTestResults.agentApi.response, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
              
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
                Tested at: {new Date(apiTestResults.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
        Loading settings...
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
