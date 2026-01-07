'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import type { SentimentMetrics } from '@/types';

interface SentimentOverviewProps {
  metrics: SentimentMetrics;
}

export function SentimentOverview({ metrics }: SentimentOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <MessageSquare className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalFeedback}</div>
          <p className="text-xs text-gray-500">
            All user feedback collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Positive Rate</CardTitle>
          <ThumbsUp className="h-4 w-4 text-success-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success-700">
            {metrics.positiveRate}%
          </div>
          <p className="text-xs text-gray-500">
            {metrics.positiveCount} thumbs up
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Negative Rate</CardTitle>
          <ThumbsDown className="h-4 w-4 text-danger-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-danger-700">
            {metrics.negativeRate}%
          </div>
          <p className="text-xs text-gray-500">
            {metrics.negativeCount} thumbs down
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

