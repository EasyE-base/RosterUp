import { useState, useEffect } from 'react';
import { Eye, TrendingUp, MapPin, Users, Calendar, Clock, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PlayerProfileView, CoachInterest } from '../../../lib/supabase';

interface ProfileAnalyticsProps {
  playerId: string;
}

interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  coachViews: number;
  avgSessionDuration: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
}

interface LocationData {
  city: string;
  state: string;
  country: string;
  count: number;
}

interface ViewTrend {
  date: string;
  count: number;
}

export default function ProfileAnalytics({ playerId }: ProfileAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentViews, setRecentViews] = useState<PlayerProfileView[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [viewTrends, setViewTrends] = useState<ViewTrend[]>([]);
  const [coachInterests, setCoachInterests] = useState<CoachInterest[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [playerId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load all profile views
      const { data: views, error: viewsError } = await supabase
        .from('player_profile_views')
        .select('*')
        .eq('player_id', playerId)
        .order('viewed_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Calculate summary stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const viewsThisWeek = views?.filter(v => new Date(v.viewed_at) >= oneWeekAgo).length || 0;
      const viewsThisMonth = views?.filter(v => new Date(v.viewed_at) >= oneMonthAgo).length || 0;
      const coachViews = views?.filter(v => v.viewer_type === 'coach').length || 0;

      // Count unique visitors (by IP or user_id)
      const uniqueVisitorIds = new Set(
        views?.map(v => v.viewer_user_id || v.id).filter(Boolean)
      );

      // Calculate average session duration
      const durationsWithValues = views?.filter(v => v.session_duration) || [];
      const avgSessionDuration = durationsWithValues.length > 0
        ? durationsWithValues.reduce((sum, v) => sum + (v.session_duration || 0), 0) / durationsWithValues.length
        : 0;

      setSummary({
        totalViews: views?.length || 0,
        uniqueVisitors: uniqueVisitorIds.size,
        coachViews,
        avgSessionDuration: Math.round(avgSessionDuration),
        viewsThisWeek,
        viewsThisMonth
      });

      // Recent views (last 10)
      setRecentViews(views?.slice(0, 10) || []);

      // Location data aggregation
      const locationMap = new Map<string, LocationData>();
      views?.forEach(view => {
        if (view.location_city && view.location_state) {
          const key = `${view.location_city}, ${view.location_state}`;
          const existing = locationMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            locationMap.set(key, {
              city: view.location_city,
              state: view.location_state,
              country: view.location_country || 'USA',
              count: 1
            });
          }
        }
      });
      const sortedLocations = Array.from(locationMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setLocationData(sortedLocations);

      // View trends (last 30 days)
      const trendMap = new Map<string, number>();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      views?.forEach(view => {
        const viewDate = new Date(view.viewed_at);
        if (viewDate >= thirtyDaysAgo) {
          const dateKey = viewDate.toISOString().split('T')[0];
          trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
        }
      });

      // Fill in missing dates with 0
      const trends: ViewTrend[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        trends.push({
          date: dateKey,
          count: trendMap.get(dateKey) || 0
        });
      }
      setViewTrends(trends);

      // Load coach interests
      const { data: interests, error: interestsError } = await supabase
        .from('coach_interests')
        .select(`
          *,
          organizations:organization_id (
            name,
            logo_url
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (interestsError) throw interestsError;
      setCoachInterests(interests || []);

    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getViewerTypeLabel = (type: string | null) => {
    switch (type) {
      case 'coach': return 'Coach';
      case 'scout': return 'Scout';
      case 'anonymous': return 'Anonymous';
      default: return 'Visitor';
    }
  };

  const getViewerTypeBadgeColor = (type: string | null) => {
    switch (type) {
      case 'coach': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scout': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
    }
  };

  const getInterestTypeLabel = (type: string) => {
    switch (type) {
      case 'view': return 'Viewed Profile';
      case 'request_info': return 'Requested Info';
      case 'invite_camp': return 'Camp Invite';
      case 'mark_prospect': return 'Marked as Prospect';
      default: return type;
    }
  };

  const getInterestTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'mark_prospect': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'invite_camp': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'request_info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <p className="text-xs text-blue-300 font-semibold">Total Views</p>
          </div>
          <p className="text-3xl font-bold text-white">{summary.totalViews}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <p className="text-xs text-purple-300 font-semibold">Unique Visitors</p>
          </div>
          <p className="text-3xl font-bold text-white">{summary.uniqueVisitors}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <p className="text-xs text-green-300 font-semibold">Coach Views</p>
          </div>
          <p className="text-3xl font-bold text-white">{summary.coachViews}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <p className="text-xs text-yellow-300 font-semibold">This Week</p>
          </div>
          <p className="text-3xl font-bold text-white">{summary.viewsThisWeek}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <p className="text-xs text-orange-300 font-semibold">This Month</p>
          </div>
          <p className="text-3xl font-bold text-white">{summary.viewsThisMonth}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <p className="text-xs text-cyan-300 font-semibold">Avg Duration</p>
          </div>
          <p className="text-3xl font-bold text-white">{formatDuration(summary.avgSessionDuration)}</p>
        </div>
      </div>

      {/* View Trends Chart */}
      {viewTrends.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">30-Day View Trend</h3>
          </div>
          <div className="flex items-end space-x-1 h-48">
            {viewTrends.map((trend, index) => {
              const maxCount = Math.max(...viewTrends.map(t => t.count), 1);
              const height = (trend.count / maxCount) * 100;
              return (
                <div
                  key={trend.date}
                  className="flex-1 flex flex-col items-center group"
                  title={`${trend.date}: ${trend.count} views`}
                >
                  <div className="text-xs text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {trend.count}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-400 hover:to-blue-300"
                    style={{ height: `${height}%`, minHeight: trend.count > 0 ? '4px' : '0' }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        {locationData.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Top Viewing Locations</h3>
            </div>
            <div className="space-y-3">
              {locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full">
                      <span className="text-sm font-bold text-blue-400">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {location.city}, {location.state}
                      </p>
                      <p className="text-xs text-slate-500">{location.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white">{location.count}</span>
                    <span className="text-xs text-slate-500">views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Views */}
        {recentViews.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Recent Profile Views</h3>
            </div>
            <div className="space-y-3">
              {recentViews.slice(0, 5).map((view) => (
                <div key={view.id} className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded border ${getViewerTypeBadgeColor(view.viewer_type)}`}>
                        {getViewerTypeLabel(view.viewer_type)}
                      </span>
                      {view.location_city && view.location_state && (
                        <span className="text-slate-500 text-xs">
                          {view.location_city}, {view.location_state}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(view.viewed_at).toLocaleDateString()} at{' '}
                      {new Date(view.viewed_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {view.session_duration && (
                    <span className="text-xs text-slate-500 ml-2">
                      {formatDuration(view.session_duration)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coach Interests */}
      {coachInterests.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Recruiting Activity</h3>
          </div>
          <div className="space-y-3">
            {coachInterests.map((interest) => (
              <div
                key={interest.id}
                className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {(interest as any).organizations?.logo_url && (
                      <img
                        src={(interest as any).organizations.logo_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {(interest as any).organizations?.name || 'Organization'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(interest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded border ${getInterestTypeBadgeColor(interest.interest_type)}`}>
                    {getInterestTypeLabel(interest.interest_type)}
                  </span>
                </div>
                {interest.message && (
                  <p className="text-sm text-slate-300 mt-2">{interest.message}</p>
                )}
                {interest.status && (
                  <div className="mt-2">
                    <span className="text-xs text-slate-500">
                      Status: <span className="text-white capitalize">{interest.status}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {summary.totalViews === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No profile views yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Share your profile with coaches and recruiters to start getting views
          </p>
        </div>
      )}
    </div>
  );
}
