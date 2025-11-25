import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
    sectionId: string;
    content: {
        heading: string;
        subheading: string;
        cta_text: string;
        cta_link: string;
        background_image?: string;
        variant?: 'default' | 'minimal' | 'bold';
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

export default function CTASection({
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
}: CTASectionProps) {
    const { theme, typography } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);

    // Apply element style overrides
    useEffect(() => {
        const elementOverrides = content.element_overrides;
        if (sectionRef.current && elementOverrides) {
            applyElementOverrides(sectionRef.current, elementOverrides);
        }
    }, [content.element_overrides]);

    const updateField = (field: string, value: string) => {
        onUpdate({ ...content, [field]: value });
    };

    const variant = content.variant || 'default';

    const headingClasses = getHeadingClasses(typography, 'h2', 'extrabold', 'tight');
    const subheadingClasses = getBodyClasses(typography, 'xl', 'normal');

    // Variant-specific styling
    const containerClasses = {
        default: 'text-center',
        minimal: 'text-center',
        bold: 'text-left grid lg:grid-cols-2 gap-12 items-center',
    };

    const paddingClasses = {
        default: 'py-24 lg:py-32',
        minimal: 'py-16 lg:py-20',
        bold: 'py-20 lg:py-28',
    };

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Call to Action"
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
                className={`relative ${paddingClasses[variant]} overflow-hidden`}
                style={{
                    backgroundColor: variant === 'minimal' ? theme.colors.backgroundAlt : theme.colors.primary,
                    ...styles,
                }}
            >
                {/* Background Image */}
                {content.background_image && (
                    <div className="absolute inset-0 z-0">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${content.background_image})` }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(135deg, ${theme.colors.primary}dd 0%, ${theme.colors.primaryDark}ee 100%)`,
                            }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className={`relative z-10 ${theme.spacing.containerMaxWidth} mx-auto px-4 ${containerClasses[variant]}`}>
                    <ScrollReveal direction="up">
                        {editMode ? (
                            <InlineEditor
                                value={content.heading || 'Ready to Get Started?'}
                                onChange={(val) => updateField('heading', val)}
                                type="heading"
                                editMode={editMode}
                                className={`${variant === 'bold' ? getHeadingClasses(typography, 'h1', 'extrabold', 'tight') : headingClasses} mb-6`}
                                style={{ color: variant === 'minimal' ? theme.colors.text : theme.colors.textInverse }}
                            />
                        ) : (
                            <h2
                                className={`${variant === 'bold' ? getHeadingClasses(typography, 'h1', 'extrabold', 'tight') : headingClasses} mb-6`}
                                style={{ color: variant === 'minimal' ? theme.colors.text : theme.colors.textInverse }}
                            >
                                {content.heading || 'Ready to Get Started?'}
                            </h2>
                        )}
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={0.1}>
                        {editMode ? (
                            <InlineEditor
                                value={content.subheading || 'Join us today and take your game to the next level.'}
                                onChange={(val) => updateField('subheading', val)}
                                type="text"
                                editMode={editMode}
                                className={`${subheadingClasses} ${variant === 'bold' ? 'max-w-none' : 'max-w-2xl mx-auto'} mb-10`}
                                style={{ color: variant === 'minimal' ? theme.colors.textMuted : theme.colors.textInverse, opacity: 0.9 }}
                            />
                        ) : (
                            <p
                                className={`${subheadingClasses} ${variant === 'bold' ? 'max-w-none' : 'max-w-2xl mx-auto'} mb-10`}
                                style={{ color: variant === 'minimal' ? theme.colors.textMuted : theme.colors.textInverse, opacity: 0.9 }}
                            >
                                {content.subheading || 'Join us today and take your game to the next level.'}
                            </p>
                        )}
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={0.2}>
                        <div className={`flex flex-col ${variant === 'bold' ? 'items-start' : 'items-center'} gap-6`}>
                            {editMode ? (
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                                    <InlineEditor
                                        value={content.cta_text || 'Sign Up Now'}
                                        onChange={(val) => updateField('cta_text', val)}
                                        type="text"
                                        editMode={editMode}
                                        className="font-bold text-lg px-6 py-3 bg-white text-blue-600 rounded-lg"
                                        style={{ color: theme.colors.primary }}
                                    />
                                </div>
                            ) : (
                                <motion.a
                                    href={content.cta_link || '#'}
                                    className={`inline-flex items-center gap-2 font-bold transition-all transform hover:-translate-y-1 ${variant === 'bold'
                                            ? 'px-12 py-5 bg-white rounded-2xl text-2xl shadow-2xl hover:shadow-3xl'
                                            : variant === 'minimal'
                                                ? 'px-6 py-3 rounded-lg border-2 shadow-sm hover:shadow-md'
                                                : 'px-8 py-4 bg-white rounded-xl text-lg shadow-lg hover:shadow-xl'
                                        }`}
                                    style={{
                                        color: variant === 'minimal' ? theme.colors.primary : theme.colors.primary,
                                        backgroundColor: variant === 'minimal' ? 'transparent' : 'white',
                                        borderColor: variant === 'minimal' ? theme.colors.primary : 'transparent',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {content.cta_text || 'Sign Up Now'}
                                    <ArrowRight className={variant === 'bold' ? 'w-6 h-6' : 'w-5 h-5'} />
                                </motion.a>
                            )}

                            {editMode && (
                                <div className="w-full max-w-md">
                                    <DragDropImageUpload
                                        value={content.background_image}
                                        onChange={(url) => updateField('background_image', url)}
                                        editMode={editMode}
                                        placeholder="Add Background Image"
                                        aspectRatio="video"
                                        showUnsplash={true}
                                    />
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </SectionWrapper>
    );
}
