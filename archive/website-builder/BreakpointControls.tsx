/**
 * Breakpoint Controls - Device size switcher for responsive editing
 */

import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Breakpoint, BREAKPOINTS } from '../../lib/responsiveStyleManager';

interface BreakpointControlsProps {
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
}

export default function BreakpointControls({
  currentBreakpoint,
  onBreakpointChange,
}: BreakpointControlsProps) {
  const breakpoints: Breakpoint[] = ['desktop', 'tablet', 'mobile'];

  const getIcon = (breakpoint: Breakpoint) => {
    switch (breakpoint) {
      case 'desktop':
        return Monitor;
      case 'tablet':
        return Tablet;
      case 'mobile':
        return Smartphone;
    }
  };

  return (
    <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
      {breakpoints.map((breakpoint) => {
        const Icon = getIcon(breakpoint);
        const config = BREAKPOINTS[breakpoint];
        const isActive = currentBreakpoint === breakpoint;

        return (
          <button
            key={breakpoint}
            onClick={() => onBreakpointChange(breakpoint)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
              isActive
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-white hover:bg-white/20'
            }`}
            title={`${config.label} (${config.width}x${config.height})`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">
              {config.label}
            </span>
            <span className="text-xs text-slate-500 hidden md:inline">
              {config.width}px
            </span>
          </button>
        );
      })}
    </div>
  );
}
