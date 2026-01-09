import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AgentSummaryRenderer } from './AgentSummaryRenderer';

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
  const parseAgentData = (agentResponse: any) => {
    if (!agentResponse || agentResponse.error) return null;

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

    if (!jsonData) return null;

    return {
      sections: jsonData.sections || [],
      tagCloud: jsonData.tag_cloud || [],
    };
  };

  const negativeData = parseAgentData(negativeAgentResponse);
  const positiveData = parseAgentData(positiveAgentResponse);

  const renderBriefingPanel = (
    title: string,
    icon: string,
    data: { sections: any[]; tagCloud: any[] } | null,
    loading: boolean,
    variant: 'negative' | 'positive',
    bgColor: string,
    borderColor: string,
    accentColor: string,
    headerColor: string
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

    if (!data || data.sections.length === 0) {
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
            No data available
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: headerColor, letterSpacing: '-0.01em' }}>
            {title}
          </span>
        </div>

        {/* Use AgentSummaryRenderer */}
        <AgentSummaryRenderer sections={data.sections} variant={variant} />
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
            negativeData,
            negativeAgentLoading,
            'negative',
            'rgba(254, 243, 199, 0.3)',  // bg-amber-50/40
            'rgba(251, 191, 36, 0.25)',  // border-amber-200/60
            '#f59e0b',                    // border-l-amber-500
            '#92400e'                     // text-amber-700
          )}

          {/* Positive Panel */}
          {renderBriefingPanel(
            'Positive Patterns',
            '👍',
            positiveData,
            positiveAgentLoading,
            'positive',
            'rgba(209, 250, 229, 0.3)',  // bg-emerald-50/40
            'rgba(167, 243, 208, 0.25)', // border-emerald-200/60
            '#14b8a6',                    // border-l-teal-500
            '#065f46'                     // text-emerald-700
          )}
        </div>
      </CardContent>
    </Card>
  );
}
