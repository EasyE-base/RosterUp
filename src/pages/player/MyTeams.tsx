import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, MapPin, Mail, Phone, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Team {
  id: string;
  name: string;
  sport: string;
  age_group: string;
  gender: string;
  description: string;
  logo_url: string;
  season: string;
  roster_limit: number;
  is_active: boolean;
  organizations?: {
    name: string;
    contact_email: string;
    contact_phone: string;
  };
}

interface TeamMembership {
  id: string;
  team_id: string;
  position: string;
  jersey_number: number;
  status: string;
  joined_at: string;
  teams?: Team;
}

export default function MyTeams() {
  const { player } = useAuth();
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (player?.id) {
      fetchTeamMemberships();
    }
  }, [player?.id]);

  const fetchTeamMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          teams:team_id (
            *,
            organizations:organization_id (
              name,
              contact_email,
              contact_phone
            )
          )
        `)
        .eq('player_id', player?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemberships(data || []);
    } catch (err) {
      console.error('Error fetching team memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'inactive':
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Teams</h1>
        <p className="text-slate-400">Teams you're currently a member of</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Teams</p>
          <p className="text-3xl font-bold text-white">{memberships.length}</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Active Teams</p>
          <p className="text-3xl font-bold text-white">
            {memberships.filter(m => m.status === 'active').length}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-white">
            {memberships.filter(m => m.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Teams List */}
      {memberships.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {memberships.map((membership) => {
            const team = membership.teams;
            if (!team) return null;

            return (
              <div
                key={membership.id}
                className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-700/50 transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Team Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Team Logo/Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                            <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(membership.status)}`}>
                              {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                            {team.sport && (
                              <div className="flex items-center space-x-1">
                                <Trophy className="w-4 h-4" />
                                <span className="capitalize">{team.sport}</span>
                              </div>
                            )}
                            {team.age_group && (
                              <span>{team.age_group}</span>
                            )}
                            {team.gender && (
                              <span className="capitalize">{team.gender}</span>
                            )}
                            {team.season && (
                              <span>{team.season}</span>
                            )}
                          </div>

                          {/* Player Info */}
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            {membership.position && (
                              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium">
                                {membership.position}
                              </span>
                            )}
                            {membership.jersey_number && (
                              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium">
                                #{membership.jersey_number}
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              Joined {formatDate(membership.joined_at)}
                            </span>
                          </div>

                          {team.description && (
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                              {team.description}
                            </p>
                          )}

                          {/* Organization Info */}
                          {team.organizations && (
                            <div className="space-y-2">
                              <p className="text-sm text-slate-400">
                                <span className="font-medium text-slate-300">Organization:</span>{' '}
                                {team.organizations.name}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                {team.organizations.contact_email && (
                                  <a
                                    href={`mailto:${team.organizations.contact_email}`}
                                    className="flex items-center space-x-1 hover:text-cyan-400 transition-colors"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>{team.organizations.contact_email}</span>
                                  </a>
                                )}
                                {team.organizations.contact_phone && (
                                  <a
                                    href={`tel:${team.organizations.contact_phone}`}
                                    className="flex items-center space-x-1 hover:text-cyan-400 transition-colors"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{team.organizations.contact_phone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/calendar?team=${team.id}`}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>View Schedule</span>
                      </Link>
                      <Link
                        to={`/messages?team=${team.id}`}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <Users className="w-4 h-4" />
                        <span>Team Chat</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Teams Yet</h3>
          <p className="text-slate-400 mb-6">
            You're not currently a member of any teams. Apply to tryouts to join a team!
          </p>
          <Link
            to="/tryouts"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
          >
            <span>Browse Tryouts</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
