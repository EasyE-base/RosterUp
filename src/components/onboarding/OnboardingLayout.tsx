import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface OnboardingLayoutProps {
    title: string;
    subtitle: string;
    currentStep: number;
    totalSteps: number;
    stepTitles?: string[];
    children: React.ReactNode;
}

export default function OnboardingLayout({
    title,
    subtitle,
    currentStep,
    totalSteps,
    stepTitles,
    children
}: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12 font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">
            <div className="w-full max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-3 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-[#86868B] text-lg">
                            {subtitle}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Bar Background */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#E5E5EA] rounded-full -z-10" />

                            {/* Active Progress Bar */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0071E3] rounded-full -z-10 transition-all duration-500 ease-out"
                                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                            />

                            {Array.from({ length: totalSteps }).map((_, index) => {
                                const stepNum = index + 1;
                                const isActive = stepNum <= currentStep;
                                const isCompleted = stepNum < currentStep;

                                return (
                                    <div key={stepNum} className="flex flex-col items-center gap-2 bg-white/0"> {/* bg-white/0 to fix z-index stacking context if needed, but mainly just a wrapper */}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2 ${isActive
                                                    ? 'bg-[#0071E3] border-[#0071E3] text-white shadow-lg shadow-blue-500/30'
                                                    : 'bg-white border-[#D2D2D7] text-[#86868B]'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                stepNum
                                            )}
                                        </div>
                                        {stepTitles && stepTitles[index] && (
                                            <span className={`absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                                                }`}
                                                style={{
                                                    left: `${(index / (totalSteps - 1)) * 100}%`,
                                                    transform: 'translateX(-50%)'
                                                }}
                                            >
                                                {stepTitles[index]}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Spacer for step titles */}
                        {stepTitles && <div className="h-6" />}
                    </div>

                    {/* Content */}
                    <div className="relative">
                        {children}
                    </div>

                </motion.div>

                {/* Footer / Copyright */}
                <div className="mt-8 text-center text-xs text-[#86868B]">
                    <p>&copy; {new Date().getFullYear()} RosterUp. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
