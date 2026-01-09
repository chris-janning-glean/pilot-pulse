import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface FeedbackVolumeChartProps {
  allFeedback: any[];
  timeRange: number | null;
}

export function FeedbackVolumeChart({ allFeedback, timeRange }: FeedbackVolumeChartProps) {
  // Generate volume data by day
  const generateVolumeData = () => {
    const dateGroups = new Map<string, { positive: number; negative: number }>();
    const now = new Date();

    // If timeRange is null, use last 30 days for display purposes
    const daysToShow = timeRange ?? 30;

    // Initialize all dates in range
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (daysToShow - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      dateGroups.set(dateKey, { positive: 0, negative: 0 });
    }

    // Count feedback by date
    allFeedback.forEach((f) => {
      if (f.createTime) {
        const dateKey = f.createTime.split('T')[0];
        const counts = dateGroups.get(dateKey);
        if (counts) {
          if (f.sentiment === 'positive') counts.positive++;
          if (f.sentiment === 'negative') counts.negative++;
        }
      }
    });

    // Convert to array
    return Array.from(dateGroups.entries()).map(([date, counts]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      positive: counts.positive,
      negative: counts.negative,
      total: counts.positive + counts.negative,
    }));
  };

  const data = generateVolumeData();

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          Feedback Volume (👍/👎)
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
            <Tooltip />
            <Bar dataKey="positive" stackId="a" fill="#14b8a6" name="Positive" />
            <Bar dataKey="negative" stackId="a" fill="#f59e0b" name="Negative" />
          </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 11, height: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#14b8a6', borderRadius: 2 }} />
            <span style={{ color: '#64748b' }}>Positive</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }} />
            <span style={{ color: '#64748b' }}>Negative</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
