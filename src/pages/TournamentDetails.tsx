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
  X,
  UserPlus,
  CheckCircle,
  ImageIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Tournament, TournamentParticipant } from '../lib/supabase';
import TournamentMap from '../components/TournamentMap';
import GuestPlayerButton from '../components/tournaments/GuestPlayerButton';
import {
  AppleButton,
  AppleCard,
  AppleCardHeader,
  AppleCardTitle,
  AppleCardContent,
  AppleHeading,
  AppleBadge,
  AppleStatCard,
  AppleEmptyState,
  AppleModal,
} from '../components/apple';

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
  } | null;
  teams?: {
    name: string;
    sport: string;
    age_group: string | null;
    gender: string | null;
    logo_url: string | null;
    organizations: {
      name: string;
      city: string | null;
      state: string | null;
    } | null;
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
  const [hasRegisteredTeam, setHasRegisteredTeam] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [registeringTeam, setRegisteringTeam] = useState(false);
  const [unregisteringTeam, setUnregisteringTeam] = useState(false);
  const { organization, player } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadTournament();
      loadParticipants();
      if (organization) {
        checkApplicationStatus();
        checkTeamRegistration();
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
        .select('*, organizations(name, city, state), teams(name, sport, age_group, gender, logo_url, organizations(name, city, state))')
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

  const checkTeamRegistration = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('team_id, teams!inner(id, organization_id)')
        .eq('tournament_id', id)
        .eq('teams.organization_id', organization.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking team registration:', error);
        return;
      }

      setHasRegisteredTeam(!!data);
    } catch (error) {
      console.error('Error checking team registration:', error);
    }
  };

  const loadAvailableTeams = async () => {
    if (!organization || !tournament) return;

    try {
      // Get all teams from this organization that match the tournament sport
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, sport, age_group')
        .eq('organization_id', organization.id)
        .eq('sport', tournament.sport);

      if (teamsError) throw teamsError;

      // Get already registered teams for this tournament
      const { data: registeredTeams, error: regError } = await supabase
        .from('tournament_participants')
        .select('team_id')
        .eq('tournament_id', id)
        .eq('organization_id', organization.id);

      if (regError && regError.code !== 'PGRST116') throw regError;

      const registeredTeamIds = new Set(registeredTeams?.map((t) => t.team_id) || []);

      // Filter out already registered teams
      const available = allTeams?.filter((team) => !registeredTeamIds.has(team.id)) || [];

      setAvailableTeams(available);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleRegisterTeam = async (teamId: string) => {
    if (!organization) return;

    setRegisteringTeam(true);

    try {
      const { error } = await supabase.from('tournament_participants').insert({
        tournament_id: id,
        team_id: teamId,
        organization_id: organization.id,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowTeamSelector(false);
      setHasRegisteredTeam(true);
      loadParticipants();
      checkTeamRegistration();
    } catch (error) {
      console.error('Error registering team:', error);
      alert('Failed to register team');
    } finally {
      setRegisteringTeam(false);
    }
  };

  const handleUnregisterTeam = async () => {
    if (!organization) return;

    if (!confirm('Are you sure you want to withdraw your team from this tournament?')) {
      return;
    }

    setUnregisteringTeam(true);

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', id)
        .eq('organization_id', organization.id);

      if (error) throw error;

      setHasRegisteredTeam(false);
      loadParticipants();
      checkTeamRegistration();
    } catch (error) {
      console.error('Error unregistering team:', error);
      alert('Failed to withdraw team from tournament');
    } finally {
      setUnregisteringTeam(false);
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

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "primary" | "info" | "danger" | "purple" | "outline" => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'open':
        return 'success';
      case 'closed':
        return 'warning';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 flex items-center justify-center">
        <AppleEmptyState
          icon={<Trophy className="w-12 h-12" />}
          title="Tournament not found"
          description="The tournament you're looking for doesn't exist or has been removed."
          action={{
            label: 'Back to tournaments',
            onClick: () => navigate('/tournaments'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournaments</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AppleCard>
              {/* Tournament Image */}
              <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden rounded-t-2xl">
                {tournament.image_url ? (
                  <img
                    src={tournament.image_url}
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-20 h-20 text-slate-300" />
                  </div>
                )}
              </div>
              <AppleCardContent className="p-8">
                {/* Title and Badge */}
                <div className="mb-4">
                  <AppleHeading level={1} size="card" className="mb-2">{tournament.title}</AppleHeading>
                  <AppleBadge variant="primary" size="lg">
                    {tournament.sport}
                  </AppleBadge>
                </div>

                {/* Hosted by */}
                {tournament.organizations && (
                  <div className="flex items-center space-x-2 text-[rgb(134,142,150)] mb-4">
                    <Building2 className="w-4 h-4" />
                    <span>Hosted by {tournament.organizations.name}</span>
                  </div>
                )}

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <AppleBadge variant={getStatusVariant(tournament.status)}>
                    {tournament.status.replace('_', ' ').toUpperCase()}
                  </AppleBadge>

                  {isOwnTournament && (
                    <div className="relative">
                      <AppleButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                      >
                        Change Status
                      </AppleButton>

                      {showStatusMenu && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[rgb(210,210,215)] rounded-lg shadow-xl z-10 min-w-[160px]">
                          {['draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled'].map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(status)}
                                className="w-full px-4 py-2 text-left text-sm text-[rgb(29,29,31)] hover:bg-[rgb(245,245,247)] first:rounded-t-lg last:rounded-b-lg transition-colors capitalize"
                              >
                                {status.replace('_', ' ')}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {organization && !hasRegisteredTeam && tournament.status === 'open' && (
                      <AppleButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          loadAvailableTeams();
                          setShowTeamSelector(true);
                        }}
                        leftIcon={<Users className="w-4 h-4" />}
                      >
                        Register Team
                      </AppleButton>
                    )}
                    {hasRegisteredTeam && (
                      <>
                        <AppleButton
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/tournaments/${id}/guest-players`)}
                          leftIcon={<UserPlus className="w-4 h-4" />}
                        >
                          Guest Players
                        </AppleButton>
                        <AppleButton
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={handleUnregisterTeam}
                          disabled={unregisteringTeam}
                          loading={unregisteringTeam}
                          leftIcon={<X className="w-4 h-4" />}
                        >
                          Withdraw Team
                        </AppleButton>
                      </>
                    )}
                    {isOwnTournament && (
                      <AppleButton
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/tournaments/${id}/edit`)}
                        leftIcon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </AppleButton>
                    )}
                  </div>
                </div>

                {tournament.description && (
                  <div className="mb-8">
                    <AppleHeading level={3} size="feature" className="mb-3">About This Tournament</AppleHeading>
                    <p className="text-[rgb(134,142,150)] leading-relaxed">{tournament.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <AppleStatCard
                    label="Tournament Dates"
                    value={formatDate(tournament.start_date)}
                    subtitle={tournament.start_date !== tournament.end_date ? `to ${formatDate(tournament.end_date)}` : undefined}
                    icon={<Calendar className="w-5 h-5" />}
                    iconColor="blue"
                    size="compact"
                  />

                  <AppleStatCard
                    label="Registration Deadline"
                    value={formatDate(tournament.registration_deadline)}
                    subtitle={!isRegistrationOpen() ? "Registration closed" : undefined}
                    icon={<Clock className="w-5 h-5" />}
                    iconColor="green"
                    size="compact"
                  />

                  <AppleStatCard
                    label="Venue"
                    value={tournament.location_name}
                    subtitle={`${tournament.city}${tournament.state ? `, ${tournament.state}` : ''}`}
                    icon={<MapPin className="w-5 h-5" />}
                    iconColor="cyan"
                    size="compact"
                  />

                  <AppleStatCard
                    label="Format"
                    value={tournament.format_type.replace('_', ' ')}
                    icon={<Trophy className="w-5 h-5" />}
                    iconColor="yellow"
                    className="capitalize"
                    size="compact"
                  />

                  <AppleStatCard
                    label="Participants"
                    value={`${tournament.current_participants} / ${tournament.max_participants}`}
                    subtitle={tournament.current_participants >= tournament.max_participants ? "Tournament full" : "teams"}
                    icon={<Users className="w-5 h-5" />}
                    iconColor="purple"
                    size="compact"
                  />

                  {tournament.entry_fee && (
                    <AppleStatCard
                      label="Entry Fee"
                      value={`$${tournament.entry_fee}`}
                      icon={<DollarSign className="w-5 h-5" />}
                      iconColor="green"
                      size="compact"
                    />
                  )}
                </div>

                {tournament.prize_info && (
                  <div className="bg-[rgb(245,245,247)] border border-[rgb(210,210,215)] rounded-xl p-6 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-[rgb(255,149,0)]" />
                      <h3 className="font-bold text-[rgb(29,29,31)]">Prize Information</h3>
                    </div>
                    <p className="text-[rgb(134,142,150)]">{tournament.prize_info}</p>
                  </div>
                )}

                {tournament.requirements &&
                  Array.isArray(tournament.requirements) &&
                  tournament.requirements.length > 0 && (
                    <div className="bg-[rgb(245,245,247)] rounded-xl p-6 mb-6">
                      <h3 className="font-bold text-[rgb(29,29,31)] mb-2">Requirements</h3>
                      <ul className="space-y-1 text-[rgb(134,142,150)]">
                        {tournament.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-[rgb(0,113,227)] mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </AppleCardContent>
            </AppleCard>

            {participants.length > 0 && (
              <AppleCard>
                <AppleCardHeader>
                  <AppleCardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[rgb(0,113,227)]" />
                    Registered Teams ({participants.length})
                  </AppleCardTitle>
                </AppleCardHeader>
                <AppleCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex flex-col p-4 bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)]"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          {participant.teams?.logo_url ? (
                            <img
                              src={participant.teams.logo_url}
                              alt={participant.teams.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(0,113,227)] to-[rgb(94,92,230)] rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                              {participant.teams?.name?.charAt(0) || participant.organizations?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {participant.teams ? (
                              <>
                                <h3 className="text-[rgb(29,29,31)] font-semibold truncate">
                                  {participant.teams.name}
                                </h3>
                                <div className="flex items-center space-x-2 text-xs text-[rgb(134,142,150)]">
                                  {participant.teams.age_group && (
                                    <span>{participant.teams.age_group}</span>
                                  )}
                                  {participant.teams.gender && (
                                    <>
                                      {participant.teams.age_group && <span>•</span>}
                                      <span className="capitalize">{participant.teams.gender}</span>
                                    </>
                                  )}
                                </div>
                              </>
                            ) : (
                              <h3 className="text-[rgb(29,29,31)] font-semibold truncate">
                                {participant.organizations?.name || 'Unknown Organization'}
                              </h3>
                            )}
                          </div>
                          {participant.check_in_status === 'checked_in' && (
                            <CheckCircle className="w-5 h-5 text-[rgb(52,199,89)] flex-shrink-0" />
                          )}
                        </div>
                        {(() => {
                          const org = participant.teams?.organizations || participant.organizations;
                          return (
                            <div className="flex items-center space-x-2 text-xs text-[rgb(134,142,150)] pl-13">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">
                                {org?.name || 'Unknown Organization'}
                                {org?.city && <> • {org.city}</>}
                                {org?.state && <>, {org.state}</>}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </AppleCardContent>
              </AppleCard>
            )}

            {tournament.latitude && tournament.longitude && (
              <AppleCard>
                <AppleCardHeader>
                  <AppleCardTitle>Location</AppleCardTitle>
                </AppleCardHeader>
                <AppleCardContent>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <TournamentMap
                      tournaments={[tournament]}
                      center={[tournament.latitude, tournament.longitude]}
                      zoom={13}
                    />
                  </div>
                </AppleCardContent>
              </AppleCard>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AppleCard>
                <AppleCardContent className="p-6">
                  {error && (
                    <div className="mb-4 p-4 bg-[rgb(255,59,48)]/10 border border-[rgb(255,59,48)]/20 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-[rgb(255,59,48)] flex-shrink-0 mt-0.5" />
                      <p className="text-[rgb(255,59,48)] text-sm">{error}</p>
                    </div>
                  )}

                  {isOwnTournament ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[rgb(0,113,227)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-[rgb(0,113,227)]" />
                      </div>
                      <AppleHeading level={3} size="feature" className="mb-2">Your Tournament</AppleHeading>
                      <p className="text-[rgb(134,142,150)] text-sm mb-6">You're hosting this tournament</p>
                      <div className="space-y-3">
                        <AppleButton
                          variant="primary"
                          onClick={() => navigate(`/tournaments/${id}/applications`)}
                          className="w-full"
                        >
                          Manage Applications
                        </AppleButton>
                        <AppleButton
                          variant="secondary"
                          onClick={() => navigate(`/tournaments/${id}/edit`)}
                          className="w-full"
                        >
                          Edit Tournament
                        </AppleButton>
                      </div>
                    </div>
                  ) : hasApplied ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[rgb(52,199,89)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-[rgb(52,199,89)]" />
                      </div>
                      <AppleHeading level={3} size="feature" className="mb-2">Application Submitted</AppleHeading>
                      <p className="text-[rgb(134,142,150)] text-sm">
                        You've applied to this tournament. The host will review your application.
                      </p>
                    </div>
                  ) : player ? (
                    <div>
                      <AppleHeading level={3} size="feature" className="mb-4">Join as Guest Player</AppleHeading>
                      <p className="text-[rgb(134,142,150)] text-sm mb-4">
                        Apply to play with teams that need guest players for this tournament.
                      </p>
                      <GuestPlayerButton tournamentId={id!} />
                    </div>
                  ) : (
                    <div>
                      <AppleHeading level={3} size="feature" className="mb-4">Ready to compete?</AppleHeading>
                      {!organization ? (
                        <div className="text-center">
                          <p className="text-[rgb(134,142,150)] text-sm mb-4">
                            Sign in as an organization to apply, or as a player to join as a guest
                          </p>
                          <AppleButton
                            variant="primary"
                            onClick={() => navigate('/login')}
                            className="w-full"
                          >
                            Sign In
                          </AppleButton>
                        </div>
                      ) : !isRegistrationOpen() ? (
                        <div className="text-center">
                          <p className="text-[rgb(134,142,150)] text-sm">Registration is closed</p>
                        </div>
                      ) : tournament.current_participants >= tournament.max_participants ? (
                        <div className="text-center">
                          <p className="text-[rgb(255,149,0)] text-sm">This tournament is full</p>
                        </div>
                      ) : (
                        <AppleButton
                          variant="primary"
                          onClick={handleApply}
                          disabled={applying}
                          loading={applying}
                          leftIcon={<Trophy className="w-5 h-5" />}
                          className="w-full"
                        >
                          Apply to Tournament
                        </AppleButton>
                      )}
                    </div>
                  )}
                </AppleCardContent>
              </AppleCard>
            </div>
          </div>
        </div>

        {/* Team Selection Modal */}
        <AppleModal
          isOpen={showTeamSelector}
          onClose={() => setShowTeamSelector(false)}
          title="Select Team to Register"
        >
          {availableTeams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-[rgb(134,142,150)] mx-auto mb-3" />
              <p className="text-[rgb(134,142,150)] mb-2">No teams available</p>
              <p className="text-sm text-[rgb(134,142,150)]">
                Create a {tournament?.sport} team to register
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleRegisterTeam(team.id)}
                  disabled={registeringTeam}
                  className="w-full p-4 bg-[rgb(245,245,247)] border border-[rgb(210,210,215)] rounded-lg hover:border-[rgb(0,113,227)] hover:bg-[rgb(240,240,242)] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[rgb(29,29,31)] mb-1">{team.name}</h4>
                      <p className="text-sm text-[rgb(134,142,150)]">
                        {team.sport} • {team.age_group}
                      </p>
                    </div>
                    {registeringTeam && <Loader2 className="w-4 h-4 animate-spin text-[rgb(0,113,227)]" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </AppleModal>
      </div>
    </div>
  );
}
