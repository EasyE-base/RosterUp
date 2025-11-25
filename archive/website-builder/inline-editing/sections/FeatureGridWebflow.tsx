import { motion } from 'framer-motion';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import Card, { CardHeader, CardTitle, CardDescription } from '../../../ui/Card';
import { spacing, typography, motionVariants } from '../../../../lib/designTokens';
import { Zap, Shield, Sparkles, Target, TrendingUp, Users } from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridWebflowProps {
  content: {
    section_title: string;
    section_subtitle: string;
    features: Feature[];
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
 * Webflow-Style Feature Grid Section
 *
 * Features:
 * - 3-column grid with icon cards
 * - Generous padding (80px)
 * - Card hover lift effects
 * - Professional icons and typography
 * - Responsive grid layout
 */
export default function FeatureGridWebflow({
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
}: FeatureGridWebflowProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...(content.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateField('features', newFeatures);
  };

  // Icon mapping
  const iconMap: Record<string, any> = {
    zap: Zap,
    shield: Shield,
    sparkles: Sparkles,
    target: Target,
    trending: TrendingUp,
    users: Users,
  };

  // Default features if none exist
  const features = content.features?.length ? content.features : [
    { icon: 'zap', title: 'Lightning Fast', description: 'Blazing fast performance optimized for speed' },
    { icon: 'shield', title: 'Secure by Default', description: 'Enterprise-grade security built-in' },
    { icon: 'sparkles', title: 'Beautiful Design', description: 'Pixel-perfect interfaces that delight users' },
  ];

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Feature Grid - Webflow"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        className="relative bg-white"
        style={{
          paddingTop: spacing.section.md,    // 80px
          paddingBottom: spacing.section.md, // 80px
          ...styles,
        }}
      >
        <div className="max-w-7xl mx-auto px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <InlineEditor
                value={content.section_title}
                onChange={(val) => updateField('section_title', val)}
                type="heading"
                editMode={editMode}
                className="text-slate-900 mb-6"
                style={{
                  fontSize: typography.sizes['heading-lg'],    // 48px
                  fontWeight: typography.weights.black,         // 900
                  lineHeight: typography.lineHeights.tight,     // 1.1
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <InlineEditor
                value={content.section_subtitle}
                onChange={(val) => updateField('section_subtitle', val)}
                type="text"
                editMode={editMode}
                className="text-slate-600"
                style={{
                  fontSize: typography.sizes.lg,              // 18px
                  lineHeight: typography.lineHeights.relaxed, // 1.625
                }}
              />
            </motion.div>
          </div>

          {/* Feature Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={motionVariants.stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Zap;

              return (
                <motion.div
                  key={index}
                  variants={motionVariants.slideUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card hover variant="elevated" padding="lg" className="h-full">
                    {/* Icon */}
                    <div className="mb-6 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    <CardHeader>
                      <InlineEditor
                        value={feature.title}
                        onChange={(val) => updateFeature(index, 'title', val)}
                        type="heading"
                        editMode={editMode}
                        className="text-slate-900"
                        style={{
                          fontSize: typography.sizes['heading-xs'], // 24px
                          fontWeight: typography.weights.bold,       // 700
                        }}
                      />
                    </CardHeader>

                    <InlineEditor
                      value={feature.description}
                      onChange={(val) => updateFeature(index, 'description', val)}
                      type="text"
                      editMode={editMode}
                      className="text-slate-600"
                      style={{
                        fontSize: typography.sizes.base,            // 16px
                        lineHeight: typography.lineHeights.relaxed, // 1.625
                      }}
                    />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Add Feature Button (Edit Mode) */}
          {editMode && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  const newFeatures = [...features, {
                    icon: 'zap',
                    title: 'New Feature',
                    description: 'Feature description goes here'
                  }];
                  updateField('features', newFeatures);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Feature
              </button>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
