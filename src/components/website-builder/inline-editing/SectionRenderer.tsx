import { WebsiteSection } from '../../../lib/supabase';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ScheduleSection from './sections/ScheduleSection';
import ContactSection from './sections/ContactSection';
import NavigationCenterLogo from './sections/NavigationCenterLogo';
import CommitmentsSection from './sections/CommitmentsSection';
import GallerySection from './sections/GallerySection';
import RosterSection from './sections/RosterSection';
import { Trash2, GripVertical } from 'lucide-react';

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
};

interface SectionRendererProps {
  sections: WebsiteSection[];
  editMode: boolean;
  onUpdateSection: (sectionId: string, content: Record<string, any>) => void;
  onDeleteSection?: (sectionId: string) => void;
  onSettingsClick?: (sectionId: string) => void;
  dragHandleProps?: any; // For drag-and-drop integration
}

export default function SectionRenderer({
  sections,
  editMode,
  onUpdateSection,
  onDeleteSection,
  onSettingsClick,
  dragHandleProps,
}: SectionRendererProps) {
  return (
    <div className="space-y-0">
      {sections.map((section) => {
        const SectionComponent = sectionRegistry[section.section_type];

        if (!SectionComponent) {
          return (
            <div
              key={section.id}
              className="p-8 bg-slate-800 border border-slate-700 rounded-lg"
            >
              <p className="text-slate-400">
                Unknown section type: {section.section_type}
              </p>
            </div>
          );
        }

        // Parse content from styles if it's stored there (from template import)
        const sectionContent = section.styles?.content || section.styles || {};

        return (
          <div key={section.id} className="relative group">
            {/* Edit Mode Controls */}
            {editMode && (
              <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Drag Handle */}
                {dragHandleProps && (
                  <div
                    {...dragHandleProps}
                    className="p-2 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg cursor-move hover:bg-slate-800 transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-slate-400" />
                  </div>
                )}

                {/* Delete Button */}
                {onDeleteSection && (
                  <button
                    onClick={() => onDeleteSection(section.id)}
                    className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            )}

            {/* Section Border in Edit Mode */}
            <div
              className={`${
                editMode
                  ? 'ring-2 ring-transparent hover:ring-blue-500/50 transition-all'
                  : ''
              }`}
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
            </div>
          </div>
        );
      })}

      {sections.length === 0 && (
        <div className="min-h-[400px] flex items-center justify-center bg-slate-900/50">
          <p className="text-slate-400 text-lg">
            No sections yet. Click "Add Section" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
