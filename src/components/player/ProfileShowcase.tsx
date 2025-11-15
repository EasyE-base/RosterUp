import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, Target, Edit, MapPin, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PlayerStats {
  profile_views: number;
  profile_views_today: number;
  profile_views_this_week: number;
  profile_views_this_month: number;
  team_interests: number;
  tryout_applications: number;
  tryout_acceptances: number;
}

interface PlayerProfileData {
  id: string;
  photo_url?: string;
  sport?: string;
  age_group?: string;
  classification?: string;
  position?: string[];
  location_city?: string;
  location_state?: string;
  bio?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export default function ProfileShowcase() {
  const { player } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (player?.id) {
      fetchPlayerData();
    }
  }, [player?.id]);

  // Refresh profile data when window gains focus (e.g., returning from profile page)
  useEffect(() => {
    const handleFocus = () => {
      if (player?.id) {
        fetchPlayerData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [player?.id]);

  const fetchPlayerData = async () => {
    try {
      // Fetch player profile with joined profiles data
      const { data: profile, error: profileError } = await supabase
        .from('player_profiles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('id', player?.id)
        .single();

      if (profileError) {
        console.error('Error fetching player profile:', profileError);
      } else {
        console.log('📸 Profile data loaded:', {
          photo_url: profile?.photo_url,
          full_name: profile?.profiles?.full_name
        });
        setProfileData(profile);
      }

      // Fetch player stats
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', player?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned", which is fine for new players
        console.error('Error fetching player stats:', error);
      } else if (data) {
        setStats(data);
      } else {
        // Initialize stats for new players
        setStats({
          profile_views: 0,
          profile_views_today: 0,
          profile_views_this_week: 0,
          profile_views_this_month: 0,
          team_interests: 0,
          tryout_applications: 0,
          tryout_acceptances: 0,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!player) return null;

  // Get player name
  const getPlayerName = () => {
    return profileData?.profiles?.full_name || 'Player Name';
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = profileData?.profiles?.full_name || 'Player';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header with gradient background */}
      <div className="relative h-32 bg-gradient-to-r from-[rgb(0,113,227)]/10 via-purple-500/10 to-pink-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDcxZTMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAyNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="relative px-6 sm:px-8 pb-8">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
          <div className="relative">
            {profileData?.photo_url ? (
              <img
                src={`${profileData.photo_url}${profileData.photo_url.includes('?') ? '&' : '?'}t=${Date.now()}`}
                alt={getPlayerName()}
                className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-[rgb(0,113,227)] to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                {getInitials()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[rgb(29,29,31)] mb-1">
                  {getPlayerName()}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-[rgb(134,142,150)] mb-2">
                  {profileData?.sport && (
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span className="capitalize">{profileData.sport}</span>
                    </div>
                  )}
                  {(profileData?.location_city || profileData?.location_state) && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[profileData.location_city, profileData.location_state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {profileData?.age_group && (
                    <span className="text-sm">{profileData.age_group}</span>
                  )}
                </div>
                {profileData?.position && profileData.position.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.position.map((position: string) => (
                      <span
                        key={position}
                        className="px-3 py-1 bg-[rgb(0,113,227)]/10 border border-[rgb(0,113,227)]/20 text-[rgb(0,113,227)] rounded-full text-sm font-medium"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/player/profile"
                className="mt-4 sm:mt-0 px-4 py-2 bg-[rgb(0,113,227)] hover:bg-blue-600 text-white rounded-lg transition-all flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profileData?.bio && (
          <div className="mt-6 p-4 bg-[rgb(247,247,249)] rounded-lg border border-slate-200">
            <p className="text-[rgb(29,29,31)] text-sm leading-relaxed">{profileData.bio}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-[rgb(0,113,227)]" />
              {stats && stats.profile_views_today > 0 && (
                <span className="flex items-center text-xs text-green-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats.profile_views_today}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[rgb(29,29,31)]">
              {loading ? '...' : stats?.profile_views || 0}
            </p>
            <p className="text-xs text-[rgb(134,142,150)] mt-1">Profile Views</p>
          </div>

          <div className="bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-[rgb(29,29,31)]">
              {loading ? '...' : stats?.team_interests || 0}
            </p>
            <p className="text-xs text-[rgb(134,142,150)] mt-1">Team Interests</p>
          </div>

          <div className="bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-[rgb(29,29,31)]">
              {loading ? '...' : stats?.tryout_applications || 0}
            </p>
            <p className="text-xs text-[rgb(134,142,150)] mt-1">Applications</p>
          </div>

          <div className="bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-[rgb(29,29,31)]">
              {loading ? '...' : stats?.tryout_acceptances || 0}
            </p>
            <p className="text-xs text-[rgb(134,142,150)] mt-1">Acceptances</p>
          </div>
        </div>

        {/* Weekly Stats */}
        {stats && stats.profile_views_this_week > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-[rgb(0,113,227)]">
              <strong>{stats.profile_views_this_week}</strong> views this week • <strong>{stats.profile_views_this_month}</strong> this month
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
