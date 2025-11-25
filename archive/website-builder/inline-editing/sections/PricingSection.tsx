import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion, AnimatePresence } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Plus, Trash2, Check, Star } from 'lucide-react';

interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    ctaText: string;
    isPopular: boolean;
}

interface PricingSectionProps {
    sectionId: string;
    content: {
        heading: string;
        subheading: string;
        plans: PricingPlan[];
        variant?: 'default' | 'compact' | 'featured';
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

export default function PricingSection({
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
}: PricingSectionProps) {
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

    const updatePlan = (id: string, field: keyof PricingPlan, value: any) => {
        const updatedPlans = content.plans.map((plan) =>
            plan.id === id ? { ...plan, [field]: value } : plan
        );
        updateField('plans', updatedPlans);
    };

    const updatePlanFeature = (planId: string, featureIndex: number, value: string) => {
        const updatedPlans = content.plans.map((plan) => {
            if (plan.id === planId) {
                const newFeatures = [...plan.features];
                newFeatures[featureIndex] = value;
                return { ...plan, features: newFeatures };
            }
            return plan;
        });
        updateField('plans', updatedPlans);
    };

    const addPlanFeature = (planId: string) => {
        const updatedPlans = content.plans.map((plan) => {
            if (plan.id === planId) {
                return { ...plan, features: [...plan.features, 'New Feature'] };
            }
            return plan;
        });
        updateField('plans', updatedPlans);
    };

    const removePlanFeature = (planId: string, featureIndex: number) => {
        const updatedPlans = content.plans.map((plan) => {
            if (plan.id === planId) {
                const newFeatures = plan.features.filter((_, i) => i !== featureIndex);
                return { ...plan, features: newFeatures };
            }
            return plan;
        });
        updateField('plans', updatedPlans);
    };

    const addPlan = () => {
        const newPlan: PricingPlan = {
            id: crypto.randomUUID(),
            name: 'New Plan',
            price: '$99',
            period: '/month',
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
            ctaText: 'Get Started',
            isPopular: false,
        };
        updateField('plans', [...(content.plans || []), newPlan]);
    };

    const removePlan = (id: string) => {
        const updatedPlans = content.plans.filter((plan) => plan.id !== id);
        updateField('plans', updatedPlans);
    };

    const togglePopular = (id: string) => {
        const updatedPlans = content.plans.map((plan) =>
            plan.id === id ? { ...plan, isPopular: !plan.isPopular } : plan
        );
        updateField('plans', updatedPlans);
    };

    // Defaults
    const plans = content.plans || [
        {
            id: '1',
            name: 'Starter',
            price: '$29',
            period: '/month',
            features: ['Basic Features', '5 Users', 'Email Support'],
            ctaText: 'Start Free Trial',
            isPopular: false,
        },
        {
            id: '2',
            name: 'Pro',
            price: '$79',
            period: '/month',
            features: ['Advanced Features', 'Unlimited Users', 'Priority Support', 'Analytics'],
            ctaText: 'Get Started',
            isPopular: true,
        },
        {
            id: '3',
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            features: ['Custom Solutions', 'Dedicated Manager', 'SLA', 'SSO'],
            ctaText: 'Contact Sales',
            isPopular: false,
        },
    ];

    const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
    const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');
    const planNameClasses = getHeadingClasses(typography, 'h4', 'bold', 'normal');
    const priceClasses = getHeadingClasses(typography, 'h3', 'bold', 'tight');

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Pricing"
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
                                    value={content.heading || 'Simple Pricing'}
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
                                    {content.heading || 'Simple Pricing'}
                                </h2>
                            )}
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={0.1}>
                            {editMode ? (
                                <InlineEditor
                                    value={content.subheading || 'Choose the plan that fits your needs.'}
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
                                    {content.subheading || 'Choose the plan that fits your needs.'}
                                </p>
                            )}
                        </ScrollReveal>
                    </div>

