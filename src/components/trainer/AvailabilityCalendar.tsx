import { useState } from 'react';
import {
  AppleCard,
  AppleHeading,
  AppleButton,
  AppleBadge,
} from '@/components/apple';
import {
  Plus,
  X,
  Clock,
  MapPin,
  Video,
  Home,
  Car,
  Globe,
} from 'lucide-react';

interface TimeSlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_type: 'home' | 'travel' | 'virtual' | 'any';
  notes?: string;
  is_recurring: boolean;
  specific_date?: string;
}

interface AvailabilityCalendarProps {
  slots: TimeSlot[];
  onAddSlot: (dayOfWeek: number) => void;
  onRemoveSlot: (slotId: string) => void;
  onUpdateSlot: (slotId: string, updates: Partial<TimeSlot>) => void;
  editable?: boolean;
}

const DAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const LOCATION_ICONS = {
  home: Home,
  travel: Car,
  virtual: Video,
  any: Globe,
};

const LOCATION_LABELS = {
  home: 'At My Location',
  travel: 'Will Travel',
  virtual: 'Virtual Session',
  any: 'Any Location',
};

const LOCATION_COLORS = {
  home: 'bg-blue-100 text-blue-700',
  travel: 'bg-purple-100 text-purple-700',
  virtual: 'bg-green-100 text-green-700',
  any: 'bg-slate-100 text-slate-700',
};

export default function AvailabilityCalendar({
  slots,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
  editable = false,
}: AvailabilityCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const getSlotsForDay = (dayOfWeek: number) => {
    return slots.filter((slot) => slot.day_of_week === dayOfWeek);
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const toggleDay = (dayOfWeek: number) => {
    setExpandedDay(expandedDay === dayOfWeek ? null : dayOfWeek);
  };

  return (
    <div className="space-y-3">
      {DAYS.map((day) => {
        const daySlots = getSlotsForDay(day.value);
        const isExpanded = expandedDay === day.value;
        const hasSlots = daySlots.length > 0;

        return (
          <AppleCard
            key={day.value}
            variant="default"
            padding="md"
            className="transition-all duration-200"
          >
            {/* Day Header */}
            <div
              className={`flex items-center justify-between ${
                editable ? 'cursor-pointer' : ''
              }`}
              onClick={() => editable && toggleDay(day.value)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[rgb(0,113,227)]/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-[rgb(0,113,227)]">
                    {day.short}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(29,29,31)]">
                    {day.label}
                  </h3>
                  <p className="text-sm text-[rgb(134,142,150)]">
                    {hasSlots ? `${daySlots.length} time slot${daySlots.length > 1 ? 's' : ''}` : 'No availability'}
                  </p>
                </div>
              </div>

              {editable && (
                <AppleButton
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSlot(day.value);
                    setExpandedDay(day.value);
                  }}
                >
                  Add Slot
                </AppleButton>
              )}
            </div>

            {/* Time Slots */}
            {(isExpanded || !editable) && daySlots.length > 0 && (
              <div className="mt-4 space-y-2">
                {daySlots.map((slot, index) => {
                  const LocationIcon = LOCATION_ICONS[slot.location_type];

                  return (
                    <div
                      key={slot.id || index}
                      className="p-3 bg-[rgb(247,247,249)] rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          {/* Time Range */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[rgb(0,113,227)]" />
                            <span className="text-sm font-semibold text-[rgb(29,29,31)]">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>

                          {/* Location Type */}
                          <div className="flex items-center gap-2">
                            <AppleBadge
                              variant="default"
                              size="sm"
                              className={LOCATION_COLORS[slot.location_type]}
                            >
                              <LocationIcon className="w-3 h-3 mr-1 inline" />
                              {LOCATION_LABELS[slot.location_type]}
                            </AppleBadge>
                          </div>

                          {/* Notes */}
                          {slot.notes && (
                            <p className="text-xs text-[rgb(134,142,150)] mt-2">
                              {slot.notes}
                            </p>
                          )}
                        </div>

                        {/* Remove Button (only in edit mode) */}
                        {editable && slot.id && (
                          <button
                            onClick={() => onRemoveSlot(slot.id!)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State for Expanded Day */}
            {isExpanded && daySlots.length === 0 && (
              <div className="mt-4 p-6 bg-[rgb(247,247,249)] rounded-lg text-center">
                <Clock className="w-8 h-8 text-[rgb(134,142,150)] mx-auto mb-2" />
                <p className="text-sm text-[rgb(134,142,150)]">
                  No time slots set for {day.label}
                </p>
                <AppleButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => onAddSlot(day.value)}
                  className="mt-3"
                >
                  Add First Slot
                </AppleButton>
              </div>
            )}
          </AppleCard>
        );
      })}
    </div>
  );
}
