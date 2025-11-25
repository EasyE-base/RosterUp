import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Mail,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  AppleButton,
  AppleCard,
  AppleCardContent,
  AppleHeading,
  AppleAvatar,
  AppleBadge,
  AppleStatCard,
  AppleEmptyState,
} from '../components/apple';

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
        setMyTeam(participation.teams as unknown as Team);
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
      <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  if (error || !myTeam) {
    return (
      <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/tournaments/${id}`)}
            className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to tournament</span>
          </button>

          <div className="bg-[rgb(255,149,0)]/10 border border-[rgb(255,149,0)]/30 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-[rgb(255,149,0)] mx-auto mb-4" />
            <AppleHeading level={3} className="mb-2">Team Registration Required</AppleHeading>
            <p className="text-[rgb(29,29,31)] mb-4">
              {error || 'Your team must be registered for this tournament to invite guest players.'}
            </p>
            <AppleButton
              variant="secondary"
              onClick={() => navigate(`/tournaments/${id}`)}
            >
              View Tournament
            </AppleButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/tournaments/${id}`)}
          className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournament</span>
        </button>

        <div className="mb-8">
          <AppleHeading level={1} size="card" className="mb-2">Guest Players</AppleHeading>
          <p className="text-[rgb(134,142,150)] text-lg">{tournamentTitle}</p>
          <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-[rgb(0,113,227)]/10 border border-[rgb(0,113,227)]/20 text-[rgb(0,113,227)] rounded-full text-sm">
            <Users className="w-4 h-4" />
            <span>Inviting for: {myTeam.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AppleStatCard
            label="Available Guest Players"
            value={availablePlayers.length}
            icon={<UserPlus className="w-6 h-6" />}
            iconColor="cyan"
          />
          <AppleStatCard
            label="Invited by Your Team"
            value={myInvitedPlayers.length}
            icon={<CheckCircle className="w-6 h-6" />}
            iconColor="green"
          />
          <AppleStatCard
            label="Invited by Other Teams"
            value={otherInvitedPlayers.length}
            icon={<Users className="w-6 h-6" />}
            iconColor="purple"
          />
        </div>

        {availablePlayers.length > 0 && (
          <div className="mb-8">
            <AppleHeading level={2} size="feature" className="mb-4">Available Guest Players</AppleHeading>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availablePlayers.map((guestPlayer) => (
                <AppleCard key={guestPlayer.id}>
                  <AppleCardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <AppleAvatar
                        src={guestPlayer.player_profiles.photo_url || undefined}
                        name={`${guestPlayer.profiles.first_name} ${guestPlayer.profiles.last_name}`}
                        alt={`${guestPlayer.profiles.first_name} ${guestPlayer.profiles.last_name}`}
                        size="lg"
                      />
                      <div className="flex-1">
                        <AppleHeading level={3} size="body" className="mb-1">
                          {guestPlayer.profiles.first_name} {guestPlayer.profiles.last_name}
                        </AppleHeading>
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                          <AppleBadge variant="info">
                            {guestPlayer.player_profiles.sport}
                          </AppleBadge>
                          <AppleBadge variant="purple">
                            {guestPlayer.player_profiles.age_group}
                          </AppleBadge>
                          <AppleBadge variant="info">
                            Class {guestPlayer.player_profiles.classification}
                          </AppleBadge>
                        </div>
                        <div className="flex items-center space-x-2 text-[rgb(134,142,150)] text-sm">
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
                          <p className="text-xs text-[rgb(134,142,150)] mb-2 font-medium">POSITIONS</p>
                          <div className="flex flex-wrap gap-2">
                            {guestPlayer.player_profiles.position.map((pos: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-[rgb(245,245,247)] text-[rgb(29,29,31)] text-xs rounded font-medium"
                              >
                                {pos}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {guestPlayer.player_profiles.bio && (
                      <p className="text-[rgb(134,142,150)] text-sm mb-4 line-clamp-3">
                        {guestPlayer.player_profiles.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-[rgb(245,245,247)]">
                      <span className="text-xs text-[rgb(134,142,150)]">
                        Applied {formatDate(guestPlayer.updated_at)}
                      </span>
                      <AppleButton
                        variant="primary"
                        onClick={() => handleInvitePlayer(guestPlayer.id)}
                        disabled={processing === guestPlayer.id}
                        loading={processing === guestPlayer.id}
                        leftIcon={!processing && <Mail className="w-4 h-4" />}
                        className="bg-gradient-to-r from-[rgb(0,199,190)] to-[rgb(0,113,227)]"
                      >
                        Invite to Team
                      </AppleButton>
                    </div>
                  </AppleCardContent>
                </AppleCard>
              ))}
            </div>
          </div>
        )}

        {myInvitedPlayers.length > 0 && (
          <div className="mb-8">
            <AppleHeading level={2} size="feature" className="mb-4">Players You Invited</AppleHeading>
            <div className="space-y-4">
              {myInvitedPlayers.map((guestPlayer) => (
                <AppleCard key={guestPlayer.id}>
                  <AppleCardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <AppleAvatar
                          src={guestPlayer.player_profiles.photo_url || undefined}
                          name={`${guestPlayer.profiles.first_name} ${guestPlayer.profiles.last_name}`}
                          alt={`${guestPlayer.profiles.first_name} ${guestPlayer.profiles.last_name}`}
                        />
                        <div>
                          <h3 className="text-lg font-bold text-[rgb(29,29,31)]">
                            {guestPlayer.profiles.first_name} {guestPlayer.profiles.last_name}
                          </h3>
                          <p className="text-sm text-[rgb(134,142,150)]">
                            {guestPlayer.player_profiles.sport} •{' '}
                            {guestPlayer.player_profiles.age_group}
                          </p>
                        </div>
                      </div>
                      <AppleBadge variant="purple" dot>
                        INVITED - Awaiting Response
                      </AppleBadge>
                    </div>
                  </AppleCardContent>
                </AppleCard>
              ))}
            </div>
          </div>
        )}

        {guestPlayers.length === 0 && (
          <div className="py-12">
            <AppleEmptyState
              icon={<Users className="w-12 h-12" />}
              title="No guest players yet"
              description="Guest players who apply will appear here for your team to invite."
            />
          </div>
        )}
      </div>
    </div>
  );
}
