import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { handleError } from '../../lib/toast';
import {
  AppleHeading,
  AppleButton,
  AppleCard,
  AppleBadge,
  AppleEmptyState,
} from '@/components/apple';
import {
  Search,
  MapPin,
  Award,
  Video,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  Filter,
} from 'lucide-react';

const TRAVEL_SPORTS = [
  'All Sports',
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

interface Trainer {
  id: string;
  user_id: string;
  headshot_url: string | null;
  intro_video_url: string | null;
  specializations: string[];
  sports: string[];
  bio: string | null;
  tagline: string | null;
  is_featured: boolean;
  featured_priority: number;
  rating: number;
  total_reviews: number;
  total_sessions: number;
  city: string | null;
  state: string | null;
  profiles: {
    full_name: string;
  };
}

export default function TrainerMarketplace() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [featuredTrainers, setFeaturedTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [showFilters, setShowFilters] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);

      // Get all trainers with profile data
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const trainersData = data || [];
      setTrainers(trainersData);

      // Separate featured trainers
      const featured = trainersData
        .filter((t: Trainer) => t.is_featured)
        .sort((a: Trainer, b: Trainer) => b.featured_priority - a.featured_priority);
      setFeaturedTrainers(featured);
    } catch (err) {
      handleError(err, 'Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = trainers.filter((trainer) => {
    // Filter by search query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      trainer.profiles.full_name.toLowerCase().includes(query) ||
      trainer.tagline?.toLowerCase().includes(query) ||
      trainer.specializations?.some(s => s.toLowerCase().includes(query));

    // Filter by sport
    const matchesSport =
      selectedSport === 'All Sports' ||
      trainer.sports?.includes(selectedSport);

    return matchesSearch && matchesSport;
  });

  const nextSlide = () => {
    setCarouselIndex((prev) =>
      prev === featuredTrainers.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? featuredTrainers.length - 1 : prev - 1
    );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <AppleHeading level={1} size="section">
            Find Your Perfect Trainer
          </AppleHeading>
          <p className="text-lg text-[rgb(134,142,150)] mt-2">
            Connect with expert coaches and trainers to elevate your game
          </p>
        </div>

        {/* Featured Trainers Carousel */}
        {featuredTrainers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[rgb(29,29,31)] flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-500" />
                Featured Trainers
              </h2>
              {featuredTrainers.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white border-[1.5px] border-slate-200 flex items-center justify-center hover:border-[rgb(0,113,227)] hover:bg-[rgb(0,113,227)]/5 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-[rgb(134,142,150)]" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-white border-[1.5px] border-slate-200 flex items-center justify-center hover:border-[rgb(0,113,227)] hover:bg-[rgb(0,113,227)]/5 transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-[rgb(134,142,150)]" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {featuredTrainers.map((trainer) => (
                  <div key={trainer.id} className="w-full flex-shrink-0">
                    <Link to={`/trainers/${trainer.id}`}>
                      <AppleCard variant="feature" padding="none" hover>
                        <div className="relative h-96 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                          {/* Background Image or Video Thumbnail */}
                          {trainer.headshot_url ? (
                            <img
                              src={trainer.headshot_url}
                              alt={trainer.profiles.full_name}
                              className="w-full h-full object-cover opacity-90"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Award className="w-32 h-32 text-white/30" />
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                          {/* Featured Badge */}
                          <div className="absolute top-6 left-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-full">
                              <Star className="w-4 h-4 text-white fill-white" />
                              <span className="text-sm font-bold text-white">Featured</span>
                            </div>
                          </div>

                          {/* Video Indicator */}
                          {trainer.intro_video_url && (
                            <div className="absolute top-6 right-6">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-8">
                            <h3 className="text-3xl font-bold text-white mb-2">
                              {trainer.profiles.full_name}
                            </h3>
                            {trainer.tagline && (
                              <p className="text-lg text-white/90 mb-4">
                                {trainer.tagline}
                              </p>
                            )}
                            <div className="flex items-center gap-4 flex-wrap mb-4">
                              {trainer.sports?.slice(0, 3).map((sport) => (
                                <AppleBadge key={sport} variant="default" size="sm" className="bg-white/20 text-white border-white/30">
                                  {sport}
                                </AppleBadge>
                              ))}
                            </div>
                            {(trainer.city || trainer.state) && (
                              <div className="flex items-center text-white/80">
                                <MapPin className="w-4 h-4 mr-2" />
                                {trainer.city}, {trainer.state}
                              </div>
                            )}
                          </div>
                        </div>
                      </AppleCard>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Carousel Indicators */}
              {featuredTrainers.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {featuredTrainers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === carouselIndex
                          ? 'bg-[rgb(0,113,227)] w-8'
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <AppleCard variant="default" padding="lg" className="mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trainers by name, specialization..."
                className="w-full pl-12 pr-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[rgb(134,142,150)] hover:text-[rgb(0,113,227)] transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-[rgb(29,29,31)] mb-2">
                  Sport
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 bg-[rgb(247,247,249)] border-[1.5px] border-slate-200 rounded-xl text-[rgb(29,29,31)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] transition-all"
                >
                  {TRAVEL_SPORTS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </AppleCard>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[rgb(134,142,150)]">
            {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || selectedSport !== 'All Sports') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSport('All Sports');
              }}
              className="text-sm text-[rgb(0,113,227)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Trainers Grid */}
        {filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <Link key={trainer.id} to={`/trainers/${trainer.id}`}>
                <AppleCard variant="default" padding="none" hover>
                  {/* Headshot or Placeholder */}
                  <div className="relative h-64 bg-gradient-to-br from-blue-500 to-cyan-400 overflow-hidden">
                    {trainer.headshot_url ? (
                      <img
                        src={trainer.headshot_url}
                        alt={trainer.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Award className="w-20 h-20 text-white/30" />
                      </div>
                    )}

                    {/* Video Indicator */}
                    {trainer.intro_video_url && (
                      <div className="absolute top-3 right-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {trainer.is_featured && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full">
                          <Star className="w-3 h-3 text-white fill-white" />
                          <span className="text-xs font-bold text-white">Featured</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-2">
                      {trainer.profiles.full_name}
                    </h3>

                    {trainer.tagline && (
                      <p className="text-sm text-[rgb(134,142,150)] mb-3 line-clamp-2">
                        {trainer.tagline}
                      </p>
                    )}

                    {/* Sports */}
                    {trainer.sports && trainer.sports.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {trainer.sports.slice(0, 3).map((sport) => (
                          <AppleBadge key={sport} variant="primary" size="sm">
                            {sport}
                          </AppleBadge>
                        ))}
                        {trainer.sports.length > 3 && (
                          <span className="text-xs text-[rgb(134,142,150)]">
                            +{trainer.sports.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Specializations */}
                    {trainer.specializations && trainer.specializations.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {trainer.specializations.slice(0, 2).map((spec) => (
                          <AppleBadge key={spec} variant="info" size="sm">
                            {spec}
                          </AppleBadge>
                        ))}
                      </div>
                    )}

                    {/* Location */}
                    {(trainer.city || trainer.state) && (
                      <div className="flex items-center text-sm text-[rgb(134,142,150)] mb-3">
                        <MapPin className="w-4 h-4 mr-2 text-[rgb(0,113,227)]" />
                        {trainer.city}, {trainer.state}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-[rgb(29,29,31)]">
                          {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'New'}
                        </span>
                        {trainer.total_reviews > 0 && (
                          <span className="text-xs text-[rgb(134,142,150)]">
                            ({trainer.total_reviews})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[rgb(134,142,150)]">
                        {trainer.total_sessions} session{trainer.total_sessions !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </AppleCard>
              </Link>
            ))}
          </div>
        ) : (
          <AppleEmptyState
            icon={<Award className="w-16 h-16" />}
            title="No Trainers Found"
            description="Try adjusting your search or filters to find the perfect trainer."
            iconColor="blue"
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedSport('All Sports');
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
