import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface InsightsPanelProps {
  activeTab: 'summary' | 'users' | 'examples';
  onTabChange: (tab: 'summary' | 'users' | 'examples') => void;
  negativeAgentResponse: any;
  positiveAgentResponse: any;
  negativeAgentLoading: boolean;
  positiveAgentLoading: boolean;
  allFeedback: any[];
  onFilterUser?: (email: string) => void;
  onFilterExample?: (filters: { sentiment?: string; issueType?: string; user?: string }) => void;
}

export function InsightsPanel({
  activeTab,
  onTabChange,
  negativeAgentResponse,
  positiveAgentResponse,
  negativeAgentLoading,
  positiveAgentLoading,
  allFeedback,
  onFilterUser,
  onFilterExample,
}: InsightsPanelProps) {
  const tabs = [
    { id: 'summary' as const, label: 'Summary' },
    { id: 'users' as const, label: 'Top Users' },
    { id: 'examples' as const, label: 'Examples' },
  ];

  return (
    <div style={{ position: 'sticky', top: 100, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
      <Card style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #6366f1' }}>
        <CardHeader>
          <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
            Insights
          </CardTitle>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  background: activeTab === tab.id ? '#6366f1' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'summary' && (
            <SummaryTab
              negativeAgentResponse={negativeAgentResponse}
              positiveAgentResponse={positiveAgentResponse}
              negativeAgentLoading={negativeAgentLoading}
              positiveAgentLoading={positiveAgentLoading}
            />
          )}

          {activeTab === 'users' && <TopUsersTab allFeedback={allFeedback} onFilterUser={onFilterUser} />}

          {activeTab === 'examples' && <ExamplesTab allFeedback={allFeedback} onFilterExample={onFilterExample} />}
        </CardContent>
      </Card>
    </div>
  );
}

// Summary Tab - Agent Briefing
function SummaryTab({
  negativeAgentResponse,
  positiveAgentResponse,
  negativeAgentLoading,
  positiveAgentLoading,
}: {
  negativeAgentResponse: any;
  positiveAgentResponse: any;
  negativeAgentLoading: boolean;
  positiveAgentLoading: boolean;
}) {
  const [expandedNegative, setExpandedNegative] = React.useState(false);
  const [expandedPositive, setExpandedPositive] = React.useState(false);

  const renderAgentSections = (agentResponse: any, loading: boolean, title: string, expanded: boolean, setExpanded: (val: boolean) => void) => {
    if (loading) {
      return <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>Loading...</div>;
    }

    if (!agentResponse) return null;

    if (agentResponse.error) {
      return <div style={{ fontSize: 12, color: '#dc2626' }}>Error: {agentResponse.error}</div>;
    }

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

    if (!jsonData) return <div style={{ fontSize: 12, color: '#64748b' }}>No data</div>;

    const sections = jsonData.sections || [];
    
    // Extract TL;DR bullets (first 5 paragraphs or h2 sections)
    const tldrItems = sections
      .filter((s: any) => s.type === 'paragraph' || (s.type === 'heading' && s.style === 'h2'))
      .slice(0, 5);
    
    const displaySections = expanded ? sections : tldrItems;

    return (
      <div style={{ marginBottom: 20, maxWidth: '80ch' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>{title}</div>
        
        {/* TL;DR Bullets */}
        <div style={{ marginBottom: 12 }}>
          {displaySections.map((section: any, idx: number) => {
            if (!section || !section.text) return null;

            const type = section.type || 'paragraph';
            const style = section.style || '';

            if (type === 'heading') {
              const level = style === 'h1' ? 1 : style === 'h2' ? 2 : 3;
              return (
                <div
                  key={idx}
                  style={{
                    fontSize: level === 1 ? 15 : level === 2 ? 14 : 13,
                    fontWeight: 600,
                    color: level === 1 ? '#0f172a' : '#475569',
                    marginTop: level === 1 ? 16 : 12,
                    marginBottom: 6,
                  }}
                >
                  {section.text}
                </div>
              );
            }

            return (
              <div key={idx} style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 10 }}>
                {section.text}
              </div>
            );
          })}
        </div>
        
        {/* Show More / Show Less */}
        {sections.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: 12,
              color: '#6366f1',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {expanded ? 'Show less' : `Show more (${sections.length - 5} more sections)`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderAgentSections(negativeAgentResponse, negativeAgentLoading, '👎 Negative Feedback', expandedNegative, setExpandedNegative)}
      {renderAgentSections(positiveAgentResponse, positiveAgentLoading, '👍 Positive Feedback', expandedPositive, setExpandedPositive)}
    </div>
  );
}

// Top Users Tab - Leaderboards
function TopUsersTab({ allFeedback, onFilterUser }: { allFeedback: any[]; onFilterUser?: (email: string) => void }) {
  // Calculate top raters
  const userStats = new Map<string, { total: number; positive: number; negative: number; lastDate: string }>();

  allFeedback.forEach((f) => {
    if (!f.user) return;
    const existing = userStats.get(f.user) || { total: 0, positive: 0, negative: 0, lastDate: '' };
    existing.total++;
    if (f.sentiment === 'positive') existing.positive++;
    if (f.sentiment === 'negative') existing.negative++;
    if (!existing.lastDate || (f.createTime && f.createTime > existing.lastDate)) {
      existing.lastDate = f.date || '';
    }
    userStats.set(f.user, existing);
  });

  const topRaters = Array.from(userStats.entries())
    .map(([email, stats]) => ({
      email,
      ...stats,
      positiveRate: stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const atRiskUsers = Array.from(userStats.entries())
    .filter(([_, stats]) => stats.total >= 3)
    .map(([email, stats]) => ({
      email,
      negativeCount: stats.negative,
      negativeRate: Math.round((stats.negative / stats.total) * 100),
      lastDate: stats.lastDate,
    }))
    .sort((a, b) => b.negativeRate - a.negativeRate)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Raters */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
          Top Raters (Engagement)
        </div>
        {topRaters.map((user, idx) => (
          <div
            key={idx}
            onClick={() => onFilterUser && onFilterUser(user.email)}
            style={{
              padding: '10px 12px',
              background: 'white',
              borderRadius: 6,
              marginBottom: 8,
              border: '1px solid #e2e8f0',
              cursor: onFilterUser ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (onFilterUser) e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#334155', fontFamily: 'monospace', flex: 1 }}>
                {user.email}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
                {user.total} • {user.positiveRate}% 👍
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* At-Risk Users */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
          At-Risk Users (Most Negative)
        </div>
        {atRiskUsers.length > 0 ? (
          atRiskUsers.map((user, idx) => (
            <div
              key={idx}
              onClick={() => onFilterUser && onFilterUser(user.email)}
              style={{
                padding: '10px 12px',
                background: '#fffbeb',
                borderRadius: 6,
                marginBottom: 8,
                border: '1px solid #fbbf24',
                cursor: onFilterUser ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (onFilterUser) e.currentTarget.style.background = '#fef3c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fffbeb';
              }}
            >
              <div style={{ fontSize: 13, color: '#334155', fontFamily: 'monospace', marginBottom: 4 }}>
                {user.email}
              </div>
              <div style={{ fontSize: 12, color: '#92400e' }}>
                {user.negativeCount} 👎 ({user.negativeRate}% negative)
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>No users with 3+ feedback</div>
        )}
      </div>
    </div>
  );
}

// Examples Tab - Representative Comments
function ExamplesTab({ allFeedback, onFilterExample }: { allFeedback: any[]; onFilterExample?: (filters: any) => void }) {
  // Get most common issue type
  const issueTypeCounts = new Map<string, number>();
  allFeedback.forEach((f) => {
    const issue = f.issueType || 'Unknown';
    issueTypeCounts.set(issue, (issueTypeCounts.get(issue) || 0) + 1);
  });
  const topIssue = Array.from(issueTypeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  const topIssueExample = allFeedback.find((f) => f.issueType === topIssue && f.comments);
  const recentNegative = allFeedback.find((f) => f.sentiment === 'negative' && f.comments);

  // Most negative user
  const userNegativeCounts = new Map<string, number>();
  allFeedback.forEach((f) => {
    if (f.sentiment === 'negative' && f.user) {
      userNegativeCounts.set(f.user, (userNegativeCounts.get(f.user) || 0) + 1);
    }
  });
  const mostNegativeUser = Array.from(userNegativeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostNegativeExample = allFeedback.find((f) => f.user === mostNegativeUser && f.comments);

  const examples = [
    { label: `Most Common Issue (${topIssue})`, feedback: topIssueExample },
    { label: 'Recent Negative Feedback', feedback: recentNegative },
    { label: 'Most Negative User Example', feedback: mostNegativeExample },
  ].filter((ex) => ex.feedback);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {examples.map((ex, idx) => (
        <div key={idx}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
            {ex.label}
          </div>
          <div
            onClick={() => {
              if (onFilterExample) {
                onFilterExample({
                  sentiment: ex.feedback.sentiment,
                  issueType: ex.feedback.issueType,
                  user: ex.feedback.user,
                });
              }
            }}
            style={{
              padding: 14,
              background: 'white',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              borderLeft: '3px solid #cbd5e1',
              fontSize: 14,
              color: '#334155',
              lineHeight: 1.7,
              fontStyle: 'italic',
              cursor: onFilterExample ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (onFilterExample) {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderLeftColor = '#6366f1';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderLeftColor = '#cbd5e1';
            }}
          >
            &ldquo;{ex.feedback.comments}&rdquo;
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
            {ex.feedback.user} • {ex.feedback.date}
            {onFilterExample && (
              <span style={{ marginLeft: 8, color: '#6366f1', fontSize: 11 }}>
                (click to filter)
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
