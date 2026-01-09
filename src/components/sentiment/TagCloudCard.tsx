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

    // Split into center (top 4-6) and outer terms
    const centerTerms = tags.slice(0, 5);
    const outerTerms = tags.slice(5);

    const renderPhrase = (tag: any, idx: number, isCenter: boolean) => {
      // +20% font scale: multiply by 1.2, cap at text-xl (20px)
      let baseFontSize = 11;
      if (isCenter) {
        if (idx === 0) baseFontSize = 20;      // text-xl (was 18)
        else if (idx === 1) baseFontSize = 18; // text-lg (was 16)
        else if (idx === 2) baseFontSize = 17;
        else if (idx === 3) baseFontSize = 16; // text-base (was 14)
        else baseFontSize = 15;
      } else {
        baseFontSize = 13; // text-sm
      }
      
      const fontWeight = isCenter && idx < 3 ? 600 : isCenter ? 500 : 400;

      return (
        <span
          key={idx}
          title={`${tag.fullPhrase}${tag.example ? '\n\n' + tag.example : ''}`}
          onClick={() => onPhraseClick(tag.fullPhrase, sentiment)}
          style={{
            fontSize: `${baseFontSize}px`,
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
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Center cluster - largest terms */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px 12px',
          lineHeight: 1.1,
        }}>
          {centerTerms.map((tag, idx) => renderPhrase(tag, idx, true))}
        </div>

        {/* Outer terms - smaller */}
        {outerTerms.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px 8px',
            lineHeight: 1.1,
          }}>
            {outerTerms.map((tag, idx) => renderPhrase(tag, idx + 5, false))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader style={{ padding: 24, paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
          Top Phrases
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Most common themes
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24, paddingTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Negative Phrases */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👎 Negative (n={negativeTags.length})
            </div>
            {renderCloud(negativeTags, 'negative', '#f59e0b')}
          </div>

          {/* Positive Phrases */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👍 Positive (n={positiveTags.length})
            </div>
            {renderCloud(positiveTags, 'positive', '#14b8a6')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
