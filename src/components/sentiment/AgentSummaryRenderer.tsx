import React from 'react';

interface AgentSummaryRendererProps {
  sections: any[];
  variant: 'negative' | 'positive' | 'neutral';
}

export function AgentSummaryRenderer({ sections, variant }: AgentSummaryRendererProps) {
  // Color scheme based on variant
  const colors = {
    negative: {
      accent: '#f59e0b',
      heading: '#92400e',
      chip: 'rgba(254, 243, 199, 0.6)',
      chipBorder: '#fbbf24',
    },
    positive: {
      accent: '#14b8a6',
      heading: '#065f46',
      chip: 'rgba(209, 250, 229, 0.6)',
      chipBorder: '#6ee7b7',
    },
    neutral: {
      accent: '#6366f1',
      heading: '#4338ca',
      chip: 'rgba(224, 231, 255, 0.6)',
      chipBorder: '#818cf8',
    },
  };

  const scheme = colors[variant];

  // Group sections by headings
  const groupedSections: Array<{ heading: string; paragraphs: string[] }> = [];
  let currentGroup: { heading: string; paragraphs: string[] } | null = null;

  sections.forEach((section) => {
    if (!section || !section.text) return;

    if (section.type === 'heading') {
      // Start new group
      if (currentGroup) {
        groupedSections.push(currentGroup);
      }
      currentGroup = { heading: section.text, paragraphs: [] };
    } else if (section.type === 'paragraph') {
      if (currentGroup) {
        currentGroup.paragraphs.push(section.text);
      } else {
        // Paragraph before first heading - create implicit group
        currentGroup = { heading: '', paragraphs: [section.text] };
      }
    }
  });

  // Push last group
  if (currentGroup) {
    groupedSections.push(currentGroup);
  }

  // Extract TL;DR from first paragraph
  const firstParagraph = groupedSections[0]?.paragraphs[0] || '';
  const tldrChips = firstParagraph
    ? [firstParagraph.substring(0, 80)]
    : [];

  // Check if any heading mentions "Representative Comments"
  const hasRepComments = groupedSections.some(g => 
    g.heading.toLowerCase().includes('representative') || 
    g.heading.toLowerCase().includes('comment')
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Grouped Sections (NO TL;DR in panels) */}
      {groupedSections.slice(0, 3).map((group, idx) => {
        const isRepComments = group.heading.toLowerCase().includes('representative') || 
                              group.heading.toLowerCase().includes('comment') ||
                              group.heading.toLowerCase().includes('example');

        return (
          <div 
            key={idx} 
            style={{ 
              borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none',
              paddingTop: idx > 0 ? 12 : 0
            }}
          >
            {/* Section Heading (NOT <h2>) */}
            {group.heading && (
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: scheme.heading,
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}>
                {group.heading}
              </div>
            )}

            {/* Section Content */}
            {isRepComments ? (
              // Render as quote blocks
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.paragraphs.slice(0, 3).map((para, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      background: 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: 13,
                      color: '#475569',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    {para.substring(0, 150)}{para.length > 150 ? '...' : ''}
                  </div>
                ))}
              </div>
            ) : (
              // Render as normal paragraphs
              <div>
                {group.paragraphs.slice(0, 4).map((para, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      fontSize: 15,
                      color: '#475569',
                      lineHeight: 1.7,
                      marginBottom: 8,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
