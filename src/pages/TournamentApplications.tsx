import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Building2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TournamentApplication } from '../lib/supabase';

interface ApplicationWithOrg extends TournamentApplication {
  organizations: {
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  };
}

export default function TournamentApplications() {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<ApplicationWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [tournamentTitle, setTournamentTitle] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadApplications();
      loadTournamentInfo();
    }
  }, [id]);

  const loadTournamentInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('title, organization_id')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data || (organization && data.organization_id !== organization.id)) {
        navigate('/tournaments');
        return;
      }

      setTournamentTitle(data.title);
    } catch (error) {
      console.error('Error loading tournament:', error);
      navigate('/tournaments');
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournament_applications')
        .select('*, organizations(name, city, state, logo_url)')
        .eq('tournament_id', id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications((data as ApplicationWithOrg[]) || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setProcessing(applicationId);

    try {
      const { error } = await supabase
        .from('tournament_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: organization?.user_id,
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (newStatus === 'accepted') {
        const application = applications.find((app) => app.id === applicationId);
        if (application) {
          await supabase.from('tournament_participants').insert({
            tournament_id: id,
            organization_id: application.organization_id,
            team_id: application.team_id,
          });
        }
      }

      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      accepted: 'bg-green-500/20 border-green-500/50 text-green-400',
      rejected: 'bg-red-500/20 border-red-500/50 text-red-400',
      waitlist: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
      withdrawn: 'bg-slate-500/20 border-slate-500/50 text-slate-400',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const reviewedApplications = applications.filter((app) => app.status !== 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/tournaments/${id}`)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournament</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournament Applications</h1>
          <p className="text-slate-400">{tournamentTitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{pendingApplications.length}</span>
            </div>
            <p className="text-slate-400">Pending Review</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {applications.filter((app) => app.status === 'accepted').length}
              </span>
            </div>
            <p className="text-slate-400">Accepted</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{applications.length}</span>
            </div>
            <p className="text-slate-400">Total Applications</p>
          </div>
        </div>

        {pendingApplications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pending Applications</h2>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {application.organizations.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {application.organizations.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-slate-400 text-sm">
                            <Building2 className="w-4 h-4" />
                            <span>
                              {application.organizations.city}
                              {application.organizations.state &&
                                `, ${application.organizations.state}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Applied</p>
                          <p className="text-white">{formatDate(application.applied_at)}</p>
                        </div>

                        {application.roster_size && (
                          <div>
                            <p className="text-sm text-slate-400 mb-1">Roster Size</p>
                            <p className="text-white">{application.roster_size} players</p>
                          </div>
                        )}

                        {application.experience_level && (
                          <div>
                            <p className="text-sm text-slate-400 mb-1">Experience Level</p>
                            <p className="text-white capitalize">{application.experience_level}</p>
                          </div>
                        )}
                      </div>

                      {application.application_notes && (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <p className="text-sm text-slate-400 mb-2">Notes from organization</p>
                          <p className="text-slate-300">{application.application_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:w-48">
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'accepted')}
                        disabled={processing === application.id}
                        className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {processing === application.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                        disabled={processing === application.id}
                        className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'waitlist')}
                        disabled={processing === application.id}
                        className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviewedApplications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Reviewed Applications</h2>
            <div className="space-y-4">
              {reviewedApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {application.organizations.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {application.organizations.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-slate-400">
                            Applied {formatDate(application.applied_at)}
                          </span>
                          {application.reviewed_at && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">
                                Reviewed {formatDate(application.reviewed_at)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
            <p className="text-slate-400">Applications will appear here as organizations sign up</p>
          </div>
        )}
      </div>
    </div>
  );
}
