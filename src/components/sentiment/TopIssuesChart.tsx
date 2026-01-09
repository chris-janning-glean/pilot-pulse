import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TopIssuesChartProps {
  allFeedback: any[];
}

export function TopIssuesChart({ allFeedback }: TopIssuesChartProps) {
  const generateTopIssuesData = () => {
    const issueStats = new Map<string, { positive: number; negative: number }>();

    allFeedback.forEach((f) => {
      const issue = f.issueType || 'Unknown';
      const stats = issueStats.get(issue) || { positive: 0, negative: 0 };
      if (f.sentiment === 'positive') stats.positive++;
      if (f.sentiment === 'negative') stats.negative++;
      issueStats.set(issue, stats);
    });

    // Get top 5 + always include Unknown if present
    const sorted = Array.from(issueStats.entries())
      .map(([name, stats]) => ({
        name,
        positive: stats.positive,
        negative: stats.negative,
        total: stats.positive + stats.negative,
      }))
      .sort((a, b) => b.total - a.total);

    const top5 = sorted.slice(0, 5);
    
    // Ensure Unknown is included if it exists
    const hasUnknown = top5.some(item => item.name === 'Unknown');
    if (!hasUnknown) {
      const unknown = sorted.find(item => item.name === 'Unknown');
      if (unknown) {
        top5.push(unknown);
      }
    }

    return top5;
  };

  const data = generateTopIssuesData();
  const unknownCount = data.find(d => d.name === 'Unknown')?.total || 0;
  const totalCount = allFeedback.length;
  const unknownPct = totalCount > 0 ? Math.round((unknownCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          Top Issue Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={75} />
            <Tooltip />
            <Bar dataKey="negative" stackId="a" fill="#f59e0b" name="Negative" />
            <Bar dataKey="positive" stackId="a" fill="#14b8a6" name="Positive" />
          </BarChart>
        </ResponsiveContainer>

        {/* Warning if Unknown dominates */}
        {unknownPct > 30 && (
          <div style={{
            marginTop: 12,
            padding: 8,
            background: '#fffbeb',
            borderRadius: 6,
            fontSize: 11,
            color: '#92400e',
          }}>
            ⚠️ High &lsquo;Unknown&rsquo; ({unknownPct}%) suggests issue type labeling needs improvement.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
