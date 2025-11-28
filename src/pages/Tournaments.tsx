import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Trophy,
  Plus,
  Loader2,
  Map,
  List,
  DollarSign,
  Navigation,
  Sliders,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Tournament, Organization } from '../lib/supabase';
import TournamentMap from '../components/TournamentMap';
import { getCurrentLocation, calculateDistance } from '../lib/geocoding';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppleHeading,
  AppleSearchBar,
  AppleButton,
  AppleCard,
  AppleSelect,
  AppleBadge,
  AppleStatCard,
  AppleEmptyState,
} from '@/components/apple';

interface TournamentWithOrg extends Tournament {
  organizations: {
    name: string;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  distance?: number;
}

export default function Tournaments() {
  const [activeTab, setActiveTab] = useState<'discover' | 'manage'>('discover');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [tournaments, setTournaments] = useState<TournamentWithOrg[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<NodeJS.Timeout | null>(null);
  const [organizationSports, setOrganizationSports] = useState<string[]>([]);
  const { organization } = useAuth();
  const navigate = useNavigate();

  // Helper function to get tournament status badge
  const getTournamentBadge = (tournament: TournamentWithOrg) => {
    const now = new Date();
    const registrationDeadline = new Date(tournament.registration_deadline);
    const daysUntilDeadline = Math.ceil((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const spotsLeft = tournament.max_participants - tournament.current_participants;
    const percentFilled = (tournament.current_participants / tournament.max_participants) * 100;

    if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
      return { text: 'Ending Soon', icon: Clock, color: 'red' };
    } else if (spotsLeft <= 5 && spotsLeft > 0) {
      return { text: 'Almost Full', icon: Flame, color: 'orange' };
    } else if (percentFilled >= 75) {
      return { text: 'Hot', icon: Flame, color: 'orange' };
    } else if (daysUntilDeadline <= 7) {
      return { text: '1 Week Left', icon: Clock, color: 'yellow' };
    }
    return null;
  };

  // Derive featured tournaments from the loaded tournaments
  // We'll take the first 5 active tournaments as "featured" for now
  const featuredTournaments = tournaments
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      sport: t.sport,
      location: `${t.city}, ${t.state || ''}`,
      dates: `${new Date(t.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(t.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      prize: t.prize_info || null,
      teams: `${t.max_participants} Teams`,
      image: t.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80', // Fallback image
      badge: getTournamentBadge(t)?.text || 'Open Registration',
      entryFee: t.entry_fee ? `$${t.entry_fee}` : null,
    }));

  useEffect(() => {
    loadTournaments();
    if (viewMode === 'map') {
      loadOrganizations();
    }
  }, [organization, activeTab, viewMode]);

  useEffect(() => {
    getUserLocation();
  }, []);

  // Load organization's sports from their teams
  useEffect(() => {
    if (organization) {
      loadOrganizationSports();
    } else {
      setOrganizationSports([]);
    }
  }, [organization]);

  const loadOrganizationSports = async () => {
    if (!organization) return;

    try {
      // Get unique sports from organization's teams
      const { data: teams, error } = await supabase
        .from('teams')
        .select('sport')
        .eq('organization_id', organization.id);

      if (error) throw error;

      if (teams && teams.length > 0) {
        const uniqueSports = Array.from(new Set(teams.map(t => t.sport)));
        setOrganizationSports(uniqueSports);
      } else {
        // If no teams, try to get sports from their tournaments
        const { data: tournaments, error: tournamentError } = await supabase
          .from('tournaments')
          .select('sport')
          .eq('organization_id', organization.id);

        if (tournamentError) throw tournamentError;

        if (tournaments && tournaments.length > 0) {
          const uniqueSports = Array.from(new Set(tournaments.map(t => t.sport)));
          setOrganizationSports(uniqueSports);
        } else {
          // No teams or tournaments - show all sports
          setOrganizationSports([]);
        }
      }
    } catch (error) {
      console.error('Error loading organization sports:', error);
      setOrganizationSports([]);
    }
  };

  // Reset slide when filtered tournaments change
  useEffect(() => {
    if (currentSlide >= featuredTournaments.length && featuredTournaments.length > 0) {
      setCurrentSlide(0);
    }
  }, [featuredTournaments.length, currentSlide]);

  // Auto-scroll carousel
  useEffect(() => {
    if (featuredTournaments.length === 0) return;

    carouselRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredTournaments.length);
    }, 5000); // Change slide every 5 seconds

    return () => {
      if (carouselRef.current) {
        clearInterval(carouselRef.current);
      }
    };
  }, [featuredTournaments.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredTournaments.length);
    // Reset auto-scroll timer
    if (carouselRef.current) {
      clearInterval(carouselRef.current);
      carouselRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredTournaments.length);
      }, 5000);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredTournaments.length) % featuredTournaments.length);
    // Reset auto-scroll timer
    if (carouselRef.current) {
      clearInterval(carouselRef.current);
      carouselRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredTournaments.length);
      }, 5000);
    }
  };

  const getUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  const loadTournaments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tournaments')
        .select('*, organizations(name, city, state)')
        .eq('status', 'open')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (activeTab === 'manage' && organization) {
        query = supabase
          .from('tournaments')
          .select('*, organizations(name, city, state)')
          .eq('organization_id', organization.id)
          .order('start_date', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      let tournamentsWithDistance = (data as TournamentWithOrg[]) || [];

      if (userLocation) {
        tournamentsWithDistance = tournamentsWithDistance.map((tournament) => {
          if (tournament.latitude && tournament.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              tournament.latitude,
              tournament.longitude
            );
            return { ...tournament, distance };
          }
          return tournament;
        });
      }

      setTournaments(tournamentsWithDistance);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      setOrganizations((data as Organization[]) || []);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.organizations.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport = !sportFilter || tournament.sport === sportFilter;

    const matchesDistance = !distanceFilter || !tournament.distance || tournament.distance <= distanceFilter;

    return matchesSearch && matchesSport && matchesDistance;
  });

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    if (distanceFilter && a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return 0;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const uniqueSports = Array.from(new Set(tournaments.map((t) => t.sport))).sort();



  // Filter tournaments for "Ending Soon" section
  const endingSoon = sortedTournaments.filter(t => {
    const now = new Date();
    const registrationDeadline = new Date(t.registration_deadline);
    const daysUntilDeadline = Math.ceil((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  }).slice(0, 3);

  // Get recommended tournaments (matching org's sport)
  const recommended = organizationSports.length > 0
    ? sortedTournaments.filter(t => organizationSports.includes(t.sport)).slice(0, 6)
    : sortedTournaments.slice(0, 6);

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)]">
      {/* Featured Tournaments Carousel */}
      {featuredTournaments.length > 0 && (
        <div className="relative h-[500px] overflow-hidden mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${featuredTournaments[currentSlide].image})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(29,29,31)] via-[rgb(29,29,31)]/80 to-transparent" />
              </div>

              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>FEATURED</span>
                      </span>
                      <AppleBadge variant="primary" size="md">
                        {featuredTournaments[currentSlide].badge}
                      </AppleBadge>
                    </div>

                    <h2 className="text-5xl font-bold text-white mb-4">
                      {featuredTournaments[currentSlide].title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-6 text-white mb-6">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <span className="text-lg">{featuredTournaments[currentSlide].location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-lg">{featuredTournaments[currentSlide].dates}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-lg">{featuredTournaments[currentSlide].teams}</span>
                      </div>
                    </div>

                    {(featuredTournaments[currentSlide].prize || featuredTournaments[currentSlide].entryFee) && (
                      <div className="flex items-center space-x-6 mb-8">
                        {featuredTournaments[currentSlide].prize && (
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <div>
                              <p className="text-xs text-slate-300">Prize Pool</p>
                              <p className="text-2xl font-bold text-yellow-400">
                                {featuredTournaments[currentSlide].prize}
                              </p>
                            </div>
                          </div>
                        )}
                        {featuredTournaments[currentSlide].entryFee && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-6 h-6 text-green-400" />
                            <div>
                              <p className="text-xs text-slate-300">Entry Fee</p>
                              <p className="text-2xl font-bold text-white">
                                {featuredTournaments[currentSlide].entryFee}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <AppleButton variant="gradient" size="lg">
                      View Tournament Details
                    </AppleButton>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white border-[1.5px] border-slate-200 rounded-full flex items-center justify-center text-[rgb(29,29,31)] transition-all z-10 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white border-[1.5px] border-slate-200 rounded-full flex items-center justify-center text-[rgb(29,29,31)] transition-all z-10 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {featuredTournaments.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all ${index === currentSlide
                  ? 'bg-[rgb(0,113,227)] w-8'
                  : 'bg-slate-300 hover:bg-slate-400 w-3'
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppleStatCard
            label="Active Tournaments"
            value={tournaments.length}
            icon={<Trophy className="w-6 h-6" />}
            iconColor="blue"
            animateOnView
          />
          <AppleStatCard
            label="Teams Competing"
            value={tournaments.reduce((acc, t) => acc + t.current_participants, 0)}
            icon={<Users className="w-6 h-6" />}
            iconColor="green"
            animateOnView
            delay={0.1}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <AppleHeading level={1} size="section">
              Browse Tournaments
            </AppleHeading>
            <p className="text-lg text-[rgb(134,142,150)] mt-2">
              Discover tournaments and compete with teams across the region
            </p>
          </div>
          {organization && activeTab === 'manage' && (
            <AppleButton
              variant="gradient"
              onClick={() => navigate('/tournaments/create')}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Create Tournament
            </AppleButton>
          )}
        </div>

        <div className="flex space-x-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-medium transition-all ${activeTab === 'discover'
              ? 'text-[rgb(0,113,227)] border-b-2 border-[rgb(0,113,227)]'
              : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
          >
            Discover Tournaments
          </button>
          {organization && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-medium transition-all ${activeTab === 'manage'
                ? 'text-[rgb(0,113,227)] border-b-2 border-[rgb(0,113,227)]'
                : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                }`}
            >
              My Tournaments
            </button>
          )}
        </div>

