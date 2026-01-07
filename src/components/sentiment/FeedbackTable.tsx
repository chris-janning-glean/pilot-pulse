'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { FeedbackTicket } from '@/types';
import { formatDateTime, getSentimentBadgeColor } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface FeedbackTableProps {
  tickets: FeedbackTicket[];
}

export function FeedbackTable({ tickets }: FeedbackTableProps) {
  const getSentimentVariant = (
    sentiment: string
  ): 'success' | 'danger' | 'secondary' => {
    if (sentiment === 'positive') return 'success';
    if (sentiment === 'negative') return 'danger';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-medium text-gray-700">
                  Ticket
                </th>
                <th className="pb-3 text-left font-medium text-gray-700">
                  User
                </th>
                <th className="pb-3 text-left font-medium text-gray-700">
                  Summary
                </th>
                <th className="pb-3 text-left font-medium text-gray-700">
                  Sentiment
                </th>
                <th className="pb-3 text-left font-medium text-gray-700">
                  Category
                </th>
                <th className="pb-3 text-left font-medium text-gray-700">
                  Date
                </th>
                <th className="pb-3 text-left font-medium text-gray-700">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 font-mono text-xs">{ticket.ticketKey}</td>
                  <td className="py-3 text-gray-600">{ticket.userEmail}</td>
                  <td className="py-3 max-w-md truncate" title={ticket.summary}>
                    {ticket.summary}
                  </td>
                  <td className="py-3">
                    <Badge variant={getSentimentVariant(ticket.sentiment)}>
                      {ticket.sentiment}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-600">{ticket.category}</td>
                  <td className="py-3 text-gray-600">
                    {formatDateTime(ticket.created)}
                  </td>
                  <td className="py-3">
                    <a
                      href={ticket.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No feedback tickets found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

