import { motion } from 'framer-motion';
import InlineEditor from '../InlineEditor';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import Button from '../../../ui/Button';
import { spacing, typography, imageOverlays } from '../../../../lib/designTokens';
import { ArrowRight } from 'lucide-react';

interface CTAWebflowProps {
  content: {
    heading: string;
    subheading: string;
    cta_text: string;
    cta_link: string;
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
 * Webflow-Style CTA Section
 *
 * Features:
 * - Centered call-to-action with background image
 * - Generous padding (120px)
 * - Bold typography
 * - Brand gradient overlay
 * - Professional button styling
 */
export default function CTAWebflow({
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
}: CTAWebflowProps) {
  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="CTA - Webflow"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: spacing.section.lg,    // 120px
          paddingBottom: spacing.section.lg, // 120px
          ...styles,
        }}
      >
        {/* Background Image */}
        {content.background_image && (
          <div className="absolute inset-0">
            <img
              src={content.background_image}
              alt="CTA background"
              className="w-full h-full object-cover"
            />

            {/* Brand gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: imageOverlays.brand.primary,
              }}
            />
          </div>
        )}

        {/* Fallback gradient */}
        {!content.background_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700" />
        )}

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-12 text-center">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <InlineEditor
              value={content.heading}
              onChange={(val) => updateField('heading', val)}
              type="heading"
              editMode={editMode}
              className="text-white mb-8"
              style={{
                fontSize: typography.sizes['display-md'],      // 64px
                fontWeight: typography.weights.black,           // 900
                lineHeight: typography.lineHeights.tight,       // 1.1
                letterSpacing: typography.letterSpacing.tight,  // -0.025em
              }}
            />
          </motion.div>

          {/* Subheading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <InlineEditor
              value={content.subheading}
              onChange={(val) => updateField('subheading', val)}
              type="text"
              editMode={editMode}
              className="text-white/90 max-w-2xl mx-auto mb-12"
              style={{
                fontSize: typography.sizes.xl,              // 20px
                lineHeight: typography.lineHeights.relaxed, // 1.625
              }}
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {editMode ? (
              <InlineEditor
                value={content.cta_text}
                onChange={(val) => updateField('cta_text', val)}
                type="button"
                editMode={editMode}
                className="px-12 py-6 text-xl font-bold rounded-xl bg-white text-slate-900 hover:bg-slate-100"
              />
            ) : (
              <Button
                variant="primary"
                size="xl"
                icon={<ArrowRight className="w-6 h-6" />}
                iconPosition="right"
                className="bg-white text-slate-900 hover:bg-slate-100 border-0 shadow-2xl"
                style={{
                  fontSize: typography.sizes.xl,
                  padding: `${spacing.lg} ${spacing['3xl']}`,
                }}
              >
                {content.cta_text}
              </Button>
            )}
          </motion.div>

          {/* Image Upload in Edit Mode */}
          {editMode && (
            <div className="mt-16 max-w-2xl mx-auto">
              <DragDropImageUpload
                value={content.background_image}
                onChange={(url) => updateField('background_image', url)}
                editMode={editMode}
                placeholder="Upload CTA Background"
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
