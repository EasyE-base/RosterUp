import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Palette, Layout, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useSelectedElement } from '../../../contexts/SelectedElementContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { WebsiteSection } from '../../../lib/supabase';

interface QuickStylePopupProps {
    sections: WebsiteSection[];
    onUpdateSection: (sectionId: string, updates: any) => void;
}

export default function QuickStylePopup({ sections, onUpdateSection }: QuickStylePopupProps) {
    const { selectedElement } = useSelectedElement();
    const { theme } = useTheme();
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedElement) {
            setIsVisible(false);
            return;
        }

        const updatePosition = () => {
            const element = document.querySelector(`[data-element-id="${selectedElement.elementId}"]`);
            if (element) {
                const rect = element.getBoundingClientRect();
                // Position above the element, centered
                setPosition({
                    top: rect.top - 60, // 60px above
                    left: rect.left + rect.width / 2
                });
                setIsVisible(true);
            }
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [selectedElement]);

    if (!selectedElement || !isVisible) return null;

    const handleStyleChange = (property: string, value: any) => {
        if (selectedElement.elementType === 'section') {
            const section = sections.find(s => s.id === selectedElement.elementId);
            if (section) {
                if (property === 'backgroundColor') {
                    onUpdateSection(section.id, {
                        styles: {
                            backgroundColor: value
                        }
                    });
                } else if (property === 'padding') {
                    // Map padding classes to CSS values
                    let paddingValue = '5rem'; // default py-20
                    if (value === 'py-12') paddingValue = '3rem';
                    if (value === 'py-32') paddingValue = '8rem';

                    onUpdateSection(section.id, {
                        styles: {
                            paddingTop: paddingValue,
                            paddingBottom: paddingValue
                        }
                    });
                }
            }
        } else if (selectedElement.elementType === 'text' || selectedElement.elementType === 'heading') {
            const sectionId = selectedElement.sectionId;
            if (sectionId) {
                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    const elementId = selectedElement.elementId;
                    const sectionContent = section.styles?.content || {};
                    const currentOverrides = sectionContent.element_overrides || {};
                    const elementOverride = currentOverrides[elementId] || {};

                    const newOverrides = {
                        ...currentOverrides,
                        [elementId]: {
                            ...elementOverride,
                            [property]: value
                        }
                    };

                    onUpdateSection(sectionId, {
                        content: {
                            ...sectionContent,
                            element_overrides: newOverrides
                        }
                    });
                }
            }
        }
    };

    // Render options based on element type
    const renderOptions = () => {
        if (selectedElement.elementType === 'text' || selectedElement.elementType === 'heading') {
            return (
                <div className="flex items-center gap-2 p-2">
                    {/* Font Size */}
                    <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                        <Type className="w-4 h-4 text-slate-400" />
                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                        >
                            <option value="">Size</option>
                            <option value="0.875rem">Small</option>
                            <option value="1rem">Medium</option>
                            <option value="1.25rem">Large</option>
                            <option value="1.5rem">XL</option>
                            <option value="2rem">2XL</option>
                        </select>
                    </div>

                    {/* Weight */}
                    <button
                        onClick={() => handleStyleChange('fontWeight', '700')}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>

                    {/* Colors */}
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                        <button
                            onClick={() => handleStyleChange('color', theme.colors.primary)}
                            className="w-5 h-5 rounded-full border border-slate-200"
                            style={{ backgroundColor: theme.colors.primary }}
                            title="Primary Color"
                        />
                        <button
                            onClick={() => handleStyleChange('color', theme.colors.accent)}
                            className="w-5 h-5 rounded-full border border-slate-200"
                            style={{ backgroundColor: theme.colors.accent }}
                            title="Accent Color"
                        />
                        <button
                            onClick={() => handleStyleChange('color', theme.colors.text)}
                            className="w-5 h-5 rounded-full border border-slate-200"
                            style={{ backgroundColor: theme.colors.text }}
                            title="Text Color"
                        />
                    </div>
                </div>
            );
        }

        if (selectedElement.elementType === 'section') {
            return (
                <div className="flex items-center gap-2 p-2">
                    {/* Background */}
                    <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                        <Palette className="w-4 h-4 text-slate-400" />
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleStyleChange('backgroundColor', theme.colors.background)}
                                className="w-5 h-5 rounded border border-slate-200"
                                style={{ backgroundColor: theme.colors.background }}
                                title="Background"
                            />
                            <button
                                onClick={() => handleStyleChange('backgroundColor', theme.colors.backgroundAlt)}
                                className="w-5 h-5 rounded border border-slate-200"
                                style={{ backgroundColor: theme.colors.backgroundAlt }}
                                title="Alt Background"
                            />
                            <button
                                onClick={() => handleStyleChange('backgroundColor', theme.colors.primary)}
                                className="w-5 h-5 rounded border border-slate-200"
                                style={{ backgroundColor: theme.colors.primary }}
                                title="Primary Background"
                            />
                        </div>
                    </div>

                    {/* Padding */}
                    <div className="flex items-center gap-1 pl-2">
                        <Layout className="w-4 h-4 text-slate-400" />
                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                            onChange={(e) => handleStyleChange('padding', e.target.value)}
                        >
                            <option value="py-20">Normal</option>
                            <option value="py-12">Compact</option>
                            <option value="py-32">Spacious</option>
                        </select>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div
            ref={popupRef}
            className="fixed z-50 pointer-events-none" // Wrapper is pointer-events-none to not block
            style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -100%)' // Center horizontally, position above
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 pointer-events-auto" // Content is pointer-events-auto
                    >
                        {renderOptions()}

                        {/* Arrow */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
