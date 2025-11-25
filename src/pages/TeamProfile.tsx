import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase, Team } from '../lib/supabase';
import { AppleEmptyState, AppleHeading, AppleCard, AppleCardContent } from '../components/apple';
import TeamHero from '../components/team/TeamHero';
import TeamStatsBar from '../components/team/TeamStatsBar';
import TeamRosterGrid from '../components/team/TeamRosterGrid';
import ContactTeamModal from '../components/team/ContactTeamModal';
import TeamHistory from '../components/team/TeamHistory';
import TeamMediaGallery from '../components/team/TeamMediaGallery';
import { cn } from '@/lib/utils';

interface TeamWithDetails extends Team {
    organizations: {
        name: string;
        city: string | null;
        state: string | null;
        logo_url: string | null;
    };
}

interface RosterPlayer {
    id: string;
    first_name: string;
    last_name: string;
    jersey_number?: number | null;
    position?: string | null;
    photo_url?: string | null;
    is_captain?: boolean;
}

export default function TeamProfile() {
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();
    const [team, setTeam] = useState<TeamWithDetails | null>(null);
    const [roster, setRoster] = useState<RosterPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'history' | 'media'>('overview');

    useEffect(() => {
        if (teamId) {
            loadTeamData();
        }
    }, [teamId]);

    const loadTeamData = async () => {
        try {
            setLoading(true);

            // Fetch Team Details
            const { data: teamData, error: teamError } = await supabase
                .from('teams')
                .select('*, organizations(name, city, state, logo_url)')
                .eq('id', teamId)
                .single();

            if (teamError) throw teamError;
            setTeam(teamData as TeamWithDetails);

            // Fetch Roster
            const { data: rosterData, error: rosterError } = await supabase
                .from('team_members')
                .select(`
                    id,
                    position,
                    jersey_number,
                    status,
                    is_guest,
                    guest_first_name,
                    guest_last_name,
                    guest_photo_url,
                    players (
                        id,
                        user_id,
                        primary_position,
                        profile_visibility,
                        profiles (
                            full_name,
                            avatar_url
                        )
                    )
                `)
                .eq('team_id', teamId);

            if (rosterError) throw rosterError;

            // For registered players, fetch player profiles separately using user_id
            const registeredMembers = rosterData.filter((m: any) => !m.is_guest && m.players);
            const userIds = registeredMembers.map((m: any) => m.players.user_id).filter(Boolean);

            let playerProfilesData: any[] = [];
            if (userIds.length > 0) {
                const { data, error: profilesError } = await supabase
                    .from('player_profiles')
                    .select('user_id, photo_url')
                    .in('user_id', userIds);

                if (profilesError) {
                    console.error('Error fetching player profiles:', profilesError);
                } else {
                    playerProfilesData = data || [];
                }
            }

            const formattedRoster = rosterData.map((member: any) => {
                // Handle guest players
                if (member.is_guest) {
                    return {
                        id: member.id,
                        first_name: member.guest_first_name,
                        last_name: member.guest_last_name || '',
                        jersey_number: member.jersey_number,
                        position: member.position,
                        photo_url: member.guest_photo_url || null,
                        is_captain: false,
                    };
                }

                // Handle registered players
                const playerProfile = playerProfilesData?.find((p: any) => p.user_id === member.players.user_id);
                const fullName = member.players.profiles.full_name || 'Unknown Player';
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                const photoUrl = playerProfile?.photo_url || member.players.profiles.avatar_url;

                return {
                    id: member.players.id,
                    first_name: firstName,
                    last_name: lastName,
                    jersey_number: member.jersey_number,
                    position: member.position || member.players.primary_position,
                    photo_url: photoUrl || null,
                    is_captain: false,
                };
            });

            setRoster(formattedRoster);

        } catch (error) {
            console.error('Error loading team profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 flex items-center justify-center">
                <AppleEmptyState
                    title="Team not found"
                    description="The team you're looking for doesn't exist or has been removed."
                    icon={<Loader2 className="w-16 h-16 text-[rgb(134,142,150)]" />}
                    action={{
                        label: 'Browse Teams',
                        onClick: () => navigate('/teams'),
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[rgb(251,251,253)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/teams')}
                    className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to teams</span>
                </button>

                <TeamHero
                    team={team}
                    onContactClick={() => setShowContactModal(true)}
                />

                <TeamStatsBar
                    team={team}
                    rosterCount={roster.length}
                />

                <div className="mt-8 mb-6 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'roster', 'history', 'media'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize",
                                    activeTab === tab
                                        ? "border-[rgb(0,113,227)] text-[rgb(0,113,227)]"
                                        : "border-transparent text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] hover:border-slate-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'overview' && (
                            <section>
                                <AppleHeading level={2} size="card" className="mb-4">About the Team</AppleHeading>
                                <AppleCard>
                                    <AppleCardContent className="p-6">
                                        <p className="text-[rgb(134,142,150)] leading-relaxed whitespace-pre-wrap">
                                            {team.bio || "No team bio available yet."}
                                        </p>

                                        {(team.practice_schedule || team.home_field) && (
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[rgb(210,210,215)]">
                                                {team.practice_schedule && (
                                                    <div>
                                                        <h4 className="font-semibold text-[rgb(29,29,31)] mb-2">Practice Schedule</h4>
                                                        <p className="text-sm text-[rgb(134,142,150)]">{team.practice_schedule}</p>
                                                    </div>
                                                )}
                                                {team.home_field && (
                                                    <div>
                                                        <h4 className="font-semibold text-[rgb(29,29,31)] mb-2">Home Field</h4>
                                                        <p className="text-sm text-[rgb(134,142,150)]">{team.home_field}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </AppleCardContent>
                                </AppleCard>
                            </section>
                        )}

                        {activeTab === 'roster' && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <AppleHeading level={2} size="card">Roster</AppleHeading>
                                    <span className="text-sm text-[rgb(134,142,150)]">
                                        {roster.length} Players
                                    </span>
                                </div>
                                <TeamRosterGrid
                                    players={roster}
                                />
                            </section>
                        )}

                        {activeTab === 'history' && (
                            <TeamHistory teamId={team.id} />
                        )}

                        {activeTab === 'media' && (
                            <TeamMediaGallery teamId={team.id} />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Events / Quick Info could go here */}
                        {/* Placeholder for future content */}
                    </div>
                </div>
            </div>

            <ContactTeamModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                teamId={team.id}
                teamName={team.name}
                organizationId={team.organization_id}
            />
        </div>
    );
}
