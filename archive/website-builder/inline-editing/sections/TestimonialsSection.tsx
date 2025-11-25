import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion, AnimatePresence } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Quote, Plus, Trash2, User } from 'lucide-react';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    avatar?: string;
}

interface TestimonialsSectionProps {
    sectionId: string;
    content: {
        heading: string;
        subheading: string;
        testimonials: Testimonial[];
        variant?: 'default' | 'carousel' | 'grid';
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

export default function TestimonialsSection({
    sectionId,
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
}: TestimonialsSectionProps) {
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

    const updateTestimonial = (id: string, field: keyof Testimonial, value: string) => {
        const updatedTestimonials = content.testimonials.map((t) =>
            t.id === id ? { ...t, [field]: value } : t
        );
        updateField('testimonials', updatedTestimonials);
    };

    const addTestimonial = () => {
        const newTestimonial: Testimonial = {
            id: crypto.randomUUID(),
            name: 'Client Name',
            role: 'Client Role',
            quote: 'This is a glowing testimonial about your amazing services. It really highlights the value you provide.',
        };
        updateField('testimonials', [...(content.testimonials || []), newTestimonial]);
    };

    const removeTestimonial = (id: string) => {
        const updatedTestimonials = content.testimonials.filter((t) => t.id !== id);
        updateField('testimonials', updatedTestimonials);
    };

    // Defaults
    const testimonials = content.testimonials || [
        {
            id: '1',
            name: 'John Doe',
            role: 'CEO, TechCorp',
            quote: 'Absolutely incredible service. The team went above and beyond to deliver exactly what we needed.',
        },
        {
            id: '2',
            name: 'Jane Smith',
            role: 'Director, Creative Studio',
            quote: 'The attention to detail and design quality is unmatched. Highly recommended for any serious business.',
        },
        {
            id: '3',
            name: 'Mike Johnson',
            role: 'Founder, StartupX',
            quote: 'Fast, reliable, and professional. They transformed our online presence completely.',
        },
    ];

    const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
    const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');
    const quoteClasses = getBodyClasses(typography, 'lg', 'normal');
    const nameClasses = getBodyClasses(typography, 'base', 'bold');
    const roleClasses = getBodyClasses(typography, 'sm', 'normal');

    const variant = content.variant || 'default';

    // Variant-specific grid classes
    const gridClasses = {
        default: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
        carousel: 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto',
        grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    };

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Testimonials"
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
                    backgroundColor: theme.colors.backgroundAlt,
                    ...styles,
                }}
            >
                <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <ScrollReveal direction="up">
                            {editMode ? (
                                <InlineEditor
                                    value={content.heading || 'What Our Clients Say'}
                                    onChange={(val) => updateField('heading', val)}
                                    type="heading"
                                    editMode={editMode}
                                    className={`${headingClasses}`}
                                    style={{ color: theme.colors.text }}
                                />
                            ) : (
                                <h2
                                    className={`${headingClasses}`}
                                    style={{ color: theme.colors.text }}
                                >
                                    {content.heading || 'What Our Clients Say'}
                                </h2>
                            )}
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={0.1}>
                            {editMode ? (
                                <InlineEditor
                                    value={content.subheading || 'Trusted by leaders in the industry'}
                                    onChange={(val) => updateField('subheading', val)}
                                    type="text"
                                    editMode={editMode}
                                    className={`${subheadingClasses}`}
                                    style={{ color: theme.colors.text }}
                                />
                            ) : (
                                <p
                                    className={`${subheadingClasses}`}
                                    style={{ color: theme.colors.text }}
                                >
                                    {content.subheading || 'Trusted by leaders in the industry'}
                                </p>
                            )}
                        </ScrollReveal>
                    </div>

                    {/* Grid */}
                    <div className={gridClasses[variant]}>
                        <AnimatePresence>
                            {testimonials.map((testimonial, index) => (
                                <ScrollReveal
                                    key={testimonial.id}
                                    direction="up"
                                    delay={index * 0.1}
                                    className="h-full"
                                >
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col relative group"
                                        style={{
                                            backgroundColor: theme.colors.background,
                                            borderColor: theme.colors.border,
                                        }}
                                    >
                                        {editMode && (
                                            <button
                                                onClick={() => removeTestimonial(testimonial.id)}
                                                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        <Quote className="w-10 h-10 text-blue-500/20 mb-6" />

                                        <div className="flex-1 mb-6">
                                            {editMode ? (
                                                <InlineEditor
                                                    value={testimonial.quote}
                                                    onChange={(val) => updateTestimonial(testimonial.id, 'quote', val)}
                                                    type="text"
                                                    editMode={editMode}
                                                    className={`${quoteClasses} italic`}
                                                    style={{ color: theme.colors.text }}
                                                />
                                            ) : (
                                                <p
                                                    className={`${quoteClasses} italic`}
                                                    style={{ color: theme.colors.text }}
                                                >
                                                    "{testimonial.quote}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                {testimonial.avatar ? (
                                                    <img
                                                        src={testimonial.avatar}
                                                        alt={testimonial.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {editMode ? (
                                                    <>
                                                        <InlineEditor
                                                            value={testimonial.name}
                                                            onChange={(val) => updateTestimonial(testimonial.id, 'name', val)}
                                                            type="text"
                                                            editMode={editMode}
                                                            className={`${nameClasses} truncate`}
                                                            style={{ color: theme.colors.text }}
                                                        />
                                                        <InlineEditor
                                                            value={testimonial.role}
                                                            onChange={(val) => updateTestimonial(testimonial.id, 'role', val)}
                                                            type="text"
                                                            editMode={editMode}
                                                            className={`${roleClasses} truncate`}
                                                            style={{ color: theme.colors.text }}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <h4
                                                            className={`${nameClasses} truncate`}
                                                            style={{ color: theme.colors.text }}
                                                        >
                                                            {testimonial.name}
                                                        </h4>
                                                        <p
                                                            className={`${roleClasses} truncate`}
                                                            style={{ color: theme.colors.text }}
                                                        >
                                                            {testimonial.role}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </ScrollReveal>
                            ))}
                        </AnimatePresence>

                        {/* Add Button */}
                        {editMode && (
                            <motion.button
                                onClick={addTestimonial}
                                className="h-full min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <span className="font-medium">Add Testimonial</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
