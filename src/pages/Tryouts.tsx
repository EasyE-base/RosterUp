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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Tryout, Team } from '../lib/supabase';

interface TryoutWithTeam extends Tryout {
  teams: {
    name: string;
    sport: string;
    age_group: string | null;
  };
}

interface TryoutApplication {
  id: string;
  player_id: string;
  status: string;
  profiles: {
    full_name: string;
  };
}

export default function Tryouts() {
  const [activeTab, setActiveTab] = useState<'discover' | 'manage'>('discover');
  const [tryouts, setTryouts] = useState<TryoutWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeredTryouts, setRegisteredTryouts] = useState<Set<string>>(new Set());
  const { user, organization, player } = useAuth();
  const navigate = useNavigate();

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
    }
  }, [organization, activeTab, player]);

  const loadTryouts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tryouts')
        .select('*, teams(name, sport, age_group)')
        .eq('status', 'open')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (activeTab === 'manage' && organization) {
        query = query.eq('teams.organization_id', organization.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTryouts((data as TryoutWithTeam[]) || []);
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

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tryouts</h1>
          <p className="text-slate-400">Discover opportunities and manage your tryouts</p>
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
            Discover Tryouts
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
              Manage Tryouts
            </button>
          )}
        </div>

        {activeTab === 'discover' && (
          <div>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by team, sport, or location..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button className="px-6 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : tryouts.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tryouts available</h3>
                <p className="text-slate-400">Check back later for upcoming tryout opportunities</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tryouts.map((tryout) => (
                  <div
                    key={tryout.id}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-2xl font-bold text-white">
                                  {tryout.teams.name}
                                </h3>
                                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm font-medium rounded-full">
                                  {tryout.teams.sport}
                                </span>
                              </div>
                              <p className="text-slate-400">{tryout.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-slate-300">
                              <Calendar className="w-5 h-5 text-blue-400 mr-3" />
                              <div>
                                <p className="text-sm text-slate-400">Date</p>
                                <p className="font-medium">{formatDate(tryout.date)}</p>
                              </div>
                            </div>

                            <div className="flex items-center text-slate-300">
                              <Clock className="w-5 h-5 text-cyan-400 mr-3" />
                              <div>
                                <p className="text-sm text-slate-400">Time</p>
                                <p className="font-medium">
                                  {formatTime(tryout.start_time)} - {formatTime(tryout.end_time)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center text-slate-300">
                              <MapPin className="w-5 h-5 text-green-400 mr-3" />
                              <div>
                                <p className="text-sm text-slate-400">Location</p>
                                <p className="font-medium">{tryout.location}</p>
                                {tryout.address && (
                                  <p className="text-sm text-slate-500">{tryout.address}</p>
                                )}
                              </div>
                            </div>

                            {tryout.teams.age_group && (
                              <div className="flex items-center text-slate-300">
                                <Trophy className="w-5 h-5 text-yellow-400 mr-3" />
                                <div>
                                  <p className="text-sm text-slate-400">Age Group</p>
                                  <p className="font-medium">{tryout.teams.age_group}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {tryout.requirements && (
                            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                              <h4 className="text-white font-semibold mb-2">Requirements</h4>
                              <p className="text-slate-300 text-sm">{tryout.requirements}</p>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">
                              Max participants:{' '}
                              <span className="font-semibold text-blue-400">
                                {tryout.total_spots}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-3 lg:w-48">
                          {player && (
                            registeredTryouts.has(tryout.id) ? (
                              <div className="w-full px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 font-semibold rounded-lg text-center">
                                Registered
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRegisterForTryout(tryout.id)}
                                disabled={registering === tryout.id}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {registering === tryout.id ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Registering...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Register</span>
                                    <ArrowRight className="w-5 h-5" />
                                  </>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-400">Manage your upcoming tryout events</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Tryout</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : tryouts.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tryouts yet</h3>
                <p className="text-slate-400 mb-6">
                  Create your first tryout to start recruiting players
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Tryout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {tryouts.map((tryout) => (
                  <div
                    key={tryout.id}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{tryout.teams.name}</h3>
                        <p className="text-slate-400">{formatDate(tryout.date)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-slate-300">
                        <Clock className="w-5 h-5 text-cyan-400 mr-3" />
                        <div>
                          <p className="text-sm text-slate-400">Time</p>
                          <p className="font-medium">
                            {formatTime(tryout.start_time)} - {formatTime(tryout.end_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <MapPin className="w-5 h-5 text-green-400 mr-3" />
                        <div>
                          <p className="text-sm text-slate-400">Location</p>
                          <p className="font-medium">{tryout.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span className="text-sm">
                          Max participants: {tryout.total_spots}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/tryouts/${tryout.id}/applications`)}
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>View Applications</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create New Tryout</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTryout} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Team *</label>
                <select
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.sport}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Central Park Field 2"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 123 Park Ave, San Diego, CA"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({ ...formData, max_participants: parseInt(e.target.value) })
                  }
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List what players need to bring..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you're looking for in players..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      <span>Create Tryout</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
