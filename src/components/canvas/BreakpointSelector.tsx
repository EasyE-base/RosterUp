/**
 * Breakpoint Selector
 * Toggle between Desktop/Tablet/Mobile responsive views
 * Auto-resizes viewport and scales transforms
 */

import React from 'react';
import type { Breakpoint } from '@/lib/breakpoints';
import { TYPICAL_WIDTHS } from '@/lib/breakpoints';

interface BreakpointSelectorProps {
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  disabled?: boolean;
}

export function BreakpointSelector({
  currentBreakpoint,
  onBreakpointChange,
  disabled = false,
}: BreakpointSelectorProps) {
  const breakpoints: Array<{
    id: Breakpoint;
    label: string;
    icon: string;
    width: number;
  }> = [
    { id: 'desktop', label: 'Desktop', icon: '🖥️', width: TYPICAL_WIDTHS.desktop },
    { id: 'tablet', label: 'Tablet', icon: '📱', width: TYPICAL_WIDTHS.tablet },
    { id: 'mobile', label: 'Mobile', icon: '📱', width: TYPICAL_WIDTHS.mobile },
  ];

  return (
    <div
      className="breakpoint-selector"
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        padding: 4,
        display: 'flex',
        gap: 4,
      }}
    >
      {breakpoints.map((bp) => {
        const isActive = currentBreakpoint === bp.id;
        return (
          <button
            key={bp.id}
            onClick={() => !disabled && onBreakpointChange(bp.id)}
            disabled={disabled}
            style={{
              padding: '8px 16px',
              backgroundColor: isActive ? '#10b981' : 'transparent',
              color: isActive ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: 6,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isActive) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: 16 }}>{bp.icon}</span>
            <span>{bp.label}</span>
            <span
              style={{
                fontSize: 11,
                opacity: 0.7,
                fontWeight: 400,
              }}
            >
              {bp.width}px
            </span>
          </button>
        );
      })}

      {/* Keyboard shortcut hint */}
      <div
        style={{
          marginLeft: 8,
          paddingLeft: 12,
          borderLeft: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          fontSize: 11,
          color: '#9ca3af',
          gap: 4,
        }}
      >
        <kbd
          style={{
            padding: '2px 6px',
            background: '#f3f4f6',
            borderRadius: 3,
            fontFamily: 'monospace',
          }}
        >
          1
        </kbd>
        <kbd
          style={{
            padding: '2px 6px',
            background: '#f3f4f6',
            borderRadius: 3,
            fontFamily: 'monospace',
          }}
        >
          2
        </kbd>
        <kbd
          style={{
            padding: '2px 6px',
            background: '#f3f4f6',
            borderRadius: 3,
            fontFamily: 'monospace',
          }}
        >
          3
        </kbd>
      </div>
    </div>
  );
}
