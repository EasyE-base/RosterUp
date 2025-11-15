import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';

interface HeroSectionProps {
  sectionId: string;
  content: {
    heading: string;
    subheading: string;
    cta_text: string;
    cta_link: string;
    background_image?: string;
    element_overrides?: Record<string, Record<string, string>>;
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

export default function HeroSection({
  sectionId,
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
}: HeroSectionProps) {
  const { theme, typography, isMobile } = useTheme();
  const animations = useThemeAnimations();
  const heroRef = useRef<HTMLDivElement>(null);

  // Apply element style overrides on mount and when content changes
  useEffect(() => {
    const elementOverrides = content.element_overrides;
    if (heroRef.current && elementOverrides) {
      applyElementOverrides(heroRef.current, elementOverrides);
    }
  }, [content.element_overrides]);

  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  // Generate typography classes from theme
  const headingClasses = getHeadingClasses(typography, 'h1', 'extrabold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'xl', 'normal');

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Hero Section"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        ref={heroRef}
        className={`relative ${editMode ? 'py-12' : 'min-h-screen flex items-center justify-center overflow-hidden'}`}
        style={{
          backgroundColor: theme.colors.background,
          ...styles,
        }}
      >
      {/* Background Image with subtle animation */}
      {content.background_image && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${content.background_image})`,
            opacity: 0.4,
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      )}

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
          opacity: content.background_image ? 0.85 : 1,
        }}
      />

      {/* Animated accent shapes (desktop only) */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: theme.colors.accent }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: theme.colors.accentLight }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 ${theme.spacing.containerMaxWidth} mx-auto ${theme.spacing.sectionPadding}`}>
        <div className="text-center space-y-8">
          <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
            {editMode ? (
              <InlineEditor
                value={content.heading}
                onChange={(val) => updateField('heading', val)}
                type="heading"
                editMode={editMode}
                className={`${headingClasses} mb-6`}
                style={{ color: theme.colors.textInverse }}
              />
            ) : (
              <h1
                className={`${headingClasses} mb-6`}
                style={{ color: theme.colors.textInverse }}
                data-selectable="true"
                data-element-id={`${sectionId}-heading`}
                data-element-type="heading"
                data-section-id={sectionId}
              >
                {content.heading}
              </h1>
            )}
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4} duration={animations.duration / 1000}>
            {editMode ? (
              <InlineEditor
                value={content.subheading}
                onChange={(val) => updateField('subheading', val)}
                type="text"
                editMode={editMode}
                className={`${subheadingClasses} max-w-3xl mx-auto`}
                style={{ color: theme.colors.textInverse, opacity: 0.9 }}
              />
            ) : (
              <p
                className={`${subheadingClasses} max-w-3xl mx-auto`}
                style={{ color: theme.colors.textInverse, opacity: 0.9 }}
                data-selectable="true"
                data-element-id={`${sectionId}-subheading`}
                data-element-type="text"
                data-section-id={sectionId}
              >
                {content.subheading}
              </p>
            )}
          </ScrollReveal>

          {editMode && (
            <div className="pt-8 max-w-2xl mx-auto">
              <DragDropImageUpload
                value={content.background_image}
                onChange={(url) => updateField('background_image', url)}
                editMode={editMode}
                placeholder="Hero Background Image"
                aspectRatio="video"
                showUnsplash={true}
              />
            </div>
          )}
        </div>
      </div>
      </div>
    </SectionWrapper>
  );
}
