import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleBadge,
  AppleEmptyState,
  AppleAvatar,
} from '@/components/apple';
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Video,
  Mail,
} from 'lucide-react';

interface Booking {
  id: string;
  session_id: string;
  player_id: string;
  status: string;
  requested_date: string | null;
  requested_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  player_message: string | null;
  trainer_response: string | null;
  additional_participants: number;
  total_amount: number | null;
  created_at: string;
  training_sessions: {
    title: string;
    sport: string;
    session_type: string;
    duration_minutes: number;
  };
  player_profiles: {
    user_id: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

export default function SessionBookings() {
  const { trainer } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [trainerResponse, setTrainerResponse] = useState('');

  useEffect(() => {
    if (trainer) {
      loadBookings();
    }
  }, [trainer]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      // Get all session IDs for this trainer
      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('id')
        .eq('trainer_id', trainer?.id);

      const sessionIds = sessions?.map(s => s.id) || [];

      if (sessionIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Get bookings for these sessions
      const { data, error } = await supabase
        .from('session_bookings')
        .select(`
          *,
          training_sessions (
            title,
            sport,
            session_type,
            duration_minutes
          ),
          player_profiles (
            user_id,
            profiles (
              full_name,
              email
            )
          )
        `)
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      handleError(err, 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled', response?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
      };

      if (response) {
        updateData.trainer_response = response;
      }

      // If confirming, copy requested date/time to confirmed
      const booking = bookings.find(b => b.id === bookingId);
      if (newStatus === 'confirmed' && booking) {
        updateData.confirmed_date = booking.requested_date;
        updateData.confirmed_time = booking.requested_time;
      }

      const { error } = await supabase
        .from('session_bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(b =>
        b.id === bookingId
          ? { ...b, status: newStatus, trainer_response: response || b.trainer_response }
          : b
      ));

      showToast.success(
        newStatus === 'confirmed' ? 'Booking confirmed' : 'Booking cancelled'
      );
      setRespondingTo(null);
      setTrainerResponse('');
    } catch (err) {
      handleError(err, 'Failed to update booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
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
        <div className="mb-8">
          <AppleHeading level={1} size="section">
            Session Bookings
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter Tabs */}
        {bookings.length > 0 && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'confirmed'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'cancelled'
                  ? 'bg-[rgb(0,113,227)] text-white'
                  : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
              }`}
            >
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <AppleCard key={booking.id} variant="default" padding="lg">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Player Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <AppleAvatar
                      name={booking.player_profiles.profiles.full_name}
                      size="lg"
                      color="blue"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-1">
                        {booking.player_profiles.profiles.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[rgb(134,142,150)] mb-3">
                        <Mail className="w-4 h-4" />
                        {booking.player_profiles.profiles.email}
                      </div>
                      <AppleBadge variant={getStatusColor(booking.status)} size="sm">
                        {booking.status}
                      </AppleBadge>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-3">
                      <Video className="w-5 h-5 text-[rgb(0,113,227)] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-[rgb(29,29,31)] mb-1">
                          {booking.training_sessions.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <AppleBadge variant="primary" size="sm">
                            {booking.training_sessions.sport}
                          </AppleBadge>
                          <AppleBadge variant="info" size="sm">
                            {booking.training_sessions.duration_minutes} min
                          </AppleBadge>
                        </div>
                      </div>
                    </div>

                    {/* Requested Date/Time */}
                    <div className="space-y-2">
                      {booking.requested_date && (
                        <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                          <Calendar className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                          {new Date(booking.requested_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      )}

                      {booking.requested_time && (
                        <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                          <Clock className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                          {booking.requested_time}
                        </div>
                      )}

                      {booking.additional_participants > 0 && (
                        <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                          <User className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                          +{booking.additional_participants} additional participant{booking.additional_participants > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Player Message */}
                    {booking.player_message && (
                      <div className="mt-4 p-3 bg-[rgb(247,247,249)] rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-[rgb(0,113,227)] flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold text-[rgb(29,29,31)]">Player Message:</span>
                        </div>
                        <p className="text-sm text-[rgb(134,142,150)] ml-6">
                          {booking.player_message}
                        </p>
                      </div>
                    )}

                    {/* Trainer Response */}
                    {booking.trainer_response && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-[rgb(0,113,227)] flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold text-[rgb(29,29,31)]">Your Response:</span>
                        </div>
                        <p className="text-sm text-[rgb(134,142,150)] ml-6">
                          {booking.trainer_response}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {respondingTo === booking.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={trainerResponse}
                            onChange={(e) => setTrainerResponse(e.target.value)}
                            placeholder="Add a message (optional)..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-white border-[1.5px] border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] resize-none"
                          />
                          <div className="flex gap-2">
                            <AppleButton
                              variant="primary"
                              size="sm"
                              fullWidth
                              leftIcon={<CheckCircle className="w-4 h-4" />}
                              onClick={() => updateBookingStatus(booking.id, 'confirmed', trainerResponse)}
                            >
                              Confirm
                            </AppleButton>
                            <AppleButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRespondingTo(null);
                                setTrainerResponse('');
                              }}
                            >
                              Cancel
                            </AppleButton>
                          </div>
                        </div>
                      ) : (
                        <>
                          <AppleButton
                            variant="primary"
                            size="sm"
                            fullWidth
                            leftIcon={<CheckCircle className="w-4 h-4" />}
                            onClick={() => setRespondingTo(booking.id)}
                          >
                            Confirm Booking
                          </AppleButton>
                          <AppleButton
                            variant="outline"
                            size="sm"
                            fullWidth
                            leftIcon={<XCircle className="w-4 h-4" />}
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            Decline
                          </AppleButton>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </AppleCard>
            ))}
          </div>
        ) : (
          <AppleEmptyState
            icon={<Calendar className="w-16 h-16" />}
            title={
              filterStatus === 'all'
                ? 'No Bookings Yet'
                : filterStatus === 'pending'
                ? 'No Pending Bookings'
                : filterStatus === 'confirmed'
                ? 'No Confirmed Bookings'
                : 'No Cancelled Bookings'
            }
            description={
              filterStatus === 'all'
                ? 'When players book your sessions, they will appear here.'
                : filterStatus === 'pending'
                ? 'You have no booking requests waiting for your response.'
                : filterStatus === 'confirmed'
                ? 'You have no confirmed bookings at the moment.'
                : 'You have no cancelled bookings.'
            }
            iconColor="blue"
          />
        )}
      </div>
    </div>
  );
}
