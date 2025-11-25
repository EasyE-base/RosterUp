import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, ArrowRight, Wand2 } from 'lucide-react';

interface SiteGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (data: any) => Promise<void>;
}

export default function SiteGenerationModal({
    isOpen,
    onClose,
    onGenerate,
}: SiteGenerationModalProps) {
    const [step, setStep] = useState<'input' | 'generating'>('input');
    const [prompt, setPrompt] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [tone, setTone] = useState('professional');
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        'Analyzing your request...',
        'Architecting site structure...',
        'Drafting professional copy...',
        'Selecting imagery...',
        'Finalizing design...',
    ];

    const handleGenerate = async () => {
        if (!prompt || !businessName) return;

        setStep('generating');

        // Simulate progress steps
        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
        }, 2000);

        try {
            await onGenerate({
                prompt,
                businessName,
                tone,
            });
        } catch (error: any) {
            console.error('Generation failed:', error);
            setStep('input'); // Go back to input on error
            alert(`Failed to generate site: ${error.message || 'Unknown error'}`);
        } finally {
            clearInterval(interval);
            setLoadingStep(0);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none"
                    >
                        <div
                            className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {step === 'input' ? (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                                <Wand2 className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">AI Site Generator</h2>
                                                <p className="text-slate-400">Describe your dream website, and we'll build it.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <X className="w-6 h-6 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                What is the name of your business or team?
                                            </label>
                                            <input
                                                type="text"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="e.g., Elite Strikers FC"
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Describe your website in detail
                                            </label>
                                            <textarea
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder="e.g., A professional website for a youth soccer academy. We focus on player development, elite training, and college recruitment. We need sections for our programs, coaches, and a contact form."
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-32 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Tone of Voice
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Professional', 'Energetic', 'Friendly'].map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setTone(t.toLowerCase())}
                                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${tone === t.toLowerCase()
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerate}
                                            disabled={!prompt || !businessName}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            Generate Website
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                                    <div className="relative w-24 h-24 mb-8">
                                        <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Building {businessName}
                                    </h3>

                                    <div className="h-8 overflow-hidden mb-8">
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={loadingStep}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="text-slate-400"
                                            >
                                                {loadingSteps[loadingStep]}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>

                                    <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
