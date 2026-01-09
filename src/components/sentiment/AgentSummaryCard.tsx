import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AgentSummaryCardProps {
  negativeAgentResponse: any;
  positiveAgentResponse: any;
  negativeAgentLoading: boolean;
  positiveAgentLoading: boolean;
  timeRange: number;
  totalFeedback: number;
}

export function AgentSummaryCard({
  negativeAgentResponse,
  positiveAgentResponse,
  negativeAgentLoading,
  positiveAgentLoading,
  timeRange,
  totalFeedback,
}: AgentSummaryCardProps) {
  const extractContent = (agentResponse: any, loading: boolean) => {
    if (loading) return { tldr: '', themes: [], quotes: [] };

    if (!agentResponse || agentResponse.error) return { tldr: '', themes: [], quotes: [] };

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

    if (!jsonData) return { tldr: '', themes: [], quotes: [] };

    const sections = jsonData.sections || [];

    // Extract TL;DR (first paragraph)
    const tldr = sections.find((s: any) => s.type === 'paragraph')?.text || '';

    // Extract themes (h2 headings or first 5 paragraphs)
    const themes = sections
      .filter((s: any) => s.type === 'paragraph' && s.text && s.text.length < 80)
      .slice(0, 5)
      .map((s: any) => s.text);

    // Extract quotes (paragraphs that look like quotes or are longer)
    const quotes = sections
      .filter((s: any) => s.type === 'paragraph' && s.text && 
        (s.text.includes('user') || s.text.includes('feedback') || s.text.length > 60))
      .slice(0, 3)
      .map((s: any) => s.text.substring(0, 120));

    return { tldr, themes, quotes };
  };

  const negativeContent = extractContent(negativeAgentResponse, negativeAgentLoading);
  const positiveContent = extractContent(positiveAgentResponse, positiveAgentLoading);

  const renderBriefingPanel = (
    title: string,
    icon: string,
    content: { tldr: string; themes: string[]; quotes: string[] },
    loading: boolean,
    bgColor: string,
    borderColor: string,
    accentColor: string,
    headerColor: string,
    chipBg: string,
    chipBorder: string
  ) => {
    if (loading) {
      return (
        <div style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: 12,
          padding: 16,
          height: '100%',
        }}>
          <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: 20 }}>
            Loading analysis...
          </div>
        </div>
      );
    }

    return (
      <div style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: headerColor, letterSpacing: '-0.01em' }}>
            {title}
          </span>
        </div>

        {/* TL;DR */}
        {content.tldr && (
          <div style={{ fontSize: 15, color: '#334155', lineHeight: 1.7 }}>
            {content.tldr}
          </div>
        )}

        {/* Key Themes as Chips */}
        {content.themes.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Key Themes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {content.themes.map((theme: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: chipBg,
                    border: `1px solid ${chipBorder}`,
                    borderRadius: 9999,
                    padding: '4px 10px',
                    fontSize: 12,
                    color: '#475569',
                  }}
                >
                  {theme.length > 50 ? theme.substring(0, 48) + '...' : theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Representative Comments as Quote Blocks */}
        {content.quotes.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Examples
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {content.quotes.map((quote: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#475569',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  {quote}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data fallback */}
        {!content.tldr && content.themes.length === 0 && content.quotes.length === 0 && (
          <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: 20 }}>
            No data available
          </div>
        )}
      </div>
    );
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <CardHeader style={{ padding: 24, paddingBottom: 16 }}>
        {/* Split Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
              Agent Summary
            </CardTitle>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              AI-powered pattern analysis
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Window: {timeRange}d
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              n={totalFeedback} feedback
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent style={{ padding: 24, paddingTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Negative Panel */}
          {renderBriefingPanel(
            'Negative Patterns',
            '👎',
            negativeContent,
            negativeAgentLoading,
            'rgba(254, 243, 199, 0.3)',  // bg-amber-50/40
            'rgba(251, 191, 36, 0.25)',  // border-amber-200/60
            '#f59e0b',                    // border-l-amber-500
            '#92400e',                    // text-amber-700
            'rgba(254, 243, 199, 0.6)',  // chip bg
            '#fbbf24'                     // chip border
          )}

          {/* Positive Panel */}
          {renderBriefingPanel(
            'Positive Patterns',
            '👍',
            positiveContent,
            positiveAgentLoading,
            'rgba(209, 250, 229, 0.3)',  // bg-emerald-50/40
            'rgba(167, 243, 208, 0.25)', // border-emerald-200/60
            '#14b8a6',                    // border-l-teal-500
            '#065f46',                    // text-emerald-700
            'rgba(209, 250, 229, 0.6)',  // chip bg
            '#6ee7b7'                     // chip border
          )}
        </div>
      </CardContent>
    </Card>
  );
}
