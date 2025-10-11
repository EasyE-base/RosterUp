import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Loader2,
  ArrowLeft,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Edit,
  Play,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Tournament, TournamentParticipant } from '../lib/supabase';
import TournamentMap from '../components/TournamentMap';

interface TournamentWithOrg extends Tournament {
  organizations: {
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  };
}

interface ParticipantWithOrg extends TournamentParticipant {
  organizations: {
    name: string;
    city: string | null;
    state: string | null;
  };
}

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<TournamentWithOrg | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadTournament();
      loadParticipants();
      if (organization) {
        checkApplicationStatus();
      }
    }
  }, [id, organization]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, organizations(name, city, state, logo_url)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      setTournament(data as TournamentWithOrg);
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*, organizations(name, city, state)')
        .eq('tournament_id', id)
        .order('confirmed_at', { ascending: true });

      if (error) throw error;

      setParticipants((data as ParticipantWithOrg[]) || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const checkApplicationStatus = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('tournament_applications')
        .select('id, status')
        .eq('tournament_id', id)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setHasApplied(!!data);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    if (!organization) {
      navigate('/login');
      return;
    }

    setApplying(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('tournament_applications').insert({
        tournament_id: id,
        organization_id: organization.id,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setHasApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply to tournament');
    } finally {
      setApplying(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!tournament) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', tournament.id);

      if (error) throw error;

      setTournament({ ...tournament, status: newStatus as typeof tournament.status });
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Error updating tournament status:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isRegistrationOpen = () => {
    if (!tournament) return false;
    const deadline = new Date(tournament.registration_deadline);
    return tournament.status === 'open' && deadline > new Date();
  };

  const isOwnTournament =
    tournament && organization && tournament.organization_id === organization.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
      case 'open':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'closed':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'in_progress':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'completed':
        return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
      case 'cancelled':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Tournament not found</h3>
          <button
            onClick={() => navigate('/tournaments')}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournaments</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h1 className="text-4xl font-bold text-white">{tournament.title}</h1>
                    <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm font-medium rounded-full">
                      {tournament.sport}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400 mb-4">
                    <Building2 className="w-4 h-4" />
                    <span>Hosted by {tournament.organizations.name}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        tournament.status
                      )}`}
                    >
                      {tournament.status.replace('_', ' ').toUpperCase()}
                    </span>

                    {isOwnTournament && (
                      <div className="relative">
                        <button
                          onClick={() => setShowStatusMenu(!showStatusMenu)}
                          className="px-3 py-1 bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium rounded-full hover:bg-slate-700 transition-all flex items-center space-x-1"
                        >
                          <span>Change Status</span>
                        </button>

                        {showStatusMenu && (
                          <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[160px]">
                            {['draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled'].map(
                              (status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(status)}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors capitalize"
                                >
                                  {status.replace('_', ' ')}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isOwnTournament && (
                  <button
                    onClick={() => navigate(`/tournaments/${id}/edit`)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {tournament.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-3">About This Tournament</h2>
                  <p className="text-slate-300 leading-relaxed">{tournament.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Tournament Dates</p>
                    <p className="text-white font-medium">{formatDate(tournament.start_date)}</p>
                    {tournament.start_date !== tournament.end_date && (
                      <p className="text-slate-400 text-sm">
                        to {formatDate(tournament.end_date)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Registration Deadline</p>
                    <p className="text-white font-medium">
                      {formatDate(tournament.registration_deadline)}
                    </p>
                    {!isRegistrationOpen() && (
                      <p className="text-red-400 text-sm">Registration closed</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Venue</p>
                    <p className="text-white font-medium">{tournament.location_name}</p>
                    <p className="text-slate-400 text-sm">
                      {tournament.city}
                      {tournament.state && `, ${tournament.state}`}
                    </p>
                    {tournament.address && (
                      <p className="text-slate-500 text-xs mt-1">{tournament.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Format</p>
                    <p className="text-white font-medium capitalize">
                      {tournament.format_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Participants</p>
                    <p className="text-white font-medium">
                      {tournament.current_participants} / {tournament.max_participants} teams
                    </p>
                    {tournament.current_participants >= tournament.max_participants && (
                      <p className="text-yellow-400 text-sm">Tournament full</p>
                    )}
                  </div>
                </div>

                {tournament.entry_fee && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Entry Fee</p>
                      <p className="text-white font-medium">${tournament.entry_fee}</p>
                    </div>
                  </div>
                )}
              </div>

              {tournament.prize_info && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold text-white">Prize Information</h3>
                  </div>
                  <p className="text-slate-300">{tournament.prize_info}</p>
                </div>
              )}

              {tournament.requirements &&
                Array.isArray(tournament.requirements) &&
                tournament.requirements.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-white mb-2">Requirements</h3>
                    <ul className="space-y-1 text-slate-300">
                      {tournament.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {participants.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-cyan-400" />
                  Participating Organizations ({participants.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        {participant.organizations.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {participant.organizations.name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {participant.organizations.city}
                          {participant.organizations.state &&
                            `, ${participant.organizations.state}`}
                        </p>
                      </div>
                      {participant.check_in_status === 'checked_in' && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tournament.latitude && tournament.longitude && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Location</h2>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <TournamentMap
                    tournaments={[tournament]}
                    center={[tournament.latitude, tournament.longitude]}
                    zoom={13}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 sticky top-24">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {isOwnTournament ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Your Tournament</h3>
                  <p className="text-slate-400 text-sm mb-4">You're hosting this tournament</p>
                  <button
                    onClick={() => navigate(`/tournaments/${id}/applications`)}
                    className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all mb-2"
                  >
                    Manage Applications
                  </button>
                  <button
                    onClick={() => navigate(`/tournaments/${id}/edit`)}
                    className="w-full py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
                  >
                    Edit Tournament
                  </button>
                </div>
              ) : hasApplied ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Application Submitted</h3>
                  <p className="text-slate-400 text-sm">
                    You've applied to this tournament. The host will review your application.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Ready to compete?</h3>
                  {!organization ? (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm mb-4">
                        You need an organization account to apply
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : !isRegistrationOpen() ? (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Registration is closed</p>
                    </div>
                  ) : tournament.current_participants >= tournament.max_participants ? (
                    <div className="text-center">
                      <p className="text-yellow-400 text-sm">This tournament is full</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-5 h-5" />
                          <span>Apply to Tournament</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
