import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Clock,
  Trophy,
  ArrowRight,
  Loader2,
  Plus,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  TrendingUp,
  Grid3x3,
  Map as MapIcon,
  CheckCircle2,
  XCircle,
  Hourglass,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Tryout, Team } from '../lib/supabase';
import {
  AppleHeading,
  AppleSearchBar,
  AppleButton,
  AppleCard,
  AppleSelect,
  AppleInput,
  AppleTextarea,
  AppleBadge,
  AppleEmptyState,
  AppleModal,
  AppleMetadataRow,
} from '@/components/apple';

interface TryoutWithTeam extends Tryout {
  teams: {
    name: string;
    sport: string;
    age_group: string | null;
    gender: string | null;
    organizations?: {
      name: string;
    };
  };
}

interface TryoutApplication {
  id: string;
  tryout_id: string;
  player_id: string;
  status: string;
  created_at: string;
  tryouts?: {
    title: string;
    date: string;
    teams: {
      name: string;
      sport: string;
    };
  };
}

export default function Tryouts() {
  const { user, organization, player } = useAuth();

  // Organizations default to 'manage', players default to 'discover'
  const [activeTab, setActiveTab] = useState<'discover' | 'manage'>(
    organization ? 'manage' : 'discover'
  );
  const [tryouts, setTryouts] = useState<TryoutWithTeam[]>([]);
  const [featuredTryouts, setFeaturedTryouts] = useState<TryoutWithTeam[]>([]);
  const [myApplications, setMyApplications] = useState<TryoutApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeredTryouts, setRegisteredTryouts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    sport: '',
    ageGroup: '',
    search: '',
  });

  const [formData, setFormData] = useState({
    team_id: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    address: '',
    max_participants: 20,
    requirements: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadTryouts();
    if (organization) {
      loadTeams();
    }
    if (player) {
      loadPlayerApplications();
      loadMyApplications();
    }
  }, [organization, player]);

  const loadTryouts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tryouts')
        .select('*, teams(name, sport, age_group, gender, organizations(name))')
        .eq('status', 'open')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      // If user is an organization, only show their own tryouts
      if (organization) {
        query = query.eq('teams.organization_id', organization.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const allTryouts = (data as TryoutWithTeam[]) || [];
      setTryouts(allTryouts);

      // Set featured tryouts (first 5)
      setFeaturedTryouts(allTryouts.slice(0, 5));
    } catch (error) {
      console.error('Error loading tryouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      if (!organization) return;

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadPlayerApplications = async () => {
    try {
      if (!player) return;

      const { data, error } = await supabase
        .from('tryout_applications')
        .select('tryout_id')
        .eq('player_id', player.id);

      if (error) throw error;

      const tryoutIds = new Set(data?.map(app => app.tryout_id) || []);
      setRegisteredTryouts(tryoutIds);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadMyApplications = async () => {
    try {
      if (!player) return;

      const { data, error } = await supabase
        .from('tryout_applications')
        .select('*, tryouts(title, date, teams(name, sport))')
        .eq('player_id', player.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      setMyApplications(data || []);
    } catch (error) {
      console.error('Error loading my applications:', error);
    }
  };

  const handleRegisterForTryout = async (tryoutId: string) => {
    if (!player) return;

    setRegistering(tryoutId);
    try {
      const { error } = await supabase.from('tryout_applications').insert({
        tryout_id: tryoutId,
        player_id: player.id,
        status: 'pending',
      });

      if (error) throw error;

      setRegisteredTryouts(prev => new Set([...prev, tryoutId]));
      loadMyApplications();
    } catch (error) {
      console.error('Error registering for tryout:', error);
    } finally {
      setRegistering(null);
    }
  };

  const handleCreateTryout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      if (!organization) {
        throw new Error('You must be an organization to create tryouts');
      }

      const selectedTeam = teams.find(t => t.id === formData.team_id);

      const { error: insertError } = await supabase.from('tryouts').insert({
        team_id: formData.team_id,
        organization_id: organization.id,
        title: formData.description || `${selectedTeam?.name} Tryout`,
        description: formData.description,
        sport: selectedTeam?.sport || 'Unknown',
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        address: formData.address,
        total_spots: formData.max_participants,
        spots_available: formData.max_participants,
        requirements: formData.requirements ? JSON.parse(`["${formData.requirements}"]`) : [],
        status: 'open',
      });

      if (insertError) throw insertError;

      setShowCreateModal(false);
      setFormData({
        team_id: '',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        address: '',
        max_participants: 20,
        requirements: '',
        description: '',
      });
      loadTryouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tryout');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Hourglass className="w-4 h-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success' as const;
      case 'rejected':
        return 'danger' as const;
      default:
        return 'warning' as const;
    }
  };

  const filteredTryouts = tryouts.filter((tryout) => {
    if (filters.sport && tryout.teams.sport !== filters.sport) return false;
    if (filters.ageGroup && tryout.teams.age_group !== filters.ageGroup) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        tryout.teams.name.toLowerCase().includes(searchLower) ||
        tryout.location.toLowerCase().includes(searchLower) ||
        tryout.teams.sport.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const uniqueSports = Array.from(new Set(tryouts.map(t => t.teams.sport)));
  const uniqueAgeGroups = Array.from(new Set(tryouts.map(t => t.teams.age_group).filter(Boolean)));

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredTryouts.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredTryouts.length) % featuredTryouts.length);
  };

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <AppleHeading level={1} size="section">
            Tryouts
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            {organization
              ? 'Manage your tryout events and recruit players'
              : 'Discover opportunities and register for tryouts'}
          </p>
        </div>

        {/* Only show tabs if user is a player (not organization) */}
        {player && !organization && (
          <div className="flex space-x-2 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'discover'
                  ? 'text-[rgb(0,113,227)] border-b-2 border-[rgb(0,113,227)]'
                  : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              Discover Tryouts
            </button>
          </div>
        )}

        {/* Discover tab - only for players */}
        {activeTab === 'discover' && !organization && (
          <div className="space-y-8">
            {/* Featured Tryouts Carousel */}
            {featuredTryouts.length > 0 && (
              <AppleCard variant="feature" padding="xl" className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Featured Tryouts</h2>
                  </div>
                  {featuredTryouts.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <AppleButton
                        variant="outline"
                        size="sm"
                        onClick={prevSlide}
                        leftIcon={<ChevronLeft className="w-5 h-5" />}
                      />
                      <AppleButton
                        variant="outline"
                        size="sm"
                        onClick={nextSlide}
                        leftIcon={<ChevronRight className="w-5 h-5" />}
                      />
                    </div>
                  )}
                </div>
                {featuredTryouts[carouselIndex] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-4 flex-wrap gap-2">
                        <h3 className="text-3xl font-bold text-[rgb(29,29,31)]">
                          {featuredTryouts[carouselIndex].teams.name}
                        </h3>
                        <AppleBadge variant="primary" size="md">
                          {featuredTryouts[carouselIndex].teams.sport}
                        </AppleBadge>
                      </div>
                      <p className="text-[rgb(86,88,105)] mb-6">{featuredTryouts[carouselIndex].description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <AppleMetadataRow
                          icon={<Calendar className="w-5 h-5" />}
                          value={formatDate(featuredTryouts[carouselIndex].date)}
                          iconColor="blue"
                          size="sm"
                        />
                        <AppleMetadataRow
                          icon={<MapPin className="w-5 h-5" />}
                          value={featuredTryouts[carouselIndex].location}
                          iconColor="green"
                          size="sm"
                        />
                      </div>
                      {player && (
                        registeredTryouts.has(featuredTryouts[carouselIndex].id) ? (
                          <div className="inline-flex px-6 py-3 bg-green-50 border-[1.5px] border-green-400 text-green-700 font-semibold rounded-lg">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Registered
                          </div>
                        ) : (
                          <AppleButton
                            variant="gradient"
                            size="lg"
                            onClick={() => handleRegisterForTryout(featuredTryouts[carouselIndex].id)}
                            disabled={registering === featuredTryouts[carouselIndex].id}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                          >
                            {registering === featuredTryouts[carouselIndex].id ? 'Registering...' : 'Register Now'}
                          </AppleButton>
                        )
                      )}
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl border-[1.5px] border-blue-200 flex items-center justify-center">
                        <Trophy className="w-32 h-32 text-blue-300" />
                      </div>
                    </div>
                  </div>
                )}
              </AppleCard>
            )}

            {/* My Applications Widget */}
            {player && myApplications.length > 0 && (
              <AppleCard variant="default" padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-lg font-bold text-[rgb(29,29,31)]">My Applications</h3>
                  </div>
                  <span className="text-sm text-[rgb(134,142,150)]">{myApplications.length} active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-[rgb(251,251,253)] border-[1.5px] border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-[rgb(29,29,31)] font-semibold text-sm truncate flex-1">
                          {app.tryouts?.teams.name || 'Team'}
                        </h4>
                        <AppleBadge variant={getStatusBadgeVariant(app.status)} size="sm" icon={getStatusIcon(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </AppleBadge>
                      </div>
                      <p className="text-xs text-[rgb(134,142,150)] mb-2">{app.tryouts?.teams.sport}</p>
                    </div>
                  ))}
                </div>
              </AppleCard>
            )}

            {/* Search and Filters */}
            <AppleCard variant="default" padding="lg">
              <div className="flex flex-col lg:flex-row gap-4">
                <AppleSearchBar
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onClear={() => setFilters({ ...filters, search: '' })}
                  placeholder="Search by team, sport, or location..."
                  fullWidth
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <AppleButton
                    variant={showFilters ? 'primary' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    leftIcon={<Filter className="w-5 h-5" />}
                  >
                    Filters
                  </AppleButton>
                  <AppleButton
                    variant="outline"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                    title={viewMode === 'grid' ? 'Switch to Map View' : 'Switch to Grid View'}
                    leftIcon={viewMode === 'grid' ? <MapIcon className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
                  />
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                  <AppleSelect
                    label="Sport"
                    value={filters.sport}
                    onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                    options={[
                      { value: '', label: 'All Sports' },
                      ...uniqueSports.map(sport => ({ value: sport, label: sport })),
                    ]}
                    fullWidth
                  />
                  <AppleSelect
                    label="Age Group"
                    value={filters.ageGroup}
                    onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                    options={[
                      { value: '', label: 'All Age Groups' },
                      ...uniqueAgeGroups.map(age => ({ value: age!, label: age! })),
                    ]}
                    fullWidth
                  />
                  <div className="flex items-end">
                    <AppleButton
                      variant="text"
                      onClick={() => setFilters({ sport: '', ageGroup: '', search: '' })}
                      fullWidth
                    >
                      Clear Filters
                    </AppleButton>
                  </div>
                </div>
              )}
            </AppleCard>

            {/* Tryouts List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
              </div>
            ) : filteredTryouts.length === 0 ? (
              <AppleEmptyState
                icon={<Trophy className="w-16 h-16" />}
                title="No tryouts available"
                description={
                  filters.search || filters.sport || filters.ageGroup
                    ? 'No tryouts match your filters. Try adjusting your search criteria.'
                    : 'Check back later for upcoming tryout opportunities'
                }
                iconColor="blue"
                action={
                  !player
                    ? {
                        label: 'Create Player Profile',
                        onClick: () => navigate('/signup'),
                        icon: <TrendingUp className="w-5 h-5" />,
                      }
                    : undefined
                }
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[rgb(134,142,150)]">
                    Showing <span className="text-[rgb(29,29,31)] font-semibold">{filteredTryouts.length}</span> tryout{filteredTryouts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {filteredTryouts.map((tryout) => (
                  <AppleCard
                    key={tryout.id}
                    variant="default"
                    padding="lg"
                    hover
                    animateOnView
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                              <h3 className="text-2xl font-bold text-[rgb(29,29,31)]">
                                {tryout.teams.name}
                              </h3>
                              <AppleBadge variant="primary" size="sm">
                                {tryout.teams.sport}
                              </AppleBadge>
                              {tryout.teams.age_group && (
                                <AppleBadge variant="purple" size="sm">
                                  {tryout.teams.age_group}
                                </AppleBadge>
                              )}
                              {tryout.teams.gender && (
                                <AppleBadge variant="info" size="sm">
                                  {tryout.teams.gender}
                                </AppleBadge>
                              )}
                            </div>
                            {tryout.teams.organizations && (
                              <p className="text-sm text-[rgb(134,142,150)] mb-2">
                                {tryout.teams.organizations.name}
                              </p>
                            )}
                            <p className="text-[rgb(134,142,150)]">{tryout.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <AppleMetadataRow
                            icon={<Calendar className="w-5 h-5" />}
                            label="Date"
                            value={formatDate(tryout.date)}
                            iconColor="blue"
                            size="sm"
                          />
                          <AppleMetadataRow
                            icon={<Clock className="w-5 h-5" />}
                            label="Time"
                            value={`${formatTime(tryout.start_time)} - ${formatTime(tryout.end_time)}`}
                            iconColor="blue"
                            size="sm"
                          />
                          <AppleMetadataRow
                            icon={<MapPin className="w-5 h-5" />}
                            label="Location"
                            value={
                              <div>
                                <p>{tryout.location}</p>
                                {tryout.address && <p className="text-sm text-[rgb(134,142,150)]">{tryout.address}</p>}
                              </div>
                            }
                            iconColor="green"
                            size="sm"
                          />
                        </div>

                        {tryout.requirements && (
                          <div className="bg-blue-50 border-[1.5px] border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="text-[rgb(29,29,31)] font-semibold mb-2 text-sm">Requirements</h4>
                            <p className="text-[rgb(86,88,105)] text-sm">{tryout.requirements}</p>
                          </div>
                        )}

                        <AppleMetadataRow
                          icon={<Users className="w-5 h-5" />}
                          value={
                            <>
                              <span className="font-semibold text-[rgb(0,113,227)]">{tryout.spots_available}</span> / {tryout.total_spots} spots
                            </>
                          }
                          iconColor="blue"
                          size="sm"
                        />
                      </div>

                      <div className="flex flex-col space-y-3 lg:w-52">
                        {player ? (
                          registeredTryouts.has(tryout.id) ? (
                            <div className="w-full px-6 py-3 bg-green-50 border-[1.5px] border-green-400 text-green-700 font-semibold rounded-lg text-center flex items-center justify-center space-x-2">
                              <CheckCircle2 className="w-5 h-5" />
                              <span>Registered</span>
                            </div>
                          ) : (
                            <AppleButton
                              variant="gradient"
                              size="md"
                              onClick={() => handleRegisterForTryout(tryout.id)}
                              disabled={registering === tryout.id}
                              rightIcon={<ArrowRight className="w-5 h-5" />}
                              fullWidth
                            >
                              {registering === tryout.id ? 'Registering...' : 'Register'}
                            </AppleButton>
                          )
                        ) : (
                          <AppleButton
                            variant="gradient"
                            size="md"
                            onClick={() => navigate('/login')}
                            fullWidth
                          >
                            Sign In to Register
                          </AppleButton>
                        )}
                      </div>
                    </div>
                  </AppleCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manage tab - only for organizations */}
        {organization && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-[rgb(134,142,150)]">Manage your upcoming tryout events</p>
              <AppleButton
                variant="gradient"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Create Tryout
              </AppleButton>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
              </div>
            ) : tryouts.length === 0 ? (
              <AppleEmptyState
                icon={<Trophy className="w-16 h-16" />}
                title="No tryouts yet"
                description="Create your first tryout to start recruiting players"
                iconColor="blue"
                action={{
                  label: 'Create Tryout',
                  onClick: () => setShowCreateModal(true),
                  icon: <Plus className="w-5 h-5" />,
                }}
              />
            ) : (
              <div className="space-y-6">
                {tryouts.map((tryout) => (
                  <AppleCard key={tryout.id} variant="default" padding="lg" animateOnView>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-[rgb(29,29,31)] mb-1">{tryout.teams.name}</h3>
                        <p className="text-[rgb(134,142,150)]">{formatDate(tryout.date)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <AppleMetadataRow
                        icon={<Clock className="w-5 h-5" />}
                        label="Time"
                        value={`${formatTime(tryout.start_time)} - ${formatTime(tryout.end_time)}`}
                        iconColor="blue"
                        size="sm"
                      />
                      <AppleMetadataRow
                        icon={<MapPin className="w-5 h-5" />}
                        label="Location"
                        value={tryout.location}
                        iconColor="green"
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <AppleMetadataRow
                        icon={<Users className="w-5 h-5" />}
                        value={`Max participants: ${tryout.total_spots}`}
                        iconColor="blue"
                        size="sm"
                      />
                      <AppleButton
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/tryouts/${tryout.id}/applications`)}
                        leftIcon={<Users className="w-4 h-4" />}
                      >
                        View Applications
                      </AppleButton>
                    </div>
                  </AppleCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Tryout Modal */}
      <AppleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Tryout"
        size="lg"
      >
        <form onSubmit={handleCreateTryout} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-[1.5px] border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <AppleSelect
            label="Team"
            value={formData.team_id}
            onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            options={[
              { value: '', label: 'Select a team' },
              ...teams.map(team => ({ value: team.id, label: `${team.name} - ${team.sport}` })),
            ]}
            fullWidth
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppleInput
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              fullWidth
              required
            />
            <AppleInput
              type="time"
              label="Start Time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              fullWidth
              required
            />
            <AppleInput
              type="time"
              label="End Time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              fullWidth
              required
            />
          </div>

          <AppleInput
            type="text"
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Central Park Field 2"
            fullWidth
            required
          />

          <AppleInput
            type="text"
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g., 123 Park Ave, San Diego, CA"
            fullWidth
          />

          <AppleInput
            type="number"
            label="Max Participants"
            value={formData.max_participants}
            onChange={(e) =>
              setFormData({ ...formData, max_participants: parseInt(e.target.value) })
            }
            min={1}
            max={100}
            fullWidth
            required
          />

          <AppleTextarea
            label="Requirements"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="List what players need to bring..."
            rows={3}
            fullWidth
          />

          <AppleTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what you're looking for in players..."
            rows={4}
            fullWidth
            required
          />

          <div className="flex gap-4 pt-4">
            <AppleButton
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </AppleButton>
            <AppleButton
              type="submit"
              variant="gradient"
              disabled={submitLoading}
              leftIcon={submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
              fullWidth
            >
              {submitLoading ? 'Creating...' : 'Create Tryout'}
            </AppleButton>
          </div>
        </form>
      </AppleModal>
    </div>
  );
}
