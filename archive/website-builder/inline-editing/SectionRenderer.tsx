import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsiteSection, supabase } from '../../../lib/supabase';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ScheduleSection from './sections/ScheduleSection';
import ContactSection from './sections/ContactSection';
import NavigationCenterLogo from './sections/NavigationCenterLogo';
import CommitmentsSection from './sections/CommitmentsSection';
import GallerySection from './sections/GallerySection';
import RosterSection from './sections/RosterSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FAQSection from './sections/FAQSection';
import CTASection from './sections/CTASection';
import StatsSection from './sections/StatsSection';
import FooterSection from './sections/FooterSection';
import FeaturesSection from './sections/FeaturesSection';
import PricingSection from './sections/PricingSection';
import VideoSection from './sections/VideoSection';
import { GripVertical, Trash2 } from 'lucide-react';
import { SectionToolbar } from './SectionToolbar';

// Section component registry
const sectionRegistry: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  about: AboutSection,
  schedule: ScheduleSection,
  contact: ContactSection,
  'navigation-center-logo': NavigationCenterLogo,
  commitments: CommitmentsSection,
  gallery: GallerySection,
  roster: RosterSection,
  testimonials: TestimonialsSection,
  faq: FAQSection,
  cta: CTASection,
  stats: StatsSection,
  footer: FooterSection,
  features: FeaturesSection,
  pricing: PricingSection,
  video: VideoSection,
};

interface SectionRendererProps {
  sections: WebsiteSection[];
  editMode: boolean;
  onUpdateSection: (sectionId: string, content: Record<string, any>) => void;
  onDeleteSection?: (sectionId: string) => void;
  onSettingsClick?: (sectionId: string) => void;
  dragHandleProps?: any; // For drag-and-drop integration
}

import { SortableSectionWrapper } from './SortableSectionWrapper';

// ... (imports remain the same)

export default function SectionRenderer({
  sections,
  editMode,
  onUpdateSection,
  onDeleteSection,
  onSettingsClick,
}: SectionRendererProps) {
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleRegenerate = async (section: WebsiteSection) => {
    if (regeneratingId) return;

    try {
      setRegeneratingId(section.id);
      console.log('Regenerating section:', section.id);

      // Get current content to use as context (optional, but good for refinement)
      const currentContent = section.styles?.content || section.styles || {};

      const { data, error } = await supabase.functions.invoke('ai-generate-section', {
        body: {
          sectionType: section.section_type,
          description: `Regenerate this ${section.section_type} section with a fresh, professional design.`,
          style: 'modern', // Could be dynamic based on theme
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        console.log('AI Regeneration success:', data.data);
        // Update the section with new content
        // We merge with existing styles to preserve other settings if needed
        onUpdateSection(section.id, {
          ...currentContent, // Keep existing structure
          ...data.data,      // Overwrite with new content
        });
      } else {
        console.error('AI Regeneration failed:', data?.error);
        alert('Failed to regenerate section. Please try again.');
      }
    } catch (err) {
      console.error('Error calling AI function:', err);
      alert('Error regenerating section. Please check your connection and try again.');
    } finally {
      setRegeneratingId(null);
    }
  };

  // Magic Remix - cycle through layout variants
  const handleRemix = (section: WebsiteSection) => {
    const currentContent = section.styles?.content || section.styles || {};
    const currentVariant = currentContent.variant || 'default';

    // Define available variants per section type
    const variantMap: Record<string, string[]> = {
      hero: ['default', 'centered', 'split'],
      features: ['default', 'grid', 'cards'],
      pricing: ['default', 'compact', 'featured'],
      testimonials: ['default', 'carousel', 'grid'],
      cta: ['default', 'minimal', 'bold'],
    };

    const availableVariants = variantMap[section.section_type] || ['default'];
    const currentIndex = availableVariants.indexOf(currentVariant);
    const nextIndex = (currentIndex + 1) % availableVariants.length;
    const nextVariant = availableVariants[nextIndex];

    console.log(`🎨 Remixing ${section.section_type}: ${currentVariant} → ${nextVariant}`);

    // Update section with new variant
    onUpdateSection(section.id, {
      ...currentContent,
      variant: nextVariant,
    });
  };
  return (
    <div className="space-y-0">
      {sections.map((section) => (
        <SortableSectionWrapper key={section.id} id={section.id}>
          {({ dragHandleProps }) => {
            const SectionComponent = sectionRegistry[section.section_type];

            if (!SectionComponent) {
              return (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-slate-500">
                    Unknown section type: {section.section_type}
                  </p>
                </div>
              );
            }

            // Parse content from styles if it's stored there (from template import)
            const sectionContent = section.styles?.content || section.styles || {};

            return (
              <div
                className="relative group"
                data-selectable="true"
                data-element-id={section.id}
                data-element-type="section"
                data-section-id={section.id}
              >
                {/* Section Toolbar - appears on hover */}
                <SectionToolbar
                  show={editMode}
                  onSettings={() => onSettingsClick?.(section.id)}
                  onDelete={() => onDeleteSection?.(section.id)}
                  onRegenerate={() => handleRegenerate(section)}
                  onRemix={() => handleRemix(section)}
                  isRegenerating={regeneratingId === section.id}
                  canMoveUp={true}
                  canMoveDown={true}
                />

                {/* Drag Handle - positioned separately */}
                {editMode && (
                  <div
                    {...dragHandleProps}
                    className="absolute top-4 left-4 z-30 p-2 bg-white/90 backdrop-blur-xl border border-white/20 rounded-full cursor-move hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-slate-200/50 ring-1 ring-slate-900/5"
                  >
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </div>
                )}

                {/* Persistent Delete Button - Top Right */}
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this section?')) {
                        onDeleteSection?.(section.id);
                      }
                    }}
                    className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur-xl border border-white/20 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all shadow-lg shadow-slate-200/50 ring-1 ring-slate-900/5"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Section Border in Edit Mode */}
                <div
                  className={`${editMode
                    ? 'relative after:absolute after:inset-0 after:border-2 after:border-blue-500/0 after:hover:border-blue-500 after:transition-colors after:pointer-events-none after:z-20'
                    : ''
                    }`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${section.id}-${sectionContent.variant || 'default'}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <SectionComponent
                        sectionId={section.id}
                        content={sectionContent}
                        styles={section.styles}
                        editMode={editMode}
                        onUpdate={(updatedContent: Record<string, any>) => {
                          onUpdateSection(section.id, updatedContent);
                        }}
                        onSettings={() => onSettingsClick?.(section.id)}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            );
          }}
        </SortableSectionWrapper>
      ))}

      {sections.length === 0 && (
        <div className="min-h-[400px] flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 text-lg">
            No sections yet. Click "Add Section" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
