'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SentimentTrendPoint } from '@/types';
import { formatDate } from '@/lib/utils';

interface SentimentChartProps {
  data: SentimentTrendPoint[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const formattedData = data.map(point => ({
    ...point,
    date: formatDate(point.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trend</CardTitle>
        <CardDescription>
          Daily feedback sentiment over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="#22c55e"
              strokeWidth={2}
              name="Positive"
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#ef4444"
              strokeWidth={2}
              name="Negative"
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="#6b7280"
              strokeWidth={2}
              name="Neutral"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

