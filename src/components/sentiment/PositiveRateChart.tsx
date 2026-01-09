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
      rate: counts.total > 0 ? Math.round((counts.positive / counts.total) * 100) : null,
      positive: counts.positive,
      negative: counts.total - counts.positive,
      total: counts.total,
      lowSample: counts.total < 3,
    }));

    // Calculate 7-day rolling average
    const withRolling = dataPoints.map((point, idx) => {
      const start = Math.max(0, idx - 6);
      const window = dataPoints.slice(start, idx + 1).filter(p => p.total > 0);
      const avg = window.length > 0 
        ? window.reduce((sum, p) => sum + (p.rate || 0), 0) / window.length 
        : null;
      return { ...point, rolling: avg !== null ? Math.round(avg) : null };
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
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: '% Positive', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
            <Tooltip 
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const data = payload[0].payload;
                if (!data.total || data.total === 0) return null;
                return (
                  <div style={{ background: 'white', padding: 8, border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.label}</div>
                    <div>👍 Positive: {data.positive}</div>
                    <div>👎 Negative: {data.negative}</div>
                    <div>Total: {data.total}</div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>Rate: {data.rate}%</div>
                    {data.lowSample && (
                      <div style={{ marginTop: 4, fontSize: 10, color: '#f59e0b' }}>⚠️ Low sample (n={data.total})</div>
                    )}
                  </div>
                );
              }}
            />
            <Line 
              type="monotone" 
              dataKey="rolling" 
              stroke="#14b8a6" 
              strokeWidth={3} 
              name="7-day Avg" 
              dot={false}
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#cbd5e1" 
              strokeWidth={1} 
              name="Daily Rate" 
              dot={(props: any) => {
                if (!props.payload || props.payload.lowSample) {
                  return <circle cx={props.cx} cy={props.cy} r={2} fill="#f59e0b" opacity={0.5} />;
                }
                return <circle cx={props.cx} cy={props.cy} r={3} fill="#6366f1" />;
              }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 3, background: '#14b8a6' }} />
            <span style={{ color: '#64748b' }}>7-day Rolling Average</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 2, background: '#cbd5e1' }} />
            <span style={{ color: '#64748b' }}>Daily % Positive</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
