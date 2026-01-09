import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface UniqueRatersChartProps {
  allFeedback: any[];
  timeRange: number | null;
}

export function UniqueRatersChart({ allFeedback, timeRange }: UniqueRatersChartProps) {
  const generateData = () => {
    const dateGroups = new Map<string, Set<string>>();
    const now = new Date();

    // If timeRange is null, use last 30 days for display purposes
    const daysToShow = timeRange ?? 30;

    // Initialize dates
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (daysToShow - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      dateGroups.set(dateKey, new Set());
    }

    // Count unique users per date
    allFeedback.forEach((f) => {
      if (f.createTime && f.user) {
        const dateKey = f.createTime.split('T')[0];
        const users = dateGroups.get(dateKey);
        if (users) {
          users.add(f.user);
        }
      }
    });

    return Array.from(dateGroups.entries()).map(([date, users]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: users.size,
    }));
  };

  const data = generateData();

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          Unique Raters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
