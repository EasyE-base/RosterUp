import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface RosterPlayer {
    id: string;
    first_name: string;
    last_name: string;
    jersey_number?: number | null;
    position?: string | null;
    photo_url?: string | null;
    is_captain?: boolean;
}



export default function TeamRosterGrid({ players }: { players: RosterPlayer[] }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {players.map((player) => (
                <motion.div key={player.id} variants={item} className="group relative">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                        {/* Background Image */}
                        {player.photo_url ? (
                            <img
                                src={player.photo_url}
                                alt={`${player.first_name} ${player.last_name}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <User className="w-24 h-24 text-slate-700" />
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            {/* Jersey Number (Large Watermark style) */}
                            {player.jersey_number !== undefined && player.jersey_number !== null && (
                                <div className="absolute top-4 right-4 text-4xl font-black text-white/10 font-mono">
                                    {player.jersey_number}
                                </div>
                            )}

                            <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    {player.jersey_number !== undefined && player.jersey_number !== null && (
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-bold text-white">
                                            #{player.jersey_number}
                                        </span>
                                    )}
                                    {player.is_captain && (
                                        <span className="px-2 py-0.5 bg-yellow-500/80 backdrop-blur-sm rounded text-xs font-bold text-white">
                                            C
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-1 leading-tight">
                                    {player.first_name}
                                    <br />
                                    <span className="text-blue-400">{player.last_name}</span>
                                </h3>

                                {player.position && (
                                    <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">
                                        {player.position}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Hover Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
