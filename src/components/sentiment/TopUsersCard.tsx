import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KpiInfo } from '@/components/ui/KpiInfo';

interface TopUsersCardProps {
  allFeedback: any[];
  onFilterUser: (email: string) => void;
}

export function TopUsersCard({ allFeedback, onFilterUser }: TopUsersCardProps) {
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
      total: stats.total,
      lastDate: stats.lastDate,
    }))
    .sort((a, b) => b.negativeCount - a.negativeCount || b.negativeRate - a.negativeRate)
    .slice(0, 10);

  // Helper to abbreviate email
  const abbreviateEmail = (email: string) => {
    const parts = email.split('@');
    return { username: parts[0], domain: parts[1] ? `@${parts[1]}` : '' };
  };

  return (
    <Card>
      <CardHeader style={{ padding: 24, paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
          Top Users
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Key contributors and at-risk users
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24, paddingTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left Column: Top Raters */}
          <div>
            {/* Header Block - Fixed Height */}
            <div style={{ minHeight: 44, marginBottom: 12 }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: '#0f172a', 
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                🏆 Top Raters
                <KpiInfo
                  title="Top Raters"
                  body={[
                    'Users ranked by total number of feedback submissions (👍 + 👎).',
                    'Shows their positive feedback rate to identify power users.',
                    'Clicking a user filters the table below to show their feedback.',
                  ]}
                />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                Total • % positive
              </div>
            </div>
            {/* List Container - Matched Styling */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              {topRaters.slice(0, 10).map((user, idx) => {
                const { username, domain } = abbreviateEmail(user.email);
                return (
                  <div
                    key={idx}
                    onClick={() => onFilterUser(user.email)}
                    title={user.email}
                    style={{
                      minHeight: 36,
                      padding: '8px 12px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                      gap: 8,
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                      <span style={{ fontSize: 13, color: '#0f172a', fontFamily: 'monospace' }}>
                        {username}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {domain}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right', fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                      {user.total}
                    </div>
                    <div style={{ fontSize: 12, color: '#14b8a6', textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                      {user.positiveRate}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: At-Risk Users */}
          <div>
            {/* Header Block - Fixed Height (matches left) */}
            <div style={{ minHeight: 44, marginBottom: 12 }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: '#92400e', 
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                ⚠️ At-Risk
                <KpiInfo
                  title="At-Risk Users"
                  body={[
                    'Users with 3+ feedback sorted by number of negative (👎) submissions.',
                    'High negative counts may indicate users struggling with the product.',
                    'Clicking a user filters the table below to show their feedback history.',
                  ]}
                />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                👎 count • % negative
              </div>
            </div>
            {/* List Container - Matched Styling + Subtle Accent */}
            {atRiskUsers.length > 0 ? (
              <div style={{ 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: 8,
                borderLeft: '4px solid #fbbf24',
                paddingLeft: 8,
              }}>
                {atRiskUsers.slice(0, 10).map((user, idx) => {
                  const { username, domain } = abbreviateEmail(user.email);
                  return (
                    <div
                      key={idx}
                      onClick={() => onFilterUser(user.email)}
                      title={user.email}
                      style={{
                        minHeight: 36,
                        padding: '8px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                        gap: 8,
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                        <span style={{ fontSize: 13, color: '#0f172a', fontFamily: 'monospace' }}>
                          {username}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {domain}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#92400e', textAlign: 'right', fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                        {user.negativeCount}👎
                      </div>
                      <div style={{ fontSize: 12, color: '#92400e', textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                        {user.negativeRate}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>No users with 3+ feedback</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
