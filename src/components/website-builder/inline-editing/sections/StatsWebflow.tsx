import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import { spacing, typography, colors } from '../../../../lib/designTokens';

interface Stat {
  number: string;
  label: string;
  suffix?: string;
}

interface StatsWebflowProps {
  content: {
    section_title?: string;
    stats: Stat[];
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

/**
 * Webflow-Style Stats/Metrics Section
 *
 * Features:
 * - 4-column grid with large numbers
 * - Animated counter effect
 * - Generous padding and spacing
 * - Brand color accents
 * - Professional typography
 */
export default function StatsWebflow({
  content,
  styles = {},
  editMode,
  onUpdate,
  onDuplicate,
  onDelete,
  onSettings,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: StatsWebflowProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const newStats = [...(content.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    updateField('stats', newStats);
  };

  // Default stats if none exist
  const stats = content.stats?.length ? content.stats : [
    { number: '10', suffix: 'K+', label: 'Active Users' },
    { number: '95', suffix: '%', label: 'Satisfaction Rate' },
    { number: '500', suffix: '+', label: 'Projects Completed' },
    { number: '24', suffix: '/7', label: 'Support Available' },
  ];

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Stats - Webflow"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        className="relative bg-slate-900"
        style={{
          paddingTop: spacing.section.md,    // 80px
          paddingBottom: spacing.section.md, // 80px
          ...styles,
        }}
      >
        <div className="max-w-7xl mx-auto px-12">
          {/* Optional Section Title */}
          {content.section_title && (
            <div className="text-center mb-16">
              <InlineEditor
                value={content.section_title}
                onChange={(val) => updateField('section_title', val)}
                type="heading"
                editMode={editMode}
                className="text-white"
                style={{
                  fontSize: typography.sizes['heading-lg'],    // 48px
                  fontWeight: typography.weights.black,         // 900
                }}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                stat={stat}
                index={index}
                editMode={editMode}
                updateStat={updateStat}
              />
            ))}
          </div>

          {/* Add Stat Button (Edit Mode) */}
          {editMode && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  const newStats = [...stats, {
                    number: '100',
                    suffix: '+',
                    label: 'New Metric'
                  }];
                  updateField('stats', newStats);
                }}
                className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                + Add Stat
              </button>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

/**
 * Individual Stat Card with animated counter
 */
function StatCard({
  stat,
  index,
  editMode,
  updateStat,
}: {
  stat: Stat;
  index: number;
  editMode: boolean;
  updateStat: (index: number, field: keyof Stat, value: string) => void;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const targetNumber = parseInt(stat.number) || 0;

  // Animate counter on scroll into view
  useEffect(() => {
    if (!hasAnimated && !editMode) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);

            const duration = 2000; // 2 seconds
            const steps = 60;
            const increment = targetNumber / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= targetNumber) {
                setCount(targetNumber);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);

            return () => clearInterval(timer);
          }
        },
        { threshold: 0.5 }
      );

      const element = document.getElementById(`stat-${index}`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [hasAnimated, editMode, targetNumber, index]);

  return (
    <motion.div
      id={`stat-${index}`}
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Number */}
      <div className="mb-4">
        {editMode ? (
          <div className="flex items-center justify-center gap-1">
            <InlineEditor
              value={stat.number}
              onChange={(val) => updateStat(index, 'number', val)}
              type="text"
              editMode={editMode}
              className="text-white inline-block"
              style={{
                fontSize: typography.sizes['display-lg'],    // 80px
                fontWeight: typography.weights.black,         // 900
                lineHeight: typography.lineHeights.none,      // 1
              }}
            />
            {stat.suffix && (
              <InlineEditor
                value={stat.suffix}
                onChange={(val) => updateStat(index, 'suffix', val)}
                type="text"
                editMode={editMode}
                className="inline-block"
                style={{
                  fontSize: typography.sizes['heading-lg'],    // 48px
                  fontWeight: typography.weights.bold,
                  color: colors.brand.primary,
                  lineHeight: typography.lineHeights.none,
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <span
              className="text-white"
              style={{
                fontSize: typography.sizes['display-lg'],    // 80px
                fontWeight: typography.weights.black,         // 900
                lineHeight: typography.lineHeights.none,      // 1
              }}
            >
              {count.toLocaleString()}
            </span>
            {stat.suffix && (
              <span
                style={{
                  fontSize: typography.sizes['heading-lg'],    // 48px
                  fontWeight: typography.weights.bold,
                  color: colors.brand.primary,
                  lineHeight: typography.lineHeights.none,
                }}
              >
                {stat.suffix}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Label */}
      <InlineEditor
        value={stat.label}
        onChange={(val) => updateStat(index, 'label', val)}
        type="text"
        editMode={editMode}
        className="text-slate-400"
        style={{
          fontSize: typography.sizes.lg,                   // 18px
          fontWeight: typography.weights.medium,            // 500
          letterSpacing: typography.letterSpacing.wide,    // 0.025em
          textTransform: 'uppercase',
        }}
      />
    </motion.div>
  );
}