        {/* Quick Sport Filter Pills - Only show organization's sports */}
        {activeTab === 'discover' && organization && organizationSports.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {organizationSports.map((sport) => (
                <AppleButton
                  key={sport}
                  variant={sportFilter === sport ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSportFilter(sport)}
                >
                  {sport}
                </AppleButton>
              ))}
            </div>
          </div>
        )}

        <AppleCard variant="default" padding="lg" className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <AppleSearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search by tournament, location, or organization..."
                fullWidth
                className="flex-1"
              />

              <div className="flex gap-4">
                <AppleButton
                  variant={showFilters ? 'primary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<Sliders className="w-5 h-5" />}
                >
                  Filters
                </AppleButton>

                <div className="flex bg-white border-[1.5px] border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 transition-all ${viewMode === 'list'
                      ? 'bg-[rgb(0,113,227)] text-white'
                      : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                      }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-3 transition-all ${viewMode === 'map'
                      ? 'bg-[rgb(0,113,227)] text-white'
                      : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                      }`}
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <AppleSelect
                  label="Sport"
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  options={
                    organization && organizationSports.length > 0
                      ? organizationSports.map((sport) => ({ value: sport, label: sport }))
                      : [
                        { value: '', label: 'All Sports' },
                        ...uniqueSports.map((sport) => ({ value: sport, label: sport })),
                      ]
                  }
                  fullWidth
                />

                <AppleSelect
                  label="Distance (miles)"
                  value={distanceFilter?.toString() || ''}
                  onChange={(e) => setDistanceFilter(e.target.value ? parseInt(e.target.value) : null)}
                  options={[
                    { value: '', label: 'Any Distance' },
                    { value: '25', label: 'Within 25 miles' },
                    { value: '50', label: 'Within 50 miles' },
                    { value: '100', label: 'Within 100 miles' },
                    { value: '250', label: 'Within 250 miles' },
                    { value: '500', label: 'Within 500 miles' },
                  ]}
                  fullWidth
                  disabled={!userLocation}
                />

                <div className="flex items-end">
                  {!userLocation ? (
                    <AppleButton
                      variant="primary"
                      onClick={getUserLocation}
                      leftIcon={<Navigation className="w-4 h-4" />}
                      fullWidth
                    >
                      Enable Location
                    </AppleButton>
                  ) : (
                    <div className="w-full px-4 py-3 bg-green-50 border-[1.5px] border-green-400 text-green-700 rounded-lg text-sm text-center font-medium">
                      ✓ Location enabled
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </AppleCard>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] bg-white border-[1.5px] border-slate-200 rounded-xl overflow-hidden">
            <TournamentMap
              tournaments={sortedTournaments}
              organizations={organizations}
              onTournamentClick={(tournament) => navigate(`/tournaments/${tournament.id}`)}
            />
          </div>
        ) : sortedTournaments.length === 0 ? (
          <AppleEmptyState
            icon={<Trophy className="w-16 h-16" />}
            title={
              searchQuery || sportFilter || distanceFilter
                ? 'No tournaments match your filters'
                : 'No tournaments available'
            }
            description={
              searchQuery || sportFilter || distanceFilter
                ? 'Try adjusting your search criteria'
                : 'Check back later for upcoming tournament opportunities'
            }
            iconColor="blue"
          />
        ) : (
          <div className="space-y-12">
            {/* Ending Soon Section */}
            {endingSoon.length > 0 && activeTab === 'discover' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-[rgb(29,29,31)]">Ending Soon</h2>
                  </div>
                  <AppleBadge variant="danger" size="md">
                    Registration Closing
                  </AppleBadge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endingSoon.map((tournament) => {
                    const badge = getTournamentBadge(tournament);
                    const percentFilled = (tournament.current_participants / tournament.max_participants) * 100;

                    return (
                      <AppleCard
                        key={tournament.id}
                        variant="default"
                        padding="none"
                        hover
                        animateOnView
                        onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        className="cursor-pointer"
                      >
                        {/* Card Image */}
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                          {tournament.image_url ? (
                            <img
                              src={tournament.image_url}
                              alt={tournament.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-16 h-16 text-slate-300" />
                            </div>
                          )}
                          {badge && (
                            <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5 ${badge.color === 'red' ? 'bg-red-600 text-white' :
                              badge.color === 'orange' ? 'bg-orange-600 text-white' :
                                'bg-yellow-500 text-black'
                              }`}>
                              <badge.icon className="w-4 h-4" />
                              {badge.text}
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-3 line-clamp-2">
                            {tournament.title}
                          </h3>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-[rgb(134,142,150)]">
                              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="truncate">{tournament.city}, {tournament.state}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[rgb(134,142,150)]">
                              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span>{formatDate(tournament.start_date)}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-[rgb(134,142,150)] mb-1.5">
                              <span>{tournament.current_participants} / {tournament.max_participants} teams</span>
                              <span>{Math.round(percentFilled)}% filled</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${percentFilled >= 90 ? 'bg-red-500' :
                                  percentFilled >= 75 ? 'bg-orange-500' :
                                    'bg-[rgb(0,113,227)]'
                                  }`}
                                style={{ width: `${percentFilled}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <AppleBadge variant="primary" size="sm">
                              {tournament.sport}
                            </AppleBadge>
                            {tournament.entry_fee && (
                              <div className="text-green-600 font-semibold">${tournament.entry_fee}</div>
                            )}
                          </div>
                        </div>
                      </AppleCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Tournaments Grid */}
            <div>
              <h2 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6">
                {organizationSports.length > 0 && activeTab === 'discover' ? 'Recommended for You' : 'All Tournaments'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTournaments.map((tournament) => {
                  const badge = getTournamentBadge(tournament);
                  const percentFilled = (tournament.current_participants / tournament.max_participants) * 100;

                  return (
                    <AppleCard
                      key={tournament.id}
                      variant="default"
                      padding="none"
                      hover
                      animateOnView
                      onClick={() => navigate(`/tournaments/${tournament.id}`)}
                      className="cursor-pointer"
                    >
                      {/* Card Image */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {tournament.image_url ? (
                          <img
                            src={tournament.image_url}
                            alt={tournament.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-slate-300" />
                          </div>
                        )}
                        {badge && (
                          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5 ${badge.color === 'red' ? 'bg-red-600 text-white' :
                            badge.color === 'orange' ? 'bg-orange-600 text-white' :
                              'bg-yellow-500 text-black'
                            }`}>
                            <badge.icon className="w-4 h-4" />
                            {badge.text}
                          </div>
                        )}
                        {tournament.distance !== undefined && (
                          <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 border-[1.5px] border-slate-200 text-green-700 text-xs font-medium rounded-full">
                            {tournament.distance.toFixed(0)} miles away
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-3 line-clamp-2">
                          {tournament.title}
                        </h3>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[rgb(134,142,150)]">
                            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="truncate">{tournament.city}, {tournament.state}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[rgb(134,142,150)]">
                            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>{formatDate(tournament.start_date)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-[rgb(134,142,150)] mb-1.5">
                            <span>{tournament.current_participants} / {tournament.max_participants} teams</span>
                            <span>{Math.round(percentFilled)}% filled</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${percentFilled >= 90 ? 'bg-red-500' :
                                percentFilled >= 75 ? 'bg-orange-500' :
                                  'bg-[rgb(0,113,227)]'
                                }`}
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <AppleBadge variant="primary" size="sm">
                            {tournament.sport}
                          </AppleBadge>
                          {tournament.entry_fee && (
                            <div className="text-green-600 font-semibold">${tournament.entry_fee}</div>
                          )}
                        </div>
                      </div>
                    </AppleCard>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
