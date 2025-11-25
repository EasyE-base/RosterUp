import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Palette,
  Type,
  Trash2,
  Copy,
  ChevronDown,
} from 'lucide-react';

interface FloatingToolbarProps {
  show: boolean;
  position: { top: number; left: number };
  selectedText: string;
  onFormat: (format: string, value?: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  textColor?: string;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right';
}

const fontSizes = [
  { label: 'Small', value: 'text-sm' },
  { label: 'Normal', value: 'text-base' },
  { label: 'Large', value: 'text-lg' },
  { label: 'XL', value: 'text-xl' },
  { label: '2XL', value: 'text-2xl' },
  { label: '3XL', value: 'text-3xl' },
  { label: '4XL', value: 'text-4xl' },
];

const colors = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
];

export default function FloatingToolbar({
  show,
  position,
  selectedText,
  onFormat,
  onDelete,
  onDuplicate,
  textColor = '#ffffff',
  fontSize = 'text-base',
  textAlign = 'left',
}: FloatingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
        setShowFontSizes(false);
        setShowLinkInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddLink = () => {
    if (linkUrl) {
      onFormat('link', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const ToolbarButton = ({
    onClick,
    active = false,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white'
          : 'hover:bg-slate-700 text-slate-300 hover:text-white'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );

  const Divider = () => <div className="w-px h-6 bg-slate-700" />;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[9999] pointer-events-auto"
          style={{
            top: `${position.top - 60}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-1 flex items-center gap-1 backdrop-blur-lg bg-opacity-95">
            {/* Text Formatting */}
            <ToolbarButton onClick={() => onFormat('bold')} title="Bold (Cmd+B)">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => onFormat('italic')} title="Italic (Cmd+I)">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => onFormat('underline')} title="Underline (Cmd+U)">
              <Underline className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Font Size */}
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowFontSizes(!showFontSizes);
                  setShowColorPicker(false);
                  setShowLinkInput(false);
                }}
                active={showFontSizes}
                title="Font Size"
              >
                <div className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </div>
              </ToolbarButton>

              <AnimatePresence>
                {showFontSizes && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 left-0 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-2 w-32 z-[10000]"
                  >
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => {
                          onFormat('fontSize', size.value);
                          setShowFontSizes(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          fontSize === size.value
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Color Picker */}
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowFontSizes(false);
                  setShowLinkInput(false);
                }}
                active={showColorPicker}
                title="Text Color"
              >
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <div
                    className="w-3 h-3 rounded border border-slate-600"
                    style={{ backgroundColor: textColor }}
                  />
                </div>
              </ToolbarButton>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 left-0 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-3 z-[10000]"
                  >
                    <div className="grid grid-cols-4 gap-2 w-40">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            onFormat('color', color.value);
                            setShowColorPicker(false);
                          }}
                          className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Divider />

            {/* Alignment */}
            <ToolbarButton
              onClick={() => onFormat('align', 'left')}
              active={textAlign === 'left'}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => onFormat('align', 'center')}
              active={textAlign === 'center'}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => onFormat('align', 'right')}
              active={textAlign === 'right'}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Link */}
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowLinkInput(!showLinkInput);
                  setShowColorPicker(false);
                  setShowFontSizes(false);
                }}
                active={showLinkInput}
                title="Add Link"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>

              <AnimatePresence>
                {showLinkInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 left-0 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-3 w-64 z-[10000]"
                  >
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 mb-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddLink();
                        if (e.key === 'Escape') setShowLinkInput(false);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAddLink}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Add Link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section Actions */}
            {(onDuplicate || onDelete) && (
              <>
                <Divider />

                {onDuplicate && (
                  <ToolbarButton onClick={onDuplicate} title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </ToolbarButton>
                )}

                {onDelete && (
                  <ToolbarButton onClick={onDelete} title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </ToolbarButton>
                )}
              </>
            )}
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1">
            <div className="w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
