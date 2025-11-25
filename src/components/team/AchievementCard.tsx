import { Trophy, Medal, Star, Calendar } from 'lucide-react';
import { AppleCard } from '../apple';
import { TeamAchievement } from '../../lib/supabase';

interface AchievementCardProps {
    achievement: TeamAchievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
    const getIcon = () => {
        switch (achievement.achievement_type) {
            case 'tournament_win':
            case 'league_title':
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 'award':
                return <Medal className="w-6 h-6 text-blue-500" />;
            default:
                return <Star className="w-6 h-6 text-purple-500" />;
        }
    };

    const getGradient = () => {
        switch (achievement.achievement_type) {
            case 'tournament_win':
            case 'league_title':
                return 'from-yellow-50 to-orange-50 border-yellow-100';
            case 'award':
                return 'from-blue-50 to-indigo-50 border-blue-100';
            default:
                return 'from-purple-50 to-pink-50 border-purple-100';
        }
    };

    return (
        <AppleCard
            variant="default"
            padding="lg"
            className={`bg-gradient-to-br ${getGradient()}`}
            hover
            animateOnView
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[rgb(29,29,31)] text-lg leading-tight">
                            {achievement.title}
                        </h3>
                        {achievement.date_achieved && (
                            <div className="flex items-center text-xs text-[rgb(134,142,150)] whitespace-nowrap ml-2">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(achievement.date_achieved).getFullYear()}
                            </div>
                        )}
                    </div>

                    {achievement.description && (
                        <p className="text-sm text-[rgb(86,88,105)] mt-2 leading-relaxed">
                            {achievement.description}
                        </p>
                    )}

                    {achievement.image_url && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-slate-200/60 aspect-video">
                            <img
                                src={achievement.image_url}
                                alt={achievement.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppleCard>
    );
}
