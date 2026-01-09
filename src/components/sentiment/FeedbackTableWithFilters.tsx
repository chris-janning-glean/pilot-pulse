import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface FeedbackTableProps {
  allFeedback: any[];
  searchFilter: string;
  sentimentFilter: 'all' | 'positive' | 'negative';
  issueTypeFilter: string;
  onRowClick: (feedback: any) => void;
}

const ITEMS_PER_PAGE = 20;

export function FeedbackTableWithFilters({
  allFeedback,
  searchFilter,
  sentimentFilter,
  issueTypeFilter,
  onRowClick,
}: FeedbackTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, sentimentFilter, issueTypeFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          All Feedback ({filteredData.length})
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#475569' }}>
                  ID
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#475569' }}>
                  Date
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, fontSize: 12, color: '#475569' }}>
                  Sentiment
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#475569' }}>
                  User
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#475569' }}>
                  Issue
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#475569', minWidth: 350 }}>
                  Comment
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
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
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500, fontSize: 12 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.ticketKey}
                    </a>
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap', fontSize: 12, color: '#64748b' }}>
                    {item.date || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: 500,
                        background: item.sentiment === 'positive' ? '#d1fae5' : '#fed7aa',
                        color: item.sentiment === 'positive' ? '#065f46' : '#92400e',
                      }}
                    >
                      {item.sentiment === 'positive' ? '👍' : '👎'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: '#334155', fontFamily: 'monospace', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.user || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: '#334155' }}>
                    {item.issueType || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
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

          {filteredData.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No feedback matches your filters
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div style={{ 
            marginTop: 20, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
            </div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
