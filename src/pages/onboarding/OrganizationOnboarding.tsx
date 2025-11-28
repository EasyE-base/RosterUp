import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Globe, Loader2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TRAVEL_SPORTS } from '../../constants/playerConstants';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import toast from 'react-hot-toast';

export default function OrganizationOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, organization, player, trainer, refreshUserData } = useAuth();
  const navigate = useNavigate();

  // Check if user already has any role
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
    name: '',
    primary_sport: '',
    description: '',
    website: '',
    city: '',
    state: '',
    country: 'USA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if organization already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingOrg) {
        await refreshUserData();
        navigate('/dashboard');
        return;
      }

      const { error: insertError } = await supabase.from('organizations').insert({
        user_id: user?.id,
        name: formData.name,
        primary_sport: formData.primary_sport || null,
        description: formData.description,
        website: formData.website,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        location: `${formData.city}, ${formData.state}`,
      });

      if (insertError) throw insertError;

      await refreshUserData();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      setLoading(false);
    }
  };

  const stepTitles = ['Organization Details', 'Location'];

  return (
    <OnboardingLayout
      title="Setup Organization"
      subtitle="Let's create your team's profile"
      currentStep={step}
      totalSteps={2}
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
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Organization Name
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lightning Sports Academy"
                  className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Primary Sport
              </label>
              <div className="relative group">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                <select
                  value={formData.primary_sport}
                  onChange={(e) => setFormData({ ...formData, primary_sport: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all appearance-none"
                  required
                >
                  <option value="">Select primary sport</option>
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
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your organization..."
                rows={4}
                className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Website <span className="text-[#86868B] font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Country
              </label>
              <div className="relative">
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all appearance-none"
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
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
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <span>Complete Setup</span>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </OnboardingLayout>
  );
}
