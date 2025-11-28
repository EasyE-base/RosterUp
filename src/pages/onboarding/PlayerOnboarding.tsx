import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Trophy, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TRAVEL_SPORTS, getPositionsBySport } from '../../constants/playerConstants';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';

export default function PlayerOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    city: '',
    state: '',
    country: 'USA',
    primary_sport: '',
    primary_position: [] as string[],
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

      // Upsert player record (insert if doesn't exist, update if exists)
      const { error: upsertError } = await supabase
        .from('players')
        .upsert({
          user_id: user?.id,
          date_of_birth: formData.date_of_birth,
          age,
          gender: formData.gender,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          location: `${formData.city}, ${formData.state}`,
          primary_sport: formData.primary_sport,
          primary_position: formData.primary_position.join(', '), // Convert array to comma-separated string
          bio: formData.bio,
          parent_email: age < 18 ? formData.parent_email : null,
          rating: 0,
          profile_visibility: 'public'
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      // Refresh user data to load the updated player record
      await refreshUserData();

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player profile');
      setLoading(false);
    }
  };

  const age = formData.date_of_birth ? calculateAge(formData.date_of_birth) : null;

  // Get available positions based on selected sport
  const availablePositions = formData.primary_sport ? getPositionsBySport(formData.primary_sport) : [];

  // Handle position selection toggle
  const togglePosition = (positionValue: string) => {
    setFormData(prev => ({
      ...prev,
      primary_position: prev.primary_position.includes(positionValue)
        ? prev.primary_position.filter(p => p !== positionValue)
        : [...prev.primary_position, positionValue]
    }));
  };

  const stepTitles = ['Personal Info', 'Location', 'Athletic Profile'];

  return (
    <OnboardingLayout
      title="Create Player Profile"
      subtitle="Showcase your talent to the world"
      currentStep={step}
      totalSteps={3}
      stepTitles={stepTitles}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  Date of Birth
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  Gender
                </label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all appearance-none"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {age !== null && age < 18 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <p className="text-amber-800 text-sm mb-4 font-medium">
                  Since you're under 18, we'll need a parent or guardian email for consent.
                </p>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600/60 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-amber-200 rounded-xl text-[#1D1D1F] placeholder-amber-600/40 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              Continue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  City
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Diego"
                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="CA"
                  className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-[2] py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Primary Sport
              </label>
              <div className="relative group">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                <select
                  value={formData.primary_sport}
                  onChange={(e) => setFormData({
                    ...formData,
                    primary_sport: e.target.value,
                    primary_position: [] // Clear positions when sport changes
                  })}
                  className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all appearance-none"
                  required
                >
                  <option value="">Select your sport</option>
                  {TRAVEL_SPORTS.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-3">
                Positions You Play {formData.primary_position.length > 0 && (
                  <span className="text-[#0071E3] text-xs ml-2 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                    {formData.primary_position.length} selected
                  </span>
                )}
              </label>
              {availablePositions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availablePositions.map((position) => {
                    const isSelected = formData.primary_position.includes(position.value);
                    return (
                      <button
                        key={position.value}
                        type="button"
                        onClick={() => togglePosition(position.value)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
                            ? 'bg-[#0071E3] border-[#0071E3] text-white shadow-md shadow-blue-500/20'
                            : 'bg-white border-[#D2D2D7] text-[#1D1D1F] hover:border-[#0071E3] hover:text-[#0071E3]'
                          }`}
                      >
                        {position.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-[#F5F5F7] rounded-xl text-[#86868B] text-center text-sm border border-dashed border-[#D2D2D7]">
                  Select a sport above to see available positions
                </div>
              )}
              {formData.primary_position.length === 0 && availablePositions.length > 0 && (
                <p className="mt-2 text-xs text-[#86868B]">Tap on positions to select them</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Bio <span className="text-[#86868B] font-normal">(Optional)</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell teams about yourself, your achievements, and what makes you stand out..."
                rows={4}
                className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all resize-none"
              />
            </div>

            {formData.primary_position.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <p className="text-amber-800 text-sm font-medium">
                  Please select at least one position to continue
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading || formData.primary_position.length === 0}
                className="flex-[2] py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <span>Complete Profile</span>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </OnboardingLayout>
  );
}
