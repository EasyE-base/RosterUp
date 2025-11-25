import { useMemo } from 'react';
import InlineEditor from '../InlineEditor';
import ScrollReveal from '../../../animations/ScrollReveal';
import FilterBar from '../FilterBar';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { useFilterState } from '../../../../hooks/useFilterState';

interface EventItem {
  date?: string;
  time?: string;
  opponent?: string;
  location?: string;
  type?: string;
  team_name?: string;
  age_group?: string;
}

interface ScheduleSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    events?: EventItem[];
    cta_text?: string;
    cta_link?: string;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function ScheduleSection({
  content,
  styles = {},
  editMode,
  onUpdate
}: ScheduleSectionProps) {
  const { theme, typography } = useTheme();
  const animations = useThemeAnimations();

  // Defensive coding: ensure events array exists
  const events: EventItem[] = Array.isArray(content.events) ? content.events : [];
  const safeTitle = typeof content.title === 'string' ? content.title : 'Upcoming Games & Events';
  const safeSubtitle = typeof content.subtitle === 'string' ? content.subtitle : 'Check out our schedule';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateEvent = (index: number, field: keyof EventItem, value: string) => {
    const newEvents = [...events];
    // Ensure the event object exists before updating
    newEvents[index] = { ...(newEvents[index] ?? {}), [field]: value };
    updateField('events', newEvents);
  };

  const addEvent = () => {
    const newEvents = [...events, {
      date: '',
      time: '',
      opponent: '',
      location: '',
      type: 'Game',
      team_name: '',
      age_group: ''
    }];
    updateField('events', newEvents);
  };

  const deleteEvent = (index: number) => {
    const newEvents = events.filter((_, i) => i !== index);
    updateField('events', newEvents);
  };

  const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');

  // Extract unique values for filter options
  const filterDefinitions = useMemo(() => {
    const teams = Array.from(new Set(events.map(e => e.team_name).filter(Boolean)));
    const ageGroups = Array.from(new Set(events.map(e => e.age_group).filter(Boolean)));
    const eventTypes = Array.from(new Set(events.map(e => e.type).filter(Boolean)));

    return [
      {
        key: 'team',
        label: 'Team',
        options: teams.map(team => ({ value: team!, label: team! }))
      },
      {
        key: 'ageGroup',
        label: 'Age Group',
        options: ageGroups.map(group => ({ value: group!, label: group! }))
      },
      {
        key: 'type',
        label: 'Event Type',
        options: eventTypes.map(type => ({ value: type!, label: type! }))
      }
    ].filter(f => f.options.length > 0); // Only show filters with options
  }, [events]);

  // Initialize filter state (URL sync enabled for public view, disabled in edit mode)
  const {
    activeFilters,
    toggleFilter,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
    getActiveFilterBadges,
    filterItems,
  } = useFilterState(filterDefinitions, { syncWithUrl: !editMode });

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return filterItems(events, (event, filterKey) => {
      if (filterKey === 'team') return event.team_name;
      if (filterKey === 'ageGroup') return event.age_group;
      if (filterKey === 'type') return event.type;
      return undefined;
    });
  }, [events, filterItems]);

  return (
    <div className={theme.spacing.sectionPadding} style={{ backgroundColor: theme.colors.background, ...styles }}>
      <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1} duration={animations.duration / 1000}>
          <div className="text-center mb-12 space-y-3">
            <InlineEditor
              value={safeTitle}
              onChange={(val) => updateField('title', val)}
              type="heading"
              editMode={editMode}
              className={headingClasses}
              style={{ color: theme.colors.text }}
            />
            <InlineEditor
              value={safeSubtitle}
              onChange={(val) => updateField('subtitle', val)}
              type="text"
              editMode={editMode}
              className={subheadingClasses}
              style={{ color: theme.colors.textMuted }}
            />
          </div>
        </ScrollReveal>

        {/* FilterBar - show only if there are events and filters available */}
        {events.length > 0 && filterDefinitions.length > 0 && !editMode && (
          <FilterBar
            filters={filterDefinitions}
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            onClearFilter={clearFilter}
            onClearAll={clearAllFilters}
            activeFilterCount={activeFilterCount}
            getActiveFilterBadges={getActiveFilterBadges}
            resultCount={filteredEvents.length}
            totalCount={events.length}
          />
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: theme.colors.backgroundAlt, border: `2px solid ${theme.colors.border}` }}>
              <p className="mb-4" style={{ color: theme.colors.textMuted }}>
                {editMode ? 'No events scheduled yet. Add your first game below!' : 'No events scheduled yet.'}
              </p>
              {editMode && (
                <button
                  type="button"
                  onClick={addEvent}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.textInverse }}
                >
                  + Add First Event
                </button>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* No Results State (when filters are active but no matches) */}
        {events.length > 0 && filteredEvents.length === 0 && !editMode && (
          <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: theme.colors.backgroundAlt, border: `2px solid ${theme.colors.border}` }}>
              <p className="mb-4" style={{ color: theme.colors.textMuted }}>
                No events match your selected filters.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: theme.colors.primary, color: theme.colors.textInverse }}
              >
                Clear Filters
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Events Cards */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(editMode ? events : filteredEvents).map((event, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={0.2 + index * 0.1}
                duration={animations.duration / 1000}
              >
                <motion.div
                  className="rounded-xl p-6 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primaryDark}15, ${theme.colors.primary}10)`,
                    border: `2px solid ${theme.colors.border}`,
                  }}
                  whileHover={{ y: editMode ? 0 : -8, boxShadow: `0 20px 40px ${theme.colors.primary}20` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Type Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color: theme.colors.textInverse }}>
                      <Trophy className="w-3 h-3" />
                      <InlineEditor
                        value={event.type ?? 'Game'}
                        onChange={(val) => updateEvent(index, 'type', val)}
                        editMode={editMode}
                        className="inline"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-8">
                    {/* Date & Time */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        <InlineEditor
                          value={event.date ?? ''}
                          onChange={(val) => updateEvent(index, 'date', val)}
                          editMode={editMode}
                          className="font-semibold"
                          style={{ color: theme.colors.text }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        <InlineEditor
                          value={event.time ?? ''}
                          onChange={(val) => updateEvent(index, 'time', val)}
                          editMode={editMode}
                          style={{ color: theme.colors.textMuted }}
                        />
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className="py-3 border-t border-b" style={{ borderColor: theme.colors.border }}>
                      <InlineEditor
                        value={event.opponent ?? ''}
                        onChange={(val) => updateEvent(index, 'opponent', val)}
                        editMode={editMode}
                        className="text-xl font-bold"
                        style={{ color: theme.colors.primary }}
                      />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: theme.colors.accent }} />
                      <InlineEditor
                        value={event.location ?? ''}
                        onChange={(val) => updateEvent(index, 'location', val)}
                        editMode={editMode}
                        className="text-sm"
                        style={{ color: theme.colors.textMuted }}
                      />
                    </div>

                    {/* Team & Age Group (Edit Mode Only) */}
                    {editMode && (
                      <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.colors.border }}>
                        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.colors.textMuted }}>
                          Filter Fields
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs" style={{ color: theme.colors.textMuted }}>Team</label>
                            <InlineEditor
                              value={event.team_name ?? ''}
                              onChange={(val) => updateEvent(index, 'team_name', val)}
                              editMode={editMode}
                              className="text-sm"
                              style={{ color: theme.colors.text }}
                            />
                          </div>
                          <div>
                            <label className="text-xs" style={{ color: theme.colors.textMuted }}>Age Group</label>
                            <InlineEditor
                              value={event.age_group ?? ''}
                              onChange={(val) => updateEvent(index, 'age_group', val)}
                              editMode={editMode}
                              className="text-sm"
                              style={{ color: theme.colors.text }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Button (Edit Mode) */}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => deleteEvent(index)}
                        className="w-full mt-4 px-4 py-2 text-xs rounded-lg transition-colors"
                        style={{ backgroundColor: `${theme.colors.error}20`, color: theme.colors.error }}
                      >
                        Remove Event
                      </button>
                    )}
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Add Event Button */}
        {editMode && events.length > 0 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={addEvent}
              className="px-8 py-4 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: theme.colors.primary, color: theme.colors.textInverse }}
            >
              + Add Another Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
