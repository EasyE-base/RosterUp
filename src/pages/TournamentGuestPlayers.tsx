import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
  MapPin,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface GuestPlayer {
  id: string;
  player_id: string;
  tournament_id: string;
  status: 'available' | 'invited' | 'accepted' | 'declined' | 'removed';
  updated_at: string;
  invited_by_team_id?: string;
  player_profiles: {
    id: string;
    user_id: string;
    sport: string;
    age_group: string;
    classification: string;
    bio: string;
    location_city: string;
    location_state: string;
    photo_url: string | null;
    position: string[];
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface Team {
  id: string;
  name: string;
  sport: string;
  age_group: string | null;
}

export default function TournamentGuestPlayers() {
  const { id } = useParams<{ id: string }>();
  const [guestPlayers, setGuestPlayers] = useState<GuestPlayer[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [tournamentTitle, setTournamentTitle] = useState('');
  const [error, setError] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && organization) {
      loadTournamentInfo();
      checkTeamRegistration();
    }
  }, [id, organization]);

  useEffect(() => {
    if (myTeam) {
      loadGuestPlayers();
    }
  }, [myTeam]);

  const loadTournamentInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('title')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/tournaments');
        return;
      }

      setTournamentTitle(data.title);
    } catch (error) {
      console.error('Error loading tournament:', error);
      navigate('/tournaments');
    }
  };

  const checkTeamRegistration = async () => {
    try {
      setLoading(true);

      // Check if any of the organization's teams are registered for this tournament
      const { data: participation, error } = await supabase
        .from('tournament_participants')
        .select(`
          team_id,
          teams!inner (
            id,
            name,
            sport,
            age_group
          )
        `)
        .eq('tournament_id', id)
        .eq('teams.organization_id', organization?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking team registration:', error);
      }

      if (participation && participation.teams) {
        setMyTeam(participation.teams as Team);
      } else {
        setError('Your organization does not have a team registered for this tournament.');
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      setError('Failed to verify team registration.');
    } finally {
      setLoading(false);
    }
  };

  const loadGuestPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_players')
        .select(`
          *,
          player_profiles (
            id,
            user_id,
            sport,
            age_group,
            classification,
            bio,
            location_city,
            location_state,
            photo_url,
            position
          )
        `)
        .eq('tournament_id', id)
        .in('status', ['available', 'invited'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get profile names for each player
      const playersWithNames = await Promise.all(
        (data || []).map(async (gp) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', gp.player_profiles.user_id)
            .single();

          return {
            ...gp,
            profiles: profile || { first_name: 'Unknown', last_name: 'Player' },
          };
        })
      );

      setGuestPlayers(playersWithNames as GuestPlayer[]);
    } catch (error) {
      console.error('Error loading guest players:', error);
    }
  };

  const handleInvitePlayer = async (playerId: string) => {
    if (!myTeam) {
      alert('Team information not available');
      return;
    }

    setProcessing(playerId);

    try {
      const { error } = await supabase
        .from('guest_players')
        .update({
          status: 'invited',
          invited_by_team_id: myTeam.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', playerId);

      if (error) throw error;

      loadGuestPlayers();
    } catch (error) {
      console.error('Error inviting player:', error);
      alert('Failed to invite player');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter guest players
  const availablePlayers = guestPlayers.filter(
    (gp) => gp.status === 'available'
  );
  const myInvitedPlayers = guestPlayers.filter(
    (gp) => gp.status === 'invited' && gp.invited_by_team_id === myTeam?.id
  );
  const otherInvitedPlayers = guestPlayers.filter(
    (gp) => gp.status === 'invited' && gp.invited_by_team_id !== myTeam?.id
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !myTeam) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/tournaments/${id}`)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to tournament</span>
          </button>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Team Registration Required</h3>
            <p className="text-yellow-400 mb-4">
              {error || 'Your team must be registered for this tournament to invite guest players.'}
            </p>
            <button
              onClick={() => navigate(`/tournaments/${id}`)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-all"
            >
              View Tournament
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/tournaments/${id}`)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournament</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Guest Players</h1>
          <p className="text-slate-400">{tournamentTitle}</p>
          <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm">
            <Users className="w-4 h-4" />
            <span>Inviting for: {myTeam.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{availablePlayers.length}</span>
            </div>
            <p className="text-slate-400">Available Guest Players</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{myInvitedPlayers.length}</span>
            </div>
            <p className="text-slate-400">Invited by Your Team</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{otherInvitedPlayers.length}</span>
            </div>
            <p className="text-slate-400">Invited by Other Teams</p>
          </div>
        </div>

        {availablePlayers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Available Guest Players</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availablePlayers.map((guestPlayer) => (
                <div
                  key={guestPlayer.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-colors"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    {guestPlayer.player_profiles.photo_url ? (
                      <img
                        src={guestPlayer.player_profiles.photo_url}
                        alt={`${guestPlayer.profiles.first_name} ${guestPlayer.profiles.last_name}`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {guestPlayer.profiles.first_name.charAt(0)}
                        {guestPlayer.profiles.last_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {guestPlayer.profiles.first_name} {guestPlayer.profiles.last_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                        <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded">
                          {guestPlayer.player_profiles.sport}
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded">
                          {guestPlayer.player_profiles.age_group}
                        </span>
                        <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded">
                          Class {guestPlayer.player_profiles.classification}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {guestPlayer.player_profiles.location_city},{' '}
                          {guestPlayer.player_profiles.location_state}
                        </span>
                      </div>
                    </div>
                  </div>

                  {guestPlayer.player_profiles.position &&
                    guestPlayer.player_profiles.position.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">POSITIONS</p>
                        <div className="flex flex-wrap gap-2">
                          {guestPlayer.player_profiles.position.map((pos: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded"
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {guestPlayer.player_profiles.bio && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                      {guestPlayer.player_profiles.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-500">
                      Applied {formatDate(guestPlayer.updated_at)}
                    </span>
                    <button
                      onClick={() => handleInvitePlayer(guestPlayer.id)}
                      disabled={processing === guestPlayer.id}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {processing === guestPlayer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Invite to Team</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {myInvitedPlayers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Players You Invited</h2>
            <div className="space-y-4">
              {myInvitedPlayers.map((guestPlayer) => (
                <div
                  key={guestPlayer.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {guestPlayer.player_profiles.photo_url ? (
                        <img
                          src={guestPlayer.player_profiles.photo_url}
                          alt={`${guestPlayer.profiles.first_name} ${guestPlayer.profiles.last_name}`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {guestPlayer.profiles.first_name.charAt(0)}
                          {guestPlayer.profiles.last_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {guestPlayer.profiles.first_name} {guestPlayer.profiles.last_name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {guestPlayer.player_profiles.sport} •{' '}
                          {guestPlayer.player_profiles.age_group}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full text-sm font-medium">
                      INVITED - Awaiting Response
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {guestPlayers.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No guest players yet</h3>
            <p className="text-slate-400">
              Guest players who apply will appear here for your team to invite
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
