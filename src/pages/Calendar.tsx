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
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleSelect,
  AppleInput,
  AppleTextarea,
  AppleBadge,
  AppleStatCard,
  AppleEmptyState,
  AppleModal,
} from '@/components/apple';

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
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const { organization, player } = useAuth();

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
    if (player) {
      loadPlayerEvents();
    } else {
      loadEvents();
      if (organization) {
        loadTeams();
      }
    }
  }, [organization, player, currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Fetch regular events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*, teams(name)')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch tryouts and convert them to calendar events format
      const { data: tryoutsData, error: tryoutsError } = await supabase
        .from('tryouts')
        .select('*, teams(name)')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (tryoutsError) throw tryoutsError;

      // Convert tryouts to calendar event format
      const tryoutsAsEvents = (tryoutsData || []).map((tryout) => ({
        id: tryout.id,
        team_id: tryout.team_id,
        title: tryout.title,
        description: tryout.description,
        event_type: 'tryout',
        date: tryout.date,
        start_time: tryout.start_time,
        end_time: tryout.end_time,
        location: tryout.location,
        created_at: tryout.created_at,
        updated_at: tryout.updated_at,
        teams: tryout.teams,
      }));

      // Combine events and tryouts
      const allEvents = [...(eventsData || []), ...tryoutsAsEvents];

      // Sort by date
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(allEvents as EventWithTeam[]);
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

  const loadPlayerEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      if (!player?.id) return;

      // Get teams the player is a member of
      const { data: memberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('player_id', player.id)
        .eq('status', 'active');

      if (membershipsError) throw membershipsError;

      const teamIds = memberships?.map(m => m.team_id) || [];

      // Fetch events from player's teams
      const { data: eventsData, error: eventsError } = teamIds.length > 0
        ? await supabase
            .from('events')
            .select('*, teams(name)')
            .in('team_id', teamIds)
            .gte('date', startOfMonth.toISOString().split('T')[0])
            .lte('date', endOfMonth.toISOString().split('T')[0])
            .order('date', { ascending: true })
        : { data: [], error: null };

      if (eventsError) throw eventsError;

      // Fetch tryouts player has applied to
      const { data: applications, error: appsError } = await supabase
        .from('tryout_applications')
        .select('tryout_id')
        .eq('player_id', player.id);

      if (appsError) throw appsError;

      const tryoutIds = applications?.map(a => a.tryout_id) || [];

      // Fetch applied tryouts as events
      const { data: appliedTryouts, error: tryoutsError } = tryoutIds.length > 0
        ? await supabase
            .from('tryouts')
            .select('*, teams(name)')
            .in('id', tryoutIds)
            .gte('date', startOfMonth.toISOString().split('T')[0])
            .lte('date', endOfMonth.toISOString().split('T')[0])
            .order('date', { ascending: true })
        : { data: [], error: null };

      if (tryoutsError) throw tryoutsError;

      // Fetch tournaments player has registered for as guest
      const { data: guestRegs, error: guestError } = await supabase
        .from('guest_players')
        .select(`
          tournament_id,
          tournaments:tournament_id (
            id,
            title,
            start_date,
            end_date,
            location
          )
        `)
        .eq('player_id', player.id)
        .in('status', ['available', 'invited', 'accepted']);

      if (guestError) throw guestError;

      // Convert tryouts to calendar event format
      const tryoutsAsEvents = (appliedTryouts || []).map((tryout) => ({
        id: tryout.id,
        team_id: tryout.team_id,
        title: tryout.title,
        description: tryout.description,
        event_type: 'tryout',
        date: tryout.date,
        start_time: tryout.start_time,
        end_time: tryout.end_time,
        location: tryout.location,
        created_at: tryout.created_at,
        updated_at: tryout.updated_at,
        teams: tryout.teams || { name: 'Tryout' },
      }));

      // Convert tournaments to calendar events
      const tournamentsAsEvents = (guestRegs || [])
        .filter(reg => reg.tournaments)
        .map((reg: any) => ({
          id: reg.tournament_id,
          team_id: null,
          title: reg.tournaments.title,
          description: 'Tournament (Guest Player)',
          event_type: 'other',
          date: reg.tournaments.start_date,
          start_time: '09:00',
          end_time: null,
          location: reg.tournaments.location,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          teams: { name: 'Tournament' },
        }));

      // Combine all events
      const allEvents = [
        ...(eventsData || []),
        ...tryoutsAsEvents,
        ...tournamentsAsEvents,
      ];

      // Sort by date
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(allEvents as EventWithTeam[]);
    } catch (error) {
      console.error('Error loading player events:', error);
    } finally {
      setLoading(false);
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
        return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'practice':
        return 'bg-green-50 border-green-300 text-green-700';
      case 'tryout':
        return 'bg-cyan-50 border-cyan-300 text-cyan-700';
      case 'meeting':
        return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700';
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

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowDayModal(true);
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <AppleHeading level={1} size="section">
              Calendar
            </AppleHeading>
            <p className="text-lg text-[rgb(134,142,150)] mt-2">Manage your schedule and events</p>
          </div>
          {organization && (
            <AppleButton
              variant="gradient"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Add Event
            </AppleButton>
          )}
        </div>

        <AppleCard variant="default" padding="lg" className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <AppleButton
                variant="outline"
                size="sm"
                onClick={previousMonth}
                leftIcon={<ChevronLeft className="w-5 h-5" />}
              />
              <h2 className="text-2xl font-bold text-[rgb(29,29,31)]">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <AppleButton
                variant="outline"
                size="sm"
                onClick={nextMonth}
                leftIcon={<ChevronRight className="w-5 h-5" />}
              />
            </div>
            <div className="flex space-x-2">
              <AppleButton
                variant={view === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </AppleButton>
              <AppleButton
                variant={view === 'agenda' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('agenda')}
              >
                Agenda
              </AppleButton>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
            </div>
          ) : view === 'month' ? (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-[rgb(134,142,150)] py-2"
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
                      onClick={() => handleDayClick(day)}
                      className={`min-h-24 p-2 rounded-lg border-[1.5px] ${
                        day
                          ? 'bg-white border-slate-200 hover:border-[rgb(0,113,227)] cursor-pointer'
                          : 'bg-transparent border-transparent'
                      } ${isToday ? 'ring-2 ring-[rgb(0,113,227)]' : ''} transition-all`}
                    >
                      {day && (
                        <>
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              isToday ? 'text-[rgb(0,113,227)]' : 'text-[rgb(29,29,31)]'
                            }`}
                          >
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded border-[1.5px] ${getEventColor(
                                  event.event_type
                                )} truncate`}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-[rgb(134,142,150)] px-2">
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
                <AppleEmptyState
                  icon={<CalendarIcon className="w-16 h-16" />}
                  title="No events this month"
                  description="Create your first event to get started"
                  iconColor="blue"
                />
              ) : (
                events.map((event) => (
                  <AppleCard key={event.id} variant="default" padding="md" hover>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <AppleBadge
                            variant={
                              event.event_type === 'game' ? 'primary' :
                              event.event_type === 'practice' ? 'success' :
                              event.event_type === 'tryout' ? 'info' :
                              event.event_type === 'meeting' ? 'warning' :
                              'default'
                            }
                            size="sm"
                          >
                            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                          </AppleBadge>
                          <span className="text-sm text-[rgb(134,142,150)]">{formatDate(event.date)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-[rgb(29,29,31)] mb-2">{event.title}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-[rgb(134,142,150)]">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{event.teams.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AppleCard>
                ))
              )}
            </div>
          )}
        </AppleCard>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AppleStatCard
            label="Games"
            value={events.filter((e) => e.event_type === 'game').length}
            icon={<div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
            iconColor="blue"
            animateOnView
          />
          <AppleStatCard
            label="Practices"
            value={events.filter((e) => e.event_type === 'practice').length}
            icon={<div className="w-3 h-3 bg-green-500 rounded-full"></div>}
            iconColor="green"
            animateOnView
            delay={0.1}
          />
          <AppleStatCard
            label="Tryouts"
            value={events.filter((e) => e.event_type === 'tryout').length}
            icon={<div className="w-3 h-3 bg-cyan-500 rounded-full"></div>}
            iconColor="cyan"
            animateOnView
            delay={0.2}
          />
          <AppleStatCard
            label="Meetings"
            value={events.filter((e) => e.event_type === 'meeting').length}
            icon={<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>}
            iconColor="yellow"
            animateOnView
            delay={0.3}
          />
        </div>
      </div>

      {/* Create Event Modal */}
      <AppleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Event"
        size="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-[1.5px] border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <AppleSelect
            label="Team"
            value={formData.team_id}
            onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            options={[
              { value: '', label: 'Select a team' },
              ...teams.map((team) => ({ value: team.id, label: `${team.name} - ${team.sport}` })),
            ]}
            fullWidth
            required
          />

          <AppleInput
            type="text"
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Practice Session, Game vs Eagles"
            fullWidth
            required
          />

          <AppleSelect
            label="Event Type"
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            options={eventTypes.map((type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
            }))}
            fullWidth
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppleInput
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
            />
            <AppleInput
              type="time"
              label="Start Time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              fullWidth
              required
            />
            <AppleInput
              type="time"
              label="End Time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              fullWidth
            />
          </div>

          <AppleInput
            type="text"
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Central Park Field 2"
            fullWidth
          />

          <AppleTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details about the event..."
            rows={3}
            fullWidth
          />

          <div className="flex gap-4 pt-4">
            <AppleButton
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </AppleButton>
            <AppleButton
              type="submit"
              variant="gradient"
              disabled={submitLoading}
              leftIcon={submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarIcon className="w-5 h-5" />}
              fullWidth
            >
              {submitLoading ? 'Creating...' : 'Create Event'}
            </AppleButton>
          </div>
        </form>
      </AppleModal>

      {/* Day Events Modal */}
      <AppleModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        title={selectedDate ? selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }) : ''}
        size="lg"
      >
        {selectedDate && (
          <>
            <p className="text-[rgb(134,142,150)] text-sm mb-6">
              {getEventsForDate(selectedDate).length} event
              {getEventsForDate(selectedDate).length !== 1 ? 's' : ''}
            </p>

            {getEventsForDate(selectedDate).length === 0 ? (
              <AppleEmptyState
                icon={<CalendarIcon className="w-16 h-16" />}
                title="No events scheduled"
                description="No events scheduled for this day"
                iconColor="blue"
              />
            ) : (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className={`border-[1.5px] rounded-lg p-5 ${getEventColor(event.event_type)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <AppleBadge
                            variant={
                              event.event_type === 'game' ? 'primary' :
                              event.event_type === 'practice' ? 'success' :
                              event.event_type === 'tryout' ? 'info' :
                              event.event_type === 'meeting' ? 'warning' :
                              'default'
                            }
                            size="sm"
                          >
                            {event.event_type.toUpperCase()}
                          </AppleBadge>
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(29,29,31)] mb-1">{event.title}</h3>
                        <p className="text-sm text-[rgb(86,88,105)]">{event.teams.name}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-[rgb(86,88,105)]">
                        <Clock className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </p>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center space-x-3 text-[rgb(86,88,105)]">
                          <MapPin className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{event.location}</p>
                          </div>
                        </div>
                      )}

                      {event.description && (
                        <div className="pt-3 border-t border-[rgb(0,0,0)]/10">
                          <p className="text-sm text-[rgb(86,88,105)]">{event.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </AppleModal>
    </div>
  );
}
