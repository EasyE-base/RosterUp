import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  MessageSquare,
  Plus,
  ArrowRight,
  Loader2,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Team, Tournament } from '../lib/supabase';

export default function Dashboard() {
  const { organization, player } = useAuth();
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
  });

  useEffect(() => {
    if (organization) {
      loadOrganizationData();
    } else if (player) {
      loadPlayerData();
    }
  }, [organization, player]);

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

      const { count: applicationsCount } = await supabase
        .from('tournament_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('tournament_id',
          supabase
            .from('tournaments')
            .select('id')
            .eq('organization_id', organization?.id)
        );

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
      });
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (organization) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {organization.name} Dashboard
            </h1>
            <p className="text-slate-400">Manage all your teams and track performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/website-builder"
              className="flex items-center space-x-2 px-5 py-3 bg-slate-800/50 border border-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-all"
            >
              <Globe className="w-5 h-5" />
              <span>Website</span>
            </Link>
            <Link
              to="/tournaments/create"
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Tournament</span>
            </Link>
            <Link
              to="/teams/new"
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Team</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Active Teams</p>
            <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-yellow-400/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Tournaments Hosted</p>
            <p className="text-3xl font-bold text-white">{stats.tournamentsHosted}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-cyan-400/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              {stats.tournamentApplications > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {stats.tournamentApplications}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-1">Pending Applications</p>
            <p className="text-3xl font-bold text-white">{stats.tournamentApplications}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Upcoming Events</p>
            <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-pink-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Unread Messages</p>
            <p className="text-3xl font-bold text-white">{stats.unreadMessages}</p>
          </div>
        </div>

        {teams.length > 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Teams</h2>
              <Link
                to="/teams"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="block bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-all cursor-pointer border border-slate-700/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1">{team.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>{team.sport}</span>
                        {team.age_group && (
                          <>
                            <span>•</span>
                            <span>{team.age_group}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Create Your First Team</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Get started by creating a team to manage players, schedule events, and host tryouts.
            </p>
            <Link
              to="/teams/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Team</span>
            </Link>
          </div>
        )}

        {tournaments.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Tournaments</h2>
              <Link
                to="/tournaments"
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="block bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-all cursor-pointer border border-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{tournament.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>{tournament.sport}</span>
                        <span>•</span>
                        <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{tournament.status}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm font-medium rounded-full">
                      {tournament.current_participants}/{tournament.max_participants}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-500/20 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">Looking for new talent?</h3>
              <p className="text-slate-400">
                Browse our player discovery tool to find the perfect fit for your team
              </p>
            </div>
            <Link
              to="/players"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
            >
              <span>Discover Players</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (player) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-slate-400">Track your teams and opportunities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">My Teams</p>
            <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Upcoming Events</p>
            <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Messages</p>
            <p className="text-3xl font-bold text-white">{stats.unreadMessages}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-400/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">Find Your Next Opportunity</h3>
              <p className="text-slate-400">
                Discover teams and tryouts that match your skills
              </p>
            </div>
            <Link
              to="/tryouts"
              className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all flex items-center space-x-2"
            >
              <span>Browse Tryouts</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
