import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion, AnimatePresence } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Plus, Trash2 } from 'lucide-react';

interface StatItem {
    id: string;
    value: string;
    label: string;
}

interface StatsSectionProps {
    sectionId: string;
    content: {
        stats: StatItem[];
        variant?: 'default' | 'compact' | 'highlighted';
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

export default function StatsSection({
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
}: StatsSectionProps) {
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

    const updateStat = (id: string, field: keyof StatItem, value: string) => {
        const updatedStats = content.stats.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateField('stats', updatedStats);
    };

    const addStat = () => {
        const newStat: StatItem = {
            id: crypto.randomUUID(),
            value: '100+',
            label: 'New Metric',
        };
        updateField('stats', [...(content.stats || []), newStat]);
    };

    const removeStat = (id: string) => {
        const updatedStats = content.stats.filter((item) => item.id !== id);
        updateField('stats', updatedStats);
    };

    // Defaults
    const stats = content.stats || [
        { id: '1', value: '500+', label: 'Happy Clients' },
        { id: '2', value: '50+', label: 'Team Members' },
        { id: '3', value: '10', label: 'Years Experience' },
        { id: '4', value: '24/7', label: 'Support' },
    ];

    const valueClasses = getHeadingClasses(typography, 'h2', 'extrabold', 'tight');
    const labelClasses = getBodyClasses(typography, 'lg', 'normal');

    const variant = content.variant || 'default';

    // Variant-specific grid classes
    const gridClasses = {
        default: 'grid grid-cols-2 md:grid-cols-4 gap-8 text-center',
        compact: 'flex flex-wrap justify-center gap-12',
        highlighted: 'grid grid-cols-1 md:grid-cols-3 gap-12 text-center',
    };

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Stats"
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
                className={`relative py-16 ${theme.spacing.sectionPadding}`}
                style={{
                    backgroundColor: theme.colors.primary,
                    ...styles,
                }}
            >
                <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
                    <div className={gridClasses[variant]}>
                        <AnimatePresence>
                            {stats.map((stat, index) => (
                                <ScrollReveal
                                    key={stat.id}
                                    direction="up"
                                    delay={index * 0.1}
                                    className="relative group"
                                >
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="p-4 rounded-xl transition-colors hover:bg-white/5"
                                    >
                                        {editMode ? (
                                            <>
                                                <InlineEditor
                                                    value={stat.value}
                                                    onChange={(val) => updateStat(stat.id, 'value', val)}
                                                    type="text"
                                                    editMode={editMode}
                                                    className={`${valueClasses} mb-2`}
                                                    style={{ color: theme.colors.textInverse }}
                                                />
                                                <InlineEditor
                                                    value={stat.label}
                                                    onChange={(val) => updateStat(stat.id, 'label', val)}
                                                    type="text"
                                                    editMode={editMode}
                                                    className={`${labelClasses}`}
                                                    style={{ color: theme.colors.textInverse, opacity: 0.8 }}
                                                />
                                                <button
                                                    onClick={() => removeStat(stat.id)}
                                                    className="absolute top-0 right-0 p-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h3
                                                    className={`${valueClasses} mb-2`}
                                                    style={{ color: theme.colors.textInverse }}
                                                >
                                                    {stat.value}
                                                </h3>
                                                <p
                                                    className={`${labelClasses}`}
                                                    style={{ color: theme.colors.textInverse, opacity: 0.8 }}
                                                >
                                                    {stat.label}
                                                </p>
                                            </>
                                        )}
                                    </motion.div>
                                </ScrollReveal>
                            ))}
                        </AnimatePresence>

                        {editMode && (
                            <motion.button
                                onClick={addStat}
                                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="font-medium">Add Stat</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
