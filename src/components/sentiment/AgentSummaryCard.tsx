import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AgentSummaryCardProps {
  negativeAgentResponse: any;
  positiveAgentResponse: any;
  negativeAgentLoading: boolean;
  positiveAgentLoading: boolean;
}

export function AgentSummaryCard({
  negativeAgentResponse,
  positiveAgentResponse,
  negativeAgentLoading,
  positiveAgentLoading,
}: AgentSummaryCardProps) {
  const extractSummary = (agentResponse: any, loading: boolean) => {
    if (loading) return { bullets: [], quotes: [] };

    if (!agentResponse || agentResponse.error) return { bullets: [], quotes: [] };

    const gleanMessage = agentResponse?.messages?.find((m: any) => m.role === 'GLEAN_AI');
    const content = gleanMessage?.content?.[0];
    let jsonData = content?.json;

    if (!jsonData && content?.text) {
      const trimmed = content.text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          jsonData = JSON.parse(trimmed);
        } catch (e) {}
      }
    }

    if (!jsonData) return { bullets: [], quotes: [] };

    const sections = jsonData.sections || [];

    // Extract bullets (first 6 paragraphs or h2 headings)
    const bullets = sections
      .filter((s: any) => s.type === 'paragraph' || (s.type === 'heading' && s.style === 'h2'))
      .slice(0, 6)
      .map((s: any) => s.text);

    // Extract quotes (paragraphs that look like quotes)
    const quotes = sections
      .filter((s: any) => s.type === 'paragraph' && s.text && 
        (s.text.startsWith('"') || s.text.includes('said') || s.text.includes('reported')))
      .slice(0, 3)
      .map((s: any) => s.text);

    return { bullets, quotes };
  };

  const negativeSummary = extractSummary(negativeAgentResponse, negativeAgentLoading);
  const positiveSummary = extractSummary(positiveAgentResponse, positiveAgentLoading);

  return (
    <Card style={{ marginBottom: 24 }}>
      <CardHeader>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Agent Summary
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          AI-powered analysis of feedback patterns
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Negative Summary */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', marginBottom: 12 }}>
              👎 Negative Patterns
            </div>
            {negativeAgentLoading ? (
              <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading...</div>
            ) : (
              <div>
                {negativeSummary.bullets.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
                    {negativeSummary.bullets.map((bullet: string, idx: number) => (
                      <li key={idx} style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 8 }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>No data</div>
                )}
              </div>
            )}
          </div>

          {/* Positive Summary */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#14b8a6', marginBottom: 12 }}>
              👍 Positive Patterns
            </div>
            {positiveAgentLoading ? (
              <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading...</div>
            ) : (
              <div>
                {positiveSummary.bullets.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
                    {positiveSummary.bullets.map((bullet: string, idx: number) => (
                      <li key={idx} style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 8 }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>No data</div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
