import { useState } from 'react';
import { Sparkles, Loader2, X, Wand2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AIContentGeneratorProps {
  onGenerate: (html: string) => void;
  onClose: () => void;
}

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section', description: 'Eye-catching banner with headline and CTA' },
  { value: 'features', label: 'Features', description: 'Grid of product/service features' },
  { value: 'pricing', label: 'Pricing', description: 'Pricing tables with tiers' },
  { value: 'testimonials', label: 'Testimonials', description: 'Customer reviews and feedback' },
  { value: 'team', label: 'Team', description: 'Team member cards with photos' },
  { value: 'contact', label: 'Contact', description: 'Contact form or contact info' },
  { value: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { value: 'footer', label: 'Footer', description: 'Footer with links and info' },
  { value: 'custom', label: 'Custom', description: 'Describe your own section' },
];

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, focused aesthetic' },
  { value: 'bold', label: 'Bold', description: 'Strong colors and typography' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated and refined' },
];

export default function AIContentGenerator({ onGenerate, onClose }: AIContentGeneratorProps) {
  const [description, setDescription] = useState('');
  const [sectionType, setSectionType] = useState('hero');
  const [style, setStyle] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Please describe what you want to create');
      return;
    }

    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke('ai-generate-section', {
        body: {
          description: description,
          sectionType: sectionType,
          style: style,
        },
      });

      if (error) throw error;

      if (data.success && data.html) {
        onGenerate(data.html);
        onClose();
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating section:', error);
      alert('Failed to generate section: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Wand2 className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">AI Section Generator</h2>
              <p className="text-sm text-purple-100">Describe what you want and AI will create it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Section Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSectionType(type.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    sectionType === type.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Design Style
            </label>
            <div className="grid grid-cols-4 gap-2">
              {STYLE_OPTIONS.map((styleOption) => (
                <button
                  key={styleOption.value}
                  onClick={() => setStyle(styleOption.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    style === styleOption.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-sm">{styleOption.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{styleOption.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe Your Section
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'Create a hero section with headline Welcome to Our Platform, subtitle The best way to manage your team, and a blue Get Started button'"
              className="w-full h-32 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-slate-500 mt-2">
              Be specific! Include text content, colors, button labels, number of items, etc.
            </p>
          </div>

          {/* Examples */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-700 mb-2">Example Descriptions:</div>
            <div className="space-y-2 text-xs text-slate-600">
              <div>• "3-column pricing table: Basic ($9/mo), Pro ($29/mo), Enterprise (custom). Include feature lists."</div>
              <div>• "Team section with 4 members: CEO John Smith, CTO Jane Doe, CMO Bob Wilson, CFO Sarah Lee"</div>
              <div>• "Testimonials carousel with 3 customer reviews from happy clients"</div>
              <div>• "Contact section with email form on left, map and address on right"</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Section</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
