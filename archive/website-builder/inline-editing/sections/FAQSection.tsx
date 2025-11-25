import { useRef, useEffect, useState } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion, AnimatePresence } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Plus, Minus, Trash2, HelpCircle } from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

interface FAQSectionProps {
    sectionId: string;
    content: {
        heading: string;
        subheading: string;
        faqs: FAQItem[];
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

export default function FAQSection({
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
}: FAQSectionProps) {
    const { theme, typography } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [openId, setOpenId] = useState<string | null>(null);

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

    const updateFAQ = (id: string, field: keyof FAQItem, value: string) => {
        const updatedFAQs = content.faqs.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateField('faqs', updatedFAQs);
    };

    const addFAQ = () => {
        const newFAQ: FAQItem = {
            id: crypto.randomUUID(),
            question: 'New Question',
            answer: 'This is the answer to the new question. You can edit this text to provide helpful information to your visitors.',
        };
        updateField('faqs', [...(content.faqs || []), newFAQ]);
        setOpenId(newFAQ.id); // Auto-open new item
    };

    const removeFAQ = (id: string) => {
        const updatedFAQs = content.faqs.filter((item) => item.id !== id);
        updateField('faqs', updatedFAQs);
    };

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    // Defaults
    const faqs = content.faqs || [
        {
            id: '1',
            question: 'What services do you offer?',
            answer: 'We offer a wide range of services tailored to meet your needs. Contact us to learn more about how we can help you achieve your goals.',
        },
        {
            id: '2',
            question: 'How can I get started?',
            answer: 'Getting started is easy! Simply contact us through our website or give us a call. We will guide you through the process step-by-step.',
        },
        {
            id: '3',
            question: 'Do you offer support?',
            answer: 'Yes, we provide dedicated support to ensure your success. Our team is available to answer any questions you may have.',
        },
    ];

    const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
    const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');
    const questionClasses = getBodyClasses(typography, 'lg', 'bold');
    const answerClasses = getBodyClasses(typography, 'base', 'normal');

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="FAQ"
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                        {/* Header Side */}
                        <div className="lg:col-span-4 space-y-6">
                            <ScrollReveal direction="right">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                                    <HelpCircle className="w-6 h-6 text-white" />
                                </div>
                                {editMode ? (
                                    <InlineEditor
                                        value={content.heading || 'Frequently Asked Questions'}
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
                                        {content.heading || 'Frequently Asked Questions'}
                                    </h2>
                                )}
                            </ScrollReveal>

                            <ScrollReveal direction="right" delay={0.1}>
                                {editMode ? (
                                    <InlineEditor
                                        value={content.subheading || 'Find answers to common questions about our services and process.'}
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
                                        {content.subheading || 'Find answers to common questions about our services and process.'}
                                    </p>
                                )}
                            </ScrollReveal>
                        </div>

                        {/* FAQ List Side */}
                        <div className="lg:col-span-8 space-y-4">
                            <AnimatePresence>
                                {faqs.map((faq, index) => (
                                    <ScrollReveal
                                        key={faq.id}
                                        direction="up"
                                        delay={index * 0.1}
                                    >
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`rounded-2xl overflow-hidden transition-colors ${openId === faq.id ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-transparent'
                                                }`}
                                            style={{
                                                border: `1px solid ${theme.colors.border}`,
                                            }}
                                        >
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleFAQ(faq.id)}
                                                    className="w-full flex items-center justify-between p-6 text-left group"
                                                >
                                                    <div className="flex-1 pr-8">
                                                        {editMode ? (
                                                            <div onClick={(e) => e.stopPropagation()}>
                                                                <InlineEditor
                                                                    value={faq.question}
                                                                    onChange={(val) => updateFAQ(faq.id, 'question', val)}
                                                                    type="text"
                                                                    editMode={editMode}
                                                                    className={`${questionClasses}`}
                                                                    style={{ color: theme.colors.text }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className={`${questionClasses}`}
                                                                style={{ color: theme.colors.text }}
                                                            >
                                                                {faq.question}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openId === faq.id
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {openId === faq.id ? (
                                                            <Minus className="w-4 h-4" />
                                                        ) : (
                                                            <Plus className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </button>

                                                {editMode && (
                                                    <button
                                                        onClick={() => removeFAQ(faq.id)}
                                                        className="absolute top-6 right-16 p-2 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {openId === faq.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    >
                                                        <div className="px-6 pb-6 pt-0">
                                                            {editMode ? (
                                                                <InlineEditor
                                                                    value={faq.answer}
                                                                    onChange={(val) => updateFAQ(faq.id, 'answer', val)}
                                                                    type="text"
                                                                    editMode={editMode}
                                                                    className={`${answerClasses}`}
                                                                    style={{ color: theme.colors.text, opacity: 0.8 }}
                                                                />
                                                            ) : (
                                                                <p
                                                                    className={`${answerClasses}`}
                                                                    style={{ color: theme.colors.text, opacity: 0.8 }}
                                                                >
                                                                    {faq.answer}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </ScrollReveal>
                                ))}
                            </AnimatePresence>

                            {editMode && (
                                <motion.button
                                    onClick={addFAQ}
                                    className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Add Question</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
