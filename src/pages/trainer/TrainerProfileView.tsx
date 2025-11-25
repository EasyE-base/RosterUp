import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleBadge,
  AppleAvatar,
} from '@/components/apple';
import {
  ArrowLeft,
  MapPin,
  Award,
  Video,
  Trophy,
  Star,
  Mail,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface Trainer {
  id: string;
  user_id: string;
  headshot_url: string | null;
  intro_video_url: string | null;
  athletic_background: any[];
  coaching_background: any[];
  certifications: any[];
  specializations: string[];
  sports: string[];
  bio: string | null;
  tagline: string | null;
  travel_radius_miles: number | null;
  latitude: number | null;
  longitude: number | null;
  pricing_info: any;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  total_sessions: number;
  city: string | null;
  state: string | null;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface TrainingSession {
  id: string;
  title: string;
  sport: string;
  session_type: string;
  duration_minutes: number;
  price_per_person: number | null;
  price_per_session: number | null;
  is_active: boolean;
}

export default function TrainerProfileView() {
  const { id } = useParams<{ id: string }>();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (id) {
      loadTrainerProfile();
      loadTrainerSessions();
    }
  }, [id]);

  const loadTrainerProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTrainer(data);
    } catch (err) {
      handleError(err, 'Failed to load trainer profile');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainerSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('trainer_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      one_on_one: '1-on-1',
      small_group: 'Small Group',
      clinic: 'Clinic',
      team_practice: 'Team Practice',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(247,247,249)]">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(247,247,249)]">
        <AppleCard variant="default" padding="xl">
          <p className="text-[rgb(134,142,150)]">Trainer not found</p>
        </AppleCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/trainers"
          className="inline-flex items-center text-[rgb(0,113,227)] hover:text-[rgb(0,113,227)]/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Trainers
        </Link>

        {/* Hero Section with Video */}
        <AppleCard variant="default" padding="none" className="mb-8 overflow-hidden">
          <div className="relative">
            {trainer.intro_video_url && !videoPlaying ? (
              <div
                className="relative h-96 bg-gradient-to-br from-indigo-500 to-purple-500 cursor-pointer group"
                onClick={() => setVideoPlaying(true)}
              >
                {trainer.headshot_url && (
                  <img
                    src={trainer.headshot_url}
                    alt={trainer.profiles.full_name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            ) : trainer.intro_video_url && videoPlaying ? (
              <video
                src={trainer.intro_video_url}
                controls
                autoPlay
                className="w-full h-96 bg-black"
              />
            ) : (
              <div className="h-96 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                {trainer.headshot_url ? (
                  <img
                    src={trainer.headshot_url}
                    alt={trainer.profiles.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Award className="w-32 h-32 text-white/30" />
                )}
              </div>
            )}

            {/* Featured Badge */}
            {trainer.is_featured && (
              <div className="absolute top-6 left-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-full">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="text-sm font-bold text-white">Featured</span>
                </div>
              </div>
            )}
          </div>

          {/* Trainer Info */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Avatar & Name */}
              <div className="flex items-start gap-4">
                <AppleAvatar
                  src={trainer.headshot_url}
                  name={trainer.profiles.full_name}
                  size="2xl"
                  color="blue"
                />
                <div>
                  <h1 className="text-3xl font-bold text-[rgb(29,29,31)] mb-2">
                    {trainer.profiles.full_name}
                  </h1>
                  {trainer.tagline && (
                    <p className="text-lg text-[rgb(134,142,150)] mb-3">
                      {trainer.tagline}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold text-[rgb(29,29,31)]">
                        {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'New Trainer'}
                      </span>
                    </div>
                    {trainer.total_reviews > 0 && (
                      <span className="text-sm text-[rgb(134,142,150)]">
                        ({trainer.total_reviews} review{trainer.total_reviews !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  {(trainer.city || trainer.state) && (
                    <div className="flex items-center text-[rgb(134,142,150)] mb-3">
                      <MapPin className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                      {trainer.city}, {trainer.state}
                      {trainer.travel_radius_miles && (
                        <span className="ml-2 text-sm">
                          • {trainer.travel_radius_miles} mile radius
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contact */}
                  <div className="flex items-center text-[rgb(134,142,150)]">
                    <Mail className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                    {trainer.profiles.email}
                  </div>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="lg:ml-auto flex flex-col gap-3">
                <AppleButton
                  variant="primary"
                  size="lg"
                  leftIcon={<Calendar className="w-5 h-5" />}
                >
                  Book a Session
                </AppleButton>
                <AppleButton
                  variant="outline"
                  size="lg"
                  leftIcon={<Mail className="w-5 h-5" />}
                >
                  Send Message
                </AppleButton>
              </div>
            </div>

            {/* Sports & Specializations */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainer.sports && trainer.sports.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(29,29,31)] mb-3 flex items-center">
                      <Trophy className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                      Sports
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.sports.map((sport) => (
                        <AppleBadge key={sport} variant="primary">
                          {sport}
                        </AppleBadge>
                      ))}
                    </div>
                  </div>
                )}

                {trainer.specializations && trainer.specializations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(29,29,31)] mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.specializations.map((spec) => (
                        <AppleBadge key={spec} variant="info">
                          {spec}
                        </AppleBadge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppleCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Bio & Background */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            {trainer.bio && (
              <AppleCard variant="default" padding="lg">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-4">About</h2>
                <p className="text-[rgb(134,142,150)] leading-relaxed whitespace-pre-wrap">
                  {trainer.bio}
                </p>
              </AppleCard>
            )}

            {/* Athletic Background Timeline */}
            {trainer.athletic_background && trainer.athletic_background.length > 0 && (
              <AppleCard variant="default" padding="lg">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
                  Athletic Background
                </h2>
                <div className="space-y-4">
                  {trainer.athletic_background.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-[rgb(0,113,227)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-[rgb(0,113,227)]" />
                        </div>
                        {index < trainer.athletic_background.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="text-sm font-semibold text-[rgb(0,113,227)] mb-1">
                          {item.year}
                        </div>
                        <h3 className="font-bold text-[rgb(29,29,31)] mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[rgb(134,142,150)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AppleCard>
            )}

            {/* Coaching Background Timeline */}
            {trainer.coaching_background && trainer.coaching_background.length > 0 && (
              <AppleCard variant="default" padding="lg">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-[rgb(0,113,227)]" />
                  Coaching Experience
                </h2>
                <div className="space-y-4">
                  {trainer.coaching_background.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        {index < trainer.coaching_background.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="text-sm font-semibold text-green-600 mb-1">
                          {item.year}
                        </div>
                        <h3 className="font-bold text-[rgb(29,29,31)] mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[rgb(134,142,150)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AppleCard>
            )}

            {/* Certifications */}
            {trainer.certifications && trainer.certifications.length > 0 && (
              <AppleCard variant="default" padding="lg">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6">
                  Certifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainer.certifications.map((cert: any, index: number) => (
                    <div key={index} className="p-4 bg-[rgb(247,247,249)] rounded-xl">
                      <h3 className="font-bold text-[rgb(29,29,31)] mb-1">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-[rgb(134,142,150)] mb-1">
                        {cert.issuer}
                      </p>
                      <p className="text-xs text-[rgb(0,113,227)]">{cert.year}</p>
                    </div>
                  ))}
                </div>
              </AppleCard>
            )}

            {/* Available Sessions */}
            {sessions.length > 0 && (
              <AppleCard variant="default" padding="lg">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6">
                  Available Training Sessions
                </h2>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-[rgb(247,247,249)] rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-[rgb(29,29,31)] mb-2">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <AppleBadge variant="primary" size="sm">
                              {session.sport}
                            </AppleBadge>
                            <AppleBadge variant="info" size="sm">
                              {getSessionTypeLabel(session.session_type)}
                            </AppleBadge>
                            <span className="text-sm text-[rgb(134,142,150)]">
                              {session.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {session.price_per_person && (
                            <div className="text-lg font-bold text-[rgb(29,29,31)] flex items-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              {session.price_per_person}
                              <span className="text-sm text-[rgb(134,142,150)] ml-1">/person</span>
                            </div>
                          )}
                          {session.price_per_session && (
                            <div className="text-lg font-bold text-[rgb(29,29,31)] flex items-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              {session.price_per_session}
                              <span className="text-sm text-[rgb(134,142,150)] ml-1">/session</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AppleCard>
            )}
          </div>

          {/* Right Column: Pricing & Stats */}
          <div className="space-y-6">
            {/* Pricing Info */}
            {trainer.pricing_info && trainer.pricing_info.show_pricing && (
              <AppleCard variant="default" padding="lg">
                <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  {trainer.pricing_info.hourly_rate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(134,142,150)]">1-on-1 Rate</span>
                      <span className="font-bold text-[rgb(29,29,31)]">
                        ${trainer.pricing_info.hourly_rate}/hr
                      </span>
                    </div>
                  )}
                  {trainer.pricing_info.group_rate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(134,142,150)]">Group Rate</span>
                      <span className="font-bold text-[rgb(29,29,31)]">
                        ${trainer.pricing_info.group_rate}/hr
                      </span>
                    </div>
                  )}
                </div>
              </AppleCard>
            )}

            {/* Stats */}
            <AppleCard variant="default" padding="lg">
              <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(134,142,150)]">Total Sessions</span>
                  <span className="font-bold text-[rgb(29,29,31)]">
                    {trainer.total_sessions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(134,142,150)]">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-[rgb(29,29,31)]">
                      {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(134,142,150)]">Reviews</span>
                  <span className="font-bold text-[rgb(29,29,31)]">
                    {trainer.total_reviews}
                  </span>
                </div>
              </div>
            </AppleCard>

            {/* CTA Card */}
            <AppleCard
              variant="feature"
              padding="lg"
              className="bg-gradient-to-br from-blue-500 to-cyan-400"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Ready to Train?
                </h3>
                <p className="text-white/90 mb-4">
                  Book a session and start improving your game today
                </p>
                <AppleButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="bg-white hover:bg-white/90 text-[rgb(0,113,227)] border-white"
                  leftIcon={<Calendar className="w-5 h-5" />}
                >
                  Book Now
                </AppleButton>
              </div>
            </AppleCard>
          </div>
        </div>
      </div>
    </div>
  );
}
