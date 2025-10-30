import InlineEditor from '../InlineEditor';

interface AboutSectionProps {
  content: {
    title: string;
    subtitle: string;
    body: string;
    mission_title: string;
    mission: string;
    stats: Array<{ label: string; value: string }>;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function AboutSection({
  content,
  styles = {},
  editMode,
  onUpdate,
}: AboutSectionProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateField('stats', newStats);
  };

  return (
    <div
      className="px-8 py-20 bg-white"
      style={{
        maxWidth: styles.maxWidth || '900px',
        margin: '0 auto',
        ...styles,
      }}
    >
      <div className="space-y-8">
        {/* Title */}
        <div className="text-center">
          <InlineEditor
            value={content.subtitle}
            onChange={(val) => updateField('subtitle', val)}
            type="text"
            editMode={editMode}
            className="text-blue-500 font-semibold uppercase tracking-wide text-sm mb-2"
          />
          <InlineEditor
            value={content.title}
            onChange={(val) => updateField('title', val)}
            type="heading"
            editMode={editMode}
            className="text-4xl font-bold text-slate-900"
          />
        </div>

        {/* Body */}
        <InlineEditor
          value={content.body}
          onChange={(val) => updateField('body', val)}
          type="textarea"
          editMode={editMode}
          className="text-lg text-slate-700 leading-relaxed"
        />

        {/* Mission */}
        <div className="bg-slate-50 rounded-xl p-8">
          <InlineEditor
            value={content.mission_title}
            onChange={(val) => updateField('mission_title', val)}
            type="heading"
            editMode={editMode}
            className="text-2xl font-bold text-slate-900 mb-4"
          />
          <InlineEditor
            value={content.mission}
            onChange={(val) => updateField('mission', val)}
            type="textarea"
            editMode={editMode}
            className="text-slate-700 leading-relaxed"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8">
          {content.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <InlineEditor
                value={stat.value}
                onChange={(val) => updateStat(index, 'value', val)}
                type="heading"
                editMode={editMode}
                className="text-4xl font-bold text-blue-500 mb-2"
              />
              <InlineEditor
                value={stat.label}
                onChange={(val) => updateStat(index, 'label', val)}
                type="text"
                editMode={editMode}
                className="text-slate-600 text-sm uppercase tracking-wide"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
