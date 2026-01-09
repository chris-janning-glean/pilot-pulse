import React from 'react';
import { Card } from '@/components/ui/Card';

interface KPIStripProps {
  metrics: {
    totalFeedback: number;
    positiveRate: number;
    positiveRateDelta?: number;
    uniqueRaters?: number;
    repeatRaters?: number;
    topIssueType?: string;
  };
}

export function KPIStrip({ metrics }: KPIStripProps) {
  const kpis = [
    {
      label: 'Total Feedback',
      value: metrics.totalFeedback.toLocaleString(),
      subtext: 'in selected period',
    },
    {
      label: '% Positive',
      value: `${Math.round(metrics.positiveRate)}%`,
      subtext: 'satisfaction rate',
    },
    {
      label: 'Trend vs Prior',
      value: metrics.positiveRateDelta 
        ? `${metrics.positiveRateDelta > 0 ? '+' : ''}${Math.round(metrics.positiveRateDelta)}%`
        : 'N/A',
      subtext: 'period over period',
      isGood: (metrics.positiveRateDelta || 0) > 0,
      isBad: (metrics.positiveRateDelta || 0) < 0,
    },
    {
      label: 'Unique Raters',
      value: (metrics.uniqueRaters || 0).toLocaleString(),
      subtext: 'distinct users',
    },
    {
      label: 'Repeat Raters',
      value: (metrics.repeatRaters || 0).toLocaleString(),
      subtext: 'users with 2+ feedback',
    },
    {
      label: 'Top Issue',
      value: metrics.topIssueType || 'Unknown',
      subtext: 'most common',
    },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(6, 1fr)', 
      gap: 12,
      marginBottom: 24
    }}>
      {kpis.map((kpi, idx) => (
        <Card key={idx} style={{ 
          padding: 16,
          background: 'white',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>
            {kpi.label}
          </div>
          <div style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            color: kpi.isGood ? '#14b8a6' : kpi.isBad ? '#f59e0b' : '#0f172a',
            marginBottom: 2
          }}>
            {kpi.value}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>
            {kpi.subtext}
          </div>
        </Card>
      ))}
    </div>
  );
}
