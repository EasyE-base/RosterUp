import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
  Plus,
  X,
  Search,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Team, Player } from '../lib/supabase';

interface TeamMember {
  id: string;
  position: string | null;
  jersey_number: string | null;
  status: string;
  joined_at: string;
  players: {
    id: string;
    user_id: string;
    age: number | null;
    primary_position: string | null;
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTeamDetails();
      loadTeamMembers();
    }
  }, [id]);

  const loadTeamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTeam(data);
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*, players(id, user_id, age, primary_position, profiles(full_name, email))')
        .eq('team_id', id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers((data as TeamMember[]) || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlayers = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*, profiles(full_name, email)')
        .or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      const memberPlayerIds = members.map(m => m.players.id);
      const filteredResults = (data || []).filter(
        (player: any) => !memberPlayerIds.includes(player.id)
      );

      setSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to search players');
    } finally {
      setSearching(false);
    }
  };

  const handleAddPlayer = async (playerId: string) => {
    setAdding(playerId);
    setError('');

    try {
      const { error: insertError } = await supabase.from('team_members').insert({
        team_id: id,
        player_id: playerId,
        status: 'active',
      });

      if (insertError) throw insertError;

      await loadTeamMembers();
      setShowAddPlayerModal(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player');
    } finally {
      setAdding(null);
    }
  };

  const handleRemovePlayer = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this player from the team?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await loadTeamMembers();
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                {team.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
                <div className="flex items-center space-x-4 text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>{team.sport}</span>
                  </span>
                  {team.age_group && (
                    <>
                      <span>•</span>
                      <span>{team.age_group}</span>
                    </>
                  )}
                  {team.gender && (
                    <>
                      <span>•</span>
                      <span>{team.gender}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {organization && (
              <button
                onClick={() => setShowAddPlayerModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Player</span>
              </button>
            )}
          </div>

          {team.description && (
            <p className="text-slate-300 mb-4">{team.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Roster</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {members.length} / {team.roster_limit}
              </p>
            </div>

            {team.season && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-slate-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Season</span>
                </div>
                <p className="text-2xl font-bold text-white">{team.season}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Team Roster</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No players yet</h3>
              <p className="text-slate-400 mb-6">Start building your roster by adding players</p>
              {organization && (
                <button
                  onClick={() => setShowAddPlayerModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add First Player</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                        {member.players.profiles.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {member.players.profiles.full_name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-400">
                          {member.players.primary_position && (
                            <span>{member.players.primary_position}</span>
                          )}
                          {member.jersey_number && (
                            <>
                              <span>•</span>
                              <span>#{member.jersey_number}</span>
                            </>
                          )}
                          {member.players.age && (
                            <>
                              <span>•</span>
                              <span>{member.players.age} years old</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {organization && (
                      <button
                        onClick={() => handleRemovePlayer(member.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Add Player to Team</h2>
              <button
                onClick={() => {
                  setShowAddPlayerModal(false);
                  setSearchTerm('');
                  setSearchResults([]);
                  setError('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Search for players
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchPlayers()}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSearchPlayers}
                    disabled={searching || !searchTerm.trim()}
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Search Results</h3>
                  {searchResults.map((player: any) => (
                    <div
                      key={player.id}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                          {player.profiles?.full_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {player.profiles?.full_name || 'Unknown Player'}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Mail className="w-4 h-4" />
                            <span>{player.profiles?.email}</span>
                          </div>
                          {player.location && (
                            <div className="flex items-center space-x-2 text-sm text-slate-400">
                              <MapPin className="w-4 h-4" />
                              <span>{player.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddPlayer(player.id)}
                        disabled={adding === player.id}
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {adding === player.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
