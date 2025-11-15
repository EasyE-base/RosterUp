import { useState, useEffect } from 'react';
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
  Edit3,
  Eye,
  Shield,
  Save,
  X,
  Video,
  BarChart3,
  Award,
  FolderOpen,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, PlayerProfile as PlayerProfileType } from '../../lib/supabase';
import { TRAVEL_SPORTS, AGE_GROUPS, getPositionsBySport, US_STATES } from '../../constants/playerConstants';
import { CLASSIFICATION_LEVELS } from '../../constants/classifications';
import PositionTagSelector from '../../components/player/PositionTagSelector';
import PhotoGalleryManager from '../../components/player/media/PhotoGalleryManager';
import VideoHighlightsManager from '../../components/player/media/VideoHighlightsManager';
import DocumentManager from '../../components/player/media/DocumentManager';
import StatsManager from '../../components/player/stats/StatsManager';
import ProfileAnalytics from '../../components/player/analytics/ProfileAnalytics';

type TabType = 'overview' | 'photos' | 'videos' | 'documents' | 'stats' | 'analytics';

export default function PlayerProfile() {
  const { user, player } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profileData, setProfileData] = useState<PlayerProfileType | null>(null);

  const [formData, setFormData] = useState({
    sport: '',
    age_group: '',
    classification: '',
    positions: [] as string[],
    bio: '',
    location_city: '',
    location_state: '',
    photo_url: '',
    banner_url: '',
    banner_color: '#1e3a8a',
    is_visible_in_search: true,
  });

  useEffect(() => {
    loadProfile();
  }, [player?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        navigate('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('player_profiles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        navigate('/player/profile/create');
        return;
      }

      setProfileData(data);
      setFormData({
        sport: data.sport || '',
        age_group: data.age_group || '',
        classification: data.classification || '',
        positions: data.position || [],
        bio: data.bio || '',
        location_city: data.location_city || '',
        location_state: data.location_state || '',
        photo_url: data.photo_url || '',
        banner_url: data.banner_url || '',
        banner_color: data.banner_color || '#1e3a8a',
        is_visible_in_search: data.is_visible_in_search ?? true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!profileData?.id) {
        throw new Error('No player profile found');
      }

      console.log('🔍 Attempting profile update with data:', {
        sport: formData.sport,
        age_group: formData.age_group || null,
        classification: formData.classification || null,
        position: formData.positions.length > 0 ? formData.positions : null,
        profileId: profileData.id
      });

      const { error: updateError } = await supabase
        .from('player_profiles')
        .update({
          sport: formData.sport,
          age_group: formData.age_group || null,
          classification: formData.classification || null,
          position: formData.positions.length > 0 ? formData.positions : null,
          bio: formData.bio || null,
          location_city: formData.location_city || null,
          location_state: formData.location_state || null,
          photo_url: formData.photo_url || null,
          banner_url: formData.banner_url || null,
          banner_color: formData.banner_color || '#1e3a8a',
          is_visible_in_search: formData.is_visible_in_search,
        })
        .eq('id', profileData.id);

      if (updateError) {
        console.error('❌ PROFILE UPDATE FAILED:', updateError);
        console.error('   Code:', updateError.code);
        console.error('   Message:', updateError.message);
        console.error('   Details:', updateError.details);
        console.error('   Hint:', updateError.hint);
        throw updateError;
      }

      console.log('✅ Profile update successful!');

      setSuccess('Profile updated successfully!');
      setEditMode(false);
      await loadProfile();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        sport: profileData.sport || '',
        age_group: profileData.age_group || '',
        classification: profileData.classification || '',
        positions: profileData.position || [],
        bio: profileData.bio || '',
        location_city: profileData.location_city || '',
        location_state: profileData.location_state || '',
        photo_url: profileData.photo_url || '',
        is_visible_in_search: profileData.is_visible_in_search ?? true,
      });
    }
    setEditMode(false);
    setError('');
  };

  const handleProfilePhotoUpload = async (file: File) => {
    try {
      if (!profileData?.id || !user?.id) {
        throw new Error('No player profile found');
      }

      setError('');
      setSuccess('Uploading profile photo...');

      // Import image compression library dynamically
      const imageCompression = (await import('browser-image-compression')).default;

      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Upload to Supabase storage using the photos folder structure to match existing RLS
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `photos/${user.id}/profile-photo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('player-media')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('player-media')
        .getPublicUrl(fileName);

      // Add timestamp to force browser to reload the image
      const photoUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Save to database immediately
      const { error: updateError } = await supabase
        .from('player_profiles')
        .update({ photo_url: publicUrl })
        .eq('id', profileData.id);

      if (updateError) {
        throw updateError;
      }

      // Update both form data and profile data with timestamped URL for display
      setFormData(prev => ({ ...prev, photo_url: photoUrlWithTimestamp }));
      setProfileData(prev => prev ? { ...prev, photo_url: photoUrlWithTimestamp } : null);

      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);

      console.log('✅ Profile photo uploaded successfully!', publicUrl);
    } catch (err) {
      console.error('❌ Profile photo upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload profile photo');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      if (!profileData?.id || !user?.id) {
        throw new Error('No player profile found');
      }

      setError('');
      setSuccess('Uploading banner image...');

      // Import image compression library dynamically
      const imageCompression = (await import('browser-image-compression')).default;

      // Compress image (larger size for banners)
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Upload to Supabase storage
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `photos/${user.id}/banner.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('player-media')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('player-media')
        .getPublicUrl(fileName);

      // Add timestamp to force browser to reload the image
      const bannerUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Save to database immediately
      const { error: updateError } = await supabase
        .from('player_profiles')
        .update({ banner_url: publicUrl })
        .eq('id', profileData.id);

      if (updateError) {
        throw updateError;
      }

      // Update both form data and profile data with timestamped URL for display
      setFormData(prev => ({ ...prev, banner_url: bannerUrlWithTimestamp }));
      setProfileData(prev => prev ? { ...prev, banner_url: bannerUrlWithTimestamp } : null);

      setSuccess('Banner image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);

      console.log('✅ Banner image uploaded successfully!', publicUrl);
    } catch (err) {
      console.error('❌ Banner upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload banner image');
      setTimeout(() => setError(''), 5000);
    }
  };

  const classificationLevel = CLASSIFICATION_LEVELS.find(
    (level) => level.value === (editMode ? formData.classification : profileData?.classification)
  );

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'photos' as TabType, label: 'Photos', icon: Camera },
    { id: 'videos' as TabType, label: 'Video Highlights', icon: Video },
    { id: 'documents' as TabType, label: 'Documents', icon: FolderOpen },
    { id: 'stats' as TabType, label: 'Statistics', icon: BarChart3 },
    { id: 'analytics' as TabType, label: 'Analytics', icon: Award },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No player profile found. Redirecting to create page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[rgb(29,29,31)]">My Recruiting Profile</h1>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => navigate(`/players/${profileData?.id}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:bg-[rgb(247,247,249)] transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Public Profile</span>
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:bg-[rgb(247,247,249)] transition-all disabled:opacity-50 shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.sport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Profile Header - Resume Style */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          {/* Banner - Custom image or solid color */}
          <div
            className="relative h-48"
            style={{
              backgroundColor: editMode ? formData.banner_color : (profileData.banner_color || '#1e3a8a'),
              backgroundImage: (editMode ? formData.banner_url : profileData.banner_url)
                ? `url(${editMode ? formData.banner_url : profileData.banner_url})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Classification Badge */}
            {classificationLevel && (
              <div className="absolute top-6 left-6">
                <div className="px-4 py-2 rounded-full bg-white/90 border border-slate-200 backdrop-blur-sm flex items-center space-x-2 shadow-sm">
                  <Shield className="w-4 h-4 text-[rgb(0,113,227)]" />
                  <span className="font-bold text-[rgb(29,29,31)]">{classificationLevel.label}</span>
                </div>
              </div>
            )}

            {/* Profile Views */}
            <div className="absolute top-6 right-6 flex items-center space-x-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
              <Eye className="w-4 h-4 text-[rgb(134,142,150)]" />
              <span className="text-sm text-[rgb(29,29,31)]">{profileData.profile_views} views</span>
            </div>

            {/* Banner Customization - Only visible in edit mode */}
            {editMode && (
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                {/* Color Picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={formData.banner_color}
                    onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })}
                    className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer bg-white"
                    title="Choose banner color"
                  />
                </div>

                {/* Upload Banner Image Button */}
                <button
                  onClick={() => document.getElementById('banner-image-input')?.click()}
                  className="px-4 py-2 bg-white/90 hover:bg-white text-[rgb(29,29,31)] rounded-lg border border-slate-200 flex items-center space-x-2 backdrop-blur-sm transition-all shadow-sm"
                  title="Upload banner image"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Banner</span>
                </button>

                {/* Hidden file input for banner */}
                <input
                  id="banner-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleBannerUpload(file);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="p-8 bg-white">
            <div className="flex items-start space-x-6">
              {/* Profile Photo */}
              <div className="flex-shrink-0 relative group">
                {(editMode ? formData.photo_url : profileData.photo_url) ? (
                  <img
                    src={editMode ? formData.photo_url : profileData.photo_url}
                    alt="Player"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg -mt-16"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[rgb(247,247,249)] border-4 border-white flex items-center justify-center -mt-16 shadow-lg">
                    <User className="w-16 h-16 text-[rgb(134,142,150)]" />
                  </div>
                )}

                {/* Upload Button - Always visible in edit mode, or on hover */}
                {editMode && (
                  <button
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[rgb(0,113,227)] hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all border-2 border-white"
                    title="Upload profile photo"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                )}

                {/* Hidden file input */}
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProfilePhotoUpload(file);
                    }
                  }}
                />
              </div>

              {/* Player Info */}
              <div className="flex-1 pt-2">
                {profileData.profiles?.full_name && (
                  <h2 className="text-4xl font-bold text-[rgb(29,29,31)] mb-2">{profileData.profiles.full_name}</h2>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-[rgb(0,113,227)]" />
                    <span className="text-xl font-bold text-[rgb(0,113,227)]">{profileData.sport}</span>
                  </div>
                  {profileData.age_group && (
                    <span className="px-3 py-1 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] text-sm rounded-full">
                      {profileData.age_group}
                    </span>
                  )}
                  {(profileData.location_city || profileData.location_state) && (
                    <div className="flex items-center space-x-2 text-[rgb(134,142,150)]">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {profileData.location_city}
                        {profileData.location_city && profileData.location_state && ', '}
                        {profileData.location_state}
                      </span>
                    </div>
                  )}
                </div>

                {profileData.position && profileData.position.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.position.map((pos) => (
                      <span key={pos} className="px-3 py-1 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] rounded-full text-sm">
                        {pos}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Completeness */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-[rgb(134,142,150)] mb-2">Profile Completeness</p>
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileData.profile_completeness / 100)}`}
                      className={
                        profileData.profile_completeness >= 80
                          ? 'text-green-500'
                          : profileData.profile_completeness >= 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[rgb(29,29,31)]">{profileData.profile_completeness}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[rgb(0,113,227)] bg-[rgb(0,113,227)]/5 text-[rgb(0,113,227)]'
                      : 'border-transparent text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] hover:bg-[rgb(247,247,249)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {editMode ? (
                <div className="space-y-6">
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[rgb(0,113,227)]" />
                      Basic Information
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                          Primary Sport *
                        </label>
                        <select
                          value={formData.sport}
                          onChange={(e) =>
                            setFormData({ ...formData, sport: e.target.value, positions: [] })
                          }
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
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
                          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                            Age Group
                          </label>
                          <select
                            value={formData.age_group}
                            onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
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
                          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                            Classification
                          </label>
                          <select
                            value={formData.classification}
                            onChange={(e) =>
                              setFormData({ ...formData, classification: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                          >
                            <option value="">Select classification</option>
                            {CLASSIFICATION_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                          Positions (Select Multiple)
                        </label>
                        <PositionTagSelector
                          sport={formData.sport}
                          selectedPositions={formData.positions}
                          availablePositions={getPositionsBySport(formData.sport)}
                          onChange={(positions) => setFormData({ ...formData, positions })}
                          disabled={saving}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">City</label>
                          <input
                            type="text"
                            value={formData.location_city}
                            onChange={(e) =>
                              setFormData({ ...formData, location_city: e.target.value })
                            }
                            placeholder="e.g., San Diego"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">State</label>
                          <select
                            value={formData.location_state}
                            onChange={(e) =>
                              setFormData({ ...formData, location_state: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
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

                      <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell coaches about your experience, achievements, and goals..."
                          rows={6}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                        />
                        <p className="mt-2 text-xs text-[rgb(134,142,150)]">
                          {formData.bio.length} characters
                        </p>
                      </div>

                      {/* Profile Photo URL is managed automatically via the camera upload button */}

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="visible"
                          checked={formData.is_visible_in_search}
                          onChange={(e) =>
                            setFormData({ ...formData, is_visible_in_search: e.target.checked })
                          }
                          className="w-4 h-4 text-[rgb(0,113,227)] bg-white border-slate-200 rounded focus:ring-[rgb(0,113,227)]"
                        />
                        <label htmlFor="visible" className="text-sm text-[rgb(29,29,31)]">
                          Make my profile visible in player search
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* About Section */}
                  {profileData.bio && (
                    <div>
                      <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-4 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-[rgb(0,113,227)]" />
                        About Me
                      </h3>
                      <p className="text-[rgb(29,29,31)] whitespace-pre-wrap leading-relaxed">{profileData.bio}</p>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4">
                        <span className="text-sm text-[rgb(134,142,150)]">Sport</span>
                        <p className="text-lg font-semibold text-[rgb(29,29,31)] mt-1">{profileData.sport}</p>
                      </div>

                      {profileData.age_group && (
                        <div className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4">
                          <span className="text-sm text-[rgb(134,142,150)]">Age Group</span>
                          <p className="text-lg font-semibold text-[rgb(29,29,31)] mt-1">{profileData.age_group}</p>
                        </div>
                      )}

                      {profileData.classification && (
                        <div className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4">
                          <span className="text-sm text-[rgb(134,142,150)]">Classification</span>
                          <p className="text-lg font-semibold text-[rgb(29,29,31)] mt-1">
                            {classificationLevel?.label || profileData.classification}
                          </p>
                        </div>
                      )}

                      <div className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4">
                        <span className="text-sm text-[rgb(134,142,150)]">Profile Visibility</span>
                        <p className="text-lg font-semibold text-[rgb(29,29,31)] mt-1">
                          {profileData.is_visible_in_search ? 'Visible in search' : 'Hidden from search'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-2 text-[rgb(0,113,227)]" />
                Photo Gallery
              </h3>
              <PhotoGalleryManager playerId={profileData.id} editMode={editMode} />
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                <Video className="w-6 h-6 mr-2 text-purple-500" />
                Video Highlights
              </h3>
              <VideoHighlightsManager playerId={profileData.id} editMode={editMode} />
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                <FolderOpen className="w-6 h-6 mr-2 text-yellow-600" />
                Documents & Transcripts
              </h3>
              <DocumentManager playerId={profileData.id} editMode={editMode} />
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div>
              <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                Season Statistics
              </h3>
              <StatsManager
                playerId={profileData.id}
                sport={profileData.sport}
                editMode={editMode}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-cyan-600" />
                Profile Analytics
              </h3>
              <ProfileAnalytics playerId={profileData.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
