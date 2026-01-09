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

    // Sort by frequency and take top phrases
    return tagCloud
      .filter((tag: any) => tag.phrase && tag.frequency)
      .sort((a: any, b: any) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 12)
      .map((tag: any) => ({
        phrase: tag.phrase.length > 24 ? tag.phrase.substring(0, 22) + '...' : tag.phrase,
        fullPhrase: tag.phrase,
        frequency: tag.frequency,
        example: tag.example,
      }));
  };

  const negativeTags = extractTagCloud(negativeAgentResponse, negativeAgentLoading);
  const positiveTags = extractTagCloud(positiveAgentResponse, positiveAgentLoading);

  const renderCloud = (tags: any[], sentiment: 'positive' | 'negative', color: string) => {
    if (tags.length === 0) {
      return <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 16 }}>No data</div>;
    }

    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px 6px', 
        justifyContent: 'center', 
        padding: '6px',
        lineHeight: 1.1
      }}>
        {tags.map((tag, idx) => {
          const frequency = Math.min(10, Math.max(1, tag.frequency || 1));
          // Reduced scale: cap at text-lg (18px)
          let fontSize = 11;
          if (idx === 0) fontSize = 18;      // text-lg
          else if (idx === 1) fontSize = 16; // text-base
          else if (idx === 2) fontSize = 15;
          else if (idx === 3) fontSize = 14; // text-sm
          else if (idx < 6) fontSize = 13;
          else fontSize = 11 + (frequency - 1) * 0.3; // text-xs + small scaling
          
          const fontWeight = idx < 3 ? 600 : idx < 5 ? 500 : 400;

          return (
            <span
              key={idx}
              title={`${tag.fullPhrase}${tag.example ? '\n\n' + tag.example : ''}`}
              onClick={() => onPhraseClick(tag.fullPhrase, sentiment)}
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                color: color,
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'inline-block',
                transition: 'all 0.2s',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.background = sentiment === 'negative' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(20, 184, 166, 0.12)';
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
    <Card style={{ minHeight: 420, maxHeight: 520, display: 'flex', flexDirection: 'column' }}>
      <CardHeader style={{ padding: 24, paddingBottom: 16 }}>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Top Phrases
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Most common themes
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24, paddingTop: 0, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Negative Phrases */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👎 Negative (n={negativeTags.length})
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {renderCloud(negativeTags, 'negative', '#f59e0b')}
            </div>
          </div>

          {/* Positive Phrases */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👍 Positive (n={positiveTags.length})
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {renderCloud(positiveTags, 'positive', '#14b8a6')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
