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

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Top Users
        </CardTitle>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Key contributors and at-risk users
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Raters */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
              🏆 Top Raters (Engagement)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topRaters.slice(0, 8).map((user, idx) => (
                <div
                  key={idx}
                  onClick={() => onFilterUser(user.email)}
                  style={{
                    padding: '10px 12px',
                    background: 'white',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ fontSize: 14, color: '#334155', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginLeft: 12, whiteSpace: 'nowrap' }}>
                    {user.total} • {user.positiveRate}% 👍
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Users */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
              ⚠️ At-Risk Users (Most Negative)
            </div>
            {atRiskUsers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {atRiskUsers.slice(0, 8).map((user, idx) => (
                  <div
                    key={idx}
                    onClick={() => onFilterUser(user.email)}
                    style={{
                      padding: '10px 12px',
                      background: '#fffbeb',
                      borderRadius: 6,
                      border: '1px solid #fbbf24',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef3c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fffbeb';
                    }}
                  >
                    <div style={{ fontSize: 14, color: '#334155', fontFamily: 'monospace', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: 13, color: '#92400e' }}>
                      {user.negativeCount} 👎 ({user.negativeRate}% negative) • {user.total} total
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: '#94a3b8' }}>No users with 3+ feedback</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
