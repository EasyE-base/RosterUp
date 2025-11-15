import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Trophy,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { supabase, PlayerProfile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CLASSIFICATION_LEVELS } from '../../constants/classifications';
import ContactPlayerModal from '../../components/player/ContactPlayerModal';
import PhotoGalleryManager from '../../components/player/media/PhotoGalleryManager';
import VideoHighlightsManager from '../../components/player/media/VideoHighlightsManager';

export default function PlayerProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlayer();
      incrementProfileViews();
    }
  }, [id]);

  const loadPlayer = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('player_profiles')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Player profile not found');

      setPlayer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load player profile');
    } finally {
      setLoading(false);
    }
  };

  const incrementProfileViews = async () => {
    try {
      await supabase.rpc('increment_player_profile_views', { profile_id: id });
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  const classificationLevel = CLASSIFICATION_LEVELS.find(
    (level) => level.value === player?.classification
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-semibold mb-2">Error Loading Profile</p>
              <p className="text-red-600/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/players')}
          className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(0,113,227)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to marketplace</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          {/* Banner - Custom image or solid color */}
          <div
            className="relative h-48"
            style={{
              backgroundColor: player.banner_color || '#1e3a8a',
              backgroundImage: player.banner_url ? `url(${player.banner_url})` : 'none',
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
              <span className="text-sm text-[rgb(29,29,31)]">{player.profile_views} views</span>
            </div>
          </div>

          <div className="px-8 pb-8 pt-0 relative bg-white">
            {/* Profile Photo - Circular avatar overlapping the banner */}
            <div className="flex items-end -mt-16 mb-6">
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt="Player"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[rgb(247,247,249)] border-4 border-white flex items-center justify-center shadow-xl">
                  <User className="w-16 h-16 text-[rgb(134,142,150)]" />
                </div>
              )}
            </div>
            {/* Player Name */}
            {player.profiles?.full_name && (
              <h1 className="text-4xl font-bold text-[rgb(29,29,31)] mb-4">{player.profiles.full_name}</h1>
            )}

            {/* Sport & Position */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-[rgb(0,113,227)]" />
                <span className="text-xl font-bold text-[rgb(0,113,227)]">{player.sport}</span>
              </div>
              {player.age_group && (
                <span className="px-3 py-1 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] text-sm rounded-full">
                  {player.age_group}
                </span>
              )}
            </div>

            {/* Positions as tags */}
            {player.position && player.position.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {player.position.map((pos: string) => (
                  <span key={pos} className="px-4 py-2 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] rounded-lg text-base font-medium">
                    {pos}
                  </span>
                ))}
              </div>
            )}

            {/* Location */}
            {(player.location_city || player.location_state) && (
              <div className="flex items-center space-x-2 text-[rgb(134,142,150)] mb-6">
                <MapPin className="w-5 h-5" />
                <span>
                  {player.location_city}
                  {player.location_city && player.location_state && ', '}
                  {player.location_state}
                </span>
              </div>
            )}

            {/* Contact Button */}
            {organization && (
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full md:w-auto px-8 py-3 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
              >
                <Mail className="w-5 h-5" />
                <span>Contact Player</span>
              </button>
            )}
          </div>
        </div>

        {/* About Section */}
        {player.bio && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[rgb(29,29,31)] mb-4">About</h2>
            <p className="text-[rgb(29,29,31)] whitespace-pre-wrap leading-relaxed">{player.bio}</p>
          </div>
        )}

        {/* Profile Stats */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-[rgb(134,142,150)]">Sport</span>
              <p className="text-lg font-semibold text-[rgb(29,29,31)]">{player.sport}</p>
            </div>

            {player.age_group && (
              <div>
                <span className="text-sm text-[rgb(134,142,150)]">Age Group</span>
                <p className="text-lg font-semibold text-[rgb(29,29,31)]">{player.age_group}</p>
              </div>
            )}

            {player.position && player.position.length > 0 && (
              <div>
                <span className="text-sm text-[rgb(134,142,150)]">Positions</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {player.position.map((pos: string) => (
                    <span key={pos} className="px-3 py-1 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] rounded-lg text-sm font-medium">
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {player.classification && (
              <div>
                <span className="text-sm text-[rgb(134,142,150)]">Classification</span>
                <p className="text-lg font-semibold text-[rgb(29,29,31)]">
                  {classificationLevel?.label || player.classification}
                </p>
              </div>
            )}

            <div>
              <span className="text-sm text-[rgb(134,142,150)]">Profile Completeness</span>
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      player.profile_completeness >= 80
                        ? 'bg-green-500'
                        : player.profile_completeness >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${player.profile_completeness}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-[rgb(29,29,31)]">
                  {player.profile_completeness}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6">Photo Gallery</h2>
          <PhotoGalleryManager playerId={player.id} editMode={false} />
        </div>

        {/* Video Highlights */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[rgb(29,29,31)] mb-6">Video Highlights</h2>
          <VideoHighlightsManager playerId={player.id} editMode={false} />
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && player && (
        <ContactPlayerModal
          player={player}
          onClose={() => setShowContactModal(false)}
          onSuccess={() => {
            setShowContactModal(false);
            // Could show success message here
          }}
        />
      )}
    </div>
  );
}
