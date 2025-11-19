import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTypeCardProps {
    title: string;
    description: string;
    image: string;
    icon?: LucideIcon;
    onClick: () => void;
    color: string; // e.g., "bg-yellow-400"
    roleLabel?: string;
}

export function UserTypeCard({
    title,
    description,
    image,
    onClick,
    color,
    roleLabel = "Role",
}: UserTypeCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative flex flex-col items-center bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-full transition-all duration-300 hover:shadow-xl"
        >
            {/* Top Label */}
            <div className="w-full flex justify-start mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {roleLabel}
                </span>
            </div>

            {/* Circular Image Container */}
            <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                {/* Colored Background Circle */}
                <div className={cn(
                    "absolute inset-0 rounded-full opacity-20 scale-110 transition-transform duration-500 group-hover:scale-125",
                    color
                )} />

                {/* Image Circle */}
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center text-center flex-grow">
                <h3 className="text-3xl font-bold text-[rgb(29,29,31)] mb-4">
                    {title}
                </h3>
                <p className="text-[rgb(134,142,150)] text-sm leading-relaxed mb-8 max-w-[240px]">
                    {description}
                </p>
            </div>

            {/* Button */}
            <button
                onClick={onClick}
                className="mt-auto w-full max-w-[160px] py-3 px-6 rounded-full bg-[rgb(29,29,31)] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-black group-hover:scale-105 shadow-md hover:shadow-lg"
            >
                Select
                <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
