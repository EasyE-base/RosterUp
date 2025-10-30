import InlineEditor from '../InlineEditor';

interface HeroSectionProps {
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
}

export default function HeroSection({
  content,
  styles = {},
  editMode,
  onUpdate,
}: HeroSectionProps) {
  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <div
      className="relative min-h-[500px] flex items-center justify-center text-center px-8 py-20"
      style={{
        background: styles.background || 'linear-gradient(180deg, #001F3F 0%, #0074D9 100%)',
        ...styles,
      }}
    >
      {/* Background Image Overlay */}
      {content.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${content.background_image})`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <InlineEditor
          value={content.heading}
          onChange={(val) => updateField('heading', val)}
          type="heading"
          editMode={editMode}
          className="text-5xl font-bold text-white mb-4"
        />

        <InlineEditor
          value={content.subheading}
          onChange={(val) => updateField('subheading', val)}
          type="text"
          editMode={editMode}
          className="text-xl text-white/90"
        />

        <div className="pt-6">
          <InlineEditor
            value={content.cta_text}
            onChange={(val) => updateField('cta_text', val)}
            type="button"
            editMode={editMode}
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          />
        </div>

        {editMode && (
          <div className="pt-4">
            <InlineEditor
              value={content.background_image || ''}
              onChange={(val) => updateField('background_image', val)}
              type="image"
              editMode={editMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
