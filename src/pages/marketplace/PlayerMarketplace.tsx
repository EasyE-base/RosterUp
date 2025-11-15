import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Loader2, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PlayerProfile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import GlassmorphismPlayerCard from '../../components/player/GlassmorphismPlayerCard';
import { TRAVEL_SPORTS, AGE_GROUPS, US_STATES, getPositionsBySport } from '../../constants/playerConstants';
import { CLASSIFICATION_LEVELS } from '../../constants/classifications';

export default function PlayerMarketplace() {
  const { organization } = useAuth();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    sport: '',
    age_group: '',
    classification: '',
    position: '',
    location_state: '',
  });

  // Auto-set sport filter based on organization's primary sport
  useEffect(() => {
    if (organization?.primary_sport && filters.sport !== organization.primary_sport) {
      setFilters(prev => ({ ...prev, sport: organization.primary_sport || '' }));
    }
  }, [organization]);

  useEffect(() => {
    loadPlayers();
  }, [filters]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query with profiles join to get player name
      let query = supabase
        .from('player_profiles')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('is_active', true)
        .eq('is_visible_in_search', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.sport) {
        query = query.eq('sport', filters.sport);
      }
      if (filters.age_group) {
        query = query.eq('age_group', filters.age_group);
      }
      if (filters.classification) {
        query = query.eq('classification', filters.classification);
      }
      if (filters.position) {
        query = query.eq('position', filters.position);
      }
      if (filters.location_state) {
        query = query.eq('location_state', filters.location_state);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Client-side search filter for bio
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(
          (player) =>
            player.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.location_city?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setPlayers(filteredData);

      // Track search analytics
      if (organization) {
        await supabase.from('search_analytics').insert({
          organization_id: organization.id,
          search_filters: filters,
          result_count: filteredData.length,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      sport: organization?.primary_sport || '', // Keep organization's sport
      age_group: '',
      classification: '',
      position: '',
      location_state: '',
    });
    setSearchTerm('');
  };

  // Don't count sport in active filters if it's auto-set by organization
  const activeFilterCount =
    Object.entries(filters).filter(([key, value]) =>
      value !== '' && !(key === 'sport' && organization?.primary_sport)
    ).length + (searchTerm ? 1 : 0);

  // Get positions for current sport
  const availablePositions = filters.sport ? getPositionsBySport(filters.sport) : [];

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-[rgb(29,29,31)]">Player Marketplace</h1>
              {organization?.primary_sport && (
                <span className="px-3 py-1 bg-[rgb(0,113,227)]/10 text-[rgb(0,113,227)] text-sm font-semibold rounded-full border border-[rgb(0,113,227)]/20">
                  {organization.primary_sport}
                </span>
              )}
            </div>
            <p className="text-[rgb(134,142,150)] text-lg">
              {organization?.primary_sport
                ? `Discover talented ${organization.primary_sport} players for your organization`
                : 'Discover talented players for your organization'}
            </p>
          </div>
          {!organization && (
            <Link
              to="/player/profile/create"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Player Profile</span>
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bio, position, or location..."
              className="w-full pl-12 pr-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(0,113,227)] transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-[rgb(0,113,227)] hover:text-blue-600 transition-colors font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className={`mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 ${organization?.primary_sport ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-6`}>
              {/* Only show Sport dropdown if organization doesn't have a primary_sport */}
              {!organization?.primary_sport && (
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Sport
                  </label>
                  <select
                    value={filters.sport}
                    onChange={(e) => setFilters({ ...filters, sport: e.target.value, position: '' })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  >
                    <option value="">All Sports</option>
                    {TRAVEL_SPORTS.map((sport) => (
                      <option key={sport.value} value={sport.value}>
                        {sport.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Age Group
                </label>
                <select
                  value={filters.age_group}
                  onChange={(e) => setFilters({ ...filters, age_group: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                >
                  <option value="">All Ages</option>
                  {AGE_GROUPS.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Classification
                </label>
                <select
                  value={filters.classification}
                  onChange={(e) => setFilters({ ...filters, classification: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                >
                  <option value="">All Classifications</option>
                  {CLASSIFICATION_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Position</label>
                <select
                  value={filters.position}
                  onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={availablePositions.length === 0}
                >
                  <option value="">All Positions</option>
                  {availablePositions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">State</label>
                <select
                  value={filters.location_state}
                  onChange={(e) =>
                    setFilters({ ...filters, location_state: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                >
                  <option value="">All States</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-[rgb(0,113,227)]" />
            <span className="text-[rgb(134,142,150)] text-sm">
              {loading ? 'Loading...' : `${players.length} players found`}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
          </div>
        )}

        {/* Player Grid */}
        {!loading && players.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {players.map((player) => (
              <GlassmorphismPlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && players.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-[rgb(134,142,150)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[rgb(29,29,31)] mb-2">No players found</h3>
            <p className="text-[rgb(134,142,150)] mb-6">
              Try adjusting your filters or search terms to find more players.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-[rgb(0,113,227)] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
