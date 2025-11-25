import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Type, Palette, Layout, Sparkles, X, RotateCcw } from 'lucide-react';
import { useSelectedElement } from '../../contexts/SelectedElementContext';
import { extractElementStyles, applyStylesToElement, ElementStyles, rgbToHex, pxToNumber, numberToPx } from '../../lib/elementStyleUtils';

interface ElementPropertiesPanelProps {
  onClose: () => void;
  onStyleChange: (elementId: string, styles: ElementStyles) => void;
}

export default function ElementPropertiesPanel({
  onClose,
  onStyleChange,
}: ElementPropertiesPanelProps) {
  const { selectedElement, clearSelection, getElementRef } = useSelectedElement();
  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'layout' | 'effects'>('typography');
  const [elementStyles, setElementStyles] = useState<ElementStyles>({});

  // Load element styles when selection changes
  useEffect(() => {
    if (selectedElement) {
      const element = getElementRef(selectedElement.elementId);
      if (element) {
        const styles = extractElementStyles(element);
        setElementStyles(styles);
      }
    }
  }, [selectedElement, getElementRef]);

  // Apply style changes to the element
  const handleStyleChange = (property: keyof ElementStyles, value: string) => {
    if (!selectedElement) return;

    const updatedStyles = { ...elementStyles, [property]: value };
    setElementStyles(updatedStyles);

    // Apply to DOM immediately
    const element = getElementRef(selectedElement.elementId);
    if (element) {
      applyStylesToElement(element, { [property]: value });
    }

    // Notify parent to persist changes
    onStyleChange(selectedElement.elementId, updatedStyles);
  };

  // Reset all styles for the element
  const handleResetStyles = () => {
    if (!selectedElement) return;

    const element = getElementRef(selectedElement.elementId);
    if (element) {
      // Remove all inline styles
      element.removeAttribute('style');
      setElementStyles({});
      onStyleChange(selectedElement.elementId, {});
    }
  };

  if (!selectedElement) {
    return null;
  }

  const tabs = [
    { id: 'typography' as const, icon: Type, label: 'Typography' },
    { id: 'colors' as const, icon: Palette, label: 'Colors' },
    { id: 'layout' as const, icon: Layout, label: 'Layout' },
    { id: 'effects' as const, icon: Sparkles, label: 'Effects' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 h-screen w-80 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col z-[9999]"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Element Properties</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetStyles}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Reset all styles"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                clearSelection();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-xs text-slate-400">
          <span className="capitalize">{selectedElement.elementType}</span>
          {selectedElement.parentIds.length > 0 && (
            <span> → Parent Container</span>
          )}
        </div>

        {/* Element ID */}
        <div className="text-xs text-slate-500 mt-1 truncate">
          {selectedElement.elementId}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-slate-800 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'typography' && (
          <>
            <PropertyGroup label="Font Size">
              <input
                type="text"
                value={elementStyles.fontSize || ''}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                placeholder="16px"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Font Weight">
              <select
                value={elementStyles.fontWeight || ''}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Default</option>
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
              </select>
            </PropertyGroup>

            <PropertyGroup label="Line Height">
              <input
                type="text"
                value={elementStyles.lineHeight || ''}
                onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                placeholder="1.5"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Letter Spacing">
              <input
                type="text"
                value={elementStyles.letterSpacing || ''}
                onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
                placeholder="0px"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Text Align">
              <select
                value={elementStyles.textAlign || ''}
                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </PropertyGroup>
          </>
        )}

        {activeTab === 'colors' && (
          <>
            <PropertyGroup label="Text Color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={elementStyles.color ? rgbToHex(elementStyles.color) : '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-12 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={elementStyles.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </PropertyGroup>

            <PropertyGroup label="Background Color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={elementStyles.backgroundColor ? rgbToHex(elementStyles.backgroundColor) : '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={elementStyles.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  placeholder="transparent"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </PropertyGroup>

            <PropertyGroup label="Border Color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={elementStyles.borderColor ? rgbToHex(elementStyles.borderColor) : '#000000'}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  className="w-12 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={elementStyles.borderColor || ''}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  placeholder="transparent"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </PropertyGroup>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            <PropertyGroup label="Padding">
              <input
                type="text"
                value={elementStyles.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="0px"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Margin">
              <input
                type="text"
                value={elementStyles.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="0px"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Width">
              <input
                type="text"
                value={elementStyles.width || ''}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                placeholder="auto"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Height">
              <input
                type="text"
                value={elementStyles.height || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                placeholder="auto"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Display">
              <select
                value={elementStyles.display || ''}
                onChange={(e) => handleStyleChange('display', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Default</option>
                <option value="block">Block</option>
                <option value="inline">Inline</option>
                <option value="inline-block">Inline Block</option>
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
                <option value="none">None</option>
              </select>
            </PropertyGroup>
          </>
        )}

        {activeTab === 'effects' && (
          <>
            <PropertyGroup label="Box Shadow">
              <input
                type="text"
                value={elementStyles.boxShadow || ''}
                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                placeholder="0 0 10px rgba(0,0,0,0.1)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Border Radius">
              <input
                type="text"
                value={elementStyles.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                placeholder="0px"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>

            <PropertyGroup label="Opacity">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={elementStyles.opacity || '1'}
                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                className="w-full"
              />
              <div className="text-xs text-slate-400 mt-1 text-center">
                {elementStyles.opacity || '1'}
              </div>
            </PropertyGroup>

            <PropertyGroup label="Transform">
              <input
                type="text"
                value={elementStyles.transform || ''}
                onChange={(e) => handleStyleChange('transform', e.target.value)}
                placeholder="none"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </PropertyGroup>
          </>
        )}
      </div>
    </motion.div>
  );
}

function PropertyGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      {children}
    </div>
  );
}
