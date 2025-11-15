import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Calendar, MapPin, Clock, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Tryout {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  sport: string;
  date: string;
  location: string;
  status: string;
  registration_deadline: string;
  organizations?: {
    name: string;
  };
}

interface TryoutApplication {
  id: string;
  tryout_id: string;
  status: string;
  applied_at: string;
  tryouts?: Tryout;
}

export default function TryoutApplicationWidget() {
  const { player } = useAuth();
  const [applications, setApplications] = useState<TryoutApplication[]>([]);
  const [upcomingTryouts, setUpcomingTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (player?.id) {
      fetchData();
    }
  }, [player?.id]);

  const fetchData = async () => {
    try {
      // Fetch player's applications
      const { data: appsData, error: appsError } = await supabase
        .from('tryout_applications')
        .select(`
          *,
          tryouts:tryout_id (
            *,
            organizations:organization_id (name)
          )
        `)
        .eq('player_id', player?.id)
        .order('applied_at', { ascending: false })
        .limit(5);

      if (appsError) throw appsError;
      setApplications(appsData || []);

      // Fetch upcoming tryouts player hasn't applied to yet
      const { data: tryoutsData, error: tryoutsError } = await supabase
        .from('tryouts')
        .select(`
          *,
          organizations:organization_id (name)
        `)
        .eq('status', 'open')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (tryoutsError) throw tryoutsError;

      // Filter out tryouts player has already applied to
      const appliedTryoutIds = (appsData || []).map(app => app.tryout_id);
      const availableTryouts = (tryoutsData || []).filter(
        tryout => !appliedTryoutIds.includes(tryout.id)
      );

      setUpcomingTryouts(availableTryouts);
    } catch (err) {
      console.error('Error fetching tryout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-[rgb(134,142,150)] bg-[rgb(247,247,249)] border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  if (!player) return null;

  return (
    <div className="space-y-6">
      {/* My Applications */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[rgb(29,29,31)]">My Tryout Applications</h3>
              <p className="text-sm text-[rgb(134,142,150)]">Track your application status</p>
            </div>
          </div>
          <Link
            to="/tryouts"
            className="text-[rgb(0,113,227)] hover:text-blue-600 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[rgb(0,113,227)] animate-spin" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200 hover:border-[rgb(0,113,227)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-[rgb(29,29,31)] font-semibold mb-1">
                      {app.tryouts?.title || 'Tryout'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[rgb(134,142,150)] mb-2">
                      {app.tryouts?.organizations?.name && (
                        <span>{app.tryouts.organizations.name}</span>
                      )}
                      {app.tryouts?.date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(app.tryouts.date)}</span>
                        </div>
                      )}
                      {app.tryouts?.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{app.tryouts.location}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[rgb(134,142,150)]">
                      Applied {formatDate(app.applied_at)}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span className="capitalize">{app.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-[rgb(134,142,150)] mx-auto mb-3" />
            <p className="text-[rgb(134,142,150)] mb-4">No applications yet</p>
            <Link
              to="/tryouts"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
            >
              <span>Browse Tryouts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Tryouts */}
      {upcomingTryouts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(0,113,227)] to-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[rgb(29,29,31)]">Upcoming Tryouts</h3>
              <p className="text-sm text-[rgb(134,142,150)]">Apply before spots fill up</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingTryouts.map((tryout) => (
              <Link
                key={tryout.id}
                to={`/tryouts/${tryout.id}`}
                className="block bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200 hover:border-[rgb(0,113,227)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-[rgb(29,29,31)] font-semibold mb-1 group-hover:text-[rgb(0,113,227)] transition-colors">
                      {tryout.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[rgb(134,142,150)] mb-2">
                      {tryout.organizations?.name && (
                        <span>{tryout.organizations.name}</span>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tryout.date)}</span>
                      </div>
                      {tryout.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{tryout.location}</span>
                        </div>
                      )}
                    </div>
                    {tryout.registration_deadline && (
                      <p className="text-xs text-yellow-600">
                        Register by {formatDate(tryout.registration_deadline)}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-[rgb(134,142,150)] group-hover:text-[rgb(0,113,227)] transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/tryouts"
            className="mt-4 block text-center py-2 text-[rgb(0,113,227)] hover:text-blue-600 text-sm font-medium"
          >
            View All Tryouts
          </Link>
        </div>
      )}
    </div>
  );
}
