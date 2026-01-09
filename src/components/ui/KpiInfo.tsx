import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface KpiInfoProps {
  title: string;
  body: string[];
  sampleSize?: number;
}

export function KpiInfo({ title, body, sampleSize }: KpiInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate position to ensure tooltip stays in viewport
  useEffect(() => {
    if (isVisible && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current.offsetHeight;
      const spaceAbove = buttonRect.top;
      const spaceBelow = window.innerHeight - buttonRect.bottom;

      // Show below if not enough space above
      if (spaceAbove < tooltipHeight + 10 && spaceBelow > tooltipHeight + 10) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label={`Information about ${title}`}
        style={{
          height: 20,
          width: 20,
          borderRadius: '50%',
          border: '1px solid #e2e8f0',
          background: 'white',
          color: '#64748b',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          transition: 'all 0.15s',
          outline: 'none',
          padding: 0,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#f8fafc';
          e.currentTarget.style.color = '#475569';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.color = '#64748b';
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.outline = '2px solid #c7d2fe';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        <Info size={12} />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'top' 
              ? { bottom: '100%', marginBottom: 8 }
              : { top: '100%', marginTop: 8 }
            ),
            width: 300,
            maxWidth: '90vw',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: 12,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {/* Title */}
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#0f172a',
            marginBottom: 8,
          }}>
            {title}
          </div>

          {/* Body */}
          <div style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: '#475569',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {body.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
            
            {/* Sample size if provided */}
            {sampleSize !== undefined && (
              <div style={{
                marginTop: 4,
                paddingTop: 8,
                borderTop: '1px solid #f1f5f9',
                fontSize: 11,
                color: '#64748b',
              }}>
                Window sample size: n={sampleSize}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
