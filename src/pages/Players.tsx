import { useEffect, useState } from 'react';
import { Search, MapPin, Trophy, Star, Filter, Loader2 } from 'lucide-react';
import { supabase, Player } from '../lib/supabase';

interface PlayerWithProfile extends Player {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function Players() {
  const [players, setPlayers] = useState<PlayerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sport: '',
    age_min: '',
    age_max: '',
    state: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, [filters]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('players')
        .select('*, profiles(full_name, avatar_url)')
        .eq('profile_visibility', 'public')
        .order('created_at', { ascending: false });

      if (filters.sport) {
        query = query.eq('primary_sport', filters.sport);
      }

      if (filters.age_min) {
        query = query.gte('age', parseInt(filters.age_min));
      }

      if (filters.age_max) {
        query = query.lte('age', parseInt(filters.age_max));
      }

      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPlayers((data as PlayerWithProfile[]) || []);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    if (!searchTerm) return true;
    const fullName = player.profiles?.full_name?.toLowerCase() || '';
    const sport = player.primary_sport?.toLowerCase() || '';
    const position = player.primary_position?.toLowerCase() || '';
    const location = player.location?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      sport.includes(search) ||
      position.includes(search) ||
      location.includes(search)
    );
  });

  const sports = ['Soccer', 'Basketball', 'Baseball', 'Football', 'Volleyball', 'Hockey', 'Tennis', 'Swimming', 'Track & Field'];
  const states = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Players</h1>
          <p className="text-slate-400">
            Find talented athletes for your teams
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, sport, position, or location..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-slate-900/50 border border-slate-800 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sport
                  </label>
                  <select
                    value={filters.sport}
                    onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Sports</option>
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={filters.age_min}
                    onChange={(e) => setFilters({ ...filters, age_min: e.target.value })}
                    placeholder="Any"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={filters.age_max}
                    onChange={(e) => setFilters({ ...filters, age_max: e.target.value })}
                    placeholder="Any"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All States</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilters({ sport: '', age_min: '', age_max: '', state: '' })}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No players found</h3>
            <p className="text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-slate-400">
              Found {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {player.profiles?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {player.profiles?.full_name || 'Anonymous'}
                        </h3>
                        {player.age && (
                          <p className="text-slate-400 text-sm">{player.age} years old</p>
                        )}
                      </div>
                    </div>
                    {player.rating > 0 && (
                      <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-sm font-semibold">
                          {player.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {player.primary_sport && (
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Trophy className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">
                          {player.primary_sport}
                          {player.primary_position && ` • ${player.primary_position}`}
                        </span>
                      </div>
                    )}

                    {player.location && (
                      <div className="flex items-center space-x-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm">{player.location}</span>
                      </div>
                    )}

                    {player.bio && (
                      <p className="text-slate-400 text-sm line-clamp-3 mt-3">
                        {player.bio}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="w-full py-2 px-4 bg-slate-800/50 border border-slate-700 text-white rounded-lg hover:bg-slate-800 hover:border-blue-500/50 transition-all text-sm font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
