import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Trophy,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TRAVEL_SPORTS, AGE_GROUPS, getPositionsBySport, US_STATES } from '../../constants/playerConstants';
import { CLASSIFICATION_LEVELS } from '../../constants/classifications';
import PositionTagSelector from '../../components/player/PositionTagSelector';
import toast from 'react-hot-toast';

export default function PlayerProfileCreate() {
  const { user, organization, player, trainer, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user already has a role
  useEffect(() => {
    if (!user) return;

    if (organization) {
      toast.error("You already have an Organization account");
      navigate('/dashboard');
    } else if (player) {
      toast.error("You already have a Player account");
      navigate('/dashboard');
    } else if (trainer) {
      toast.error("You already have a Trainer account");
      navigate('/dashboard');
    }
  }, [user, organization, player, trainer, navigate]);

  const [formData, setFormData] = useState({
    sport: '',
    age_group: '',
    classification: '',
    positions: [] as string[], // Changed to array
    bio: '',
    location_city: '',
    location_state: '',
    photo_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to create a player profile');
      }

      console.log('Submitting profile for user:', user.id);

      // Upsert player profile (create if doesn't exist, update if it does)
      const { data, error: insertError } = await supabase
        .from('player_profiles')
        .upsert({
          user_id: user.id,
          sport: formData.sport,
          age_group: formData.age_group || null,
          classification: formData.classification || null,
          position: formData.positions.length > 0 ? formData.positions : null, // Save as array
          bio: formData.bio || null,
          location_city: formData.location_city || null,
          location_state: formData.location_state || null,
          photo_url: formData.photo_url || null,
          is_active: true,
          is_visible_in_search: true,
          recruiting_status: 'open',
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Profile upsert successful:', data);

      // Refresh user data to update AuthContext with new player profile
      console.log('Calling refreshUserData...');
      await refreshUserData();
      console.log('refreshUserData completed');

      setSuccess(true);

      // Wait a moment for React to update state before navigating
      console.log('Waiting for state update...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[rgb(29,29,31)] mb-2">Create Your Player Profile</h1>
          <p className="text-[rgb(134,142,150)]">
            Get discovered by top organizations looking for talent in your sport
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">
              Player profile created successfully! Redirecting to your profile...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-[rgb(0,113,227)]" />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Primary Sport *
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) =>
                    setFormData({ ...formData, sport: e.target.value, positions: [] })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  required
                >
                  <option value="">Select your sport</option>
                  {TRAVEL_SPORTS.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Age Group
                  </label>
                  <select
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  >
                    <option value="">Select age group</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Classification
                  </label>
                  <select
                    value={formData.classification}
                    onChange={(e) =>
                      setFormData({ ...formData, classification: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  >
                    <option value="">Select classification</option>
                    {CLASSIFICATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[rgb(134,142,150)]">
                    Your team's competitive level (A=Elite, B=Competitive, C=Developmental)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Positions (Select Multiple)
                </label>
                <PositionTagSelector
                  sport={formData.sport}
                  selectedPositions={formData.positions}
                  availablePositions={getPositionsBySport(formData.sport)}
                  onChange={(positions) => setFormData({ ...formData, positions })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-[rgb(0,113,227)]" />
              Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">City</label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) =>
                    setFormData({ ...formData, location_city: e.target.value })
                  }
                  placeholder="e.g., San Diego"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">State</label>
                <select
                  value={formData.location_state}
                  onChange={(e) =>
                    setFormData({ ...formData, location_state: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[rgb(0,113,227)]" />
              About You
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell organizations about your experience, achievements, and what you're looking for..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                />
                <p className="mt-2 text-xs text-[rgb(134,142,150)]">
                  {formData.bio.length} characters (min 50 recommended for better visibility)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                />
                <p className="mt-2 text-xs text-[rgb(134,142,150)]">
                  Add a professional action photo. Use a direct image URL.
                </p>
                {formData.photo_url && (
                  <div className="mt-3">
                    <img
                      src={formData.photo_url}
                      alt="Profile preview"
                      className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 text-[rgb(29,29,31)] font-semibold rounded-lg hover:bg-[rgb(247,247,249)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.sport}
              className="flex-1 py-3 px-4 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:bg-[rgb(0,100,200)] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  <span>Create Player Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
