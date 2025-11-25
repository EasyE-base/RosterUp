import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleBadge,
  AppleEmptyState,
} from '@/components/apple';
import {
  Plus,
  Video,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  sport: string;
  session_type: string;
  banner_image_url: string | null;
  promo_video_url: string | null;
  duration_minutes: number;
  max_participants: number | null;
  skill_level: string | null;
  price_per_person: number | null;
  price_per_session: number | null;
  location_type: string;
  is_active: boolean;
  available_spots: number | null;
  total_bookings: number;
  created_at: string;
}

export default function TrainerSessions() {
  const navigate = useNavigate();
  const { trainer } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (trainer) {
      loadSessions();
    }
  }, [trainer]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('trainer_id', trainer?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      handleError(err, 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .update({ is_active: !currentStatus })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.map(s =>
        s.id === sessionId ? { ...s, is_active: !currentStatus } : s
      ));

      showToast.success(
        !currentStatus ? 'Session activated' : 'Session deactivated'
      );
    } catch (err) {
      handleError(err, 'Failed to update session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== sessionId));
      showToast.success('Session deleted successfully');
    } catch (err) {
      handleError(err, 'Failed to delete session');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterActive === 'active') return session.is_active;
    if (filterActive === 'inactive') return !session.is_active;
    return true;
  });

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      one_on_one: '1-on-1',
      small_group: 'Small Group',
      clinic: 'Clinic',
      team_practice: 'Team Practice',
    };
    return labels[type] || type;
  };

  const getLocationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fixed: 'Fixed Location',
      travel: 'Travel to Client',
      virtual: 'Virtual/Online',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(247,247,249)]">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <AppleHeading level={1} size="section">
              My Training Sessions
            </AppleHeading>
            <p className="text-lg text-[rgb(134,142,150)] mt-2">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Link to="/sessions/create">
            <AppleButton variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
              Create Session
            </AppleButton>
          </Link>
        </div>

        {/* Filter Tabs */}
        {sessions.length > 0 && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterActive === 'all'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterActive === 'active'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              Active ({sessions.filter(s => s.is_active).length})
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterActive === 'inactive'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              Inactive ({sessions.filter(s => !s.is_active).length})
            </button>
          </div>
        )}

        {/* Sessions Grid */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <AppleCard key={session.id} variant="default" padding="none" hover>
                {/* Banner Image or Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-t-xl overflow-hidden">
                  {session.banner_image_url ? (
                    <img
                      src={session.banner_image_url}
                      alt={session.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-16 h-16 text-white/30" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <AppleBadge
                      variant={session.is_active ? 'success' : 'default'}
                      size="sm"
                    >
                      {session.is_active ? 'Active' : 'Inactive'}
                    </AppleBadge>
                  </div>

                  {/* Video Indicator */}
                  {session.promo_video_url && (
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title & Sport */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-2 line-clamp-2">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <AppleBadge variant="primary" size="sm">
                        {session.sport}
                      </AppleBadge>
                      <AppleBadge variant="info" size="sm">
                        {getSessionTypeLabel(session.session_type)}
                      </AppleBadge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                      <Clock className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                      {session.duration_minutes} minutes
                    </div>

                    {session.max_participants && (
                      <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                        <Users className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                        Up to {session.max_participants} participants
                      </div>
                    )}

                    <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                      <MapPin className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                      {getLocationTypeLabel(session.location_type)}
                    </div>

                    {(session.price_per_person || session.price_per_session) && (
                      <div className="flex items-center text-sm text-[rgb(29,29,31)] font-semibold">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        {session.price_per_person && `$${session.price_per_person}/person`}
                        {session.price_per_session && `$${session.price_per_session}/session`}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <div className="text-sm">
                      <span className="text-[rgb(134,142,150)]">Bookings: </span>
                      <span className="font-semibold text-[rgb(29,29,31)]">
                        {session.total_bookings}
                      </span>
                    </div>
                    {session.available_spots !== null && (
                      <div className="text-sm">
                        <span className="text-[rgb(134,142,150)]">Spots: </span>
                        <span className="font-semibold text-[rgb(29,29,31)]">
                          {session.available_spots}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => toggleActiveStatus(session.id, session.is_active)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-[rgb(247,247,249)] hover:bg-slate-200 transition-colors"
                      title={session.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {session.is_active ? (
                        <EyeOff className="w-4 h-4 text-[rgb(134,142,150)]" />
                      ) : (
                        <Eye className="w-4 h-4 text-[rgb(134,142,150)]" />
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/sessions/${session.id}/edit`)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-[rgb(247,247,249)] hover:bg-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-[rgb(0,113,227)]" />
                    </button>

                    <button
                      onClick={() => deleteSession(session.id)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-[rgb(247,247,249)] hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </AppleCard>
            ))}
          </div>
        ) : (
          <AppleEmptyState
            icon={<Video className="w-16 h-16" />}
            title={
              filterActive === 'all'
                ? 'No Sessions Created'
                : filterActive === 'active'
                ? 'No Active Sessions'
                : 'No Inactive Sessions'
            }
            description={
              filterActive === 'all'
                ? 'Create your first training session to start accepting bookings from athletes.'
                : filterActive === 'active'
                ? 'You have no active training sessions at the moment.'
                : 'You have no inactive training sessions.'
            }
            iconColor="blue"
            action={
              filterActive === 'all'
                ? {
                    label: 'Create Session',
                    onClick: () => navigate('/sessions/create'),
                    icon: <Plus className="w-5 h-5" />,
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
