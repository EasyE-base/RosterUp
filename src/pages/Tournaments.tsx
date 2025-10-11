import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Tournament, Organization } from '../lib/supabase';
import TournamentMap from '../components/TournamentMap';
import { getCurrentLocation, calculateDistance } from '../lib/geocoding';

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
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
    if (viewMode === 'map') {
      loadOrganizations();
    }
  }, [organization, activeTab, viewMode]);

  useEffect(() => {
    getUserLocation();
  }, []);

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
        .select('*, organizations(name, city, state, latitude, longitude)')
        .eq('status', 'open')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (activeTab === 'manage' && organization) {
        query = supabase
          .from('tournaments')
          .select('*, organizations(name, city, state, latitude, longitude)')
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

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Tournaments</h1>
            <p className="text-slate-400">
              Discover tournaments and compete with teams across the region
            </p>
          </div>
          {organization && activeTab === 'manage' && (
            <button
              onClick={() => navigate('/tournaments/create')}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Tournament</span>
            </button>
          )}
        </div>

        <div className="flex space-x-2 mb-8 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'discover'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Discover Tournaments
          </button>
          {organization && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'manage'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Tournaments
            </button>
          )}
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tournament, location, or organization..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-all flex items-center space-x-2"
                >
                  <Sliders className="w-5 h-5" />
                  <span>Filters</span>
                </button>

                <div className="flex bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-3 transition-all ${
                      viewMode === 'map'
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sport</label>
                  <select
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Sports</option>
                    {uniqueSports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Distance (miles)
                  </label>
                  <select
                    value={distanceFilter || ''}
                    onChange={(e) => setDistanceFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={!userLocation}
                  >
                    <option value="">Any Distance</option>
                    <option value="25">Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                    <option value="250">Within 250 miles</option>
                    <option value="500">Within 500 miles</option>
                  </select>
                </div>

                <div className="flex items-end">
                  {!userLocation && (
                    <button
                      onClick={getUserLocation}
                      className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 font-medium rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Enable Location</span>
                    </button>
                  )}
                  {userLocation && (
                    <div className="w-full px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm text-center">
                      ✓ Location enabled
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
            <TournamentMap
              tournaments={sortedTournaments}
              organizations={organizations}
              onTournamentClick={(tournament) => navigate(`/tournaments/${tournament.id}`)}
            />
          </div>
        ) : sortedTournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || sportFilter || distanceFilter
                ? 'No tournaments match your filters'
                : 'No tournaments available'}
            </h3>
            <p className="text-slate-400">
              {searchQuery || sportFilter || distanceFilter
                ? 'Try adjusting your search criteria'
                : 'Check back later for upcoming tournament opportunities'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedTournaments.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">{tournament.title}</h3>
                          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm font-medium rounded-full">
                            {tournament.sport}
                          </span>
                          {tournament.distance !== undefined && (
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-medium rounded-full">
                              {tournament.distance.toFixed(0)} miles away
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          Hosted by {tournament.organizations.name}
                        </p>
                        {tournament.description && (
                          <p className="text-slate-300">{tournament.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-slate-300">
                        <Calendar className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-400">Dates</p>
                          <p className="font-medium">{formatDate(tournament.start_date)}</p>
                          {tournament.start_date !== tournament.end_date && (
                            <p className="text-xs text-slate-500">
                              to {formatDate(tournament.end_date)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <MapPin className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-400">Location</p>
                          <p className="font-medium">{tournament.location_name}</p>
                          <p className="text-xs text-slate-500">
                            {tournament.city}
                            {tournament.state && `, ${tournament.state}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <Trophy className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-400">Format</p>
                          <p className="font-medium capitalize">
                            {tournament.format_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span>
                          {tournament.current_participants} / {tournament.max_participants} teams
                        </span>
                      </div>

                      {tournament.entry_fee && (
                        <div className="flex items-center space-x-2 text-slate-300">
                          <DollarSign className="w-5 h-5 text-green-400" />
                          <span>${tournament.entry_fee} entry fee</span>
                        </div>
                      )}

                      {tournament.prize_info && (
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span>{tournament.prize_info}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:w-48">
                    <div className="px-4 py-2 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-xs text-slate-400 mb-1">Registration Deadline</p>
                      <p className="text-sm font-medium text-white">
                        {formatDate(tournament.registration_deadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
