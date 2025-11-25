import { motion } from 'framer-motion';
import { Plus, Command } from 'lucide-react';

interface UserTypeCardProps {
    title: string;
    description: string;
    image: string;
    onClick: () => void;
    roleLabel?: string;
    color?: string; // Kept for compatibility but unused in new design
}

export function UserTypeCard({
    title,
    description,
    image,
    onClick,
    roleLabel = "Role",
}: UserTypeCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="group relative w-full aspect-[3/5] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-shadow duration-500 bg-white"
            onClick={onClick}
        >
            {/* Full Background Image */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    loading="lazy"
                />
                {/* Subtle gradient overlay to ensure text contrast if needed, though glass pane handles most */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
            </div>

            {/* Glassmorphic Bottom Panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 shadow-lg transition-colors duration-300 group-hover:bg-white/90">
                {/* Top Row: Icon + Label + Icon */}
                <div className="flex justify-between items-center mb-3 opacity-60">
                    <div className="p-1.5 rounded-full border border-black/10">
                        <Plus className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/70">
                        {roleLabel}
                    </span>
                    <div className="p-1.5 rounded-full border border-black/10">
                        <Command className="w-3 h-3 text-black" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-semibold text-black tracking-tight text-center mb-2">
                    {title}
                </h3>

                {/* Description (Hidden by default, shown on hover? Or just small?) 
                    User image didn't show description, but for UX we might want it. 
                    Let's keep it very subtle or remove if strictly following image.
                    I'll add it as a very small subtle text for context.
                */}
                <p className="text-center text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 px-2">
                    {description}
                </p>

                {/* Hover Indicator */}
                <div className="flex justify-center mt-4 gap-1.5">
                    <div className="w-8 h-1 bg-black/20 rounded-full group-hover:bg-black/80 transition-colors duration-300" />
                    <div className="w-1.5 h-1 bg-black/10 rounded-full" />
                </div>
            </div>
        </motion.div>
    );
}
