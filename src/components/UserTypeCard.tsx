import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTypeCardProps {
    title: string;
    description: string;
    image: string;
    icon: LucideIcon;
    onClick: () => void;
    buttonColor?: string;
    buttonTextColor?: string;
    popular?: boolean;
}

export function UserTypeCard({
    title,
    description,
    image,
    icon: Icon,
    onClick,
    buttonColor = 'bg-[rgb(29,29,31)]',
    buttonTextColor = 'text-white',
    popular = false,
}: UserTypeCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full transition-shadow hover:shadow-xl"
        >
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Popular Badge */}
                {popular && (
                    <div className="absolute top-4 right-4 bg-[rgb(0,113,227)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        POPULAR
                    </div>
                )}

                {/* Icon Badge */}
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[rgb(0,113,227)]" />
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6 pt-8">
                <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-3">
                    {title}
                </h3>
                <p className="text-[rgb(134,142,150)] text-sm leading-relaxed mb-8 flex-grow">
                    {description}
                </p>

                {/* Button */}
                <button
                    onClick={onClick}
                    className={cn(
                        "w-full py-3 px-6 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300 group-hover:gap-3",
                        buttonColor,
                        buttonTextColor
                    )}
                >
                    Get started
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
