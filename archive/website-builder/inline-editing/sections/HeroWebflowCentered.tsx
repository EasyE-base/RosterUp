import { motion } from 'framer-motion';
import InlineEditor from '../InlineEditor';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import Button from '../../../ui/Button';
import { spacing, typography, imageOverlays } from '../../../../lib/designTokens';
import { ArrowRight } from 'lucide-react';

interface HeroWebflowCenteredProps {
  content: {
    heading: string;
    subheading: string;
    cta_text: string;
    cta_link: string;
    secondary_cta_text?: string;
    background_image?: string;
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
 * Webflow-Style Hero Section - Centered Variant
 *
 * Features:
 * - Full-bleed background image with gradient overlay
 * - Centered content with generous padding (120px)
 * - Display-size headline (80px on desktop)
 * - Dual CTAs with professional styling
 * - Image overlay for text readability
 */
export default function HeroWebflowCentered({
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
}: HeroWebflowCenteredProps) {
  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Hero - Webflow Centered"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          paddingTop: spacing.section.lg,    // 120px top
          paddingBottom: spacing.section.lg, // 120px bottom
          ...styles,
        }}
      >
        {/* Full-Bleed Background Image */}
        {content.background_image && (
          <div className="absolute inset-0">
            <motion.img
              src={content.background_image}
              alt="Hero background"
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: [0.4, 0.0, 0.2, 1] }}
            />

            {/* Dark gradient overlay for text readability */}
            <div
              className="absolute inset-0"
              style={{
                background: imageOverlays.dark.full,
              }}
            />
          </div>
        )}

        {/* Fallback gradient if no image */}
        {!content.background_image && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          />
        )}

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-12 text-center">
          {/* Headline - Display Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InlineEditor
              value={content.heading}
              onChange={(val) => updateField('heading', val)}
              type="heading"
              editMode={editMode}
              className="text-white mb-8"
              style={{
                fontSize: typography.sizes['display-lg'],      // 80px
                fontWeight: typography.weights.black,          // 900
                lineHeight: typography.lineHeights.tight,      // 1.1
                letterSpacing: typography.letterSpacing.tight, // -0.025em
              }}
            />
          </motion.div>

          {/* Subheading - Larger body text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <InlineEditor
              value={content.subheading}
              onChange={(val) => updateField('subheading', val)}
              type="text"
              editMode={editMode}
              className="text-white/90 max-w-3xl mx-auto mb-12"
              style={{
                fontSize: typography.sizes.xl,              // 20px
                lineHeight: typography.lineHeights.relaxed, // 1.625
              }}
            />
          </motion.div>

          {/* Dual CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {editMode ? (
              <>
                <InlineEditor
                  value={content.cta_text}
                  onChange={(val) => updateField('cta_text', val)}
                  type="button"
                  editMode={editMode}
                  className="px-10 py-5 text-lg font-bold rounded-xl bg-white text-slate-900 hover:bg-slate-100"
                />
                {content.secondary_cta_text && (
                  <InlineEditor
                    value={content.secondary_cta_text}
                    onChange={(val) => updateField('secondary_cta_text', val)}
                    type="button"
                    editMode={editMode}
                    className="px-10 py-5 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white/10"
                  />
                )}
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="xl"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                  className="bg-white text-slate-900 hover:bg-slate-100 border-0"
                >
                  {content.cta_text}
                </Button>
                {content.secondary_cta_text && (
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white text-white hover:bg-white/10"
                  >
                    {content.secondary_cta_text}
                  </Button>
                )}
              </>
            )}
          </motion.div>

          {/* Image Upload in Edit Mode */}
          {editMode && (
            <div className="mt-16 max-w-2xl mx-auto">
              <DragDropImageUpload
                value={content.background_image}
                onChange={(url) => updateField('background_image', url)}
                editMode={editMode}
                placeholder="Upload Hero Background"
                aspectRatio="video"
                showUnsplash={true}
              />
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
