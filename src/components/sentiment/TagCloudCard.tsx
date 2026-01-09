import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TagCloudCardProps {
  negativeAgentResponse: any;
  positiveAgentResponse: any;
  negativeAgentLoading: boolean;
  positiveAgentLoading: boolean;
  onPhraseClick: (phrase: string, sentiment: 'positive' | 'negative') => void;
}

export function TagCloudCard({
  negativeAgentResponse,
  positiveAgentResponse,
  negativeAgentLoading,
  positiveAgentLoading,
  onPhraseClick,
}: TagCloudCardProps) {
  const extractTagCloud = (agentResponse: any, loading: boolean) => {
    if (loading) return [];

    if (!agentResponse || agentResponse.error) return [];

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

    if (!jsonData) return [];

    const tagCloud = jsonData.tag_cloud || [];

    // Sort by frequency and take top 20
    return tagCloud
      .filter((tag: any) => tag.phrase && tag.frequency)
      .sort((a: any, b: any) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 20)
      .map((tag: any) => ({
        phrase: tag.phrase.length > 30 ? tag.phrase.substring(0, 28) + '...' : tag.phrase,
        fullPhrase: tag.phrase,
        frequency: tag.frequency,
        example: tag.example,
      }));
  };

  const negativeTags = extractTagCloud(negativeAgentResponse, negativeAgentLoading);
  const positiveTags = extractTagCloud(positiveAgentResponse, positiveAgentLoading);

  const renderCloud = (tags: any[], sentiment: 'positive' | 'negative', color: string) => {
    if (tags.length === 0) {
      return <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No data</div>;
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 120, padding: '12px 8px' }}>
        {tags.map((tag, idx) => {
          const frequency = Math.min(10, Math.max(1, tag.frequency || 1));
          const baseFontSize = 12;
          const fontSize = baseFontSize + (frequency - 1) * 2.5;
          const fontWeight = frequency >= 7 ? 600 : frequency >= 4 ? 500 : 400;

          return (
            <span
              key={idx}
              title={tag.example || tag.fullPhrase}
              onClick={() => onPhraseClick(tag.fullPhrase, sentiment)}
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                color: color,
                cursor: 'pointer',
                padding: '6px 10px',
                display: 'inline-block',
                transition: 'all 0.2s',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = sentiment === 'negative' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(20, 184, 166, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {tag.phrase}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Top Phrases
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Most common themes from feedback
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Negative Phrases */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 10, textAlign: 'center' }}>
              👎 Negative (n={negativeTags.length})
            </div>
            {renderCloud(negativeTags, 'negative', '#f59e0b')}
          </div>

          {/* Positive Phrases */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#14b8a6', marginBottom: 10, textAlign: 'center' }}>
              👍 Positive (n={positiveTags.length})
            </div>
            {renderCloud(positiveTags, 'positive', '#14b8a6')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
