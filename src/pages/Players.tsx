import { useEffect, useState } from 'react';
import { MapPin, Trophy, Star, Filter, Loader2 } from 'lucide-react';
import { supabase, Player } from '../lib/supabase';
import {
  AppleHeading,
  AppleSearchBar,
  AppleButton,
  AppleInput,
  AppleSelect,
  AppleCard,
  AppleAvatar,
  AppleBadge,
  AppleMetadataRow,
  AppleEmptyState,
} from '@/components/apple';

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
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <AppleHeading level={1} size="section">
            Discover Players
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            Find talented athletes for your teams
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <AppleSearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search by name, sport, position, or location..."
              fullWidth
              className="flex-1"
            />
            <AppleButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-5 h-5" />}
            >
              Filters
            </AppleButton>
          </div>

          {showFilters && (
            <AppleCard variant="default" padding="lg" animateOnView>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AppleSelect
                  label="Sport"
                  value={filters.sport}
                  onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                  options={[
                    { value: '', label: 'All Sports' },
                    ...sports.map((sport) => ({ value: sport, label: sport })),
                  ]}
                  fullWidth
                />

                <AppleInput
                  type="number"
                  label="Min Age"
                  value={filters.age_min}
                  onChange={(e) => setFilters({ ...filters, age_min: e.target.value })}
                  placeholder="Any"
                  fullWidth
                />

                <AppleInput
                  type="number"
                  label="Max Age"
                  value={filters.age_max}
                  onChange={(e) => setFilters({ ...filters, age_max: e.target.value })}
                  placeholder="Any"
                  fullWidth
                />

                <AppleSelect
                  label="State"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  options={[
                    { value: '', label: 'All States' },
                    ...states.map((state) => ({ value: state, label: state })),
                  ]}
                  fullWidth
                />
              </div>

              <div className="mt-6 flex justify-end">
                <AppleButton
                  variant="text"
                  onClick={() => setFilters({ sport: '', age_min: '', age_max: '', state: '' })}
                >
                  Clear Filters
                </AppleButton>
              </div>
            </AppleCard>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <AppleEmptyState
            icon={<Trophy className="w-16 h-16" />}
            title="No players found"
            description="Try adjusting your search or filters"
            iconColor="blue"
          />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[rgb(134,142,150)] text-sm">
                Found {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player, idx) => (
                <AppleCard key={player.id} variant="default" padding="lg" hover animateOnView delay={idx * 0.05}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <AppleAvatar
                        src={player.profiles?.avatar_url}
                        name={player.profiles?.full_name || undefined}
                        size="xl"
                        color="blue"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-1">
                          {player.profiles?.full_name || 'Anonymous'}
                        </h3>
                        {player.age && (
                          <p className="text-[rgb(134,142,150)] text-sm">{player.age} years old</p>
                        )}
                      </div>
                    </div>
                    {player.rating > 0 && (
                      <AppleBadge variant="warning" size="sm" icon={<Star className="w-3 h-3 fill-current" />}>
                        {player.rating.toFixed(1)}
                      </AppleBadge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {player.primary_sport && (
                      <AppleMetadataRow
                        icon={<Trophy className="w-4 h-4" />}
                        value={`${player.primary_sport}${player.primary_position ? ` • ${player.primary_position}` : ''}`}
                        iconColor="blue"
                        size="sm"
                      />
                    )}

                    {player.location && (
                      <AppleMetadataRow
                        icon={<MapPin className="w-4 h-4" />}
                        value={player.location}
                        iconColor="blue"
                        size="sm"
                      />
                    )}

                    {player.bio && (
                      <p className="text-[rgb(134,142,150)] text-sm line-clamp-3 leading-relaxed">
                        {player.bio}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <AppleButton variant="primary" size="md" fullWidth>
                      View Profile
                    </AppleButton>
                  </div>
                </AppleCard>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
