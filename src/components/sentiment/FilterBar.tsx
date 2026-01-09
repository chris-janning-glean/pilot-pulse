import React from 'react';

interface FilterBarProps {
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  sentimentFilter: 'all' | 'positive' | 'negative';
  setSentimentFilter: (val: 'all' | 'positive' | 'negative') => void;
  issueTypeFilter: string;
  setIssueTypeFilter: (val: string) => void;
  issueTypes: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function FilterBar({
  searchFilter,
  setSearchFilter,
  sentimentFilter,
  setSentimentFilter,
  issueTypeFilter,
  setIssueTypeFilter,
  issueTypes,
  hasActiveFilters,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
        Table Filters (affects table only)
      </div>
      <div style={{ 
        display: 'flex', 
        gap: 12,
        padding: 16,
        background: '#f8fafc',
        borderRadius: 8,
        border: '1px solid #e2e8f0'
      }}>
          {/* Search Input */}
        <input
          type="text"
          placeholder="Search comments, users, or issues..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 14,
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            outline: 'none',
          }}
        />

        {/* Sentiment Toggle */}
        <div style={{ display: 'flex', gap: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: 3, background: 'white' }}>
          {(['all', 'positive', 'negative'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSentimentFilter(filter)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                background: sentimentFilter === filter ? '#6366f1' : 'transparent',
                color: sentimentFilter === filter ? 'white' : '#64748b',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {filter === 'all' ? 'All' : filter === 'positive' ? '👍 Positive' : '👎 Negative'}
            </button>
          ))}
        </div>

        {/* Issue Type Filter */}
        <select
          value={issueTypeFilter}
          onChange={(e) => setIssueTypeFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            fontSize: 14,
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            background: 'white',
            color: '#334155',
            minWidth: 160,
          }}
        >
        <option value="all">All Issues</option>
        {issueTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              background: 'white',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
