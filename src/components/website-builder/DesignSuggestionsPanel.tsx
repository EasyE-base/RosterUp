import { useState } from 'react';
import { Sparkles, Loader2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DesignSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'color' | 'typography' | 'spacing' | 'layout' | 'accessibility' | 'modern-design';
  priority: 'high' | 'medium' | 'low';
  cssChanges: { [selector: string]: { [property: string]: string } };
  before: string;
  after: string;
}

interface DesignSuggestionsPanelProps {
  html: string;
  css: string;
  onApplySuggestion: (suggestion: DesignSuggestion) => void;
  onClose: () => void;
}

const CATEGORY_INFO = {
  color: { icon: '🎨', label: 'Color', color: 'text-pink-600 bg-pink-50' },
  typography: { icon: '✍️', label: 'Typography', color: 'text-blue-600 bg-blue-50' },
  spacing: { icon: '📏', label: 'Spacing', color: 'text-green-600 bg-green-50' },
  layout: { icon: '🎯', label: 'Layout', color: 'text-purple-600 bg-purple-50' },
  accessibility: { icon: '♿', label: 'Accessibility', color: 'text-orange-600 bg-orange-50' },
  'modern-design': { icon: '✨', label: 'Modern Design', color: 'text-indigo-600 bg-indigo-50' },
};

const PRIORITY_INFO = {
  high: { icon: AlertCircle, label: 'High Priority', color: 'text-red-600' },
  medium: { icon: Info, label: 'Medium Priority', color: 'text-yellow-600' },
  low: { icon: CheckCircle, label: 'Low Priority', color: 'text-green-600' },
};

export default function DesignSuggestionsPanel({
  html,
  css,
  onApplySuggestion,
  onClose,
}: DesignSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);

      const { data, error } = await supabase.functions.invoke('ai-design-analyzer', {
        body: {
          htmlContent: html,
          cssContent: css,
        },
      });

      if (error) throw error;

      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
        setHasAnalyzed(true);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing design:', error);
      alert('Failed to analyze design: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = (suggestion: DesignSuggestion) => {
    onApplySuggestion(suggestion);
    setAppliedSuggestions(prev => new Set(prev).add(suggestion.id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">AI Design Suggestions</h2>
              <p className="text-sm text-purple-100">AI-powered design improvements for your website</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {!hasAnalyzed ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Get AI-Powered Design Insights
                </h3>
                <p className="text-slate-600 max-w-md">
                  Our AI will analyze your website's design and provide specific, actionable suggestions
                  to improve color harmony, typography, spacing, accessibility, and more.
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Design...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze My Design</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {suggestions.length} Suggestions Found
                    </h3>
                    <p className="text-sm text-slate-600">
                      {appliedSuggestions.size > 0
                        ? `${appliedSuggestions.size} applied • ${suggestions.length - appliedSuggestions.size} remaining`
                        : 'Click "Apply" on any suggestion to implement it'}
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Re-analyze
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const categoryInfo = CATEGORY_INFO[suggestion.category];
                  const priorityInfo = PRIORITY_INFO[suggestion.priority];
                  const PriorityIcon = priorityInfo.icon;
                  const isApplied = appliedSuggestions.has(suggestion.id);

                  return (
                    <div
                      key={suggestion.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isApplied
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Category & Priority */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                              {categoryInfo.icon} {categoryInfo.label}
                            </span>
                            <span className={`flex items-center gap-1 text-xs ${priorityInfo.color}`}>
                              <PriorityIcon className="w-3 h-3" />
                              {priorityInfo.label}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <h4 className="font-semibold text-slate-900 mb-1">{suggestion.title}</h4>
                          <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>

                          {/* Before/After */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Before:</span>
                              <code className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
                                {suggestion.before}
                              </code>
                            </div>
                            <span className="text-slate-400">→</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">After:</span>
                              <code className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                                {suggestion.after}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => handleApply(suggestion)}
                          disabled={isApplied}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            isApplied
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {isApplied ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Applied
                            </span>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