                    {/* Plans Grid - Layout changes based on variant */}
                    <div className={`grid gap-8 ${content.variant === 'compact'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : content.variant === 'featured'
                            ? 'grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto'
                            : 'grid-cols-1 md:grid-cols-3'
                        }`}>
                        <AnimatePresence>
                            {plans.map((plan, index) => {
                                const isCompact = content.variant === 'compact';
                                const isFeatured = content.variant === 'featured';
                                const showPopularBadge = isFeatured ? plan.isPopular : plan.isPopular;

                                return (
                                    <ScrollReveal
                                        key={plan.id}
                                        direction="up"
                                        delay={index * 0.1}
                                        className={`relative h-full ${isFeatured && plan.isPopular ? 'lg:scale-110 lg:z-10' : ''
                                            }`}
                                    >
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`h-full ${isCompact ? 'p-6' : 'p-8'
                                                } rounded-2xl border transition-all flex flex-col ${plan.isPopular
                                                    ? 'border-blue-500 shadow-lg ring-1 ring-blue-500 bg-white dark:bg-slate-800'
                                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                                }`}
                                        >
                                            {showPopularBadge && (
                                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                        Most Popular
                                                    </span>
                                                </div>
                                            )}

                                            {/* Plan Header */}
                                            <div className={`mb-6 text-center ${isCompact ? 'mb-4' : 'mb-6'
                                                }`}>
                                                {editMode ? (
                                                    <>
                                                        <InlineEditor
                                                            value={plan.name}
                                                            onChange={(val) => updatePlan(plan.id, 'name', val)}
                                                            type="text"
                                                            editMode={editMode}
                                                            className={`${isCompact ? getHeadingClasses(typography, 'h4', 'bold', 'normal') : planNameClasses
                                                                } mb-2`}
                                                            style={{ color: theme.colors.text }}
                                                        />
                                                        <div className="flex items-center justify-center gap-1">
                                                            <InlineEditor
                                                                value={plan.price}
                                                                onChange={(val) => updatePlan(plan.id, 'price', val)}
                                                                type="text"
                                                                editMode={editMode}
                                                                className={`${isCompact ? getHeadingClasses(typography, 'h4', 'bold', 'tight') : priceClasses
                                                                    }`}
                                                                style={{ color: theme.colors.text }}
                                                            />
                                                            <InlineEditor
                                                                value={plan.period}
                                                                onChange={(val) => updatePlan(plan.id, 'period', val)}
                                                                type="text"
                                                                editMode={editMode}
                                                                className={`${isCompact ? 'text-xs' : 'text-sm'
                                                                    } opacity-70`}
                                                                style={{ color: theme.colors.text }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h3
                                                            className={`${isCompact ? getHeadingClasses(typography, 'h4', 'bold', 'normal') : planNameClasses
                                                                } mb-2`}
                                                            style={{ color: theme.colors.text }}
                                                        >
                                                            {plan.name}
                                                        </h3>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span
                                                                className={`${isCompact ? getHeadingClasses(typography, 'h4', 'bold', 'tight') : priceClasses
                                                                    }`}
                                                                style={{ color: theme.colors.text }}
                                                            >
                                                                {plan.price}
                                                            </span>
                                                            <span
                                                                className={`${isCompact ? 'text-xs' : 'text-sm'
                                                                    } opacity-70`}
                                                                style={{ color: theme.colors.text }}
                                                            >
                                                                {plan.period}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Features List */}
                                            <div className="flex-grow mb-8">
                                                <ul className={`${isCompact ? 'space-y-2' : 'space-y-3'
                                                    }`}>
                                                    {plan.features.map((feature, fIndex) => (
                                                        <li key={fIndex} className="flex items-start gap-3">
                                                            <Check className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'
                                                                } text-green-500 flex-shrink-0 mt-0.5`} />
                                                            {editMode ? (
                                                                <div className="flex-grow flex items-center gap-2">
                                                                    <InlineEditor
                                                                        value={feature}
                                                                        onChange={(val) => updatePlanFeature(plan.id, fIndex, val)}
                                                                        type="text"
                                                                        editMode={editMode}
                                                                        className={`${isCompact ? 'text-xs' : 'text-sm'
                                                                            } flex-grow`}
                                                                        style={{ color: theme.colors.text, opacity: 0.8 }}
                                                                    />
                                                                    <button
                                                                        onClick={() => removePlanFeature(plan.id, fIndex)}
                                                                        className="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    className={`${isCompact ? 'text-xs' : 'text-sm'
                                                                        }`}
                                                                    style={{ color: theme.colors.text, opacity: 0.8 }}
                                                                >
                                                                    {feature}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {editMode && (
                                                    <button
                                                        onClick={() => addPlanFeature(plan.id)}
                                                        className="mt-4 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Feature
                                                    </button>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            <div>
                                                {editMode ? (
                                                    <div className="relative group">
                                                        <button
                                                            className={`w-full ${isCompact ? 'py-2 px-4 text-sm' : 'py-3 px-6'
                                                                } rounded-lg font-medium transition-colors ${plan.isPopular
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                                                                }`}
                                                        >
                                                            <InlineEditor
                                                                value={plan.ctaText}
                                                                onChange={(val) => updatePlan(plan.id, 'ctaText', val)}
                                                                type="text"
                                                                editMode={editMode}
                                                                className="text-center w-full"
                                                            />
                                                        </button>
                                                        <div className="absolute -top-12 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                                                            <button
                                                                onClick={() => togglePopular(plan.id)}
                                                                className={`p-1.5 rounded ${plan.isPopular ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:text-yellow-500'
                                                                    }`}
                                                                title="Toggle Popular"
                                                            >
                                                                <Star className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removePlan(plan.id)}
                                                                className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                                title="Remove Plan"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className={`w-full ${isCompact ? 'py-2 px-4 text-sm' : 'py-3 px-6'
                                                            } rounded-lg font-medium transition-colors ${plan.isPopular
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                                                            }`}
                                                    >
                                                        {plan.ctaText}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    </ScrollReveal>
                                );
                            })}
                        </AnimatePresence>

                        {editMode && (
                            <motion.button
                                onClick={addPlan}
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all ${content.variant === 'compact' ? 'min-h-[300px]' : 'min-h-[400px]'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-8 h-8 mb-4" />
                                <span className="font-medium">Add Plan</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
