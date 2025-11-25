import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, Trophy, Loader2 } from 'lucide-react';
import { supabase, Team } from '../lib/supabase';
import {
    AppleInput,
    AppleSelect,
    AppleCard,
    AppleCardContent,
    AppleHeading,
    AppleButton,
    AppleBadge,
    AppleAvatar
} from '../components/apple';

interface TeamWithOrg extends Team {
    organizations: {
        name: string;
        city: string | null;
        state: string | null;
    };
}

export default function TeamsMarketplace() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<TeamWithOrg[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sportFilter, setSportFilter] = useState('');
    const [ageFilter, setAgeFilter] = useState('');

    useEffect(() => {
        loadTeams();
    }, [sportFilter, ageFilter]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('teams')
                .select('*, organizations(name, city, state)')
                .eq('is_active', true);

            if (sportFilter) {
                query = query.eq('sport', sportFilter);
            }

            if (ageFilter) {
                query = query.eq('age_group', ageFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTeams(data as TeamWithOrg[]);
        } catch (error) {
            console.error('Error loading teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.organizations.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sports = ['Baseball', 'Softball', 'Basketball', 'Soccer', 'Volleyball', 'Football'];
    const ageGroups = ['8U', '9U', '10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U', '18U'];

    return (
        <div className="min-h-screen bg-[rgb(251,251,253)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <AppleHeading level={1} size="card" className="mb-2">Find a Team</AppleHeading>
                        <p className="text-[rgb(134,142,150)]">Discover and join competitive teams in your area.</p>
                    </div>
                    <AppleButton variant="primary" onClick={() => navigate('/teams/create')} disabled>
                        List Your Team
                    </AppleButton>
                </div>

                {/* Filters */}
                <AppleCard className="mb-8">
                    <AppleCardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <AppleInput
                                placeholder="Search teams or organizations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-5 h-5 text-gray-400" />}
                                fullWidth
                            />
                            <AppleSelect
                                value={sportFilter}
                                onChange={(e) => setSportFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Sports' },
                                    ...sports.map(s => ({ value: s, label: s }))
                                ]}
                                fullWidth
                            />
                            <AppleSelect
                                value={ageFilter}
                                onChange={(e) => setAgeFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Ages' },
                                    ...ageGroups.map(a => ({ value: a, label: a }))
                                ]}
                                fullWidth
                            />
                        </div>
                    </AppleCardContent>
                </AppleCard>

                {/* Team Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-[rgb(29,29,31)] mb-2">No teams found</h3>
                        <p className="text-[rgb(134,142,150)]">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <div
                                key={team.id}
                                onClick={() => navigate(`/teams/${team.id}`)}
                                className="group cursor-pointer"
                            >
                                <AppleCard className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                                    {/* Card Header / Banner */}
                                    <div className="h-32 bg-gradient-to-r from-[rgb(0,113,227)] to-[rgb(94,92,230)] relative">
                                        {team.banner_url && (
                                            <img
                                                src={team.banner_url}
                                                alt={team.name}
                                                className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                                            />
                                        )}
                                        <div className="absolute -bottom-8 left-6">
                                            <div className="p-1 bg-white rounded-xl shadow-md">
                                                <AppleAvatar
                                                    src={team.logo_url || undefined}
                                                    name={team.name}
                                                    alt={team.name}
                                                    size="lg"
                                                    shape="square"
                                                    className="rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <AppleCardContent className="pt-10 pb-6 px-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-[rgb(29,29,31)] group-hover:text-[rgb(0,113,227)] transition-colors">
                                                    {team.name}
                                                </h3>
                                                <p className="text-sm text-[rgb(134,142,150)] flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {team.organizations.name}
                                                </p>
                                            </div>
                                            <AppleBadge variant="primary" size="sm">
                                                {team.sport}
                                            </AppleBadge>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                                                <MapPin className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                                                {[team.organizations.city, team.organizations.state].filter(Boolean).join(', ') || 'Location N/A'}
                                            </div>
                                            <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                                                <Trophy className="w-4 h-4 mr-2 text-[rgb(255,149,0)]" />
                                                {team.classification || 'Unclassified'} • {team.age_group || 'All Ages'}
                                            </div>
                                        </div>
                                    </AppleCardContent>
                                </AppleCard>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
