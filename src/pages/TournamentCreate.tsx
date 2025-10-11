import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { geocodeAddress } from '../lib/geocoding';

export default function TournamentCreate() {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    location_name: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    latitude: null as number | null,
    longitude: null as number | null,
    max_participants: 16,
    format_type: 'single_elimination',
    entry_fee: '',
    prize_info: '',
    requirements: '',
    status: 'draft',
  });

  const handleGeocode = async () => {
    if (!formData.city) {
      setError('Please enter at least a city to find coordinates');
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      const result = await geocodeAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.country
      );

      if (result) {
        setFormData({
          ...formData,
          latitude: result.latitude,
          longitude: result.longitude,
        });
      } else {
        setError('Could not find coordinates for this address');
      }
    } catch (err) {
      setError('Failed to geocode address');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!organization) {
        throw new Error('You must be an organization to create tournaments');
      }

      if (!formData.latitude || !formData.longitude) {
        await handleGeocode();
      }

      const { error: insertError } = await supabase.from('tournaments').insert({
        organization_id: organization.id,
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_deadline: formData.registration_deadline,
        location_name: formData.location_name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        max_participants: formData.max_participants,
        format_type: formData.format_type,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : null,
        prize_info: formData.prize_info || null,
        requirements: formData.requirements ? [formData.requirements] : [],
        status: formData.status,
      });

      if (insertError) throw insertError;

      navigate('/tournaments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Tournament</h1>
          <p className="text-slate-400">
            Host a tournament and invite organizations to compete
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Showdown 2025"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your tournament, format, and what makes it special..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sport *
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="">Select a sport</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Soccer">Soccer</option>
                    <option value="Baseball">Baseball</option>
                    <option value="Football">Football</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Softball">Softball</option>
                    <option value="Hockey">Hockey</option>
                    <option value="Lacrosse">Lacrosse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Format Type *
                  </label>
                  <select
                    value={formData.format_type}
                    onChange={(e) => setFormData({ ...formData, format_type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="single_elimination">Single Elimination</option>
                    <option value="double_elimination">Double Elimination</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="pool_play">Pool Play</option>
                    <option value="swiss">Swiss System</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Dates & Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_deadline: e.target.value })
                  }
                  max={formData.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              Location
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={formData.location_name}
                  onChange={(e) =>
                    setFormData({ ...formData, location_name: e.target.value })
                  }
                  placeholder="e.g., Riverside Sports Complex"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Diego"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding || !formData.city}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-medium rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {geocoding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Finding location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Find Coordinates</span>
                    </>
                  )}
                </button>
                {formData.latitude && formData.longitude && (
                  <span className="text-sm text-green-400">
                    ✓ Location found ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-cyan-400" />
              Participants & Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({ ...formData, max_participants: parseInt(e.target.value) })
                  }
                  min="4"
                  max="128"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Entry Fee (Optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.entry_fee}
                      onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Prize Information (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.prize_info}
                    onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
                    placeholder="e.g., $1000 grand prize"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Requirements (Optional)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List any requirements for participating teams..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                >
                  <option value="draft">Draft (Not visible to public)</option>
                  <option value="open">Open (Accept applications)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/tournaments')}
              className="flex-1 py-3 px-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  <span>Create Tournament</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
