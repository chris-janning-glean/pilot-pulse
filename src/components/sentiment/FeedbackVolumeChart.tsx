import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface FeedbackVolumeChartProps {
  allFeedback: any[];
  timeRange: number;
}

export function FeedbackVolumeChart({ allFeedback, timeRange }: FeedbackVolumeChartProps) {
  // Generate volume data by day
  const generateVolumeData = () => {
    const dateGroups = new Map<string, { positive: number; negative: number }>();
    const now = new Date();

    // Initialize all dates in range
    for (let i = 0; i < timeRange; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (timeRange - 1 - i));
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
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="positive" stackId="a" fill="#14b8a6" name="Positive" />
            <Bar dataKey="negative" stackId="a" fill="#f59e0b" name="Negative" />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
