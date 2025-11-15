/**
 * AnimatedStat Component
 * Displays an animated counter that counts up when scrolled into view
 */

import { useCountUp } from '../../hooks/useCountUp';

export interface AnimatedStatProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  labelClassName?: string;
}

export default function AnimatedStat({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  className = '',
  labelClassName = '',
}: AnimatedStatProps) {
  const { ref, formattedValue } = useCountUp({
    end: value,
    duration,
    decimals,
    prefix,
    suffix,
    separator: ',',
  });

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <div className="text-4xl md:text-5xl font-bold mb-2">{formattedValue}</div>
      <div className={`text-sm md:text-base uppercase tracking-wide ${labelClassName}`}>
        {label}
      </div>
    </div>
  );
}
