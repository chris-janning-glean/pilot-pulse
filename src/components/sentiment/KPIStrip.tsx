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
      tooltip: `${metrics.totalFeedback} total items`,
    },
    {
      label: '% Positive',
      value: `${Math.round(metrics.positiveRate)}%`,
      subtext: 'satisfaction rate',
      tooltip: `${Math.round(metrics.positiveRate)}% positive feedback`,
    },
    {
      label: 'Trend vs Prior',
      value: metrics.positiveRateDelta !== undefined
        ? `${metrics.positiveRateDelta > 0 ? '+' : ''}${Math.round(metrics.positiveRateDelta)}%`
        : '—',
      subtext: metrics.positiveRateDelta !== undefined ? 'period over period' : 'no prior data',
      isGood: (metrics.positiveRateDelta || 0) > 0,
      isBad: (metrics.positiveRateDelta || 0) < 0,
      tooltip: metrics.positiveRateDelta !== undefined 
        ? `${metrics.positiveRateDelta > 0 ? 'Up' : 'Down'} ${Math.abs(Math.round(metrics.positiveRateDelta))}% vs prior period`
        : 'No feedback in prior period',
    },
    {
      label: 'Unique Raters',
      value: (metrics.uniqueRaters || 0) > 0 ? (metrics.uniqueRaters || 0).toLocaleString() : '—',
      subtext: (metrics.uniqueRaters || 0) > 0 ? 'distinct users' : 'insufficient data',
      tooltip: (metrics.uniqueRaters || 0) > 0 ? `n=${metrics.uniqueRaters}` : 'User emails missing from feedback',
    },
    {
      label: 'Repeat Raters',
      value: (metrics.repeatRaters || 0) > 0 ? (metrics.repeatRaters || 0).toLocaleString() : '—',
      subtext: (metrics.repeatRaters || 0) > 0 ? 'users with 2+ feedback' : 'insufficient data',
      tooltip: `${metrics.repeatRaters || 0} users with multiple submissions`,
    },
    {
      label: 'Top Issue',
      value: metrics.topIssueType || 'Unknown',
      subtext: 'most common',
      tooltip: `Most common issue type in selected period`,
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
        <div key={idx} title={kpi.tooltip} style={{ cursor: kpi.tooltip ? 'help' : 'default' }}>
          <Card style={{ 
            padding: 16,
            background: 'white',
            border: '1px solid #e2e8f0'
          }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>
            {kpi.label}
          </div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: kpi.isGood ? '#14b8a6' : kpi.isBad ? '#f59e0b' : '#0f172a',
            marginBottom: 4
          }}>
            {kpi.value}
          </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {kpi.subtext}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
