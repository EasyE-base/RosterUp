import { X, Layout, FileText, Calendar, Mail } from 'lucide-react';
import { loadTemplateManifest } from '../../../lib/templates';
import { useState, useEffect } from 'react';

interface SectionMenuProps {
  onClose: () => void;
  onSelect: (template: any) => void;
  pageId: string;
}

const sectionIcons: Record<string, any> = {
  hero: Layout,
  about: FileText,
  schedule: Calendar,
  contact: Mail,
};

export default function SectionMenu({ onClose, onSelect, pageId }: SectionMenuProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableTemplates();
  }, []);

  const loadAvailableTemplates = async () => {
    try {
      const manifest = await loadTemplateManifest();
      setTemplates(manifest.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Section</h2>
            <p className="text-slate-400 text-sm mt-1">Choose a section type to add to your page</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const Icon = sectionIcons[template.id.replace(/-sports-\d+$/, '')] || Layout;
                return (
                  <button
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className="group bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500 hover:bg-slate-900 transition-all text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">{template.name}</h3>
                        <p className="text-slate-400 text-sm">{template.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
