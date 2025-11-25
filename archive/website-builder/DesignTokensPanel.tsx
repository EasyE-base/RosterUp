/**
 * Design Tokens Panel - Visualize and manage extracted design tokens
 */

import { useState } from 'react';
import { Palette, Type, Maximize2, Box, X } from 'lucide-react';
import { DesignTokens } from '../../lib/designSystemAnalyzer';

interface DesignTokensPanelProps {
  tokens: DesignTokens;
  onClose: () => void;
  onApplyColor?: (oldColor: string, newColor: string) => void;
}

export default function DesignTokensPanel({
  tokens,
  onClose,
  onApplyColor,
}: DesignTokensPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects'>('colors');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [newColor, setNewColor] = useState<string>('');

  const handleColorSwap = () => {
    if (selectedColor && newColor && onApplyColor) {
      onApplyColor(selectedColor, newColor);
      setSelectedColor(null);
      setNewColor('');
    }
  };

  const getUsageBadgeColor = (usage: string) => {
    const colors: { [key: string]: string } = {
      primary: 'bg-blue-100 text-blue-700',
      secondary: 'bg-purple-100 text-purple-700',
      accent: 'bg-pink-100 text-pink-700',
      text: 'bg-slate-100 text-slate-700',
      background: 'bg-gray-100 text-gray-700',
      neutral: 'bg-zinc-100 text-zinc-700',
    };
    return colors[usage] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Design Tokens</h2>
              <p className="text-sm text-purple-100">Extracted design system from cloned website</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex space-x-1 px-6">
            {[
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'spacing', label: 'Spacing', icon: Maximize2 },
              { id: 'effects', label: 'Effects', icon: Box },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Color Palette ({tokens.colors.length} colors)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tokens.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedColor === color.value
                          ? 'ring-2 ring-purple-500 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedColor(color.value)}
                    >
                      <div
                        className="h-20 w-full"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-slate-600">
                            {color.value}
                          </span>
                          <span className="text-xs text-slate-400">
                            {color.count}×
                          </span>
                        </div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${getUsageBadgeColor(color.usage)}`}>
                          {color.usage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Swap Tool */}
              {selectedColor && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3">
                    Replace Color
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="block text-xs text-purple-700 mb-1">Current</label>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-sm font-mono text-purple-900">
                          {selectedColor}
                        </span>
                      </div>
                    </div>
                    <div className="text-purple-400 mt-6">→</div>
                    <div className="flex-1">
                      <label className="block text-xs text-purple-700 mb-1">New Color</label>
                      <input
                        type="color"
                        value={newColor || selectedColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={handleColorSwap}
                      disabled={!newColor}
                      className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {tokens.typography.map((typo, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    {typo.family}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Font Sizes</label>
                      <div className="flex flex-wrap gap-1">
                        {typo.sizes.map((size, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            {size}px
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Font Weights</label>
                      <div className="flex flex-wrap gap-1">
                        {typo.weights.map((weight, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                          >
                            {weight}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Line Heights</label>
                      <div className="flex flex-wrap gap-1">
                        {typo.lineHeights.map((lh, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                          >
                            {lh}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spacing Tab */}
          {activeTab === 'spacing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Spacing Scale ({tokens.spacing.length} values)
                </h3>
                <div className="space-y-2">
                  {tokens.spacing.map((spacing, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-mono text-slate-900">
                          {spacing.value}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded">
                        {spacing.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {spacing.count}× used
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Border Radius ({tokens.borderRadius.length} values)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tokens.borderRadius.map((radius, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg text-center hover:bg-slate-50"
                    >
                      <div
                        className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 mx-auto mb-2"
                        style={{ borderRadius: radius }}
                      />
                      <span className="text-xs font-mono text-slate-600">
                        {radius}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Shadows ({tokens.shadows.length} values)
                </h3>
                <div className="space-y-2">
                  {tokens.shadows.map((shadow, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div
                        className="w-full h-16 bg-white rounded mb-2"
                        style={{ boxShadow: shadow }}
                      />
                      <span className="text-xs font-mono text-slate-600 break-all">
                        {shadow}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeTab === 'colors' && tokens.colors.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No colors detected</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Design tokens extracted from website</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
