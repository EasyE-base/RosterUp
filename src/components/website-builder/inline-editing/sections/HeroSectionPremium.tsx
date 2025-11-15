/**
 * Premium HeroSection Component
 * Features: Video backgrounds, parallax, scroll animations, split layouts
 * Maintains full inline editing compatibility
 */

import InlineEditor from '../InlineEditor';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';

interface HeroSectionPremiumProps {
  content: {
    heading: string;
    subheading: string;
    cta_text: string;
    cta_link: string;
    background_image?: string;
    video_background?: string;
    layout_variant?: 'centered' | 'split' | 'fullscreen';
    enable_parallax?: boolean;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function HeroSectionPremium({
  content,
  styles = {},
  editMode,
  onUpdate,
}: HeroSectionPremiumProps) {
  const { theme, typography, isMobile } = useTheme();
  const animations = useThemeAnimations();

  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  // Get layout variant (default to centered)
  const layout = content.layout_variant || 'centered';
  const enableParallax = content.enable_parallax && !isMobile;

  // Generate typography classes from theme
  const headingClasses = getHeadingClasses(typography, 'h1', 'extrabold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'xl', 'normal');

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: theme.colors.background,
        ...styles,
      }}
    >
      {/* Video Background (if provided) */}
      {content.video_background && !editMode && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.4 }}
          >
            <source src={content.video_background} type="video/mp4" />
          </video>
          <div
            className="absolute inset-0"
            style={{ background: theme.colors.backgroundOverlay }}
          />
        </div>
      )}

      {/* Background Image with optional parallax */}
      {content.background_image && !content.video_background && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${content.background_image})`,
            opacity: 0.5,
            scale: enableParallax ? 1.1 : 1,
          }}
          animate={enableParallax ? { y: [0, -50] } : {}}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
          opacity: content.background_image || content.video_background ? 0.85 : 1,
        }}
      />

      {/* Animated accent shapes */}
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
        {layout === 'centered' && (
          <div className="text-center space-y-8">
            <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
              <InlineEditor
                value={content.heading}
                onChange={(val) => updateField('heading', val)}
                type="heading"
                editMode={editMode}
                className={`${headingClasses} mb-6`}
                style={{ color: theme.colors.textInverse }}
              />
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4} duration={animations.duration / 1000}>
              <InlineEditor
                value={content.subheading}
                onChange={(val) => updateField('subheading', val)}
                type="text"
                editMode={editMode}
                className={`${subheadingClasses} max-w-3xl mx-auto`}
                style={{ color: theme.colors.textInverse, opacity: 0.9 }}
              />
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.6} duration={animations.duration / 1000}>
              <div className="pt-4">
                <motion.div
                  whileHover={{ scale: editMode ? 1 : 1.05 }}
                  whileTap={{ scale: editMode ? 1 : 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <InlineEditor
                    value={content.cta_text}
                    onChange={(val) => updateField('cta_text', val)}
                    type="button"
                    editMode={editMode}
                    className="inline-block px-10 py-5 text-lg font-bold rounded-xl shadow-2xl transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentDark})`,
                      color: theme.colors.textInverse,
                      boxShadow: `0 10px 40px ${theme.colors.accent}40`,
                    }}
                  />
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        )}

        {layout === 'split' && (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left" delay={0.2}>
              <div className="space-y-6">
                <InlineEditor
                  value={content.heading}
                  onChange={(val) => updateField('heading', val)}
                  type="heading"
                  editMode={editMode}
                  className={headingClasses}
                  style={{ color: theme.colors.textInverse }}
                />
                <InlineEditor
                  value={content.subheading}
                  onChange={(val) => updateField('subheading', val)}
                  type="text"
                  editMode={editMode}
                  className={subheadingClasses}
                  style={{ color: theme.colors.textInverse, opacity: 0.9 }}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <InlineEditor
                    value={content.cta_text}
                    onChange={(val) => updateField('cta_text', val)}
                    type="button"
                    editMode={editMode}
                    className="inline-block px-8 py-4 text-base font-semibold rounded-lg"
                    style={{
                      background: theme.colors.accent,
                      color: theme.colors.textInverse,
                    }}
                  />
                </motion.div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.4}>
              <div
                className="aspect-video rounded-2xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: theme.colors.backgroundAlt }}
              >
                {content.background_image && (
                  <img
                    src={content.background_image}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>

      {/* Edit Mode Controls */}
      {editMode && (
        <div className="absolute bottom-8 right-8 z-20 bg-white rounded-lg shadow-xl p-4 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={content.enable_parallax || false}
              onChange={(e) => updateField('enable_parallax', e.target.checked.toString())}
              className="rounded"
            />
            <span>Enable Parallax</span>
          </label>
          <div className="pt-2 border-t">
            <label className="block text-xs text-gray-600 mb-1">Layout</label>
            <select
              value={content.layout_variant || 'centered'}
              onChange={(e) => updateField('layout_variant', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="centered">Centered</option>
              <option value="split">Split</option>
              <option value="fullscreen">Fullscreen</option>
            </select>
          </div>
          <div className="pt-2 border-t">
            <label className="block text-xs text-gray-600 mb-1">Video URL</label>
            <input
              type="text"
              value={content.video_background || ''}
              onChange={(e) => updateField('video_background', e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full px-2 py-1 border rounded text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
