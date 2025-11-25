import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleInput,
} from '@/components/apple';
import {
  Loader2,
  Save,
  Calendar,
  Clock,
  MapPin,
  X,
  Plus,
  Home,
  Car,
  Video,
  Globe,
} from 'lucide-react';
import AvailabilityCalendar from '../../components/trainer/AvailabilityCalendar';

interface TimeSlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_type: 'home' | 'travel' | 'virtual' | 'any';
  notes?: string;
  is_recurring: boolean;
  specific_date?: string;
  is_active: boolean;
}

export default function TrainerAvailability() {
  const { trainer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    location_type: 'any',
    notes: '',
    is_recurring: true,
    is_active: true,
  });

  useEffect(() => {
    if (trainer) {
      loadAvailability();
    }
  }, [trainer]);

  const loadAvailability = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainer?.id)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      handleError(err, 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = (dayOfWeek: number) => {
    setNewSlot({
      ...newSlot,
      day_of_week: dayOfWeek,
    });
    setShowAddModal(true);
  };

  const handleSaveNewSlot = async () => {
    try {
      // Validation
      if (newSlot.start_time >= newSlot.end_time) {
        showToast.error('End time must be after start time');
        return;
      }

      setSaving(true);

      const { data, error } = await supabase
        .from('trainer_availability')
        .insert([
          {
            trainer_id: trainer?.id,
            day_of_week: newSlot.day_of_week,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            location_type: newSlot.location_type,
            notes: newSlot.notes || null,
            is_recurring: newSlot.is_recurring,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSlots([...slots, data]);
      showToast.success('Time slot added successfully');
      setShowAddModal(false);

      // Reset form
      setNewSlot({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00',
        location_type: 'any',
        notes: '',
        is_recurring: true,
        is_active: true,
      });
    } catch (err) {
      handleError(err, 'Failed to add time slot');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('trainer_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      setSlots(slots.filter((slot) => slot.id !== slotId));
      showToast.success('Time slot removed');
    } catch (err) {
      handleError(err, 'Failed to remove time slot');
    }
  };

  const handleUpdateSlot = async (slotId: string, updates: Partial<TimeSlot>) => {
    try {
      const { error } = await supabase
        .from('trainer_availability')
        .update(updates)
        .eq('id', slotId);

      if (error) throw error;

      setSlots(
        slots.map((slot) =>
          slot.id === slotId ? { ...slot, ...updates } : slot
        )
      );
      showToast.success('Time slot updated');
    } catch (err) {
      handleError(err, 'Failed to update time slot');
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <AppleHeading level={1} size="section">
            Manage Availability
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            Set your available time slots for training sessions
          </p>
        </div>

        {/* Stats Card */}
        <AppleCard variant="default" padding="lg" className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[rgb(0,113,227)] mb-1">
                {slots.length}
              </div>
              <div className="text-sm text-[rgb(134,142,150)]">Total Slots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {new Set(slots.map((s) => s.day_of_week)).size}
              </div>
              <div className="text-sm text-[rgb(134,142,150)]">Days Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {slots.filter((s) => s.location_type === 'virtual').length}
              </div>
              <div className="text-sm text-[rgb(134,142,150)]">Virtual Slots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-1">
                {slots.filter((s) => s.location_type === 'travel').length}
              </div>
              <div className="text-sm text-[rgb(134,142,150)]">Travel Slots</div>
            </div>
          </div>
        </AppleCard>

        {/* Availability Calendar */}
        <AvailabilityCalendar
          slots={slots}
          onAddSlot={handleAddSlot}
          onRemoveSlot={handleRemoveSlot}
          onUpdateSlot={handleUpdateSlot}
          editable={true}
        />

        {/* Add Slot Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <AppleCard
              variant="default"
              padding="lg"
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <AppleHeading level={2} size="subsection">
                  Add Time Slot
                </AppleHeading>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Start Time
                  </label>
                  <AppleInput
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, start_time: e.target.value })
                    }
                    leftIcon={<Clock className="w-4 h-4" />}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    End Time
                  </label>
                  <AppleInput
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, end_time: e.target.value })
                    }
                    leftIcon={<Clock className="w-4 h-4" />}
                  />
                </div>

                {/* Location Type */}
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-3">
                    Location Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'home' as const, label: 'At My Location', icon: Home },
                      { value: 'travel' as const, label: 'Will Travel', icon: Car },
                      { value: 'virtual' as const, label: 'Virtual', icon: Video },
                      { value: 'any' as const, label: 'Any Location', icon: Globe },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            setNewSlot({ ...newSlot, location_type: option.value })
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            newSlot.location_type === option.value
                              ? 'border-[rgb(0,113,227)] bg-[rgb(0,113,227)]/5'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 mx-auto mb-1 ${
                              newSlot.location_type === option.value
                                ? 'text-[rgb(0,113,227)]'
                                : 'text-[rgb(134,142,150)]'
                            }`}
                          />
                          <div
                            className={`text-xs font-semibold ${
                              newSlot.location_type === option.value
                                ? 'text-[rgb(0,113,227)]'
                                : 'text-[rgb(134,142,150)]'
                            }`}
                          >
                            {option.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newSlot.notes}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, notes: e.target.value })
                    }
                    placeholder="Add any additional details..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white border-[1.5px] border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <AppleButton
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSaveNewSlot}
                  loading={saving}
                >
                  {saving ? 'Saving...' : 'Save Time Slot'}
                </AppleButton>
                <AppleButton
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </AppleButton>
              </div>
            </AppleCard>
          </div>
        )}
      </div>
    </div>
  );
}
