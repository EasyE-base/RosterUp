import { useState } from 'react';
import {
  X,
  Palette,
  Type,
  Box,
  Square,
  Wand2,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface DesignSystemPanelProps {
  isOpen: boolean;
  onClose: () => void;
  designSystem: DesignSystem;
  onUpdate: (updates: Partial<DesignSystem>) => void;
  onApplyToAll?: () => void;
}

export interface DesignSystem {
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: {
      heading: string;
      body: string;
      muted: string;
    };
    background: {
      light: string;
      dark: string;
      gray: string;
    };
    customPalette: { name: string; color: string }[];
  };
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: string;
    scaleRatio: number;
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
    fontWeights: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  // Buttons
  buttons: {
    primary: {
      bg: string;
      text: string;
      border: string;
      hoverBg: string;
    };
    secondary: {
      bg: string;
      text: string;
      border: string;
      hoverBg: string;
    };
    sizes: {
      sm: { padding: string; fontSize: string };
      md: { padding: string; fontSize: string };
      lg: { padding: string; fontSize: string };
    };
    borderRadius: string;
  };
  // Effects
  effects: {
    shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
  };
}

export const defaultDesignSystem: DesignSystem = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    text: {
      heading: '#111827',
      body: '#374151',
      muted: '#6b7280',
    },
    background: {
      light: '#ffffff',
      dark: '#1f2937',
      gray: '#f3f4f6',
    },
    customPalette: [],
  },
  typography: {
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    baseFontSize: '16px',
    scaleRatio: 1.25,
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem',
  },
  buttons: {
    primary: {
      bg: '#3b82f6',
      text: '#ffffff',
      border: '#3b82f6',
      hoverBg: '#2563eb',
    },
    secondary: {
      bg: 'transparent',
      text: '#3b82f6',
      border: '#3b82f6',
      hoverBg: '#eff6ff',
    },
    sizes: {
      sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
    },
    borderRadius: '0.5rem',
  },
  effects: {
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
    transitions: {
      fast: 'all 0.15s ease',
      normal: 'all 0.3s ease',
      slow: 'all 0.5s ease',
    },
  },
};

export default function DesignSystemPanel({
  isOpen,
  onClose,
  designSystem,
  onUpdate,
  onApplyToAll,
}: DesignSystemPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'colors' | 'typography' | 'spacing' | 'buttons' | 'effects'
  >('colors');

  if (!isOpen) return null;

  const handleColorUpdate = (path: string, value: string) => {
    const keys = path.split('.');
    const updated = { ...designSystem };
    let current: any = updated.colors;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    onUpdate({ colors: updated.colors });
  };

  const handleTypographyUpdate = (path: string, value: string | number) => {
    const keys = path.split('.');
    const updated = { ...designSystem };
    let current: any = updated.typography;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    onUpdate({ typography: updated.typography });
  };

  const addCustomColor = () => {
    const updated = { ...designSystem };
    updated.colors.customPalette.push({ name: 'New Color', color: '#000000' });
    onUpdate({ colors: updated.colors });
  };

  const removeCustomColor = (index: number) => {
    const updated = { ...designSystem };
    updated.colors.customPalette.splice(index, 1);
    onUpdate({ colors: updated.colors });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-[9999] flex flex-col animate-slideInRight">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">Design System</h2>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'colors'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colors
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'typography'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          Typography
        </button>
        <button
          onClick={() => setActiveTab('spacing')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'spacing'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Box className="w-4 h-4" />
          Spacing
        </button>
        <button
          onClick={() => setActiveTab('buttons')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'buttons'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Square className="w-4 h-4" />
          Buttons
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'effects'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Effects
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'colors' && (
          <ColorsTab
            colors={designSystem.colors}
            onUpdate={handleColorUpdate}
            onAddCustomColor={addCustomColor}
            onRemoveCustomColor={removeCustomColor}
          />
        )}
        {activeTab === 'typography' && (
          <TypographyTab
            typography={designSystem.typography}
            onUpdate={handleTypographyUpdate}
          />
        )}
        {activeTab === 'spacing' && (
          <SpacingTab
            spacing={designSystem.spacing}
            onUpdate={(key, value) =>
              onUpdate({ spacing: { ...designSystem.spacing, [key]: value } })
            }
          />
        )}
        {activeTab === 'buttons' && (
          <ButtonsTab
            buttons={designSystem.buttons}
            onUpdate={(updates) =>
              onUpdate({ buttons: { ...designSystem.buttons, ...updates } })
            }
          />
        )}
        {activeTab === 'effects' && (
          <EffectsTab
            effects={designSystem.effects}
            onUpdate={(updates) =>
              onUpdate({ effects: { ...designSystem.effects, ...updates } })
            }
          />
        )}
      </div>

      {/* Footer */}
      {onApplyToAll && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onApplyToAll}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply to All Blocks
          </button>
        </div>
      )}
    </div>
  );
}

