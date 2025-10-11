import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  Users,
  X,
  AlertCircle,
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CalendarEvent, Team } from '../lib/supabase';

interface EventWithTeam extends CalendarEvent {
  teams: {
    name: string;
  };
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const [events, setEvents] = useState<EventWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const { organization } = useAuth();

  const [formData, setFormData] = useState({
    team_id: '',
    title: '',
    event_type: 'practice',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const eventTypes = ['game', 'practice', 'tryout', 'meeting', 'other'];

  useEffect(() => {
    loadEvents();
    if (organization) {
      loadTeams();
    }
  }, [organization, currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      let query = supabase
        .from('events')
        .select('*, teams(name)')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      setEvents((data as EventWithTeam[]) || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      if (!organization) return;

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      if (!organization) {
        throw new Error('You must be an organization to create events');
      }

      const { error: insertError } = await supabase.from('events').insert({
        organization_id: organization.id,
        team_id: formData.team_id,
        title: formData.title,
        event_type: formData.event_type,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        location: formData.location || null,
        description: formData.description || null,
      });

      if (insertError) throw insertError;

      setShowCreateModal(false);
      setFormData({
        team_id: '',
        title: '',
        event_type: 'practice',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        description: '',
      });
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'game':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'practice':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'tryout':
        return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
      case 'meeting':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      default:
        return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-slate-400">Manage your schedule and events</p>
          </div>
          {organization && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
          )}
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={previousMonth}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'month'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('agenda')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'agenda'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Agenda
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : view === 'month' ? (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-slate-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday =
                    day &&
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 rounded-lg border ${
                        day
                          ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 cursor-pointer'
                          : 'bg-transparent border-transparent'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''} transition-all`}
                    >
                      {day && (
                        <>
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              isToday ? 'text-blue-400' : 'text-slate-300'
                            }`}
                          >
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded border ${getEventColor(
                                  event.event_type
                                )} truncate`}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-slate-400 px-2">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-20">
                  <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No events this month</h3>
                  <p className="text-slate-400">Create your first event to get started</p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getEventColor(
                              event.event_type
                            )}`}
                          >
                            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                          </span>
                          <span className="text-sm text-slate-400">{formatDate(event.date)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-slate-400">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-slate-400">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{event.teams.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-white font-semibold">Games</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {events.filter((e) => e.event_type === 'game').length}
            </p>
            <p className="text-sm text-slate-400 mt-1">This month</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="text-white font-semibold">Practices</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {events.filter((e) => e.event_type === 'practice').length}
            </p>
            <p className="text-sm text-slate-400 mt-1">This month</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <h3 className="text-white font-semibold">Tryouts</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {events.filter((e) => e.event_type === 'tryout').length}
            </p>
            <p className="text-sm text-slate-400 mt-1">This month</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h3 className="text-white font-semibold">Meetings</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {events.filter((e) => e.event_type === 'meeting').length}
            </p>
            <p className="text-sm text-slate-400 mt-1">This month</p>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create New Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Team *</label>
                <select
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.sport}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Practice Session, Game vs Eagles"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Central Park Field 2"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the event..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-5 h-5" />
                      <span>Create Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
