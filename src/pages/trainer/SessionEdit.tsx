import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
} from '@/components/apple';
import {
  ArrowLeft,
  Upload,
  X,
  Video as VideoIcon,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Trophy,
  Loader2,
  Save,
} from 'lucide-react';

const TRAVEL_SPORTS = [
  'Baseball',
  'Softball',
  'Basketball',
  'Soccer',
  'Volleyball',
  'Football',
  'Lacrosse',
  'Hockey',
  'Wrestling',
  'Track & Field',
  'Swimming',
  'Tennis',
  'Golf',
  'Cross Country',
  'Other',
];

const SESSION_TYPES = [
  { value: 'one_on_one', label: '1-on-1 Training', maxParticipants: 1 },
  { value: 'small_group', label: 'Small Group (2-6)', maxParticipants: 6 },
  { value: 'clinic', label: 'Clinic (7-20)', maxParticipants: 20 },
  { value: 'team_practice', label: 'Team Practice (20+)', maxParticipants: 50 },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const LOCATION_TYPES = [
  { value: 'fixed', label: 'Fixed Location', icon: MapPin },
  { value: 'travel', label: 'I Travel to Client', icon: MapPin },
  { value: 'virtual', label: 'Virtual/Online', icon: VideoIcon },
];

export default function SessionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trainer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('');
  const [sessionType, setSessionType] = useState('one_on_one');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [skillLevel, setSkillLevel] = useState('All Levels');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [pricePerSession, setPricePerSession] = useState('');
  const [pricingNotes, setPricingNotes] = useState('');
  const [locationType, setLocationType] = useState('fixed');
  const [locationAddress, setLocationAddress] = useState('');
  const [travelRadius, setTravelRadius] = useState(25);
  const [videoPlatform, setVideoPlatform] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Existing media URLs
  const [existingBannerUrl, setExistingBannerUrl] = useState('');
  const [existingVideoUrl, setExistingVideoUrl] = useState('');

  // New media files
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && trainer) {
      loadSession();
    }
  }, [id, trainer]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('id', id)
        .eq('trainer_id', trainer?.id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setDescription(data.description || '');
        setSport(data.sport);
        setSessionType(data.session_type);
        setDurationMinutes(data.duration_minutes);
        setMaxParticipants(data.max_participants || 1);
        setSkillLevel(data.skill_level || 'All Levels');
        setPricePerPerson(data.price_per_person?.toString() || '');
        setPricePerSession(data.price_per_session?.toString() || '');
        setPricingNotes(data.pricing_notes || '');
        setLocationType(data.location_type);
        setIsActive(data.is_active);

        // Set existing media
        setExistingBannerUrl(data.banner_image_url || '');
        setExistingVideoUrl(data.promo_video_url || '');

        // Parse location data
        if (data.location_data) {
          if (data.location_type === 'fixed') {
            setLocationAddress(data.location_data.address || '');
          } else if (data.location_type === 'travel') {
            setTravelRadius(data.location_data.travel_radius || 25);
          } else if (data.location_type === 'virtual') {
            setVideoPlatform(data.location_data.video_platform || '');
          }
        }
      }
    } catch (err) {
      handleError(err, 'Failed to load session');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Banner image must be less than 10MB');
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('Promo video must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!trainer) throw new Error('No trainer profile found');
      if (!title || !sport || !sessionType) {
        throw new Error('Please fill in all required fields');
      }

      let bannerUrl = existingBannerUrl;
      let videoUrl = existingVideoUrl;

      // Upload new banner if provided
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${trainer.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('session-media')
          .upload(fileName, bannerFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('session-media')
          .getPublicUrl(fileName);

        bannerUrl = publicData.publicUrl;
      }

      // Upload new video if provided
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${trainer.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('session-media')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('session-media')
          .getPublicUrl(fileName);

        videoUrl = publicData.publicUrl;
      }

      // Build location data
      let locationData: any = {};
      if (locationType === 'fixed') {
        locationData = { address: locationAddress };
      } else if (locationType === 'travel') {
        locationData = { travel_radius: travelRadius };
      } else if (locationType === 'virtual') {
        locationData = { video_platform: videoPlatform };
      }

      // Update session
      const { error: updateError } = await supabase
        .from('training_sessions')
        .update({
          title,
          description,
          sport,
          session_type: sessionType,
          banner_image_url: bannerUrl,
          promo_video_url: videoUrl,
          duration_minutes: durationMinutes,
          max_participants: sessionType === 'one_on_one' ? null : maxParticipants,
          skill_level: skillLevel,
          price_per_person: pricePerPerson ? parseFloat(pricePerPerson) : null,
          price_per_session: pricePerSession ? parseFloat(pricePerSession) : null,
          pricing_notes: pricingNotes || null,
          location_type: locationType,
          location_data: locationData,
          is_active: isActive,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      showToast.success('Session updated successfully!');
      navigate('/sessions');
    } catch (err) {
      const errorMessage = handleError(err, 'Failed to update session');
      setError(errorMessage);
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[rgb(0,113,227)] hover:text-[rgb(0,113,227)]/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <AppleHeading level={1} size="section">
            Edit Training Session
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            Update session details and media
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Active Status Toggle */}
          <AppleCard variant="default" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-1">Session Status</h3>
                <p className="text-sm text-[rgb(134,142,150)]">
                  {isActive ? 'Session is visible and bookable' : 'Session is hidden from marketplace'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isActive ? 'bg-[rgb(0,113,227)]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </AppleCard>

          {/* Basic Information */}
          <AppleCard variant="default" padding="lg">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
              Basic Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Advanced Pitching Mechanics"
                  className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what participants will learn and experience..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Sport *
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                    required
                  >
                    <option value="">Select sport</option>
                    {TRAVEL_SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                  >
                    {SKILL_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </AppleCard>

          {/* Session Details */}
          <AppleCard variant="default" padding="lg">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
              Session Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Session Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SESSION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSessionType(type.value);
                        setMaxParticipants(type.maxParticipants);
                      }}
                      className={`p-4 rounded-xl border-[1.5px] transition-all text-left ${
                        sessionType === type.value
                          ? 'border-[rgb(0,113,227)] bg-[rgb(0,113,227)]/5'
                          : 'border-slate-200 hover:border-[rgb(0,113,227)]/50'
                      }`}
                    >
                      <div className="font-semibold text-[rgb(29,29,31)]">{type.label}</div>
                      <div className="text-sm text-[rgb(134,142,150)] mt-1">
                        Max {type.maxParticipants} participant{type.maxParticipants > 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    min="15"
                    step="15"
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                  />
                </div>

                {sessionType !== 'one_on_one' && (
                  <div>
                    <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                      min="2"
                      className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          </AppleCard>

          {/* Rich Media - Similar structure to SessionCreate but showing existing media */}
          <AppleCard variant="default" padding="lg">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <ImageIcon className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
              Rich Media
            </h2>

            <div className="space-y-6">
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Banner Image
                </label>
                <p className="text-sm text-[rgb(134,142,150)] mb-3">
                  {bannerPreview || existingBannerUrl ? 'Click to replace' : 'Upload new banner (max 10MB)'}
                </p>

                {bannerPreview || existingBannerUrl ? (
                  <div className="relative">
                    <img
                      src={bannerPreview || existingBannerUrl}
                      alt="Banner"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview('');
                        if (!bannerPreview) setExistingBannerUrl('');
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-slate-100 text-[rgb(29,29,31)] rounded-lg font-semibold transition-colors"
                    >
                      Replace Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full h-64 border-[1.5px] border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-[rgb(0,113,227)] hover:bg-[rgb(0,113,227)]/5 transition-all"
                  >
                    <Upload className="w-12 h-12 text-[rgb(134,142,150)] mb-3" />
                    <p className="text-[rgb(29,29,31)] font-semibold">Click to upload banner image</p>
                    <p className="text-sm text-[rgb(134,142,150)] mt-1">PNG, JPG up to 10MB</p>
                  </button>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </div>

              {/* Promo Video - similar structure */}
              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Promo Video
                </label>
                <p className="text-sm text-[rgb(134,142,150)] mb-3">
                  {videoPreview || existingVideoUrl ? 'Click to replace' : 'Upload new video (max 500MB)'}
                </p>

                {videoPreview || existingVideoUrl ? (
                  <div className="relative">
                    <video
                      src={videoPreview || existingVideoUrl}
                      controls
                      className="w-full h-64 object-cover rounded-xl bg-black"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview('');
                        if (!videoPreview) setExistingVideoUrl('');
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-64 border-[1.5px] border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-[rgb(0,113,227)] hover:bg-[rgb(0,113,227)]/5 transition-all"
                  >
                    <VideoIcon className="w-12 h-12 text-[rgb(134,142,150)] mb-3" />
                    <p className="text-[rgb(29,29,31)] font-semibold">Click to upload promo video</p>
                    <p className="text-sm text-[rgb(134,142,150)] mt-1">MP4, MOV up to 500MB</p>
                  </button>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </AppleCard>

          {/* Pricing */}
          <AppleCard variant="default" padding="lg">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
              Pricing
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Price Per Person
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(134,142,150)]">
                      $
                    </span>
                    <input
                      type="number"
                      value={pricePerPerson}
                      onChange={(e) => setPricePerPerson(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Price Per Session
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(134,142,150)]">
                      $
                    </span>
                    <input
                      type="number"
                      value={pricePerSession}
                      onChange={(e) => setPricePerSession(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Pricing Notes
                </label>
                <textarea
                  value={pricingNotes}
                  onChange={(e) => setPricingNotes(e.target.value)}
                  placeholder="e.g., Discounts for packages, early bird pricing..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all resize-none"
                />
              </div>
            </div>
          </AppleCard>

          {/* Location */}
          <AppleCard variant="default" padding="lg">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
              Location
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {LOCATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setLocationType(type.value)}
                    className={`p-4 rounded-xl border-[1.5px] transition-all ${
                      locationType === type.value
                        ? 'border-[rgb(0,113,227)] bg-[rgb(0,113,227)]/5'
                        : 'border-slate-200 hover:border-[rgb(0,113,227)]/50'
                    }`}
                  >
                    <type.icon className="w-6 h-6 text-[rgb(0,113,227)] mb-2" />
                    <div className="font-semibold text-[rgb(29,29,31)]">{type.label}</div>
                  </button>
                ))}
              </div>

              {locationType === 'fixed' && (
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Location Address
                  </label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g., 123 Main St, City, State"
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                  />
                </div>
              )}

              {locationType === 'travel' && (
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Travel Radius (miles)
                  </label>
                  <input
                    type="number"
                    value={travelRadius}
                    onChange={(e) => setTravelRadius(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                  />
                </div>
              )}

              {locationType === 'virtual' && (
                <div>
                  <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                    Video Platform
                  </label>
                  <input
                    type="text"
                    value={videoPlatform}
                    onChange={(e) => setVideoPlatform(e.target.value)}
                    placeholder="e.g., Zoom, Google Meet, etc."
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                  />
                </div>
              )}
            </div>
          </AppleCard>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-[1.5px] border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <AppleButton
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </AppleButton>
            <AppleButton
              type="submit"
              variant="primary"
              disabled={saving}
              leftIcon={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </AppleButton>
          </div>
        </form>
      </div>
    </div>
  );
}
