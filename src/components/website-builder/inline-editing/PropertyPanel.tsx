import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronRight,
  Box,
  Type,
  Palette,
  Zap,
  Code,
  Layout,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

interface PropertyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSection: any | null;
  onUpdateSection: (updates: Record<string, any>) => void;
}

type PanelSection = 'layout' | 'typography' | 'colors' | 'spacing' | 'animations' | 'custom';

export default function PropertyPanel({
  isOpen,
  onClose,
  selectedSection,
  onUpdateSection,
}: PropertyPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<PanelSection>>(
    new Set(['layout', 'spacing'])
  );

  const toggleSection = (section: PanelSection) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Preset spacing values
  const spacingPresets = [
    { label: 'None', value: '0' },
    { label: 'XS', value: '0.5rem' },
    { label: 'SM', value: '1rem' },
    { label: 'MD', value: '2rem' },
    { label: 'LG', value: '3rem' },
    { label: 'XL', value: '4rem' },
  ];

  // Preset colors
  const colorPresets = [
    { name: 'Primary Blue', value: '#3b82f6' },
    { name: 'Primary Dark', value: '#1e40af' },
    { name: 'Accent Purple', value: '#8b5cf6' },
    { name: 'Success Green', value: '#10b981' },
    { name: 'Warning Yellow', value: '#f59e0b' },
    { name: 'Danger Red', value: '#ef4444' },
    { name: 'Dark', value: '#1e293b' },
    { name: 'Light', value: '#f8fafc' },
  ];

  // Typography presets
  const fontSizes = ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
  const fontWeights = [
    { label: 'Light', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semibold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Extrabold', value: '800' },
  ];

  const CollapsibleSection = ({
    id,
    title,
    icon: Icon,
    children,
  }: {
    id: PanelSection;
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border-b border-slate-700">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const SpacingControl = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm text-slate-300 font-medium">{label}</label>
      <div className="grid grid-cols-6 gap-2">
        {spacingPresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              value === preset.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );

  const ColorPicker = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm text-slate-300 font-medium">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {colorPresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            title={preset.name}
            className={`h-10 rounded-lg transition-all border-2 ${
              value === preset.value
                ? 'border-white scale-110 shadow-lg'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: preset.value }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#3b82f6'}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3b82f6"
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );

  const ToggleGroup = ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: { icon: any; value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm text-slate-300 font-medium">{label}</label>
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              title={option.label}
              className={`flex-1 px-3 py-2 rounded-lg transition-all ${
                value === option.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const SelectControl = ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm text-slate-300 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const SliderControl = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    unit,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-300 font-medium">{label}</label>
        <span className="text-sm text-blue-400 font-mono">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-gradient-to-b from-slate-900 to-slate-800 border-l border-slate-700 shadow-2xl z-[9999] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Layout className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Properties</h2>
                  <p className="text-xs text-slate-400">
                    {selectedSection ? 'Section Selected' : 'No Selection'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!selectedSection ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="p-4 bg-slate-800 rounded-full mb-4">
                    <Layout className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Section Selected
                  </h3>
                  <p className="text-sm text-slate-400">
                    Hover over a section and click the settings icon to edit its properties
                  </p>
                </div>
              ) : (
                <>
                  {/* Layout Section */}
                  <CollapsibleSection id="layout" title="Layout" icon={Box}>
                    <ToggleGroup
                      label="Alignment"
                      options={[
                        { icon: AlignLeft, value: 'left', label: 'Left' },
                        { icon: AlignCenter, value: 'center', label: 'Center' },
                        { icon: AlignRight, value: 'right', label: 'Right' },
                        { icon: AlignJustify, value: 'justify', label: 'Justify' },
                      ]}
                      value={selectedSection?.alignment || 'left'}
                      onChange={(value) => onUpdateSection({ alignment: value })}
                    />

                    <SliderControl
                      label="Max Width"
                      value={selectedSection?.maxWidth || 1200}
                      onChange={(value) => onUpdateSection({ maxWidth: value })}
                      min={600}
                      max={1920}
                      step={10}
                      unit="px"
                    />

                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <span className="text-sm text-slate-300">Full Width</span>
                      <button
                        onClick={() =>
                          onUpdateSection({ fullWidth: !selectedSection?.fullWidth })
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          selectedSection?.fullWidth ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <motion.div
                          animate={{ x: selectedSection?.fullWidth ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>
                  </CollapsibleSection>

                  {/* Spacing Section */}
                  <CollapsibleSection id="spacing" title="Spacing" icon={Maximize2}>
                    <SpacingControl
                      label="Padding Top"
                      value={selectedSection?.paddingTop || '3rem'}
                      onChange={(value) => onUpdateSection({ paddingTop: value })}
                    />
                    <SpacingControl
                      label="Padding Bottom"
                      value={selectedSection?.paddingBottom || '3rem'}
                      onChange={(value) => onUpdateSection({ paddingBottom: value })}
                    />
                    <SpacingControl
                      label="Padding Left"
                      value={selectedSection?.paddingLeft || '1rem'}
                      onChange={(value) => onUpdateSection({ paddingLeft: value })}
                    />
                    <SpacingControl
                      label="Padding Right"
                      value={selectedSection?.paddingRight || '1rem'}
                      onChange={(value) => onUpdateSection({ paddingRight: value })}
                    />
                  </CollapsibleSection>

                  {/* Colors Section */}
                  <CollapsibleSection id="colors" title="Colors" icon={Palette}>
                    <ColorPicker
                      label="Background Color"
                      value={selectedSection?.backgroundColor || '#ffffff'}
                      onChange={(value) => onUpdateSection({ backgroundColor: value })}
                    />
                    <ColorPicker
                      label="Text Color"
                      value={selectedSection?.textColor || '#1e293b'}
                      onChange={(value) => onUpdateSection({ textColor: value })}
                    />
                  </CollapsibleSection>

                  {/* Typography Section */}
                  <CollapsibleSection id="typography" title="Typography" icon={Type}>
                    <SelectControl
                      label="Font Size"
                      options={fontSizes.map((size) => ({ label: size, value: size }))}
                      value={selectedSection?.fontSize || 'base'}
                      onChange={(value) => onUpdateSection({ fontSize: value })}
                    />
                    <SelectControl
                      label="Font Weight"
                      options={fontWeights}
                      value={selectedSection?.fontWeight || '400'}
                      onChange={(value) => onUpdateSection({ fontWeight: value })}
                    />
                  </CollapsibleSection>

                  {/* Animations Section */}
                  <CollapsibleSection id="animations" title="Animations" icon={Zap}>
                    <SelectControl
                      label="Entrance Animation"
                      options={[
                        { label: 'None', value: 'none' },
                        { label: 'Fade In', value: 'fadeIn' },
                        { label: 'Slide Up', value: 'slideUp' },
                        { label: 'Slide Left', value: 'slideLeft' },
                        { label: 'Zoom In', value: 'zoomIn' },
                      ]}
                      value={selectedSection?.animation || 'none'}
                      onChange={(value) => onUpdateSection({ animation: value })}
                    />
                    <SliderControl
                      label="Animation Duration"
                      value={selectedSection?.animationDuration || 300}
                      onChange={(value) => onUpdateSection({ animationDuration: value })}
                      min={100}
                      max={2000}
                      step={100}
                      unit="ms"
                    />
                    <SliderControl
                      label="Animation Delay"
                      value={selectedSection?.animationDelay || 0}
                      onChange={(value) => onUpdateSection({ animationDelay: value })}
                      min={0}
                      max={2000}
                      step={100}
                      unit="ms"
                    />
                  </CollapsibleSection>

                  {/* Custom CSS Section */}
                  <CollapsibleSection id="custom" title="Custom CSS" icon={Code}>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300 font-medium">
                        Custom Styles
                      </label>
                      <textarea
                        value={selectedSection?.customCss || ''}
                        onChange={(e) => onUpdateSection({ customCss: e.target.value })}
                        placeholder="/* Add custom CSS here */"
                        className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        Advanced users can add custom CSS here
                      </p>
                    </div>
                  </CollapsibleSection>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Figma-inspired controls</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span>Live Preview</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
