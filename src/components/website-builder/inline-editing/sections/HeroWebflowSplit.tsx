import { motion } from 'framer-motion';
import InlineEditor from '../InlineEditor';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import Button from '../../../ui/Button';
import { spacing, typography } from '../../../../lib/designTokens';
import { ArrowRight, Play } from 'lucide-react';

interface HeroWebflowSplitProps {
  content: {
    heading: string;
    subheading: string;
    cta_text: string;
    cta_link: string;
    secondary_cta_text?: string;
    hero_image?: string;
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
 * Webflow-Style Hero Section - Split Layout Variant
 *
 * Features:
 * - Split layout: Content left (60%), Image right (40%)
 * - Display-size headline (64px on desktop)
 * - Generous padding (80px)
 * - Image with subtle hover zoom
 * - Professional spacing and typography
 */
export default function HeroWebflowSplit({
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
}: HeroWebflowSplitProps) {
  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Hero - Webflow Split"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        className="relative bg-slate-50"
        style={{
          paddingTop: spacing.section.md,    // 80px
          paddingBottom: spacing.section.md, // 80px
          ...styles,
        }}
      >
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            >
              {/* Headline */}
              <InlineEditor
                value={content.heading}
                onChange={(val) => updateField('heading', val)}
                type="heading"
                editMode={editMode}
                className="text-slate-900"
                style={{
                  fontSize: typography.sizes['display-md'],      // 64px
                  fontWeight: typography.weights.black,          // 900
                  lineHeight: typography.lineHeights.tight,      // 1.1
                  letterSpacing: typography.letterSpacing.tighter, // -0.05em
                }}
              />

              {/* Subheading */}
              <InlineEditor
                value={content.subheading}
                onChange={(val) => updateField('subheading', val)}
                type="text"
                editMode={editMode}
                className="text-slate-600"
                style={{
                  fontSize: typography.sizes.lg,              // 18px
                  lineHeight: typography.lineHeights.relaxed, // 1.625
                }}
              />

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                {editMode ? (
                  <>
                    <InlineEditor
                      value={content.cta_text}
                      onChange={(val) => updateField('cta_text', val)}
                      type="button"
                      editMode={editMode}
                      className="px-8 py-4 text-base font-bold rounded-xl bg-slate-900 text-white"
                    />
                    {content.secondary_cta_text && (
                      <InlineEditor
                        value={content.secondary_cta_text}
                        onChange={(val) => updateField('secondary_cta_text', val)}
                        type="button"
                        editMode={editMode}
                        className="px-8 py-4 text-base font-semibold rounded-xl text-slate-700"
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<ArrowRight className="w-5 h-5" />}
                      iconPosition="right"
                    >
                      {content.cta_text}
                    </Button>
                    {content.secondary_cta_text && (
                      <Button
                        variant="ghost"
                        size="lg"
                        icon={<Play className="w-5 h-5" />}
                        className="text-slate-700"
                      >
                        {content.secondary_cta_text}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            >
              {content.hero_image ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <motion.img
                    src={content.hero_image}
                    alt="Hero"
                    className="w-full h-auto aspect-square object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              ) : editMode ? (
                <DragDropImageUpload
                  value={content.hero_image}
                  onChange={(url) => updateField('hero_image', url)}
                  editMode={editMode}
                  placeholder="Upload Hero Image"
                  aspectRatio="square"
                  showUnsplash={true}
                />
              ) : (
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600" />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
