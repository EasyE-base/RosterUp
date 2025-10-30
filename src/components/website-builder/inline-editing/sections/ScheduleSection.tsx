import InlineEditor from '../InlineEditor';

interface ScheduleSectionProps {
  content: {
    title: string;
    subtitle: string;
    events: Array<{
      date: string;
      time: string;
      opponent: string;
      location: string;
      type: string;
    }>;
    cta_text?: string;
    cta_link?: string;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function ScheduleSection({ content, styles = {}, editMode, onUpdate }: ScheduleSectionProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const newEvents = [...content.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    updateField('events', newEvents);
  };

  return (
    <div className="px-8 py-20 bg-slate-50" style={{ ...styles }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <InlineEditor value={content.title} onChange={(val) => updateField('title', val)} type="heading" editMode={editMode} className="text-4xl font-bold text-slate-900 mb-2" />
          <InlineEditor value={content.subtitle} onChange={(val) => updateField('subtitle', val)} type="text" editMode={editMode} className="text-lg text-slate-600" />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Opponent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
              </tr>
            </thead>
            <tbody>
              {content.events.map((event, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-6 py-4"><InlineEditor value={event.date} onChange={(val) => updateEvent(index, 'date', val)} editMode={editMode} className="text-slate-700" /></td>
                  <td className="px-6 py-4"><InlineEditor value={event.time} onChange={(val) => updateEvent(index, 'time', val)} editMode={editMode} className="text-slate-700" /></td>
                  <td className="px-6 py-4"><InlineEditor value={event.opponent} onChange={(val) => updateEvent(index, 'opponent', val)} editMode={editMode} className="font-semibold text-slate-900" /></td>
                  <td className="px-6 py-4"><InlineEditor value={event.location} onChange={(val) => updateEvent(index, 'location', val)} editMode={editMode} className="text-slate-700" /></td>
                  <td className="px-6 py-4"><InlineEditor value={event.type} onChange={(val) => updateEvent(index, 'type', val)} editMode={editMode} className="text-sm text-slate-600" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
