import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TopIssuesChartProps {
  allFeedback: any[];
}

export function TopIssuesChart({ allFeedback }: TopIssuesChartProps) {
  const generateTopIssuesData = () => {
    const issueStats = new Map<string, { positive: number; negative: number }>();

    // Normalize issue types
    allFeedback.forEach((f) => {
      let issue = (f.issueType || '').trim();
      if (!issue) {
        issue = 'Unknown';
      } else {
        // Normalize: trim extra whitespace, uppercase
        issue = issue.replace(/\s+/g, '_').toUpperCase();
      }
      
      const stats = issueStats.get(issue) || { positive: 0, negative: 0 };
      if (f.sentiment === 'positive') stats.positive++;
      if (f.sentiment === 'negative') stats.negative++;
      issueStats.set(issue, stats);
    });

    // Get top 5 + always include Unknown if present
    const sorted = Array.from(issueStats.entries())
      .map(([name, stats]) => ({
        name,
        displayName: name.length > 20 ? name.substring(0, 18) + '...' : name,
        fullName: name,
        positive: stats.positive,
        negative: stats.negative,
        total: stats.positive + stats.negative,
      }))
      .sort((a, b) => b.total - a.total);

    const top5 = sorted.slice(0, 5);
    
    // Ensure Unknown is included if it exists
    const hasUnknown = top5.some(item => item.name === 'UNKNOWN');
    if (!hasUnknown) {
      const unknown = sorted.find(item => item.name === 'UNKNOWN');
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
          <BarChart data={data} layout="vertical" margin={{ left: 100, right: 10 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis 
              type="category" 
              dataKey="displayName" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              width={95} 
            />
            <Tooltip 
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div style={{ background: 'white', padding: 8, border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.fullName}</div>
                    <div>Negative: {data.negative}</div>
                    <div>Positive: {data.positive}</div>
                    <div>Total: {data.total}</div>
                  </div>
                );
              }}
            />
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
