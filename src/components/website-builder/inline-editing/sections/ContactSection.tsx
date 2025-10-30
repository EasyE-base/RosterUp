import InlineEditor from '../InlineEditor';

interface ContactSectionProps {
  content: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    social_links?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
    submit_text?: string;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function ContactSection({ content, styles = {}, editMode, onUpdate }: ContactSectionProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <div className="px-8 py-20 bg-slate-900 text-white" style={{ ...styles }}>
      <div className="max-w-4xl mx-auto text-center">
        <InlineEditor value={content.title} onChange={(val) => updateField('title', val)} type="heading" editMode={editMode} className="text-4xl font-bold mb-4" />
        <InlineEditor value={content.subtitle} onChange={(val) => updateField('subtitle', val)} type="text" editMode={editMode} className="text-lg text-slate-300 mb-12" />

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">Email</p>
              <InlineEditor value={content.email} onChange={(val) => updateField('email', val)} type="email" editMode={editMode} className="text-blue-400 hover:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">Phone</p>
              <InlineEditor value={content.phone} onChange={(val) => updateField('phone', val)} type="phone" editMode={editMode} className="text-blue-400 hover:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">Address</p>
              <InlineEditor value={content.address} onChange={(val) => updateField('address', val)} type="text" editMode={editMode} className="text-slate-300" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
              <input type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
              <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none" />
              <InlineEditor value={content.submit_text || 'Send Message'} onChange={(val) => updateField('submit_text', val)} type="button" editMode={editMode} className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