// Colors Tab Component
function ColorsTab({
  colors,
  onUpdate,
  onAddCustomColor,
  onRemoveCustomColor,
}: any) {
  return (
    <div className="space-y-6">
      {/* Brand Colors */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Brand Colors</h3>
        <div className="space-y-3">
          <ColorInput
            label="Primary"
            value={colors.primary}
            onChange={(v) => onUpdate('primary', v)}
          />
          <ColorInput
            label="Secondary"
            value={colors.secondary}
            onChange={(v) => onUpdate('secondary', v)}
          />
          <ColorInput
            label="Accent"
            value={colors.accent}
            onChange={(v) => onUpdate('accent', v)}
          />
        </div>
      </div>

      {/* Text Colors */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Text Colors</h3>
        <div className="space-y-3">
          <ColorInput
            label="Heading"
            value={colors.text.heading}
            onChange={(v) => onUpdate('text.heading', v)}
          />
          <ColorInput
            label="Body"
            value={colors.text.body}
            onChange={(v) => onUpdate('text.body', v)}
          />
          <ColorInput
            label="Muted"
            value={colors.text.muted}
            onChange={(v) => onUpdate('text.muted', v)}
          />
        </div>
      </div>

      {/* Background Colors */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Background Colors
        </h3>
        <div className="space-y-3">
          <ColorInput
            label="Light"
            value={colors.background.light}
            onChange={(v) => onUpdate('background.light', v)}
          />
          <ColorInput
            label="Dark"
            value={colors.background.dark}
            onChange={(v) => onUpdate('background.dark', v)}
          />
          <ColorInput
            label="Gray"
            value={colors.background.gray}
            onChange={(v) => onUpdate('background.gray', v)}
          />
        </div>
      </div>

      {/* Custom Palette */}
      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Custom Palette</h3>
          <button
            onClick={onAddCustomColor}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {colors.customPalette.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const updated = [...colors.customPalette];
                  updated[index].name = e.target.value;
                  onUpdate('customPalette', updated);
                }}
                className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                placeholder="Color name"
              />
              <input
                type="color"
                value={item.color}
                onChange={(e) => {
                  const updated = [...colors.customPalette];
                  updated[index].color = e.target.value;
                  onUpdate('customPalette', updated);
                }}
                className="w-10 h-8 rounded border border-slate-700 bg-slate-800 cursor-pointer"
              />
              <button
                onClick={() => onRemoveCustomColor(index)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Typography Tab Component
function TypographyTab({ typography, onUpdate }: any) {
  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
    { name: 'Roboto', value: 'Roboto, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap' },
    { name: 'Lato', value: 'Lato, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap' },
    { name: 'Poppins', value: 'Poppins, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap' },
    { name: 'Playfair Display', value: 'Playfair Display, serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap' },
    { name: 'Merriweather', value: 'Merriweather, serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap' },
    { name: 'Raleway', value: 'Raleway, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&display=swap' },
    { name: 'Nunito', value: 'Nunito, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&display=swap' },
    { name: 'PT Sans', value: 'PT Sans, sans-serif', url: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap' },
    { name: 'Arial', value: 'Arial, sans-serif', url: null },
    { name: 'Helvetica', value: 'Helvetica, sans-serif', url: null },
    { name: 'Georgia', value: 'Georgia, serif', url: null },
    { name: 'Times New Roman', value: 'Times New Roman, serif', url: null },
  ];

  // Load Google Fonts when selected
  const loadGoogleFont = (fontValue: string) => {
    const font = fontFamilies.find(f => f.value === fontValue);
    if (font && font.url) {
      // Check if the font is already loaded
      const existingLink = document.querySelector(`link[href="${font.url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = font.url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  };

  const handleFontChange = (type: 'headingFont' | 'bodyFont', value: string) => {
    loadGoogleFont(value);
    onUpdate(type, value);
  };

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Font Families</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Heading Font
            </label>
            <select
              value={typography.headingFont}
              onChange={(e) => handleFontChange('headingFont', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Body Font
            </label>
            <select
              value={typography.bodyFont}
              onChange={(e) => handleFontChange('bodyFont', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Font Scale */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Font Scale</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Base Font Size
            </label>
            <input
              type="text"
              value={typography.baseFontSize}
              onChange={(e) => onUpdate('baseFontSize', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              placeholder="16px"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Scale Ratio
            </label>
            <input
              type="number"
              step="0.05"
              value={typography.scaleRatio}
              onChange={(e) =>
                onUpdate('scaleRatio', parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Line Height */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Line Height</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-16">Tight</span>
            <input
              type="text"
              value={typography.lineHeight.tight}
              onChange={(e) => onUpdate('lineHeight.tight', e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-16">Normal</span>
            <input
              type="text"
              value={typography.lineHeight.normal}
              onChange={(e) => onUpdate('lineHeight.normal', e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-16">Relaxed</span>
            <input
              type="text"
              value={typography.lineHeight.relaxed}
              onChange={(e) => onUpdate('lineHeight.relaxed', e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Preview</h3>
        <div
          className="bg-white p-4 rounded space-y-2"
          style={{ fontFamily: typography.bodyFont }}
        >
          <h1 style={{ fontFamily: typography.headingFont, fontSize: '2em', fontWeight: 700 }}>
            Heading 1
          </h1>
          <h2 style={{ fontFamily: typography.headingFont, fontSize: '1.5em', fontWeight: 600 }}>
            Heading 2
          </h2>
          <h3
            style={{ fontFamily: typography.headingFont, fontSize: '1.25em', fontWeight: 600 }}
          >
            Heading 3
          </h3>
          <p style={{ fontSize: typography.baseFontSize, fontFamily: typography.bodyFont }}>
            This is body text in {fontFamilies.find(f => f.value === typography.bodyFont)?.name || 'default font'}. The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>
    </div>
  );
}

// Spacing Tab Component
function SpacingTab({ spacing, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white mb-3">Spacing Scale</h3>
      <div className="space-y-3">
        {Object.entries(spacing).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs text-slate-300 mb-1.5 capitalize">
              {key}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={value as string}
                onChange={(e) => onUpdate(key, e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
              <div
                className="w-20 h-8 bg-blue-500 rounded"
                style={{ width: value as string }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Buttons Tab Component
function ButtonsTab({ buttons, onUpdate }: any) {
  return (
    <div className="space-y-6">
      {/* Primary Button */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Primary Button</h3>
        <div className="space-y-3">
          <ColorInput
            label="Background"
            value={buttons.primary.bg}
            onChange={(v) =>
              onUpdate({ primary: { ...buttons.primary, bg: v } })
            }
          />
          <ColorInput
            label="Text"
            value={buttons.primary.text}
            onChange={(v) =>
              onUpdate({ primary: { ...buttons.primary, text: v } })
            }
          />
          <ColorInput
            label="Hover Background"
            value={buttons.primary.hoverBg}
            onChange={(v) =>
              onUpdate({ primary: { ...buttons.primary, hoverBg: v } })
            }
          />
        </div>
        <div className="mt-3">
          <button
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: buttons.primary.bg,
              color: buttons.primary.text,
              borderRadius: buttons.borderRadius,
            }}
          >
            Preview Button
          </button>
        </div>
      </div>

      {/* Secondary Button */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Secondary Button
        </h3>
        <div className="space-y-3">
          <ColorInput
            label="Background"
            value={buttons.secondary.bg}
            onChange={(v) =>
              onUpdate({ secondary: { ...buttons.secondary, bg: v } })
            }
          />
          <ColorInput
            label="Text"
            value={buttons.secondary.text}
            onChange={(v) =>
              onUpdate({ secondary: { ...buttons.secondary, text: v } })
            }
          />
          <ColorInput
            label="Border"
            value={buttons.secondary.border}
            onChange={(v) =>
              onUpdate({ secondary: { ...buttons.secondary, border: v } })
            }
          />
        </div>
        <div className="mt-3">
          <button
            className="px-4 py-2 rounded border-2 transition-colors"
            style={{
              backgroundColor: buttons.secondary.bg,
              color: buttons.secondary.text,
              borderColor: buttons.secondary.border,
              borderRadius: buttons.borderRadius,
            }}
          >
            Preview Button
          </button>
        </div>
      </div>

      {/* Border Radius */}
      <div className="border-t border-slate-800 pt-4">
        <label className="block text-sm font-semibold text-white mb-3">
          Border Radius
        </label>
        <input
          type="text"
          value={buttons.borderRadius}
          onChange={(e) => onUpdate({ borderRadius: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
        />
      </div>
    </div>
  );
}

// Effects Tab Component
function EffectsTab({ effects, onUpdate }: any) {
  return (
    <div className="space-y-6">
      {/* Shadows */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Box Shadows</h3>
        <div className="space-y-3">
          {Object.entries(effects.shadows).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-slate-300 mb-1.5 capitalize">
                {key}
              </label>
              <input
                type="text"
                value={value as string}
                onChange={(e) =>
                  onUpdate({ shadows: { ...effects.shadows, [key]: e.target.value } })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm mb-2"
              />
              <div
                className="w-full h-12 bg-white rounded"
                style={{ boxShadow: value as string }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Border Radius</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(effects.borderRadius).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-slate-300 mb-1.5 capitalize">
                {key}
              </label>
              <div
                className="w-full h-16 bg-blue-500"
                style={{ borderRadius: value as string }}
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) =>
                  onUpdate({
                    borderRadius: { ...effects.borderRadius, [key]: e.target.value },
                  })
                }
                className="w-full mt-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Transitions */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Transitions</h3>
        <div className="space-y-2">
          {Object.entries(effects.transitions).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-16 capitalize">{key}</span>
              <input
                type="text"
                value={value as string}
                onChange={(e) =>
                  onUpdate({
                    transitions: { ...effects.transitions, [key]: e.target.value },
                  })
                }
                className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reusable Color Input Component
function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-300 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded border border-slate-700 bg-slate-800 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
