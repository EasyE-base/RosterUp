import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function PlayerOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    city: '',
    state: '',
    country: 'USA',
    primary_sport: '',
    primary_position: '',
    bio: '',
    parent_email: '',
  });

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const age = calculateAge(formData.date_of_birth);

      const { error: insertError } = await supabase.from('players').insert({
        user_id: user?.id,
        date_of_birth: formData.date_of_birth,
        age,
        gender: formData.gender,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        location: `${formData.city}, ${formData.state}`,
        primary_sport: formData.primary_sport,
        primary_position: formData.primary_position,
        bio: formData.bio,
        parent_email: age < 18 ? formData.parent_email : null,
      });

      if (insertError) throw insertError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player profile');
      setLoading(false);
    }
  };

  const sports = ['Soccer', 'Basketball', 'Baseball', 'Football', 'Volleyball', 'Hockey', 'Tennis', 'Swimming', 'Track & Field', 'Other'];

  const age = formData.date_of_birth ? calculateAge(formData.date_of_birth) : null;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 w-12 rounded-full transition-all ${
                      s <= step ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Create Your Player Profile
            </h1>
            <p className="text-slate-400 text-center">
              Let's showcase your athletic talent
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {age !== null && age < 18 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm mb-3">
                      Since you're under 18, we'll need a parent or guardian email for consent.
                    </p>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.parent_email}
                        onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                        placeholder="parent@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
                >
                  Continue
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="San Diego"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        required
                      />
                    </div>
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
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Sport
                  </label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={formData.primary_sport}
                      onChange={(e) => setFormData({ ...formData, primary_sport: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                      required
                    >
                      <option value="">Select your sport</option>
                      {sports.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Position
                  </label>
                  <input
                    type="text"
                    value={formData.primary_position}
                    onChange={(e) => setFormData({ ...formData, primary_position: e.target.value })}
                    placeholder="e.g., Forward, Pitcher, Guard"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell teams about yourself, your achievements, and what makes you stand out..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Complete Profile</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
