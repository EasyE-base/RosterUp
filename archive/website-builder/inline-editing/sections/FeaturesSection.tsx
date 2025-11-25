import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion, AnimatePresence } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import {
    Plus,
    Trash2,
    Zap,
    Shield,
    Smartphone,
    Globe,
    Layers,
    Cpu,
    Code,
    Database
} from 'lucide-react';

interface FeatureItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

interface FeaturesSectionProps {
    sectionId: string;
    content: {
        heading: string;
        subheading: string;
        features: FeatureItem[];
        variant?: 'default' | 'grid' | 'cards';
        element_overrides?: Record<string, Record<string, string>>;
    };
    styles?: Record<string, any>;
    editMode: boolean;
    onUpdate: (content: Record<string, any>) => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onSettings?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

export default function FeaturesSection({
    sectionId: _sectionId,
    content,
    styles = {},
    editMode,
    onUpdate,
    onDuplicate,
    onDelete,
    onSettings,
    onMoveUp,
    onMoveDown,
    canMoveUp = true,
    canMoveDown = true,
}: FeaturesSectionProps) {
    const { theme, typography } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);

    // Apply element style overrides
    useEffect(() => {
        const elementOverrides = content.element_overrides;
        if (sectionRef.current && elementOverrides) {
            applyElementOverrides(sectionRef.current, elementOverrides);
        }
    }, [content.element_overrides]);

    const updateField = (field: string, value: any) => {
        onUpdate({ ...content, [field]: value });
    };

    const updateFeature = (id: string, field: keyof FeatureItem, value: string) => {
        const updatedFeatures = content.features.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateField('features', updatedFeatures);
    };

    const addFeature = () => {
        const newFeature: FeatureItem = {
            id: crypto.randomUUID(),
            title: 'New Feature',
            description: 'Describe this feature and how it benefits your users.',
            icon: 'zap',
        };
        updateField('features', [...(content.features || []), newFeature]);
    };

    const removeFeature = (id: string) => {
        const updatedFeatures = content.features.filter((item) => item.id !== id);
        updateField('features', updatedFeatures);
    };

    // Defaults
    const features = content.features || [
        { id: '1', title: 'Lightning Fast', description: 'Optimized for speed and performance.', icon: 'zap' },
        { id: '2', title: 'Secure', description: 'Enterprise-grade security built-in.', icon: 'shield' },
        { id: '3', title: 'Mobile Ready', description: 'Responsive design for all devices.', icon: 'smartphone' },
        { id: '4', title: 'Global Scale', description: 'Deploy worldwide with a click.', icon: 'globe' },
    ];

    const getIcon = (iconName: string) => {
        switch (iconName.toLowerCase()) {
            case 'zap': return Zap;
            case 'shield': return Shield;
            case 'smartphone': return Smartphone;
            case 'globe': return Globe;
            case 'layers': return Layers;
            case 'cpu': return Cpu;
            case 'code': return Code;
            case 'database': return Database;
            default: return Zap;
        }
    };

    const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
    const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');
    const titleClasses = getHeadingClasses(typography, 'h4', 'bold', 'normal');
    const descClasses = getBodyClasses(typography, 'base', 'normal');

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Features"
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onSettings={onSettings}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
        >
            <div
                ref={sectionRef}
                className={`relative py-20 ${theme.spacing.sectionPadding}`}
                style={{
                    backgroundColor: theme.colors.background,
                    ...styles,
                }}
            >
                <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <ScrollReveal direction="up">
                            {editMode ? (
                                <InlineEditor
                                    value={content.heading || 'Our Features'}
                                    onChange={(val) => updateField('heading', val)}
                                    type="heading"
                                    editMode={editMode}
                                    className={`${headingClasses} mb-4`}
                                    style={{ color: theme.colors.text }}
                                />
                            ) : (
                                <h2
                                    className={`${headingClasses} mb-4`}
                                    style={{ color: theme.colors.text }}
                                >
                                    {content.heading || 'Our Features'}
                                </h2>
                            )}
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={0.1}>
                            {editMode ? (
                                <InlineEditor
                                    value={content.subheading || 'Discover what makes us different and how we can help you succeed.'}
                                    onChange={(val) => updateField('subheading', val)}
                                    type="text"
                                    editMode={editMode}
                                    className={`${subheadingClasses}`}
                                    style={{ color: theme.colors.text, opacity: 0.7 }}
                                />
                            ) : (
                                <p
                                    className={`${subheadingClasses}`}
                                    style={{ color: theme.colors.text, opacity: 0.7 }}
                                >
                                    {content.subheading || 'Discover what makes us different and how we can help you succeed.'}
                                </p>
                            )}
                        </ScrollReveal>
                    </div>

                    {/* Grid */}
                    {/* Variant: default = 4-column, grid = 3-column, cards = 2-column with enhanced cards */}
                    <div className={`grid gap-8 ${content.variant === 'cards'
                            ? 'grid-cols-1 md:grid-cols-2'
                            : content.variant === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                        }`}>
                        <AnimatePresence>
                            {features.map((feature, index) => {
                                const Icon = getIcon(feature.icon);
                                const isCardsVariant = content.variant === 'cards';

                                return (
                                    <ScrollReveal
                                        key={feature.id}
                                        direction="up"
                                        delay={index * 0.1}
                                        className="relative group"
                                    >
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`p-6 rounded-2xl transition-all ${isCardsVariant
                                                    ? 'bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl ${isCardsVariant
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                } flex items-center justify-center mb-6`}>
                                                <Icon className="w-6 h-6" />
                                            </div>

                                            {editMode ? (
                                                <>
                                                    <InlineEditor
                                                        value={feature.title}
                                                        onChange={(val) => updateFeature(feature.id, 'title', val)}
                                                        type="text"
                                                        editMode={editMode}
                                                        className={`${titleClasses} mb-3`}
                                                        style={{ color: theme.colors.text }}
                                                    />
                                                    <InlineEditor
                                                        value={feature.description}
                                                        onChange={(val) => updateFeature(feature.id, 'description', val)}
                                                        type="text"
                                                        editMode={editMode}
                                                        className={`${descClasses}`}
                                                        style={{ color: theme.colors.text, opacity: 0.7 }}
                                                    />
                                                    <button
                                                        onClick={() => removeFeature(feature.id)}
                                                        className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <h3
                                                        className={`${titleClasses} mb-3`}
                                                        style={{ color: theme.colors.text }}
                                                    >
                                                        {feature.title}
                                                    </h3>
                                                    <p
                                                        className={`${descClasses}`}
                                                        style={{ color: theme.colors.text, opacity: 0.7 }}
                                                    >
                                                        {feature.description}
                                                    </p>
                                                </>
                                            )}
                                        </motion.div>
                                    </ScrollReveal>
                                );
                            })}
                        </AnimatePresence>

                        {editMode && (
                            <motion.button
                                onClick={addFeature}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all min-h-[200px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-8 h-8 mb-4" />
                                <span className="font-medium">Add Feature</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
