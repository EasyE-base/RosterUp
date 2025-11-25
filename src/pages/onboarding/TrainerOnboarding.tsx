import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Trophy, GraduationCap, MapPin, DollarSign,
  Upload, X, Plus, CheckCircle2, Loader2, Video, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TRAVEL_SPORTS } from '../../constants/playerConstants';

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
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[rgb(0,113,227)]/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-[rgb(0,113,227)]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-[rgb(29,29,31)] mb-2">
              Trainer Profile Setup
            </h1>
            <p className="text-center text-[rgb(134,142,150)]">
              Step {step} of 3
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-[rgb(0,113,227)] text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-sm font-medium text-[rgb(29,29,31)]">Brand</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-slate-200 rounded">
                <div
                  className="h-full bg-[rgb(0,113,227)] rounded transition-all duration-300"
                  style={{ width: step >= 2 ? '100%' : '0%' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-[rgb(0,113,227)] text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                </div>
                <span className="text-sm font-medium text-[rgb(29,29,31)]">Credentials</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-slate-200 rounded">
                <div
                  className="h-full bg-[rgb(0,113,227)] rounded transition-all duration-300"
                  style={{ width: step >= 3 ? '100%' : '0%' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-[rgb(0,113,227)] text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium text-[rgb(29,29,31)]">Service Area</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step Content */}
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <AnimatePresence mode="wait">
              {/* STEP 1: BRAND YOURSELF */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Profile Photos & Videos */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Headshot */}
                    <div>
                      <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Profile Photo
                      </label>
                      <div
                        onClick={() => headshotInputRef.current?.click()}
                        className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[rgb(0,113,227)] transition-colors cursor-pointer group"
                      >
                        {headshotPreview ? (
                          <div className="relative">
                            <img
                              src={headshotPreview}
                              alt="Headshot preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHeadshotFile(null);
                                setHeadshotPreview('');
                              }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-400 group-hover:text-[rgb(0,113,227)]" />
                            <p className="text-sm text-[rgb(134,142,150)]">
                              Click to upload photo
                            </p>
                            <p className="text-xs text-[rgb(134,142,150)] mt-1">
                              Max 10MB (JPG, PNG)
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
                      <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Intro Video (Optional)
                      </label>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[rgb(0,113,227)] transition-colors cursor-pointer group"
                      >
                        {introVideoPreview ? (
                          <div className="relative">
                            <video
                              src={introVideoPreview}
                              className="w-full h-48 object-cover rounded-lg"
                              controls
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIntroVideoFile(null);
                                setIntroVideoPreview('');
                              }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Video className="w-12 h-12 mx-auto mb-2 text-slate-400 group-hover:text-[rgb(0,113,227)]" />
                            <p className="text-sm text-[rgb(134,142,150)]">
                              Click to upload video
                            </p>
                            <p className="text-xs text-[rgb(134,142,150)] mt-1">
                              Max 500MB (MP4, MOV)
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
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g., Former MLB Player | Hitting Specialist"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Tell players about yourself and your coaching philosophy..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Sports Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Sports You Train *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TRAVEL_SPORTS.map((sport) => (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            sports.includes(sport)
                              ? 'bg-[rgb(0,113,227)]/10 border-[rgb(0,113,227)] text-[rgb(0,113,227)]'
                              : 'bg-white border-slate-200 text-[rgb(134,142,150)] hover:border-slate-300'
                          }`}
                        >
                          <Trophy className="w-4 h-4 inline mr-2" />
                          {sport}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Specializations
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                        placeholder="e.g., Hitting, Pitching, Speed Training..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                      />
                      <button
                        type="button"
                        onClick={addSpecialization}
                        className="px-4 py-2 bg-[rgb(0,113,227)] text-white rounded-lg hover:bg-blue-600"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgb(0,113,227)]/10 text-[rgb(0,113,227)] rounded-full text-sm"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpecialization(spec)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[rgb(134,142,150)] mt-2">
                      Suggestions: {commonSpecializations.filter(s => !specializations.includes(s)).slice(0, 5).join(', ')}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CREDENTIALS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Athletic Background */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-[rgb(29,29,31)]">
                        Athletic Background
                      </label>
                      <button
                        type="button"
                        onClick={() => addBackgroundItem('athletic')}
                        className="text-sm text-[rgb(0,113,227)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Experience
                      </button>
                    </div>
                    <div className="space-y-4">
                      {athleticBackground.map((item, idx) => (
                        <div key={idx} className="p-4 bg-[rgb(247,247,249)] rounded-lg border border-slate-200">
                          <div className="grid md:grid-cols-3 gap-3 mb-3">
                            <input
                              type="text"
                              placeholder="Year (e.g., 2015-2018)"
                              value={item.year}
                              onChange={(e) => updateBackgroundItem('athletic', idx, 'year', e.target.value)}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                            />
                            <input
                              type="text"
                              placeholder="Title/Position"
                              value={item.title}
                              onChange={(e) => updateBackgroundItem('athletic', idx, 'title', e.target.value)}
                              className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              placeholder="Description..."
                              value={item.description}
                              onChange={(e) => updateBackgroundItem('athletic', idx, 'description', e.target.value)}
                              rows={2}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeBackgroundItem('athletic', idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {athleticBackground.length === 0 && (
                        <p className="text-sm text-[rgb(134,142,150)] text-center py-4">
                          No athletic background added yet. Click "Add Experience" to get started.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coaching Background */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-[rgb(29,29,31)]">
                        Coaching Background
                      </label>
                      <button
                        type="button"
                        onClick={() => addBackgroundItem('coaching')}
                        className="text-sm text-[rgb(0,113,227)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Experience
                      </button>
                    </div>
                    <div className="space-y-4">
                      {coachingBackground.map((item, idx) => (
                        <div key={idx} className="p-4 bg-[rgb(247,247,249)] rounded-lg border border-slate-200">
                          <div className="grid md:grid-cols-3 gap-3 mb-3">
                            <input
                              type="text"
                              placeholder="Year (e.g., 2018-Present)"
                              value={item.year}
                              onChange={(e) => updateBackgroundItem('coaching', idx, 'year', e.target.value)}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                            />
                            <input
                              type="text"
                              placeholder="Role/Organization"
                              value={item.title}
                              onChange={(e) => updateBackgroundItem('coaching', idx, 'title', e.target.value)}
                              className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              placeholder="Description..."
                              value={item.description}
                              onChange={(e) => updateBackgroundItem('coaching', idx, 'description', e.target.value)}
                              rows={2}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeBackgroundItem('coaching', idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {coachingBackground.length === 0 && (
                        <p className="text-sm text-[rgb(134,142,150)] text-center py-4">
                          No coaching background added yet. Click "Add Experience" to get started.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-[rgb(29,29,31)]">
                        Certifications & Awards
                      </label>
                      <button
                        type="button"
                        onClick={addCertification}
                        className="text-sm text-[rgb(0,113,227)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Certification
                      </button>
                    </div>
                    <div className="space-y-3">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="p-4 bg-[rgb(247,247,249)] rounded-lg border border-slate-200">
                          <div className="flex gap-3">
                            <div className="flex-1 grid md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                placeholder="Certification Name"
                                value={cert.name}
                                onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                              />
                              <input
                                type="text"
                                placeholder="Issuing Organization"
                                value={cert.issuer}
                                onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                              />
                              <input
                                type="text"
                                placeholder="Year"
                                value={cert.year}
                                onChange={(e) => updateCertification(idx, 'year', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCertification(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {certifications.length === 0 && (
                        <p className="text-sm text-[rgb(134,142,150)] text-center py-4">
                          No certifications added yet. Click "Add Certification" to get started.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SERVICE AREA */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Primary Location *
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                        required
                      />
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                        required
                      />
                    </div>
                  </div>

                  {/* Travel Radius */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Travel Radius: {travelRadius} miles
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={travelRadius}
                      onChange={(e) => setTravelRadius(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(0,113,227)]"
                    />
                    <div className="flex justify-between text-xs text-[rgb(134,142,150)] mt-1">
                      <span>Local only</span>
                      <span>100+ miles</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-[rgb(29,29,31)]">
                        Pricing (Optional)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPricing}
                          onChange={(e) => setShowPricing(e.target.checked)}
                          className="w-4 h-4 text-[rgb(0,113,227)] focus:ring-[rgb(0,113,227)] rounded"
                        />
                        <span className="text-sm text-[rgb(134,142,150)]">Display on profile</span>
                      </label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[rgb(134,142,150)] mb-1">
                          1-on-1 Rate ($/hour)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
                          <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="75"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[rgb(134,142,150)] mb-1">
                          Group Rate ($/hour)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
                          <input
                            type="number"
                            value={groupRate}
                            onChange={(e) => setGroupRate(e.target.value)}
                            placeholder="50"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[rgb(134,142,150)] mt-2">
                      Pricing is optional and can be updated later. Players can contact you to discuss rates.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-[rgb(0,113,227)] hover:bg-[rgb(0,113,227)]/10 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <div className={step === 1 ? 'ml-auto' : ''}>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[rgb(0,113,227)] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : step === 3 ? (
                    'Complete Setup'
                  ) : (
                    'Next Step'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
