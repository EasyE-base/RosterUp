import { useState } from 'react';
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

export default function PlayerProfileCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

      // Check if player profile already exists
      const { data: existingProfile } = await supabase
        .from('player_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        throw new Error('You already have a player profile. Redirecting to edit...');
      }

      // Create player profile
      const { data, error: insertError } = await supabase
        .from('player_profiles')
        .insert({
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
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/players/${data.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player profile');
      if (err instanceof Error && err.message.includes('already have')) {
        setTimeout(() => {
          navigate('/player/profile');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Your Player Profile</h1>
          <p className="text-slate-400">
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
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Primary Sport *
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) =>
                    setFormData({ ...formData, sport: e.target.value, position: '' })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Age Group
                  </label>
                  <select
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Classification
                  </label>
                  <select
                    value={formData.classification}
                    onChange={(e) =>
                      setFormData({ ...formData, classification: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select classification</option>
                    {CLASSIFICATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-400">
                    Your team's competitive level (A=Elite, B=Competitive, C=Developmental)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) =>
                    setFormData({ ...formData, location_city: e.target.value })
                  }
                  placeholder="e.g., San Diego"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                <select
                  value={formData.location_state}
                  onChange={(e) =>
                    setFormData({ ...formData, location_state: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              About You
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell organizations about your experience, achievements, and what you're looking for..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
                <p className="mt-2 text-xs text-slate-400">
                  {formData.bio.length} characters (min 50 recommended for better visibility)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-yellow-400" />
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Add a professional action photo. Use a direct image URL.
                </p>
                {formData.photo_url && (
                  <div className="mt-3">
                    <img
                      src={formData.photo_url}
                      alt="Profile preview"
                      className="w-32 h-32 object-cover rounded-lg border border-slate-700"
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
              className="flex-1 py-3 px-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.sport}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
