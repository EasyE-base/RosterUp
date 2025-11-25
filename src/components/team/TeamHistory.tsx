import { useEffect, useState } from 'react';
import { Trophy, Calendar, MapPin, Loader2 } from 'lucide-react';
import { supabase, TeamAchievement, TournamentParticipant, Tournament } from '../../lib/supabase';
import { AppleCard, AppleHeading, AppleEmptyState, AppleBadge } from '../apple';
import AchievementCard from './AchievementCard';

interface TeamHistoryProps {
    teamId: string;
}

interface TournamentHistoryItem extends TournamentParticipant {
    tournaments: Tournament;
}

export default function TeamHistory({ teamId }: TeamHistoryProps) {
    const [achievements, setAchievements] = useState<TeamAchievement[]>([]);
    const [tournamentHistory, setTournamentHistory] = useState<TournamentHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [teamId]);

    const loadHistory = async () => {
        try {
            // Load Achievements
            const { data: achievementsData } = await supabase
                .from('team_achievements')
                .select('*')
                .eq('team_id', teamId)
                .order('date_achieved', { ascending: false });

            setAchievements(achievementsData || []);

            // Load Tournament History
            const { data: tournamentsData } = await supabase
                .from('tournament_participants')
                .select('*, tournaments(*)')
                .eq('team_id', teamId)
                .in('status', ['confirmed', 'completed']) // Assuming these are the statuses for past participation
                .order('created_at', { ascending: false });

            setTournamentHistory(tournamentsData as unknown as TournamentHistoryItem[] || []);

        } catch (error) {
            console.error('Error loading team history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
            </div>
        );
    }

    if (achievements.length === 0 && tournamentHistory.length === 0) {
        return (
            <AppleEmptyState
                icon={<Trophy className="w-16 h-16" />}
                title="No History Yet"
                description="This team hasn't recorded any achievements or tournament history yet."
                iconColor="gray"
            />
        );
    }

    return (
        <div className="space-y-10">
            {/* Achievements Section */}
            {achievements.length > 0 && (
                <section>
                    <AppleHeading level={3} size="card" className="mb-6">
                        Achievements
                    </AppleHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                </section>
            )}

            {/* Tournament History Section */}
            {tournamentHistory.length > 0 && (
                <section>
                    <AppleHeading level={3} size="card" className="mb-6">
                        Tournament History
                    </AppleHeading>
                    <div className="space-y-4">
                        {tournamentHistory.map((item) => (
                            <AppleCard key={item.id} variant="default" padding="md" hover>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Trophy className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[rgb(29,29,31)] text-lg">
                                                {item.tournaments.title}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-[rgb(134,142,150)]">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(item.tournaments.start_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {item.tournaments.city}, {item.tournaments.state}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {item.placement && (
                                        <div className="flex-shrink-0">
                                            <AppleBadge
                                                variant={
                                                    ['1st', 'Winner', 'Champion'].some(s => item.placement?.includes(s)) ? 'success' :
                                                        ['2nd', 'Finalist'].some(s => item.placement?.includes(s)) ? 'warning' :
                                                            'default'
                                                }
                                                size="lg"
                                            >
                                                {item.placement}
                                            </AppleBadge>
                                        </div>
                                    )}
                                </div>
                            </AppleCard>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
