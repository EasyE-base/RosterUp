import { useRef, useEffect } from 'react';
import EditableText from '../EditableText';
import DraggableText from '../DraggableText';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { useWebsiteEditor } from '../../../../contexts/WebsiteEditorContext';
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
    variant?: 'default' | 'split' | 'minimal';
    element_overrides?: Record<string, Record<string, string>>;
    element_positions?: Record<string, { x?: number; y?: number; width?: number; height?: number }>;
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
  const { editorState } = useWebsiteEditor();
  const dragModeEnabled = editorState.dragModeEnabled && editMode;
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

  const updateElementPosition = (elementId: string, x: number, y: number) => {
    const positions = content.element_positions || {};
    onUpdate({
      ...content,
      element_positions: {
        ...positions,
        [elementId]: { ...positions[elementId], x, y }
      }
    });
  };

  const updateElementSize = (elementId: string, width: number, height: number) => {
    const positions = content.element_positions || {};
    onUpdate({
      ...content,
      element_positions: {
        ...positions,
        [elementId]: { ...positions[elementId], width, height }
      }
    });
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
        className={`relative ${editMode
          ? 'py-12'
          : content.variant === 'minimal'
            ? 'py-24 flex items-center justify-center'
            : 'min-h-screen flex items-center justify-center overflow-hidden'
          }`}
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

        {/* Animated accent shapes (desktop only) - hidden in minimal variant */}
        {!isMobile && content.variant !== 'minimal' && (
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

        {/* Content - Layout changes based on variant */}
        <div className={`relative z-10 ${theme.spacing.containerMaxWidth} mx-auto ${theme.spacing.sectionPadding}`}>
          {content.variant === 'split' ? (
            // Split Layout - Text on left, visual indicator on right
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-left">
                <ScrollReveal direction="left" delay={0.2} duration={animations.duration / 1000}>
                  <EditableText
                    tagName="h1"
                    initialValue={content.heading}
                    onSave={(val) => updateField('heading', val)}
                    disabled={!editMode}
                    className={`${headingClasses} mb-6`}
                    style={{ color: theme.colors.textInverse }}
                    placeholder="Enter Heading"
                    data-element-id={`${sectionId}-heading`}
                    data-selectable="true"
                    data-element-type="heading"
                    data-section-id={sectionId}
                  />
                </ScrollReveal>

                <ScrollReveal direction="left" delay={0.4} duration={animations.duration / 1000}>
                  <EditableText
                    tagName="p"
                    initialValue={content.subheading}
                    onSave={(val) => updateField('subheading', val)}
                    disabled={!editMode}
                    multiline
                    className={`${subheadingClasses} max-w-xl`}
                    style={{ color: theme.colors.textInverse, opacity: 0.9 }}
                    placeholder="Enter Subheading"
                    data-element-id={`${sectionId}-subheading`}
                    data-selectable="true"
                    data-element-type="text"
                    data-section-id={sectionId}
                  />
                </ScrollReveal>

                {editMode && (
                  <div className="pt-4">
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

              {/* Right side visual element */}
              <ScrollReveal direction="right" delay={0.3} duration={animations.duration / 1000}>
                <div className="relative h-96 lg:h-[500px]">
                  <motion.div
                    className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              </ScrollReveal>
            </div>
          ) : (
            // Default & Minimal Layout - Centered
            <div className={`text-center space-y-8 ${dragModeEnabled ? 'relative min-h-[400px]' : ''} ${content.variant === 'minimal' ? 'max-w-2xl mx-auto' : ''
              }`}>
              {/* Heading */}
              {dragModeEnabled ? (
                <DraggableText
                  id={`${sectionId}-heading`}
                  tagName="h1"
                  initialValue={content.heading}
                  onSave={(val) => updateField('heading', val)}
                  disabled={!editMode}
                  className={`${headingClasses} mb-6`}
                  style={{ color: theme.colors.textInverse }}
                  placeholder="Enter Heading"
                  data-element-id={`${sectionId}-heading`}
                  data-selectable="true"
                  data-element-type="heading"
                  data-section-id={sectionId}
                  sectionId={sectionId}
                  dragEnabled={dragModeEnabled}
                  onPositionChange={(x, y) => updateElementPosition(`${sectionId}-heading`, x, y)}
                  onSizeChange={(w, h) => updateElementSize(`${sectionId}-heading`, w, h)}
                  x={content.element_positions?.[`${sectionId}-heading`]?.x || 50}
                  y={content.element_positions?.[`${sectionId}-heading`]?.y || 50}
                  width={content.element_positions?.[`${sectionId}-heading`]?.width || 600}
                  height={content.element_positions?.[`${sectionId}-heading`]?.height || 'auto'}
                />
              ) : (
                <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
                  <EditableText
                    tagName="h1"
                    initialValue={content.heading}
                    onSave={(val) => updateField('heading', val)}
                    disabled={!editMode}
                    className={`${headingClasses} mb-6`}
                    style={{ color: theme.colors.textInverse }}
                    placeholder="Enter Heading"
                    data-element-id={`${sectionId}-heading`}
                    data-selectable="true"
                    data-element-type="heading"
                    data-section-id={sectionId}
                  />
                </ScrollReveal>
              )}

              {/* Subheading */}
              {dragModeEnabled ? (
                <DraggableText
                  id={`${sectionId}-subheading`}
                  tagName="p"
                  initialValue={content.subheading}
                  onSave={(val) => updateField('subheading', val)}
                  disabled={!editMode}
                  multiline
                  className={`${subheadingClasses} ${content.variant === 'minimal' ? 'max-w-xl' : 'max-w-3xl'
                    } mx-auto`}
                  style={{ color: theme.colors.textInverse, opacity: 0.9 }}
                  placeholder="Enter Subheading"
                  data-element-id={`${sectionId}-subheading`}
                  data-selectable="true"
                  data-element-type="text"
                  data-section-id={sectionId}
                  sectionId={sectionId}
                  dragEnabled={dragModeEnabled}
                  onPositionChange={(x, y) => updateElementPosition(`${sectionId}-subheading`, x, y)}
                  onSizeChange={(w, h) => updateElementSize(`${sectionId}-subheading`, w, h)}
                  x={content.element_positions?.[`${sectionId}-subheading`]?.x || 50}
                  y={content.element_positions?.[`${sectionId}-subheading`]?.y || 150}
                  width={content.element_positions?.[`${sectionId}-subheading`]?.width || 700}
                  height={content.element_positions?.[`${sectionId}-subheading`]?.height || 'auto'}
                />
              ) : (
                <ScrollReveal direction="up" delay={0.4} duration={animations.duration / 1000}>
                  <EditableText
                    tagName="p"
                    initialValue={content.subheading}
                    onSave={(val) => updateField('subheading', val)}
                    disabled={!editMode}
                    multiline
                    className={`${subheadingClasses} ${content.variant === 'minimal' ? 'max-w-xl' : 'max-w-3xl'
                      } mx-auto`}
                    style={{ color: theme.colors.textInverse, opacity: 0.9 }}
                    placeholder="Enter Subheading"
                    data-element-id={`${sectionId}-subheading`}
                    data-selectable="true"
                    data-element-type="text"
                    data-section-id={sectionId}
                  />
                </ScrollReveal>
              )}

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
          )}
        </div>
      </div>
    </SectionWrapper >
  );
}
