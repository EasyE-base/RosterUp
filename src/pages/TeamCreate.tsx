import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function TeamCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    age_group: '',
    gender: '',
    description: '',
    season: '',
    roster_limit: 20,
  });

  const sports = [
    'Soccer',
    'Basketball',
    'Baseball',
    'Softball',
    'Football',
    'Volleyball',
    'Hockey',
    'Lacrosse',
    'Tennis',
    'Swimming',
    'Track & Field',
    'Wrestling',
    'Other',
  ];

  const ageGroups = [
    'U8',
    'U10',
    'U12',
    'U14',
    'U16',
    'U18',
    'U19',
    'U21',
    'Adult',
    'Open',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!organization) {
        throw new Error('You must be an organization to create teams');
      }

      const { data, error: insertError } = await supabase
        .from('teams')
        .insert({
          organization_id: organization.id,
          name: formData.name,
          sport: formData.sport,
          age_group: formData.age_group || null,
          gender: formData.gender || null,
          description: formData.description || null,
          season: formData.season || null,
          roster_limit: formData.roster_limit,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(29,29,31)] mb-2">Create New Team</h1>
          <p className="text-[rgb(134,142,150)]">
            Set up a new team for your organization
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[rgb(29,29,31)] mb-6 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-[rgb(0,113,227)]" />
              <span>Team Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lightning U14 Boys"
                  className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Sport *
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    required
                  >
                    <option value="">Select sport</option>
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Age Group
                  </label>
                  <select
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  >
                    <option value="">Select gender</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Coed">Coed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Season
                  </label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    placeholder="e.g., Fall 2024"
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell players about your team..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[rgb(29,29,31)] mb-6 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[rgb(0,113,227)]" />
              <span>Team Settings</span>
            </h2>

            <div>
              <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                Roster Limit
              </label>
              <input
                type="number"
                value={formData.roster_limit}
                onChange={(e) => setFormData({ ...formData, roster_limit: parseInt(e.target.value) })}
                min="1"
                max="50"
                className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
              />
              <p className="text-[rgb(134,142,150)] text-sm mt-2">
                Maximum number of players allowed on this team
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 text-[rgb(29,29,31)] font-semibold rounded-lg hover:bg-[rgb(247,247,249)] hover:shadow-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[rgb(0,113,227)]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  <span>Create Team</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
