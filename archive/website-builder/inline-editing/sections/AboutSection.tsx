import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import ScrollReveal from '../../../animations/ScrollReveal';
import AnimatedStat from '../../../animations/AnimatedStat';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';

interface AboutSectionProps {
  sectionId: string;
  content: {
    title: string;
    subtitle: string;
    body: string;
    mission_title: string;
    mission: string;
    stats: Array<{ label: string; value: string }>;
    element_overrides?: Record<string, Record<string, string>>;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function AboutSection({
  sectionId,
  content,
  styles = {},
  editMode,
  onUpdate,
}: AboutSectionProps) {
  const { theme, typography } = useTheme();
  const animations = useThemeAnimations();
  const aboutRef = useRef<HTMLDivElement>(null);

  // Apply element style overrides on mount and when content changes
  useEffect(() => {
    const elementOverrides = content.element_overrides;
    if (aboutRef.current && elementOverrides) {
      applyElementOverrides(aboutRef.current, elementOverrides);
    }
  }, [content.element_overrides]);

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    const newStats = [...(content.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    updateField('stats', newStats);
  };

  const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'sm', 'semibold');
  const bodyClasses = getBodyClasses(typography, 'lg', 'normal');

  return (
    <div
      ref={aboutRef}
      className={`${theme.spacing.sectionPadding} relative`}
      style={{
        backgroundColor: theme.colors.backgroundAlt,
        ...styles,
      }}
    >
      <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
        <div className="space-y-12">
          {/* Title */}
          <ScrollReveal direction="up" delay={0.1} duration={animations.duration / 1000}>
            <div className="text-center space-y-3">
              {editMode ? (
                <>
                  <InlineEditor
                    value={content.subtitle}
                    onChange={(val) => updateField('subtitle', val)}
                    type="text"
                    editMode={editMode}
                    className={`${subheadingClasses} uppercase tracking-wider mb-3`}
                    style={{ color: theme.colors.accent }}
                  />
                  <InlineEditor
                    value={content.title}
                    onChange={(val) => updateField('title', val)}
                    type="heading"
                    editMode={editMode}
                    className={headingClasses}
                    style={{ color: theme.colors.text }}
                  />
                </>
              ) : (
                <>
                  <p
                    className={`${subheadingClasses} uppercase tracking-wider mb-3`}
                    style={{ color: theme.colors.accent }}
                    data-selectable="true"
                    data-element-id={`${sectionId}-subtitle`}
                    data-element-type="text"
                    data-section-id={sectionId}
                  >
                    {content.subtitle}
                  </p>
                  <h2
                    className={headingClasses}
                    style={{ color: theme.colors.text }}
                    data-selectable="true"
                    data-element-id={`${sectionId}-title`}
                    data-element-type="heading"
                    data-section-id={sectionId}
                  >
                    {content.title}
                  </h2>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* Body */}
          <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
            <div className="max-w-3xl mx-auto">
              {editMode ? (
                <InlineEditor
                  value={content.body}
                  onChange={(val) => updateField('body', val)}
                  type="textarea"
                  editMode={editMode}
                  className={`${bodyClasses} leading-relaxed text-center`}
                  style={{ color: theme.colors.textMuted }}
                />
              ) : (
                <p
                  className={`${bodyClasses} leading-relaxed text-center`}
                  style={{ color: theme.colors.textMuted }}
                  data-selectable="true"
                  data-element-id={`${sectionId}-body`}
                  data-element-type="text"
                  data-section-id={sectionId}
                >
                  {content.body}
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Mission Card */}
          <ScrollReveal direction="up" delay={0.3} duration={animations.duration / 1000}>
            <motion.div
              className="rounded-2xl p-10 max-w-4xl mx-auto"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
                border: `2px solid ${theme.colors.primary}20`,
              }}
              whileHover={{ scale: editMode ? 1 : 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {editMode ? (
                <>
                  <InlineEditor
                    value={content.mission_title}
                    onChange={(val) => updateField('mission_title', val)}
                    type="heading"
                    editMode={editMode}
                    className={`${getHeadingClasses(typography, 'h3', 'bold', 'normal')} mb-4`}
                    style={{ color: theme.colors.primary }}
                  />
                  <InlineEditor
                    value={content.mission}
                    onChange={(val) => updateField('mission', val)}
                    type="textarea"
                    editMode={editMode}
                    className={`${bodyClasses} leading-relaxed`}
                    style={{ color: theme.colors.text }}
                  />
                </>
              ) : (
                <>
                  <h3
                    className={`${getHeadingClasses(typography, 'h3', 'bold', 'normal')} mb-4`}
                    style={{ color: theme.colors.primary }}
                    data-selectable="true"
                    data-element-id={`${sectionId}-mission-title`}
                    data-element-type="heading"
                    data-section-id={sectionId}
                  >
                    {content.mission_title}
                  </h3>
                  <p
                    className={`${bodyClasses} leading-relaxed`}
                    style={{ color: theme.colors.text }}
                    data-selectable="true"
                    data-element-id={`${sectionId}-mission`}
                    data-element-type="text"
                    data-section-id={sectionId}
                  >
                    {content.mission}
                  </p>
                </>
              )}
            </motion.div>
          </ScrollReveal>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {(content.stats || []).map((stat, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={0.4 + index * 0.1}
                duration={animations.duration / 1000}
              >
                <motion.div
                  className="text-center p-6 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.accent}05)`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  whileHover={{ y: editMode ? 0 : -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {editMode ? (
                    <>
                      <InlineEditor
                        value={stat.value}
                        onChange={(val) => updateStat(index, 'value', val)}
                        type="heading"
                        editMode={editMode}
                        className="text-5xl font-bold mb-2"
                        style={{ color: theme.colors.accent }}
                      />
                      <InlineEditor
                        value={stat.label}
                        onChange={(val) => updateStat(index, 'label', val)}
                        type="text"
                        editMode={editMode}
                        className="text-sm uppercase tracking-wide"
                        style={{ color: theme.colors.textMuted }}
                      />
                    </>
                  ) : (
                    <AnimatedStat
                      value={parseInt(stat.value.replace(/\D/g, '')) || 0}
                      label={stat.label}
                      suffix={stat.value.replace(/[0-9]/g, '')}
                      className="space-y-2"
                      labelClassName="text-sm uppercase tracking-wide"
                    />
                  )}
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
