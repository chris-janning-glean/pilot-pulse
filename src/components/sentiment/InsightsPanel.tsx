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
}

export function InsightsPanel({
  activeTab,
  onTabChange,
  negativeAgentResponse,
  positiveAgentResponse,
  negativeAgentLoading,
  positiveAgentLoading,
  allFeedback,
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

          {activeTab === 'users' && <TopUsersTab allFeedback={allFeedback} />}

          {activeTab === 'examples' && <ExamplesTab allFeedback={allFeedback} />}
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
  const renderAgentSections = (agentResponse: any, loading: boolean, title: string) => {
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

    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>{title}</div>
        {sections.slice(0, 5).map((section: any, idx: number) => {
          if (!section || !section.text) return null;

          const type = section.type || 'paragraph';
          const style = section.style || '';

          if (type === 'heading') {
            const level = style === 'h1' ? 1 : style === 'h2' ? 2 : 3;
            return (
              <div
                key={idx}
                style={{
                  fontSize: level === 1 ? 14 : level === 2 ? 13 : 12,
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
            <div key={idx} style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>
              {section.text}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {renderAgentSections(negativeAgentResponse, negativeAgentLoading, '👎 Negative Feedback')}
      {renderAgentSections(positiveAgentResponse, positiveAgentLoading, '👍 Positive Feedback')}
    </div>
  );
}

// Top Users Tab - Leaderboards
function TopUsersTab({ allFeedback }: { allFeedback: any[] }) {
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
            style={{
              padding: '10px 12px',
              background: 'white',
              borderRadius: 6,
              marginBottom: 8,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace', flex: 1 }}>
                {user.email}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>
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
              style={{
                padding: '10px 12px',
                background: '#fffbeb',
                borderRadius: 6,
                marginBottom: 8,
                border: '1px solid #fbbf24',
              }}
            >
              <div style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace', marginBottom: 4 }}>
                {user.email}
              </div>
              <div style={{ fontSize: 11, color: '#92400e' }}>
                {user.negativeCount} 👎 ({user.negativeRate}% negative)
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: '#94a3b8' }}>No users with 3+ feedback</div>
        )}
      </div>
    </div>
  );
}

// Examples Tab - Representative Comments
function ExamplesTab({ allFeedback }: { allFeedback: any[] }) {
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
            {ex.label}
          </div>
          <div
            style={{
              padding: 12,
              background: 'white',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              borderLeft: '3px solid #cbd5e1',
              fontSize: 13,
              color: '#334155',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{ex.feedback.comments}&rdquo;
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            {ex.feedback.user} • {ex.feedback.date}
          </div>
        </div>
      ))}
    </div>
  );
}
