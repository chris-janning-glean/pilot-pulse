import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface FeedbackTableProps {
  allFeedback: any[];
  searchFilter: string;
  sentimentFilter: 'all' | 'positive' | 'negative';
  issueTypeFilter: string;
  onRowClick: (feedback: any) => void;
}

export function FeedbackTableWithFilters({
  allFeedback,
  searchFilter,
  sentimentFilter,
  issueTypeFilter,
  onRowClick,
}: FeedbackTableProps) {
  // Apply filters
  const filteredData = allFeedback.filter((item) => {
    // Search filter
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      const matchesSearch =
        (item.comments || '').toLowerCase().includes(searchLower) ||
        (item.user || '').toLowerCase().includes(searchLower) ||
        (item.issueType || '').toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      if (item.sentiment !== sentimentFilter) return false;
    }

    // Issue type filter
    if (issueTypeFilter !== 'all') {
      if ((item.issueType || 'Unknown') !== issueTypeFilter) return false;
    }

    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          All Feedback ({filteredData.length})
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                  ID
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                  Date
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                  Sentiment
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                  User
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                  Issue
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#475569', minWidth: 350 }}>
                  Comment
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map((item, index) => (
                <tr
                  key={item.id || index}
                  onClick={() => onRowClick(item)}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    background: index % 2 === 0 ? 'white' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa';
                  }}
                >
                  <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.ticketKey}
                    </a>
                  </td>
                  <td style={{ padding: '14px', whiteSpace: 'nowrap', fontSize: 14, color: '#64748b' }}>
                    {item.date || '-'}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 5,
                        fontSize: 13,
                        fontWeight: 500,
                        background: item.sentiment === 'positive' ? '#d1fae5' : '#fed7aa',
                        color: item.sentiment === 'positive' ? '#065f46' : '#92400e',
                      }}
                    >
                      {item.sentiment === 'positive' ? '👍' : '👎'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontSize: 14, color: '#334155', fontFamily: 'monospace', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.user || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontSize: 14, color: '#334155' }}>
                    {item.issueType || 'Unknown'}
                  </td>
                  <td style={{ padding: '14px', fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.comments || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length > 50 && (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              Showing first 50 of {filteredData.length} results
            </div>
          )}

          {filteredData.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No feedback matches your filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
