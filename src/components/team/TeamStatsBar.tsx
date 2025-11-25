import { Trophy, Users, Calendar, Medal } from 'lucide-react';
import { AppleCard, AppleCardContent } from '../apple';
import { Team } from '../../lib/supabase';

interface TeamStatsBarProps {
    team: Team;
    rosterCount: number;
}

export default function TeamStatsBar({ team, rosterCount }: TeamStatsBarProps) {
    const stats = [
        {
            label: 'Record',
            value: `${team.wins}-${team.losses}`,
            icon: <Trophy className="w-5 h-5 text-[rgb(255,149,0)]" />,
            show: team.wins > 0 || team.losses > 0,
        },
        {
            label: 'Roster',
            value: `${rosterCount}${team.roster_limit ? `/${team.roster_limit}` : ''}`,
            icon: <Users className="w-5 h-5 text-[rgb(0,113,227)]" />,
            show: true,
        },
        {
            label: 'Founded',
            value: team.founded_year || new Date(team.created_at).getFullYear(),
            icon: <Calendar className="w-5 h-5 text-[rgb(52,199,89)]" />,
            show: true,
        },
        {
            label: 'Classification',
            value: team.classification || 'N/A',
            icon: <Medal className="w-5 h-5 text-[rgb(175,82,222)]" />,
            show: !!team.classification,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.filter(s => s.show).map((stat, index) => (
                <AppleCard key={index} className="hover:shadow-md transition-shadow">
                    <AppleCardContent className="p-4 flex items-center space-x-4">
                        <div className="p-3 bg-[rgb(245,245,247)] rounded-full">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[rgb(134,142,150)] uppercase tracking-wider">
                                {stat.label}
                            </p>
                            <p className="text-lg font-bold text-[rgb(29,29,31)]">
                                {stat.value}
                            </p>
                        </div>
                    </AppleCardContent>
                </AppleCard>
            ))}
        </div>
    );
}
