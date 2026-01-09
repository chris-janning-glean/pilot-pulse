import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PositiveRateChartProps {
  allFeedback: any[];
  timeRange: number | null;
}

export function PositiveRateChart({ allFeedback, timeRange }: PositiveRateChartProps) {
  const [showPositive, setShowPositive] = useState(true);
  const generateRateData = () => {
    const dateGroups = new Map<string, { positive: number; total: number }>();
    const now = new Date();

    // If timeRange is null, use last 30 days for display purposes
    const daysToShow = timeRange ?? 30;

    // Build continuous date series for ALL days in window
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (daysToShow - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      dateGroups.set(dateKey, { positive: 0, total: 0 });
    }

    // Count feedback by date
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

    // Build data points with continuous dates
    const dataPoints = Array.from(dateGroups.entries()).map(([date, counts]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      positiveRate: counts.total > 0 ? Math.round((counts.positive / counts.total) * 100) : null,
      negativeRate: counts.total > 0 ? Math.round(((counts.total - counts.positive) / counts.total) * 100) : null,
      positive: counts.positive,
      negative: counts.total - counts.positive,
      total: counts.total,
      lowSample: counts.total > 0 && counts.total < 3,
    }));

    // Calculate rolling averages with variable window (starts as soon as there's data)
    const withRolling = dataPoints.map((point, idx) => {
      // Get last up-to-7 days with valid data (total > 0)
      const validPositiveRates: number[] = [];
      const validNegativeRates: number[] = [];
      
      for (let j = Math.max(0, idx - 6); j <= idx; j++) {
        if (dataPoints[j].total > 0 && dataPoints[j].positiveRate !== null) {
          validPositiveRates.push(dataPoints[j].positiveRate!);
          validNegativeRates.push(dataPoints[j].negativeRate!);
        }
      }
      
      const rollingPositive = validPositiveRates.length > 0
        ? Math.round(validPositiveRates.reduce((sum, r) => sum + r, 0) / validPositiveRates.length)
        : null;
        
      const rollingNegative = validNegativeRates.length > 0
        ? Math.round(validNegativeRates.reduce((sum, r) => sum + r, 0) / validNegativeRates.length)
        : null;
      
      return { ...point, rollingPositive, rollingNegative, rollingWindow: validPositiveRates.length };
    });

    return withRolling;
  };

  const data = generateRateData();

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardTitle style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
            Sentiment Rate
          </CardTitle>
          
          {/* Toggle Buttons */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setShowPositive(true)}
              style={{
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 500,
                color: showPositive ? '#ffffff' : '#10b981',
                backgroundColor: showPositive ? '#10b981' : '#ffffff',
                border: '1px solid #10b981',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              👍 Positive
            </button>
            <button
              onClick={() => setShowPositive(false)}
              style={{
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 500,
                color: !showPositive ? '#ffffff' : '#f59e0b',
                backgroundColor: !showPositive ? '#f59e0b' : '#ffffff',
                border: '1px solid #f59e0b',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              👎 Negative
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: showPositive ? '% Positive' : '% Negative', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
            <Tooltip 
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const data = payload[0].payload;
                if (!data.total || data.total === 0) return null;
                return (
                  <div style={{ background: 'white', padding: 8, border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.label}</div>
                    <div>👍 Positive: {data.positive} ({data.positiveRate}%)</div>
                    <div>👎 Negative: {data.negative} ({data.negativeRate}%)</div>
                    <div style={{ marginTop: 4 }}>Total: {data.total}</div>
                    {data.lowSample && (
                      <div style={{ marginTop: 4, fontSize: 10, color: '#f59e0b' }}>⚠️ Low sample (n={data.total})</div>
                    )}
                  </div>
                );
              }}
            />
            {showPositive ? (
              <>
                {/* Positive Rate Lines */}
                <Line 
                  type="monotone" 
                  dataKey="rollingPositive" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="7-day Avg" 
                  dot={false}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="positiveRate" 
                  stroke="#86efac" 
                  strokeWidth={1} 
                  name="Daily Rate" 
                  dot={(props: any) => {
                    if (!props.payload || props.payload.lowSample) {
                      return <circle cx={props.cx} cy={props.cy} r={2} fill="#10b981" opacity={0.5} />;
                    }
                    return <circle cx={props.cx} cy={props.cy} r={3} fill="#10b981" />;
                  }}
                  connectNulls
                />
              </>
            ) : (
              <>
                {/* Negative Rate Lines */}
                <Line 
                  type="monotone" 
                  dataKey="rollingNegative" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  name="7-day Avg" 
                  dot={false}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="negativeRate" 
                  stroke="#fcd34d" 
                  strokeWidth={1} 
                  name="Daily Rate" 
                  dot={(props: any) => {
                    if (!props.payload || props.payload.lowSample) {
                      return <circle cx={props.cx} cy={props.cy} r={2} fill="#f59e0b" opacity={0.5} />;
                    }
                    return <circle cx={props.cx} cy={props.cy} r={3} fill="#f59e0b" />;
                  }}
                  connectNulls
                />
              </>
            )}
          </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 11, height: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 3, background: showPositive ? '#10b981' : '#f59e0b' }} />
            <span style={{ color: '#64748b' }}>7-day Rolling Average</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 2, background: showPositive ? '#86efac' : '#fcd34d' }} />
            <span style={{ color: '#64748b' }}>Daily {showPositive ? '% Positive' : '% Negative'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
