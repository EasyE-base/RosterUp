import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AIOrbProps {
    onClick: () => void;
    isOpen: boolean;
}

export default function AIOrb({ onClick, isOpen }: AIOrbProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div id="ai-orb" className="fixed bottom-8 right-8 z-[100] pointer-events-auto">
            <motion.button
                onClick={() => {
                    console.log('AI Orb clicked');
                    onClick();
                }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Outer Glow */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-50"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Orb Body */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                    {/* Inner Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20" />

                    {/* Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />

                    {/* Icon */}
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sparkles className={`w-8 h-8 ${isOpen ? 'text-white' : 'text-blue-400'} transition-colors`} />
                    </motion.div>
                </div>

                {/* Label (Tooltip) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
                    className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none border border-white/10 shadow-xl"
                >
                    AI Director
                </motion.div>
            </motion.button>
        </div>
    );
}
