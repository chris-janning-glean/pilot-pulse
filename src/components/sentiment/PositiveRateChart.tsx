import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PositiveRateChartProps {
  allFeedback: any[];
  timeRange: number;
}

export function PositiveRateChart({ allFeedback, timeRange }: PositiveRateChartProps) {
  const generateRateData = () => {
    const dateGroups = new Map<string, { positive: number; total: number }>();
    const now = new Date();

    // Initialize all dates
    for (let i = 0; i < timeRange; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (timeRange - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      dateGroups.set(dateKey, { positive: 0, total: 0 });
    }

    // Count by date
    allFeedback.forEach((f) => {
      if (f.createTime) {
        const dateKey = f.createTime.split('T')[0];
        const counts = dateGroups.get(dateKey);
        if (counts) {
          counts.total++;
          if (f.sentiment === 'positive') counts.positive++;
        }
      }
    });

    const dataPoints = Array.from(dateGroups.entries()).map(([date, counts]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: counts.total > 0 ? Math.round((counts.positive / counts.total) * 100) : 0,
    }));

    // Calculate 7-day rolling average
    const withRolling = dataPoints.map((point, idx) => {
      const start = Math.max(0, idx - 6);
      const window = dataPoints.slice(start, idx + 1);
      const avg = window.reduce((sum, p) => sum + p.rate, 0) / window.length;
      return { ...point, rolling: Math.round(avg) };
    });

    return withRolling;
  };

  const data = generateRateData();

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          Positive Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip />
            <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} name="Daily Rate" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="rolling" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" name="7-day Avg" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
