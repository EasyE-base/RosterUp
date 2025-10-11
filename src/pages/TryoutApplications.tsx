import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Check,
  X as XIcon,
  Loader2,
  Mail,
  MapPin,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  player_id: string;
  status: string;
  created_at: string;
  players: {
    id: string;
    age: number | null;
    primary_position: string | null;
    primary_sport: string | null;
    location: string | null;
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

interface TryoutDetails {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
  total_spots: number | null;
  description: string | null;
  teams: {
    name: string;
    sport: string;
    age_group: string | null;
  };
}

export default function TryoutApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [tryout, setTryout] = useState<TryoutDetails | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (id && organization) {
      loadTryoutDetails();
      loadApplications();
    }
  }, [id, organization]);

  const loadTryoutDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tryouts')
        .select('*, teams(name, sport, age_group)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTryout(data as TryoutDetails);
    } catch (error) {
      console.error('Error loading tryout:', error);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tryout_applications')
        .select(
          '*, players(id, age, primary_position, primary_sport, location, profiles(full_name, email))'
        )
        .eq('tryout_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data as Application[]) || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId);
    try {
      const { error } = await supabase
        .from('tryout_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      await loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (!tryout) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const acceptedApplications = applications.filter((app) => app.status === 'accepted');
  const rejectedApplications = applications.filter((app) => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/tryouts')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Tryouts</span>
        </button>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tryout Applications</h1>
              <p className="text-xl text-slate-300 mb-4">{tryout.teams.name}</p>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <span className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>{tryout.teams.sport}</span>
                </span>
                {tryout.teams.age_group && (
                  <>
                    <span>•</span>
                    <span>{tryout.teams.age_group}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(tryout.date).toLocaleDateString()}</span>
                </span>
                {tryout.time && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{tryout.time}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Total Applications</span>
              </div>
              <p className="text-2xl font-bold text-white">{applications.length}</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Pending Review</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{pendingApplications.length}</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Check className="w-5 h-5" />
                <span className="text-sm">Accepted</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{acceptedApplications.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
            <p className="text-slate-400">
              Applications will appear here when players register for this tryout
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingApplications.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span>Pending Applications ({pendingApplications.length})</span>
                </h2>
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onUpdate={handleUpdateStatus}
                      updating={updating}
                    />
                  ))}
                </div>
              </div>
            )}

            {acceptedApplications.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Accepted ({acceptedApplications.length})</span>
                </h2>
                <div className="space-y-4">
                  {acceptedApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onUpdate={handleUpdateStatus}
                      updating={updating}
                    />
                  ))}
                </div>
              </div>
            )}

            {rejectedApplications.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <XIcon className="w-5 h-5 text-red-400" />
                  <span>Rejected ({rejectedApplications.length})</span>
                </h2>
                <div className="space-y-4">
                  {rejectedApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onUpdate={handleUpdateStatus}
                      updating={updating}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ApplicationCardProps {
  application: Application;
  onUpdate: (id: string, status: string) => void;
  updating: string | null;
}

function ApplicationCard({ application, onUpdate, updating }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50';
      case 'accepted':
        return 'text-green-400 bg-green-500/10 border-green-500/50';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/50';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/50';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {application.players.profiles.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {application.players.profiles.full_name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{application.players.profiles.email}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              {application.players.primary_sport && (
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Trophy className="w-4 h-4 text-cyan-400" />
                  <span>{application.players.primary_sport}</span>
                </div>
              )}
              {application.players.primary_position && (
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{application.players.primary_position}</span>
                </div>
              )}
              {application.players.age && (
                <div className="text-sm text-slate-300">
                  <span className="font-semibold">{application.players.age}</span> years old
                </div>
              )}
              {application.players.location && (
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{application.players.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-3 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
            </div>

            {application.status === 'pending' && (
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => onUpdate(application.id, 'accepted')}
                  disabled={updating === application.id}
                  className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating === application.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onUpdate(application.id, 'rejected')}
                  disabled={updating === application.id}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XIcon className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
