import React from 'react';
import { Card } from '@/components/ui/Card';
import { MessageSquare, ThumbsUp, TrendingUp, Users, Repeat, Trophy, Smile, AlertTriangle, Sparkles, Flag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPIStripProps {
  metrics: {
    totalFeedback: number;
    positiveRate: number;
    positiveRateDelta?: number;
    uniqueRaters?: number;
    repeatRaters?: number;
  };
  priorMetrics?: {
    totalFeedback: number;
    uniqueRaters: number;
    repeatRaters: number;
  };
  mostActiveRater?: { email: string; count: number };
  mostPositiveUser?: { email: string; count: number; rate: number };
  mostNegativeUser?: { email: string; count: number; rate: number };
  topPositiveTerm?: { phrase: string; frequency: number };
  topNegativeTerm?: { phrase: string; frequency: number };
  onFilterUser?: (email: string) => void;
  onFilterPhrase?: (phrase: string, sentiment: 'positive' | 'negative') => void;
}

export function KPIStrip({
  metrics,
  priorMetrics,
  mostActiveRater,
  mostPositiveUser,
  mostNegativeUser,
  topPositiveTerm,
  topNegativeTerm,
  onFilterUser,
  onFilterPhrase,
}: KPIStripProps) {
  // Helper to abbreviate email
  const abbreviateEmail = (email: string) => {
    const parts = email.split('@');
    return { username: parts[0], domain: parts[1] ? `@${parts[1]}` : '' };
  };

  // Calculate deltas
  const totalFeedbackDelta = priorMetrics && priorMetrics.totalFeedback > 0
    ? ((metrics.totalFeedback - priorMetrics.totalFeedback) / priorMetrics.totalFeedback) * 100
    : undefined;

  const uniqueRatersDelta = priorMetrics && priorMetrics.uniqueRaters > 0
    ? ((metrics.uniqueRaters || 0) - priorMetrics.uniqueRaters) / priorMetrics.uniqueRaters * 100
    : undefined;

  const repeatRatersDelta = priorMetrics && priorMetrics.repeatRaters > 0
    ? ((metrics.repeatRaters || 0) - priorMetrics.repeatRaters) / priorMetrics.repeatRaters * 100
    : undefined;

  // Delta Badge Component
  const DeltaBadge = ({ value, isPercentagePoints }: { value?: number; isPercentagePoints?: boolean }) => {
    if (value === undefined) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 9999,
          border: '1px solid #e2e8f0',
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 500,
          color: '#64748b',
          background: '#f8fafc',
        }} title="No prior data">
          —
        </span>
      );
    }

    const isPositive = value > 0;
    const isNegative = value < 0;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        borderRadius: 9999,
        border: `1px solid ${isPositive ? '#a7f3d0' : isNegative ? '#fecaca' : '#e2e8f0'}`,
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 500,
        color: isPositive ? '#065f46' : isNegative ? '#991b1b' : '#64748b',
        background: isPositive ? '#d1fae5' : isNegative ? '#fee2e2' : '#f8fafc',
      }}>
        {isPositive ? <ArrowUpRight size={10} /> : isNegative ? <ArrowDownRight size={10} /> : null}
        {value > 0 ? '+' : ''}{value.toFixed(1)}{isPercentagePoints ? 'pp' : '%'}
      </span>
    );
  };

  const kpis = [
    {
      icon: MessageSquare,
      iconColor: '#6366f1',
      label: 'Total Feedback',
      value: metrics.totalFeedback.toLocaleString(),
      subtext: 'in selected period',
      delta: totalFeedbackDelta,
      tooltip: `${metrics.totalFeedback} total items`,
    },
    {
      icon: ThumbsUp,
      iconColor: '#14b8a6',
      label: '% Positive',
      value: `${Math.round(metrics.positiveRate)}%`,
      subtext: 'satisfaction rate',
      delta: metrics.positiveRateDelta,
      isPercentagePoints: true,
      tooltip: `${Math.round(metrics.positiveRate)}% positive feedback`,
    },
    {
      icon: TrendingUp,
      iconColor: '#8b5cf6',
      label: 'Trend vs Prior',
      value: metrics.positiveRateDelta !== undefined
        ? `${metrics.positiveRateDelta > 0 ? '+' : ''}${metrics.positiveRateDelta.toFixed(1)}pp`
        : '—',
      subtext: 'period over period',
      tooltip: metrics.positiveRateDelta !== undefined
        ? `${Math.abs(metrics.positiveRateDelta).toFixed(1)} percentage points ${metrics.positiveRateDelta > 0 ? 'up' : 'down'}`
        : 'No prior period data',
    },
    {
      icon: Users,
      iconColor: '#06b6d4',
      label: 'Unique Raters',
      value: (metrics.uniqueRaters || 0) > 0 ? (metrics.uniqueRaters || 0).toLocaleString() : '—',
      subtext: (metrics.uniqueRaters || 0) > 0 ? 'distinct users' : 'insufficient data',
      delta: uniqueRatersDelta,
      tooltip: `${metrics.uniqueRaters || 0} unique users provided feedback`,
    },
    {
      icon: Repeat,
      iconColor: '#f59e0b',
      label: 'Repeat Raters',
      value: (metrics.repeatRaters || 0) > 0 ? (metrics.repeatRaters || 0).toLocaleString() : '—',
      subtext: (metrics.repeatRaters || 0) > 0 ? 'users with 2+ feedback' : 'insufficient data',
      delta: repeatRatersDelta,
      tooltip: `${metrics.repeatRaters || 0} users with multiple submissions`,
    },
    {
      icon: Trophy,
      iconColor: '#eab308',
      label: 'Most Active Rater',
      value: mostActiveRater ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 0, cursor: 'help' }} title={`Full email: ${mostActiveRater.email}`}>
          <span style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 20 }}>
            {abbreviateEmail(mostActiveRater.email).username}
          </span>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>
            {abbreviateEmail(mostActiveRater.email).domain}
          </span>
        </div>
      ) : '—',
      subtext: mostActiveRater ? `${mostActiveRater.count} ratings` : 'no data',
      onClick: mostActiveRater && onFilterUser ? () => onFilterUser(mostActiveRater.email) : undefined,
      isEmail: true,
    },
    {
      icon: Smile,
      iconColor: '#10b981',
      label: 'Most Positive User',
      value: mostPositiveUser ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 0, cursor: 'help' }} title={`Full email: ${mostPositiveUser.email}`}>
          <span style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 20 }}>
            {abbreviateEmail(mostPositiveUser.email).username}
          </span>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>
            {abbreviateEmail(mostPositiveUser.email).domain}
          </span>
        </div>
      ) : '—',
      subtext: mostPositiveUser ? `${mostPositiveUser.count} • ${mostPositiveUser.rate}% positive` : 'no data',
      onClick: mostPositiveUser && onFilterUser ? () => onFilterUser(mostPositiveUser.email) : undefined,
      isEmail: true,
    },
    {
      icon: AlertTriangle,
      iconColor: '#f97316',
      label: 'Most Negative User',
      value: mostNegativeUser ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 0, cursor: 'help' }} title={`Full email: ${mostNegativeUser.email}`}>
          <span style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 20 }}>
            {abbreviateEmail(mostNegativeUser.email).username}
          </span>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>
            {abbreviateEmail(mostNegativeUser.email).domain}
          </span>
        </div>
      ) : '—',
      subtext: mostNegativeUser ? `${mostNegativeUser.count} • ${mostNegativeUser.rate}% negative` : 'no data',
      onClick: mostNegativeUser && onFilterUser ? () => onFilterUser(mostNegativeUser.email) : undefined,
      isEmail: true,
    },
    {
      icon: Sparkles,
      iconColor: '#14b8a6',
      label: 'Top Positive Term',
      value: topPositiveTerm ? topPositiveTerm.phrase : '—',
      subtext: topPositiveTerm ? `n=${topPositiveTerm.frequency} mentions` : 'no data',
      onClick: topPositiveTerm && onFilterPhrase ? () => onFilterPhrase(topPositiveTerm.phrase, 'positive') : undefined,
      tooltip: topPositiveTerm ? `"${topPositiveTerm.phrase}" appears ${topPositiveTerm.frequency} times` : 'No tag data',
      smallValue: true,
    },
    {
      icon: Flag,
      iconColor: '#f59e0b',
      label: 'Top Negative Term',
      value: topNegativeTerm ? topNegativeTerm.phrase : '—',
      subtext: topNegativeTerm ? `n=${topNegativeTerm.frequency} mentions` : 'no data',
      onClick: topNegativeTerm && onFilterPhrase ? () => onFilterPhrase(topNegativeTerm.phrase, 'negative') : undefined,
      tooltip: topNegativeTerm ? `"${topNegativeTerm.phrase}" appears ${topNegativeTerm.frequency} times` : 'No tag data',
      smallValue: true,
    },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
      gap: 16,
      marginBottom: 24
    }}>
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            onClick={kpi.onClick}
            title={kpi.isEmail ? undefined : kpi.tooltip}
            style={{ cursor: kpi.onClick ? 'pointer' : 'default' }}
            onMouseEnter={(e) => {
              if (kpi.onClick && e.currentTarget.firstElementChild) {
                (e.currentTarget.firstElementChild as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                (e.currentTarget.firstElementChild as HTMLElement).style.borderColor = '#6366f1';
              }
            }}
            onMouseLeave={(e) => {
              if (kpi.onClick && e.currentTarget.firstElementChild) {
                (e.currentTarget.firstElementChild as HTMLElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                (e.currentTarget.firstElementChild as HTMLElement).style.borderColor = '#e2e8f0';
              }
            }}
          >
            <Card 
              style={{ 
                padding: 20,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
              }}
            >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Icon Badge */}
              <div style={{
                height: 40,
                width: 40,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color={kpi.iconColor || '#64748b'} />
              </div>

              {/* Label */}
              <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                {kpi.label}
              </div>

              {/* Value + Delta */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ 
                  fontSize: kpi.smallValue ? 18 : (typeof kpi.value === 'string' && !kpi.isEmail ? 28 : 24), 
                  fontWeight: 600, 
                  color: '#0f172a',
                  lineHeight: 1.2,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 0,
                  flex: typeof kpi.value === 'string' ? '0 1 auto' : '1',
                  overflow: 'hidden',
                }}>
                  {kpi.value}
                </div>
                {kpi.delta !== undefined && (
                  <DeltaBadge value={kpi.delta} isPercentagePoints={kpi.isPercentagePoints} />
                )}
              </div>

              {/* Subtext */}
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: -4 }}>
                {kpi.subtext}
              </div>
            </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

// Delta Badge Component
function DeltaBadge({ value, isPercentagePoints }: { value?: number; isPercentagePoints?: boolean }) {
  if (value === undefined) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 9999,
        border: '1px solid #e2e8f0',
        padding: '3px 8px',
        fontSize: 11,
        fontWeight: 500,
        color: '#64748b',
        background: '#f8fafc',
      }} title="No prior data">
        —
      </span>
    );
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      borderRadius: 9999,
      border: `1px solid ${isPositive ? '#a7f3d0' : isNegative ? '#fecaca' : '#e2e8f0'}`,
      padding: '3px 8px',
      fontSize: 11,
      fontWeight: 500,
      color: isPositive ? '#065f46' : isNegative ? '#991b1b' : '#64748b',
      background: isPositive ? '#d1fae5' : isNegative ? '#fee2e2' : '#f8fafc',
    }}>
      {isPositive ? <ArrowUpRight size={10} /> : isNegative ? <ArrowDownRight size={10} /> : null}
      {value > 0 ? '+' : ''}{absValue.toFixed(1)}{isPercentagePoints ? 'pp' : '%'}
    </span>
  );
}
