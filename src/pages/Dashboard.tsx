import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  Plus,
  ArrowRight,
  Loader2,
  Video,
  ClipboardList,
  Settings,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Team, Tournament } from '../lib/supabase';
import ProfileShowcase from '../components/player/ProfileShowcase';
import TryoutApplicationWidget from '../components/player/TryoutApplicationWidget';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleStatCard,
  AppleAvatar,
  AppleEmptyState,
  AppleBadge,
} from '@/components/apple';

export default function Dashboard() {
  const { organization, player, trainer } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    tournamentsHosted: 0,
    tournamentApplications: 0,
    upcomingTournaments: 0,
    // Trainer stats
    totalSessions: 0,
    activeSessions: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
  });

  useEffect(() => {
    if (organization) {
      loadOrganizationData();
    } else if (player) {
      loadPlayerData();
    } else if (trainer) {
      loadTrainerData();
    }
  }, [organization, player, trainer]);

  const loadOrganizationData = async () => {
    try {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setTeams(teamsData || []);

      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('start_date', { ascending: false })
        .limit(3);

      setTournaments(tournamentsData || []);

      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id)
        .eq('is_active', true);

      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id)
        .gte('date', new Date().toISOString().split('T')[0]);

      const { count: tournamentsCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id);

      // Get tournament IDs first
      const { data: tournamentIds } = await supabase
        .from('tournaments')
        .select('id')
        .eq('organization_id', organization?.id);

      const tournamentIdArray = tournamentIds?.map(t => t.id) || [];

      const { count: applicationsCount } = await supabase
        .from('tournament_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('tournament_id', tournamentIdArray);

      const { count: upcomingTournamentsCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('start_date', new Date().toISOString().split('T')[0]);

      setStats({
        totalTeams: teamCount || 0,
        totalPlayers: 0,
        upcomingEvents: eventCount || 0,
        unreadMessages: 0,
        tournamentsHosted: tournamentsCount || 0,
        tournamentApplications: applicationsCount || 0,
        upcomingTournaments: upcomingTournamentsCount || 0,
        totalSessions: 0,
        activeSessions: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
      });
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerData = async () => {
    try {
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('*, teams(*)')
        .eq('player_id', player?.id);

      const { count: upcomingTournamentsCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('start_date', new Date().toISOString().split('T')[0]);

      setStats({
        totalTeams: teamMemberships?.length || 0,
        totalPlayers: 0,
        upcomingEvents: 0,
        unreadMessages: 0,
        tournamentsHosted: 0,
        tournamentApplications: 0,
        upcomingTournaments: upcomingTournamentsCount || 0,
        totalSessions: 0,
        activeSessions: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
      });
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainerData = async () => {
    try {
      // Get all sessions count
      const { count: totalSessionsCount } = await supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainer?.id);

      // Get active sessions count
      const { count: activeSessionsCount } = await supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainer?.id)
        .eq('is_active', true);

      // Get total bookings
      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('id')
        .eq('trainer_id', trainer?.id);

      const sessionIds = sessions?.map(s => s.id) || [];

      const { count: totalBookingsCount } = await supabase
        .from('session_bookings')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds);

      const { count: pendingBookingsCount } = await supabase
        .from('session_bookings')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .eq('status', 'pending');

      const { count: completedBookingsCount } = await supabase
        .from('session_bookings')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .eq('status', 'completed');

      setStats({
        totalTeams: 0,
        totalPlayers: 0,
        upcomingEvents: 0,
        unreadMessages: 0,
        tournamentsHosted: 0,
        tournamentApplications: 0,
        upcomingTournaments: 0,
        totalSessions: totalSessionsCount || 0,
        activeSessions: activeSessionsCount || 0,
        totalBookings: totalBookingsCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        completedBookings: completedBookingsCount || 0,
      });
    } catch (error) {
      console.error('Error loading trainer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(247,247,249)]">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  if (organization) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <AppleHeading level={1} size="section">
                {organization.name}
              </AppleHeading>
              <p className="text-lg text-[rgb(134,142,150)] mt-2">
                Welcome back! Here's what's happening with your organization.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/tournaments/create">
                <AppleButton variant="gradient" leftIcon={<Plus className="w-5 h-5" />}>
                  Create Tournament
                </AppleButton>
              </Link>
              <Link to="/teams/new">
                <AppleButton variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
                  Create Team
                </AppleButton>
              </Link>
              <Link to="/tryouts">
                <AppleButton variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
                  Create Tryout
                </AppleButton>
              </Link>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AppleStatCard
              label="Active Teams"
              value={stats.totalTeams}
              icon={<Trophy className="w-5 h-5" />}
              iconColor="blue"
              animateOnView
            />

            <AppleStatCard
              label="Tournaments"
              value={stats.tournamentsHosted}
              icon={<Trophy className="w-5 h-5" />}
              iconColor="purple"
              animateOnView
              delay={0.1}
            />

            <AppleStatCard
              label="Applications"
              value={stats.tournamentApplications}
              icon={<Users className="w-5 h-5" />}
              iconColor="cyan"
              animateOnView
              delay={0.2}
            />

            <AppleStatCard
              label="Events"
              value={stats.upcomingEvents}
              icon={<Calendar className="w-5 h-5" />}
              iconColor="green"
              animateOnView
              delay={0.3}
            />

            <AppleStatCard
              label="Messages"
              value={stats.unreadMessages}
              icon={<MessageSquare className="w-5 h-5" />}
              iconColor="yellow"
              animateOnView
              delay={0.4}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teams Section - Takes 2 columns */}
            <div className="lg:col-span-2">
              {teams.length > 0 ? (
                <AppleCard variant="default" padding="lg" animateOnView>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Your Teams</h2>
                      <p className="text-sm text-[rgb(134,142,150)] mt-1">
                        {teams.length} team{teams.length !== 1 ? 's' : ''} • Showing latest 3
                      </p>
                    </div>
                    <Link to="/teams">
                      <AppleButton variant="text" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        View All
                      </AppleButton>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <Link
                        key={team.id}
                        to={`/teams/${team.id}/manage`}
                        className="block bg-white border-[1.5px] border-slate-200 rounded-xl p-5 hover:border-[rgb(0,113,227)] hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-4">
                          <AppleAvatar
                            src={team.logo_url}
                            name={team.name}
                            size="xl"
                            color="blue"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[rgb(29,29,31)] font-bold mb-2 group-hover:text-[rgb(0,113,227)] transition-colors">
                              {team.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <AppleBadge variant="primary" size="sm">
                                {team.sport}
                              </AppleBadge>
                              {team.age_group && (
                                <AppleBadge variant="default" size="sm">
                                  {team.age_group}
                                </AppleBadge>
                              )}
                              {team.gender && (
                                <AppleBadge variant="info" size="sm">
                                  {team.gender}
                                </AppleBadge>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[rgb(134,142,150)] group-hover:text-[rgb(0,113,227)] transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </AppleCard>
              ) : (
                <AppleEmptyState
                  icon={<Trophy className="w-16 h-16" />}
                  title="Create Your First Team"
                  description="Get started by creating a team to manage players, schedule events, and host tryouts."
                  iconColor="blue"
                  action={{
                    label: 'Create Team',
                    onClick: () => window.location.href = '/teams/new',
                    icon: <Plus className="w-5 h-5" />,
                  }}
                />
              )}
            </div>

            {/* CTA Card - Takes 1 column */}
            <div>
              <AppleCard
                variant="feature"
                padding="lg"
                animateOnView
                className="bg-gradient-to-br from-blue-500 to-cyan-400 h-full"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Discover Players
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      Browse talented athletes and find the perfect fit for your team
                    </p>
                  </div>
                  <Link to="/players" className="mt-6">
                    <AppleButton
                      variant="outline"
                      size="lg"
                      fullWidth
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-white hover:bg-white/90 text-[rgb(0,113,227)] border-white"
                    >
                      Browse Players
                    </AppleButton>
                  </Link>
                </div>
              </AppleCard>
            </div>
          </div>

          {/* Tournaments Section */}
          {tournaments.length > 0 && (
            <AppleCard variant="default" padding="lg" animateOnView>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Your Tournaments</h2>
                  <p className="text-sm text-[rgb(134,142,150)] mt-1">
                    {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} • Latest updates
                  </p>
                </div>
                <Link to="/tournaments">
                  <AppleButton variant="text" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All
                  </AppleButton>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    to={`/tournaments/${tournament.id}`}
                    className="block bg-white border-[1.5px] border-slate-200 rounded-xl p-5 hover:border-[rgb(0,113,227)] hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <AppleBadge variant="primary" size="sm">
                        {tournament.sport}
                      </AppleBadge>
                      <AppleBadge
                        variant={
                          tournament.status === 'open' ? 'success' :
                            tournament.status === 'closed' ? 'danger' :
                              'warning'
                        }
                        size="sm"
                      >
                        {tournament.status}
                      </AppleBadge>
                    </div>
                    <h3 className="text-[rgb(29,29,31)] font-bold mb-2 group-hover:text-[rgb(0,113,227)] transition-colors line-clamp-2">
                      {tournament.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[rgb(134,142,150)]">
                        {new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[rgb(134,142,150)]" />
                        <span className="text-[rgb(29,29,31)] font-semibold">
                          {tournament.current_participants}/{tournament.max_participants}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </AppleCard>
          )}
        </div>
      </div>
    );
  }

  if (player) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Profile Showcase */}
          <ProfileShowcase />

          {/* Tryout Applications Widget */}
          <TryoutApplicationWidget />

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/tournaments">
              <AppleCard
                variant="feature"
                padding="xl"
                hover
                animateOnView
                className="bg-gradient-to-br from-purple-500 to-pink-500 h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Browse Tournaments
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      Apply as a guest player and get invited by teams
                    </p>
                  </div>
                </div>
              </AppleCard>
            </Link>

            <Link to="/player/teams">
              <AppleCard
                variant="feature"
                padding="xl"
                hover
                animateOnView
                delay={0.1}
                className="bg-gradient-to-br from-cyan-500 to-blue-500 h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      My Teams
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      View your team memberships and schedules
                    </p>
                  </div>
                </div>
              </AppleCard>
            </Link>
          </div>

          {/* Additional Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/tryouts">
              <AppleCard variant="default" padding="lg" hover animateOnView delay={0.2}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[rgb(29,29,31)] mb-1">Tryouts</h4>
                    <p className="text-sm text-[rgb(134,142,150)]">Upcoming opportunities</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[rgb(134,142,150)]" />
                </div>
              </AppleCard>
            </Link>

            <Link to="/calendar">
              <AppleCard variant="default" padding="lg" hover animateOnView delay={0.3}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[rgb(29,29,31)] mb-1">Calendar</h4>
                    <p className="text-sm text-[rgb(134,142,150)]">View your schedule</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[rgb(134,142,150)]" />
                </div>
              </AppleCard>
            </Link>

            <Link to="/player/profile">
              <AppleCard variant="default" padding="lg" hover animateOnView delay={0.4}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[rgb(29,29,31)] mb-1">Profile</h4>
                    <p className="text-sm text-[rgb(134,142,150)]">Manage your profile</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[rgb(134,142,150)]" />
                </div>
              </AppleCard>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (trainer) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <AppleHeading level={1} size="section">
                Welcome Back, Trainer
              </AppleHeading>
              <p className="text-lg text-[rgb(134,142,150)] mt-2">
                {trainer.tagline || 'Manage your training sessions and bookings'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/trainer/profile">
                <AppleButton variant="outline" leftIcon={<Settings className="w-5 h-5" />}>
                  Edit Profile
                </AppleButton>
              </Link>
              <Link to="/sessions/create">
                <AppleButton variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
                  Create Session
                </AppleButton>
              </Link>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AppleStatCard
              label="Total Sessions"
              value={stats.totalSessions}
              icon={<Video className="w-5 h-5" />}
              iconColor="blue"
              animateOnView
            />

            <AppleStatCard
              label="Active Sessions"
              value={stats.activeSessions}
              icon={<Trophy className="w-5 h-5" />}
              iconColor="green"
              animateOnView
              delay={0.1}
            />

            <AppleStatCard
              label="Total Bookings"
              value={stats.totalBookings}
              icon={<ClipboardList className="w-5 h-5" />}
              iconColor="purple"
              animateOnView
              delay={0.2}
            />

            <AppleStatCard
              label="Pending Bookings"
              value={stats.pendingBookings}
              icon={<MessageSquare className="w-5 h-5" />}
              iconColor="yellow"
              animateOnView
              delay={0.3}
            />

            <AppleStatCard
              label="Completed"
              value={stats.completedBookings}
              icon={<Award className="w-5 h-5" />}
              iconColor="cyan"
              animateOnView
              delay={0.4}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions - Takes 2 columns */}
            <div className="lg:col-span-2">
              <AppleCard variant="default" padding="lg" animateOnView>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Quick Actions</h2>
                  <p className="text-sm text-[rgb(134,142,150)] mt-1">
                    Manage your training business
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/sessions/create">
                    <AppleCard
                      variant="feature"
                      padding="lg"
                      hover
                      className="bg-gradient-to-br from-blue-500 to-cyan-400 h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                          <Plus className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Create Session
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Add a new training session with rich media
                        </p>
                      </div>
                    </AppleCard>
                  </Link>

                  <Link to="/sessions">
                    <AppleCard
                      variant="feature"
                      padding="lg"
                      hover
                      className="bg-gradient-to-br from-purple-500 to-pink-500 h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                          <Video className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Manage Sessions
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          View and edit all your training sessions
                        </p>
                      </div>
                    </AppleCard>
                  </Link>

                  <Link to="/bookings">
                    <AppleCard
                      variant="feature"
                      padding="lg"
                      hover
                      className="bg-gradient-to-br from-green-500 to-emerald-500 h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                          <ClipboardList className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          View Bookings
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Manage session bookings and requests
                        </p>
                      </div>
                    </AppleCard>
                  </Link>

                  <Link to="/trainer/profile">
                    <AppleCard
                      variant="feature"
                      padding="lg"
                      hover
                      className="bg-gradient-to-br from-orange-500 to-red-500 h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                          <Settings className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Edit Profile
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Update your credentials and media
                        </p>
                      </div>
                    </AppleCard>
                  </Link>
                </div>
              </AppleCard>
            </div>

            {/* CTA Card - Takes 1 column */}
            <div>
              <AppleCard
                variant="feature"
                padding="lg"
                animateOnView
                className="bg-gradient-to-br from-indigo-500 to-purple-500 h-full"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Trainer Marketplace
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      View your public profile and marketplace listing
                    </p>
                  </div>
                  <Link to="/trainers" className="mt-6">
                    <AppleButton
                      variant="outline"
                      size="lg"
                      fullWidth
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-white hover:bg-white/90 text-[rgb(75,0,130)] border-white"
                    >
                      View Marketplace
                    </AppleButton>
                  </Link>
                </div>
              </AppleCard>
            </div>
          </div>

          {/* Pending Bookings Alert */}
          {stats.pendingBookings > 0 && (
            <AppleCard variant="default" padding="lg" animateOnView>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-1">
                      {stats.pendingBookings} Pending Booking{stats.pendingBookings !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-[rgb(134,142,150)]">
                      You have booking requests waiting for your response
                    </p>
                  </div>
                </div>
                <Link to="/bookings">
                  <AppleButton variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Review Now
                  </AppleButton>
                </Link>
              </div>
            </AppleCard>
          )}
        </div>
      </div>
    );
  }

  return null;
}
