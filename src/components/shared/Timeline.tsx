import { CheckCircle, Award, Trophy } from 'lucide-react';
import { ReactNode } from 'react';

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon?: ReactNode;
  iconColor?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact';
}

export default function Timeline({ items, variant = 'default' }: TimelineProps) {
  if (items.length === 0) return null;

  const getDefaultIcon = () => <CheckCircle className="w-5 h-5" />;

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const iconColor = item.iconColor || 'rgb(0,113,227)';

        return (
          <div key={index} className="flex gap-4">
            {/* Timeline Line & Icon */}
            <div className="flex flex-col items-center">
              {/* Icon Circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${iconColor}15`,
                  color: iconColor,
                }}
              >
                {item.icon || getDefaultIcon()}
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className="w-0.5 flex-1 mt-2 min-h-[40px]"
                  style={{ backgroundColor: `${iconColor}30` }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: iconColor }}
              >
                {item.year}
              </div>
              <h3 className="font-bold text-[rgb(29,29,31)] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[rgb(134,142,150)] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compact variant for smaller displays
export function CompactTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-3 bg-[rgb(247,247,249)] rounded-lg border border-slate-200"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-[rgb(0,113,227)]">
              {item.year}
            </span>
            {item.icon && (
              <div className="w-6 h-6 bg-[rgb(0,113,227)]/10 rounded-full flex items-center justify-center">
                {item.icon}
              </div>
            )}
          </div>
          <h4 className="text-sm font-bold text-[rgb(29,29,31)] mb-1">
            {item.title}
          </h4>
          <p className="text-xs text-[rgb(134,142,150)]">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
