import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleInput,
  AppleTextarea,
  AppleBadge,
} from '@/components/apple';
import TravelRadiusMap from '../../components/trainer/TravelRadiusMap';
import {
  Camera,
  Video,
  Plus,
  X,
  MapPin,
  DollarSign,
  Award,
  Trophy,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
  image_url?: string;
}

export default function TrainerProfileEdit() {
  const navigate = useNavigate();
  const { trainer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Media refs
  const headshotInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Existing media
  const [existingHeadshotUrl, setExistingHeadshotUrl] = useState('');
  const [existingVideoUrl, setExistingVideoUrl] = useState('');

  // New media uploads
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');

  // Basic info
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');

  // Sports and specializations
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');

  // Timelines
  const [athleticBackground, setAthleticBackground] = useState<TimelineItem[]>([]);
  const [coachingBackground, setCoachingBackground] = useState<TimelineItem[]>([]);

  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Location
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [travelRadius, setTravelRadius] = useState(25);

  // Pricing
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [groupRate, setGroupRate] = useState<number>(0);
  const [showPricing, setShowPricing] = useState(true);

  const availableSports = [
    'Baseball',
    'Softball',
    'Basketball',
    'Football',
    'Soccer',
    'Volleyball',
    'Track & Field',
    'Swimming',
    'Tennis',
    'Golf',
    'Hockey',
    'Lacrosse',
  ];

  useEffect(() => {
    if (trainer) {
      loadTrainerData();
    }
  }, [trainer]);

  const loadTrainerData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            city,
            state
          )
        `)
        .eq('id', trainer?.id)
        .single();

      if (error) throw error;

      if (data) {
        // Media
        setExistingHeadshotUrl(data.headshot_url || '');
        setExistingVideoUrl(data.intro_video_url || '');

        // Basic info
        setTagline(data.tagline || '');
        setBio(data.bio || '');

        // Sports and specializations
        setSelectedSports(data.sports || []);
        setSpecializations(data.specializations || []);

        // Timelines
        setAthleticBackground(data.athletic_background || []);
        setCoachingBackground(data.coaching_background || []);

        // Certifications
        setCertifications(data.certifications || []);

        // Location
        setCity(data.profiles?.city || '');
        setState(data.profiles?.state || '');
        setTravelRadius(data.travel_radius_miles || 25);

        // Pricing
        setHourlyRate(data.hourly_rate || 0);
        setGroupRate(data.group_rate || 0);
        setShowPricing(data.show_pricing ?? true);
      }
    } catch (err) {
      handleError(err, 'Failed to load trainer data');
    } finally {
      setLoading(false);
    }
  };

  const handleHeadshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Image must be less than 5MB');
        return;
      }
      setHeadshotFile(file);
      setHeadshotPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showToast.error('Please select a video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        showToast.error('Video must be less than 100MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport)
        ? prev.filter((s) => s !== sport)
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
    setSpecializations(specializations.filter((s) => s !== spec));
  };

  const addAthleticItem = () => {
    setAthleticBackground([
      ...athleticBackground,
      { year: '', title: '', description: '' },
    ]);
  };

  const updateAthleticItem = (index: number, field: keyof TimelineItem, value: string) => {
    const updated = [...athleticBackground];
    updated[index] = { ...updated[index], [field]: value };
    setAthleticBackground(updated);
  };

  const removeAthleticItem = (index: number) => {
    setAthleticBackground(athleticBackground.filter((_, i) => i !== index));
  };

  const addCoachingItem = () => {
    setCoachingBackground([
      ...coachingBackground,
      { year: '', title: '', description: '' },
    ]);
  };

  const updateCoachingItem = (index: number, field: keyof TimelineItem, value: string) => {
    const updated = [...coachingBackground];
    updated[index] = { ...updated[index], [field]: value };
    setCoachingBackground(updated);
  };

  const removeCoachingItem = (index: number) => {
    setCoachingBackground(coachingBackground.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { name: '', issuer: '', year: '' },
    ]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!tagline.trim()) {
        showToast.error('Please enter a tagline');
        return;
      }
      if (!bio.trim()) {
        showToast.error('Please enter a bio');
        return;
      }
      if (selectedSports.length === 0) {
        showToast.error('Please select at least one sport');
        return;
      }

      setSaving(true);

      let headshotUrl = existingHeadshotUrl;
      let videoUrl = existingVideoUrl;

      // Upload new headshot if provided
      if (headshotFile) {
        const fileExt = headshotFile.name.split('.').pop();
        const fileName = `${trainer?.id}/headshot-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trainer-media')
          .upload(fileName, headshotFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('trainer-media')
          .getPublicUrl(fileName);

        headshotUrl = urlData.publicUrl;
      }

      // Upload new video if provided
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${trainer?.id}/intro-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trainer-media')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('trainer-media')
          .getPublicUrl(fileName);

        videoUrl = urlData.publicUrl;
      }

      // Update trainer profile
      const { error: trainerError } = await supabase
        .from('trainers')
        .update({
          headshot_url: headshotUrl,
          intro_video_url: videoUrl,
          tagline: tagline.trim(),
          bio: bio.trim(),
          sports: selectedSports,
          specializations,
          athletic_background: athleticBackground,
          coaching_background: coachingBackground,
          certifications,
          travel_radius_miles: travelRadius,
          hourly_rate: hourlyRate,
          group_rate: groupRate,
          show_pricing: showPricing,
        })
        .eq('id', trainer?.id);

      if (trainerError) throw trainerError;

      // Update location in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          city: city.trim(),
          state: state.trim(),
        })
        .eq('user_id', trainer?.user_id);

      if (profileError) throw profileError;

      showToast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (err) {
      handleError(err, 'Failed to update profile');
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <AppleButton
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </AppleButton>

          <AppleHeading level={1} size="section">
            Edit Trainer Profile
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            Update your profile information and media
          </p>
        </div>

        <div className="space-y-6">
          {/* Media Section */}
          <AppleCard variant="default" padding="lg">
            <AppleHeading level={2} size="subsection" className="mb-6">
              Profile Media
            </AppleHeading>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Headshot */}
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Headshot Photo
                </label>
                {headshotPreview || existingHeadshotUrl ? (
                  <div className="relative">
                    <img
                      src={headshotPreview || existingHeadshotUrl}
                      alt="Headshot preview"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setHeadshotFile(null);
                        setHeadshotPreview('');
                        if (!headshotPreview) setExistingHeadshotUrl('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <AppleButton
                      variant="outline"
                      size="sm"
                      fullWidth
                      leftIcon={<Camera className="w-4 h-4" />}
                      onClick={() => headshotInputRef.current?.click()}
                      className="mt-2"
                    >
                      Replace Photo
                    </AppleButton>
                  </div>
                ) : (
                  <button
                    onClick={() => headshotInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[rgb(0,113,227)] transition-colors"
                  >
                    <Camera className="w-8 h-8 text-[rgb(134,142,150)]" />
                    <span className="text-sm text-[rgb(134,142,150)]">Upload Headshot</span>
                  </button>
                )}
                <input
                  ref={headshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotChange}
                  className="hidden"
                />
              </div>

              {/* Intro Video */}
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Intro Video
                </label>
                {videoPreview || existingVideoUrl ? (
                  <div className="relative">
                    <video
                      src={videoPreview || existingVideoUrl}
                      controls
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview('');
                        if (!videoPreview) setExistingVideoUrl('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <AppleButton
                      variant="outline"
                      size="sm"
                      fullWidth
                      leftIcon={<Video className="w-4 h-4" />}
                      onClick={() => videoInputRef.current?.click()}
                      className="mt-2"
                    >
                      Replace Video
                    </AppleButton>
                  </div>
                ) : (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[rgb(0,113,227)] transition-colors"
                  >
                    <Video className="w-8 h-8 text-[rgb(134,142,150)]" />
                    <span className="text-sm text-[rgb(134,142,150)]">Upload Intro Video</span>
                  </button>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </div>
            </div>
          </AppleCard>

          {/* Basic Info */}
          <AppleCard variant="default" padding="lg">
            <AppleHeading level={2} size="subsection" className="mb-6">
              Basic Information
            </AppleHeading>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Tagline *
                </label>
                <AppleInput
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g., Elite Performance Coach | Former D1 Athlete"
                  maxLength={100}
                />
                <p className="text-xs text-[rgb(134,142,150)] mt-1">
                  {tagline.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Bio *
                </label>
                <AppleTextarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell players about your background, coaching philosophy, and what makes you unique..."
                  rows={6}
                />
              </div>
            </div>
          </AppleCard>

          {/* Sports & Specializations */}
          <AppleCard variant="default" padding="lg">
            <AppleHeading level={2} size="subsection" className="mb-6">
              Sports & Specializations
            </AppleHeading>

            <div className="space-y-6">
              {/* Sports */}
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-3">
                  Sports You Train *
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => toggleSport(sport)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        selectedSports.includes(sport)
                          ? 'bg-[rgb(0,113,227)] text-white'
                          : 'bg-white text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] border-[1.5px] border-slate-200'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-3">
                  Specializations
                </label>
                <div className="flex gap-2 mb-3">
                  <AppleInput
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="e.g., Hitting Mechanics, Speed Training"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialization();
                      }
                    }}
                  />
                  <AppleButton
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={addSpecialization}
                  >
                    Add
                  </AppleButton>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec, index) => (
                    <AppleBadge
                      key={index}
                      variant="primary"
                      size="md"
                      className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                      onClick={() => removeSpecialization(spec)}
                    >
                      {spec} <X className="w-3 h-3 ml-1 inline" />
                    </AppleBadge>
                  ))}
                </div>
              </div>
            </div>
          </AppleCard>

          {/* Athletic Background */}
          <AppleCard variant="default" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <AppleHeading level={2} size="subsection">
                Athletic Background
              </AppleHeading>
              <AppleButton
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addAthleticItem}
              >
                Add Item
              </AppleButton>
            </div>

            <div className="space-y-4">
              {athleticBackground.map((item, index) => (
                <div key={index} className="p-4 bg-[rgb(247,247,249)] rounded-lg relative">
                  <button
                    onClick={() => removeAthleticItem(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid md:grid-cols-3 gap-3">
                    <AppleInput
                      value={item.year}
                      onChange={(e) => updateAthleticItem(index, 'year', e.target.value)}
                      placeholder="Year (e.g., 2015-2019)"
                    />
                    <div className="md:col-span-2">
                      <AppleInput
                        value={item.title}
                        onChange={(e) => updateAthleticItem(index, 'title', e.target.value)}
                        placeholder="Title (e.g., Division I Baseball - University of Miami)"
                      />
                    </div>
                  </div>
                  <AppleTextarea
                    value={item.description}
                    onChange={(e) => updateAthleticItem(index, 'description', e.target.value)}
                    placeholder="Description of achievements and experience..."
                    rows={2}
                    className="mt-3"
                  />
                </div>
              ))}
              {athleticBackground.length === 0 && (
                <p className="text-sm text-[rgb(134,142,150)] text-center py-4">
                  No athletic background added yet. Click "Add Item" to get started.
                </p>
              )}
            </div>
          </AppleCard>

          {/* Coaching Background */}
          <AppleCard variant="default" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <AppleHeading level={2} size="subsection">
                Coaching Background
              </AppleHeading>
              <AppleButton
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addCoachingItem}
              >
                Add Item
              </AppleButton>
            </div>

            <div className="space-y-4">
              {coachingBackground.map((item, index) => (
                <div key={index} className="p-4 bg-[rgb(247,247,249)] rounded-lg relative">
                  <button
                    onClick={() => removeCoachingItem(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid md:grid-cols-3 gap-3">
                    <AppleInput
                      value={item.year}
                      onChange={(e) => updateCoachingItem(index, 'year', e.target.value)}
                      placeholder="Year (e.g., 2020-Present)"
                    />
                    <div className="md:col-span-2">
                      <AppleInput
                        value={item.title}
                        onChange={(e) => updateCoachingItem(index, 'title', e.target.value)}
                        placeholder="Title (e.g., Head Coach - Elite Travel Baseball)"
                      />
                    </div>
                  </div>
                  <AppleTextarea
                    value={item.description}
                    onChange={(e) => updateCoachingItem(index, 'description', e.target.value)}
                    placeholder="Description of role and achievements..."
                    rows={2}
                    className="mt-3"
                  />
                </div>
              ))}
              {coachingBackground.length === 0 && (
                <p className="text-sm text-[rgb(134,142,150)] text-center py-4">
                  No coaching background added yet. Click "Add Item" to get started.
                </p>
              )}
            </div>
          </AppleCard>

          {/* Certifications */}
          <AppleCard variant="default" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <AppleHeading level={2} size="subsection">
                Certifications
              </AppleHeading>
              <AppleButton
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addCertification}
              >
                Add Certification
              </AppleButton>
            </div>

            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="p-4 bg-[rgb(247,247,249)] rounded-lg relative">
                  <button
                    onClick={() => removeCertification(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid md:grid-cols-3 gap-3">
                    <AppleInput
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      placeholder="Certification Name"
                    />
                    <AppleInput
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      placeholder="Issuing Organization"
                    />
                    <AppleInput
                      value={cert.year}
                      onChange={(e) => updateCertification(index, 'year', e.target.value)}
                      placeholder="Year"
                    />
                  </div>
                </div>
              ))}
              {certifications.length === 0 && (
                <p className="text-sm text-[rgb(134,142,150)] text-center py-4">
                  No certifications added yet. Click "Add Certification" to get started.
                </p>
              )}
            </div>
          </AppleCard>

          {/* Location & Service Area */}
          <div className="space-y-4">
            <AppleCard variant="default" padding="lg">
              <AppleHeading level={2} size="subsection" className="mb-6">
                Location & Service Area
              </AppleHeading>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    City
                  </label>
                  <AppleInput
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Miami"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    State
                  </label>
                  <AppleInput
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., FL"
                    maxLength={2}
                  />
                </div>
              </div>
            </AppleCard>

            {/* Travel Radius Map */}
            {city && state && (
              <TravelRadiusMap
                city={city}
                state={state}
                travelRadius={travelRadius}
                editable={true}
                onRadiusChange={setTravelRadius}
              />
            )}
          </div>

          {/* Pricing */}
          <AppleCard variant="default" padding="lg">
            <AppleHeading level={2} size="subsection" className="mb-6">
              Pricing
            </AppleHeading>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Hourly Rate
                  </label>
                  <AppleInput
                    type="number"
                    value={hourlyRate || ''}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Group Rate (per person)
                  </label>
                  <AppleInput
                    type="number"
                    value={groupRate || ''}
                    onChange={(e) => setGroupRate(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPricing(!showPricing)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    showPricing ? 'bg-[rgb(0,113,227)]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      showPricing ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold text-[rgb(29,29,31)]">
                  Show pricing publicly
                </span>
              </div>
            </div>
          </AppleCard>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <AppleButton
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Save className="w-5 h-5" />}
              onClick={handleSubmit}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </AppleButton>
            <AppleButton
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              disabled={saving}
            >
              Cancel
            </AppleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
