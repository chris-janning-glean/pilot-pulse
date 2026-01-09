import React from 'react';
import { Card } from '@/components/ui/Card';
import { KpiInfo } from '@/components/ui/KpiInfo';
import { MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Users, Repeat, Trophy, Smile, AlertTriangle, Sparkles, Flag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPIStripProps {
  metrics: {
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    positiveRate: number;
    negativeRate: number;
    positiveRateDelta?: number;
    uniqueRaters?: number;
    repeatRaters?: number;
  };
  priorMetrics?: {
    totalFeedback: number;
    positiveCount?: number;
    negativeCount?: number;
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

  // Calculate positive and negative deltas
  const positiveCountDelta = priorMetrics && priorMetrics.positiveCount && priorMetrics.positiveCount > 0
    ? ((metrics.positiveCount - priorMetrics.positiveCount) / priorMetrics.positiveCount) * 100
    : undefined;

  const negativeCountDelta = priorMetrics && priorMetrics.negativeCount && priorMetrics.negativeCount > 0
    ? ((metrics.negativeCount - priorMetrics.negativeCount) / priorMetrics.negativeCount) * 100
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

  // KPI definitions with tooltip content
  const kpis: Array<{
    icon: any;
    iconColor: string;
    label: string;
    value: any;
    fullValue?: string;
    subtext: string;
    delta?: number;
    isPercentagePoints?: boolean;
    onClick?: () => void;
    isEmail?: boolean;
    smallValue?: boolean;
    infoTooltip?: {
      title: string;
      body: string[];
      sampleSize?: number;
    };
  }> = [
    {
      icon: MessageSquare,
      iconColor: '#6366f1',
      label: 'Total Feedback',
      value: metrics.totalFeedback.toLocaleString(),
      subtext: 'in selected period',
      delta: totalFeedbackDelta,
      infoTooltip: {
        title: 'Total Feedback',
        body: [
          'Total number of feedback ratings (👍 + 👎) in the selected time window.',
          'Computed from merged positive + negative datasets after date filtering.',
          'Delta compares to the immediately prior window of the same length.',
        ],
        sampleSize: metrics.totalFeedback,
      },
    },
    {
      icon: ThumbsUp,
      iconColor: '#10b981',
      label: 'Positive Feedback',
      value: (
        <span>
          {metrics.positiveCount.toLocaleString()}{' '}
          <span style={{ color: '#10b981' }}>({Math.round(metrics.positiveRate)}%)</span>
        </span>
      ),
      subtext: '👍 ratings received',
      delta: positiveCountDelta,
      infoTooltip: {
        title: 'Positive Feedback',
        body: [
          'Total number of positive (👍) ratings in the selected time window.',
          'Percentage shows positive rate: (positive / total) × 100.',
          'Delta compares count to the immediately prior window of the same length.',
        ],
        sampleSize: metrics.positiveCount,
      },
    },
    {
      icon: ThumbsDown,
      iconColor: '#f59e0b',
      label: 'Negative Feedback',
      value: (
        <span>
          {metrics.negativeCount.toLocaleString()}{' '}
          <span style={{ color: '#f59e0b' }}>({Math.round(metrics.negativeRate)}%)</span>
        </span>
      ),
      subtext: '👎 ratings received',
      delta: negativeCountDelta,
      infoTooltip: {
        title: 'Negative Feedback',
        body: [
          'Total number of negative (👎) ratings in the selected time window.',
          'Percentage shows negative rate: (negative / total) × 100.',
          'Delta compares count to the immediately prior window of the same length.',
        ],
        sampleSize: metrics.negativeCount,
      },
    },
    {
      icon: Users,
      iconColor: '#06b6d4',
      label: 'Unique Raters',
      value: (metrics.uniqueRaters || 0) > 0 ? (metrics.uniqueRaters || 0).toLocaleString() : '—',
      subtext: (metrics.uniqueRaters || 0) > 0 ? 'distinct users' : 'insufficient data',
      delta: uniqueRatersDelta,
      infoTooltip: {
        title: 'Unique Raters',
        body: [
          'Number of distinct users who submitted feedback in this window.',
          'Computed from distinct normalized emails (trim + lowercase).',
          'Null/empty emails are ignored; if email data is missing, this may be \'—\'.',
        ],
        sampleSize: metrics.uniqueRaters,
      },
    },
    {
      icon: Repeat,
      iconColor: '#f59e0b',
      label: 'Repeat Raters',
      value: (metrics.repeatRaters || 0) > 0 ? (metrics.repeatRaters || 0).toLocaleString() : '—',
      subtext: (metrics.repeatRaters || 0) > 0 ? 'users with 2+ feedback' : 'insufficient data',
      delta: repeatRatersDelta,
      infoTooltip: {
        title: 'Repeat Raters',
        body: [
          'Number of users with 2+ feedback ratings in the selected window.',
          'Requires valid user emails; null/empty emails are ignored.',
          'Delta compares to the prior window.',
        ],
        sampleSize: metrics.repeatRaters,
      },
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
      infoTooltip: {
        title: 'Most Active Rater',
        body: [
          'User with the highest total number of ratings (👍 + 👎) in this window.',
          'Sorted by total ratings; ties break by most recent rating.',
          'Clicking filters the table to this user.',
        ],
      },
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
      infoTooltip: {
        title: 'Most Positive User',
        body: [
          'User with the highest positive rate in this window (with minimum sample size).',
          'Eligibility: users with ≥2 ratings (configurable).',
          'Shown as: total ratings + positive rate.',
        ],
      },
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
      infoTooltip: {
        title: 'Most Negative User',
        body: [
          'User with the highest negative rate in this window (with minimum sample size).',
          'Eligibility: users with ≥2 ratings (configurable).',
          'Shown as: total ratings + negative rate.',
        ],
      },
    },
    {
      icon: Sparkles,
      iconColor: '#14b8a6',
      label: 'Top Positive Term',
      value: topPositiveTerm 
        ? (topPositiveTerm.phrase.length > 30 
            ? topPositiveTerm.phrase.substring(0, 30) + '...' 
            : topPositiveTerm.phrase)
        : '—',
      fullValue: topPositiveTerm?.phrase,
      subtext: topPositiveTerm ? `n=${topPositiveTerm.frequency} mentions` : 'no data',
      onClick: topPositiveTerm && onFilterPhrase ? () => onFilterPhrase(topPositiveTerm.phrase, 'positive') : undefined,
      smallValue: true,
      infoTooltip: {
        title: 'Top Positive Term',
        body: [
          'Most frequent phrase from the positive tag cloud in this window.',
          'Frequency is based on extracted phrases from comments.',
          'Clicking can filter the table/search for this phrase.',
        ],
      },
    },
    {
      icon: Flag,
      iconColor: '#f59e0b',
      label: 'Top Negative Term',
      value: topNegativeTerm 
        ? (topNegativeTerm.phrase.length > 30 
            ? topNegativeTerm.phrase.substring(0, 30) + '...' 
            : topNegativeTerm.phrase)
        : '—',
      fullValue: topNegativeTerm?.phrase,
      subtext: topNegativeTerm ? `n=${topNegativeTerm.frequency} mentions` : 'no data',
      onClick: topNegativeTerm && onFilterPhrase ? () => onFilterPhrase(topNegativeTerm.phrase, 'negative') : undefined,
      smallValue: true,
      infoTooltip: {
        title: 'Top Negative Term',
        body: [
          'Most frequent phrase from the negative tag cloud in this window.',
          'Frequency is based on extracted phrases from comments.',
          'Clicking can filter the table/search for this phrase.',
        ],
      },
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
            title={kpi.fullValue || undefined}
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
                position: 'relative',
              }}
            >
            {/* Info Icon - Top Right Corner */}
            {kpi.infoTooltip && (
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <KpiInfo
                  title={kpi.infoTooltip.title}
                  body={kpi.infoTooltip.body}
                  sampleSize={kpi.infoTooltip.sampleSize}
                />
              </div>
            )}
            
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minHeight: 34 }}>
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
