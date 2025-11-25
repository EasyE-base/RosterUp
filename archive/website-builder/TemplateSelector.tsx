import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Template, loadTemplateManifest, loadTemplate } from '../../lib/templates';

interface TemplateSelectorProps {
  onSelect: (template: Template) => Promise<void>;
  onClose: () => void;
}

export default function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    description: string;
    preview_url: string;
    file: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const manifest = await loadTemplateManifest();
      setTemplates(manifest.templates);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId: string, templateFile: string) => {
    try {
      setImporting(templateId);
      setError(null);

      // Load the full template data
      const template = await loadTemplate(templateFile);

      // Call the onSelect handler passed from parent
      await onSelect(template);

      setImportSuccess(templateId);

      // Close after a brief success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to import template:', err);
      setError(err instanceof Error ? err.message : 'Failed to import template');
      setImporting(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white text-lg">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Choose a Template</h2>
            <p className="text-slate-400 text-sm">
              Select a pre-designed template to get started quickly
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            disabled={importing !== null}
          >
            <XCircle className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const isImporting = importing === template.id;
              const isSuccess = importSuccess === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id, template.file)}
                  disabled={importing !== null}
                  className="group relative bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Preview Image */}
                  <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                    <img
                      src={template.preview_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isImporting ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : isSuccess ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <span className="text-white font-medium">Select Template</span>
                      )}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4 text-left">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  {isImporting && (
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-slate-900 px-4 py-2 rounded-lg border border-blue-500">
                        <p className="text-white text-sm font-medium">Importing...</p>
                      </div>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-slate-900 px-4 py-2 rounded-lg border border-green-500">
                        <p className="text-white text-sm font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Success!
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {templates.length === 0 && !loading && (
          <div className="p-12 text-center">
            <p className="text-slate-400">No templates available</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50">
          <p className="text-slate-400 text-sm text-center">
            More templates coming soon! You can customize any template after importing.
          </p>
        </div>
      </div>
    </div>
  );
}
