import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Trophy, MapPin, DollarSign,
  Upload, X, Plus, Loader2, Video, Image as ImageIcon,
  ArrowRight, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TRAVEL_SPORTS } from '../../constants/playerConstants';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import toast from 'react-hot-toast';

interface BackgroundItem {
  year: string;
  title: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export default function TrainerOnboarding() {
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

  // Step 1: Brand Yourself
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string>('');
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);
  const [introVideoPreview, setIntroVideoPreview] = useState<string>('');
  const [sports, setSports] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');

  // Step 2: Credentials
  const [athleticBackground, setAthleticBackground] = useState<BackgroundItem[]>([]);
  const [coachingBackground, setCoachingBackground] = useState<BackgroundItem[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Step 3: Service Area
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [travelRadius, setTravelRadius] = useState<number>(25);
  const [hourlyRate, setHourlyRate] = useState('');
  const [groupRate, setGroupRate] = useState('');
  const [showPricing, setShowPricing] = useState(false);

  // File input refs
  const headshotInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Common specializations for autocomplete
  const commonSpecializations = [
    'Hitting', 'Pitching', 'Fielding', 'Base Running', 'Catching',
    'Strength & Conditioning', 'Speed Training', 'Mental Coaching',
    'Defensive Skills', 'Offensive Strategy', 'Youth Development'
  ];

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image must be less than 10MB');
        return;
      }
      setHeadshotFile(file);
      setHeadshotPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        setError('Video must be less than 500MB');
        return;
      }
      setIntroVideoFile(file);
      setIntroVideoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const toggleSport = (sport: string) => {
    setSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const addBackgroundItem = (type: 'athletic' | 'coaching') => {
    const newItem: BackgroundItem = { year: '', title: '', description: '' };
    if (type === 'athletic') {
      setAthleticBackground([...athleticBackground, newItem]);
    } else {
      setCoachingBackground([...coachingBackground, newItem]);
    }
  };

  const updateBackgroundItem = (
    type: 'athletic' | 'coaching',
    index: number,
    field: keyof BackgroundItem,
    value: string
  ) => {
    const setter = type === 'athletic' ? setAthleticBackground : setCoachingBackground;
    const items = type === 'athletic' ? athleticBackground : coachingBackground;
    const updated = [...items];
    updated[index][field] = value;
    setter(updated);
  };

  const removeBackgroundItem = (type: 'athletic' | 'coaching', index: number) => {
    if (type === 'athletic') {
      setAthleticBackground(athleticBackground.filter((_, i) => i !== index));
    } else {
      setCoachingBackground(coachingBackground.filter((_, i) => i !== index));
    }
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', year: '' }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    if (step === 1) {
      if (sports.length === 0) {
        setError('Please select at least one sport');
        return false;
      }
      if (!tagline.trim()) {
        setError('Please add a tagline');
        return false;
      }
    }
    if (step === 3) {
      if (!city.trim() || !state.trim()) {
        setError('Please enter your location');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      let headshotUrl = '';
      let introVideoUrl = '';

      // Upload headshot if provided
      if (headshotFile && user) {
        const fileName = `${user.id}/headshot-${Date.now()}.${headshotFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('trainer-photos')
          .upload(fileName, headshotFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('trainer-photos').getPublicUrl(fileName);
        headshotUrl = data.publicUrl;
      }

      // Upload intro video if provided
      if (introVideoFile && user) {
        const fileName = `${user.id}/intro-${Date.now()}.${introVideoFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('trainer-videos')
          .upload(fileName, introVideoFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('trainer-videos').getPublicUrl(fileName);
        introVideoUrl = data.publicUrl;
      }

      // Update trainer profile
      const { error: updateError } = await supabase
        .from('trainers')
        .update({
          headshot_url: headshotUrl || null,
          intro_video_url: introVideoUrl || null,
          sports,
          specializations,
          tagline,
          bio,
          athletic_background: athleticBackground,
          coaching_background: coachingBackground,
          certifications,
          latitude: 0, // TODO: Geocode from city/state
          longitude: 0,
          travel_radius_miles: travelRadius,
          pricing_info: {
            hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
            group_rate: groupRate ? parseFloat(groupRate) : null,
            show_pricing: showPricing,
          },
        })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Refresh user data to load the updated trainer record
      await refreshUserData();

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving trainer profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save trainer profile');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Brand', 'Credentials', 'Service Area'];

  return (
    <OnboardingLayout
      title="Trainer Profile Setup"
      subtitle="Build your coaching brand"
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

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Profile Photos & Videos */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Headshot */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  Profile Photo
                </label>
                <div
                  onClick={() => headshotInputRef.current?.click()}
                  className="relative border-2 border-dashed border-[#D2D2D7] rounded-xl p-6 hover:border-[#0071E3] hover:bg-[#F5F5F7] transition-all cursor-pointer group aspect-square flex flex-col items-center justify-center"
                >
                  {headshotPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={headshotPreview}
                        alt="Headshot preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeadshotFile(null);
                          setHeadshotPreview('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-[#1D1D1F] rounded-full hover:bg-white shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
                      <p className="text-sm font-medium text-[#1D1D1F]">
                        Upload Photo
                      </p>
                      <p className="text-xs text-[#86868B] mt-1">
                        Max 10MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={headshotInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleHeadshotUpload}
                  className="hidden"
                />
              </div>

              {/* Intro Video */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  Intro Video <span className="text-[#86868B] font-normal">(Optional)</span>
                </label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="relative border-2 border-dashed border-[#D2D2D7] rounded-xl p-6 hover:border-[#0071E3] hover:bg-[#F5F5F7] transition-all cursor-pointer group aspect-square flex flex-col items-center justify-center"
                >
                  {introVideoPreview ? (
                    <div className="relative w-full h-full">
                      <video
                        src={introVideoPreview}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIntroVideoFile(null);
                          setIntroVideoPreview('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-[#1D1D1F] rounded-full hover:bg-white shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="w-10 h-10 mx-auto mb-3 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
                      <p className="text-sm font-medium text-[#1D1D1F]">
                        Upload Video
                      </p>
                      <p className="text-xs text-[#86868B] mt-1">
                        Max 500MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Former MLB Player | Hitting Specialist"
                className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell players about yourself and your coaching philosophy..."
                className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Sports Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-3">
                Sports You Train
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRAVEL_SPORTS.map((sport) => (
                  <button
                    key={sport.value}
                    type="button"
                    onClick={() => toggleSport(sport.value)}
                    className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${sports.includes(sport.value)
                        ? 'bg-[#0071E3] border-[#0071E3] text-white shadow-md shadow-blue-500/20'
                        : 'bg-white border-[#D2D2D7] text-[#1D1D1F] hover:border-[#0071E3] hover:text-[#0071E3]'
                      }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">{sport.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                Specializations
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  placeholder="e.g., Hitting, Pitching, Speed Training..."
                  className="flex-1 px-4 py-3 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="px-4 py-3 bg-[#0071E3] text-white rounded-xl hover:bg-[#0077ED] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#0071E3] rounded-full text-sm font-medium"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#86868B] mt-2">
                Suggestions: {commonSpecializations.filter(s => !specializations.includes(s)).slice(0, 5).join(', ')}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Athletic Background */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-[#1D1D1F]">
                  Athletic Background
                </label>
                <button
                  type="button"
                  onClick={() => addBackgroundItem('athletic')}
                  className="text-sm text-[#0071E3] hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {athleticBackground.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#F5F5F7] rounded-xl border border-transparent hover:border-[#D2D2D7] transition-all">
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Year (e.g., 2015-2018)"
                        value={item.year}
                        onChange={(e) => updateBackgroundItem('athletic', idx, 'year', e.target.value)}
                        className="px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                      />
                      <input
                        type="text"
                        placeholder="Title/Position"
                        value={item.title}
                        onChange={(e) => updateBackgroundItem('athletic', idx, 'title', e.target.value)}
                        className="md:col-span-2 px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => updateBackgroundItem('athletic', idx, 'description', e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeBackgroundItem('athletic', idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {athleticBackground.length === 0 && (
                  <div className="text-center py-8 bg-[#F5F5F7] rounded-xl border border-dashed border-[#D2D2D7]">
                    <p className="text-sm text-[#86868B]">No athletic background added yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coaching Background */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-[#1D1D1F]">
                  Coaching Background
                </label>
                <button
                  type="button"
                  onClick={() => addBackgroundItem('coaching')}
                  className="text-sm text-[#0071E3] hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {coachingBackground.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#F5F5F7] rounded-xl border border-transparent hover:border-[#D2D2D7] transition-all">
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Year (e.g., 2018-Present)"
                        value={item.year}
                        onChange={(e) => updateBackgroundItem('coaching', idx, 'year', e.target.value)}
                        className="px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                      />
                      <input
                        type="text"
                        placeholder="Role/Organization"
                        value={item.title}
                        onChange={(e) => updateBackgroundItem('coaching', idx, 'title', e.target.value)}
                        className="md:col-span-2 px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => updateBackgroundItem('coaching', idx, 'description', e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeBackgroundItem('coaching', idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {coachingBackground.length === 0 && (
                  <div className="text-center py-8 bg-[#F5F5F7] rounded-xl border border-dashed border-[#D2D2D7]">
                    <p className="text-sm text-[#86868B]">No coaching background added yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-[#1D1D1F]">
                  Certifications & Awards
                </label>
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-sm text-[#0071E3] hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </button>
              </div>
              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 bg-[#F5F5F7] rounded-xl border border-transparent hover:border-[#D2D2D7] transition-all">
                    <div className="flex gap-3">
                      <div className="flex-1 grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Certification Name"
                          value={cert.name}
                          onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                          className="px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                        />
                        <input
                          type="text"
                          placeholder="Issuing Organization"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                          className="px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                        />
                        <input
                          type="text"
                          placeholder="Year"
                          value={cert.year}
                          onChange={(e) => updateCertification(idx, 'year', e.target.value)}
                          className="px-3 py-2 bg-white border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {certifications.length === 0 && (
                  <div className="text-center py-8 bg-[#F5F5F7] rounded-xl border border-dashed border-[#D2D2D7]">
                    <p className="text-sm text-[#86868B]">No certifications added yet.</p>
                  </div>
                )}
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
            {/* Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  City
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                  className="w-full px-4 py-4 bg-[#F5F5F7] border-none rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Travel Radius */}
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-4">
                Travel Radius: <span className="text-[#0071E3]">{travelRadius} miles</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={travelRadius}
                onChange={(e) => setTravelRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E5E5EA] rounded-lg appearance-none cursor-pointer accent-[#0071E3]"
              />
              <div className="flex justify-between text-xs text-[#86868B] mt-2 font-medium">
                <span>Local only</span>
                <span>100+ miles</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 border border-[#E5E5EA]">
              <div className="flex items-center justify-between mb-6">
                <label className="block text-sm font-semibold text-[#1D1D1F]">
                  Pricing <span className="text-[#86868B] font-normal">(Optional)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPricing}
                    onChange={(e) => setShowPricing(e.target.checked)}
                    className="w-4 h-4 text-[#0071E3] focus:ring-[#0071E3] rounded border-gray-300"
                  />
                  <span className="text-sm text-[#1D1D1F]">Display on profile</span>
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#86868B] mb-2 uppercase tracking-wide">
                    1-on-1 Rate ($/hour)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="75"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868B] mb-2 uppercase tracking-wide">
                    Group Rate ($/hour)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
                    <input
                      type="number"
                      value={groupRate}
                      onChange={(e) => setGroupRate(e.target.value)}
                      placeholder="50"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border-none rounded-lg text-[#1D1D1F] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#86868B] mt-4">
                Pricing is optional and can be updated later. Players can contact you to discuss rates.
              </p>
            </div>

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
                disabled={loading}
                className="flex-[2] py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Profile...</span>
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
