import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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
    .sort((a, b) => b.negativeRate - a.negativeRate)
    .slice(0, 10);

  // Helper to abbreviate email
  const abbreviateEmail = (email: string) => {
    const parts = email.split('@');
    return { username: parts[0], domain: parts[1] ? `@${parts[1]}` : '' };
  };

  return (
    <Card style={{ minHeight: 420, maxHeight: 520, display: 'flex', flexDirection: 'column' }}>
      <CardHeader>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Top Users
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Key contributors and at-risk users
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Raters */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              🏆 Top Raters
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {topRaters.slice(0, 8).map((user, idx) => {
                const { username, domain } = abbreviateEmail(user.email);
                return (
                  <div
                    key={idx}
                    onClick={() => onFilterUser(user.email)}
                    title={user.email}
                    style={{
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
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, color: '#0f172a', fontFamily: 'monospace' }}>
                        {username}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {domain}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {user.total}
                    </div>
                    <div style={{ fontSize: 12, color: '#14b8a6', textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                      {user.positiveRate}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* At-Risk Users */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              ⚠️ At-Risk
            </div>
            {atRiskUsers.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {atRiskUsers.slice(0, 8).map((user, idx) => {
                  const { username, domain } = abbreviateEmail(user.email);
                  return (
                    <div
                      key={idx}
                      onClick={() => onFilterUser(user.email)}
                      title={user.email}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(251, 191, 36, 0.08)',
                        borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                        gap: 8,
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.08)';
                      }}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 13, color: '#0f172a', fontFamily: 'monospace' }}>
                          {username}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {domain}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#92400e', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {user.negativeCount}👎
                      </div>
                      <div style={{ fontSize: 12, color: '#92400e', textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
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
