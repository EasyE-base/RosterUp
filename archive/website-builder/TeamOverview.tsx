import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import ScrollReveal from '../animations/ScrollReveal';
import { useTheme, useThemeAnimations } from '../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../lib/typography-presets';
import { getTeamPageUrlFromName } from '../../lib/team-routing';
import { supabase } from '../../lib/supabase';

interface Team {
  id: string;
  name: string;
  age_group?: string;
  logo_url?: string;
  description?: string;
}

interface TeamStats {
  roster_count: number;
  next_game_date?: string;
  next_game_opponent?: string;
}

interface TeamOverviewProps {
  organizationId: string;
  websiteId?: string;
}

export default function TeamOverview({ organizationId, websiteId }: TeamOverviewProps) {
  const { theme, typography } = useTheme();
  const animations = useThemeAnimations();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamStats, setTeamStats] = useState<Record<string, TeamStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, [organizationId, websiteId]);

  const loadTeams = async () => {
    try {
      setLoading(true);

      // Base query
      let query = supabase
        .from('teams')
        .select('id, name, age_group, logo_url, description')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true });

      // If websiteId provided, only show teams enabled for this website
      if (websiteId) {
        const { data: teamWebsites } = await supabase
          .from('team_websites')
          .select('team_id')
          .eq('website_id', websiteId)
          .eq('is_enabled', true);

        if (teamWebsites && teamWebsites.length > 0) {
          const teamIds = teamWebsites.map(tw => tw.team_id);
          query = query.in('id', teamIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setTeams(data || []);

      // Load stats for each team
      if (data) {
        await loadTeamStats(data.map(t => t.id));
      }
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamStats = async (teamIds: string[]) => {
    const stats: Record<string, TeamStats> = {};

    await Promise.all(
      teamIds.map(async (teamId) => {
        // Count roster members
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId);

        stats[teamId] = {
          roster_count: count || 0,
        };

        // TODO: Add next game query once events are in database
        // For now, stats just show roster count
      })
    );

    setTeamStats(stats);
  };

  const handleTeamClick = (team: Team) => {
    const teamUrl = getTeamPageUrlFromName(team.name);
    navigate(teamUrl);
  };

  const headingClasses = getHeadingClasses(typography, 'h1', 'bold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'xl', 'normal');

  if (loading) {
    return (
      <div className={theme.spacing.sectionPadding} style={{ backgroundColor: theme.colors.background }}>
        <div className={`${theme.spacing.containerMaxWidth} mx-auto text-center`}>
          <p style={{ color: theme.colors.textMuted }}>Loading teams...</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={theme.spacing.sectionPadding} style={{ backgroundColor: theme.colors.background }}>
        <div className={`${theme.spacing.containerMaxWidth} mx-auto text-center`}>
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textMuted }} />
          <p className="text-xl" style={{ color: theme.colors.textMuted }}>
            No teams available yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={theme.spacing.sectionPadding} style={{ backgroundColor: theme.colors.background }}>
      <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1} duration={animations.duration / 1000}>
          <div className="text-center mb-16 space-y-4">
            <h1 className={headingClasses} style={{ color: theme.colors.text }}>
              Our Teams
            </h1>
            <p className={subheadingClasses} style={{ color: theme.colors.textMuted }}>
              Select a team to view their schedule, roster, and more
            </p>
          </div>
        </ScrollReveal>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => {
            const stats = teamStats[team.id] || { roster_count: 0 };

            return (
              <ScrollReveal
                key={team.id}
                direction="up"
                delay={0.2 + index * 0.1}
                duration={animations.duration / 1000}
              >
                <motion.button
                  type="button"
                  onClick={() => handleTeamClick(team)}
                  className="w-full text-left rounded-2xl p-6 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.accent}05)`,
                    border: `2px solid ${theme.colors.border}`,
                  }}
                  whileHover={{
                    y: -8,
                    boxShadow: `0 20px 40px ${theme.colors.primary}20`,
                    borderColor: theme.colors.accent,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Team Header */}
                  <div className="flex items-start gap-4 mb-6">
                    {/* Logo */}
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl"
                        style={{
                          backgroundColor: `${theme.colors.primary}20`,
                          color: theme.colors.primary,
                        }}
                      >
                        {team.name.charAt(0)}
                      </div>
                    )}

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold mb-1 truncate" style={{ color: theme.colors.text }}>
                        {team.name}
                      </h3>
                      {team.age_group && (
                        <div
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${theme.colors.accent}20`,
                            color: theme.colors.accent,
                          }}
                        >
                          {team.age_group}
                        </div>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <ChevronRight className="w-6 h-6 flex-shrink-0" style={{ color: theme.colors.accent }} />
                  </div>

                  {/* Description */}
                  {team.description && (
                    <p className="mb-4 text-sm line-clamp-2" style={{ color: theme.colors.textMuted }}>
                      {team.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: theme.colors.border }}>
                    {/* Roster Count */}
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${theme.colors.primary}15` }}
                      >
                        <Users className="w-4 h-4" style={{ color: theme.colors.primary }} />
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                          Roster
                        </div>
                        <div className="font-semibold" style={{ color: theme.colors.text }}>
                          {stats.roster_count}
                        </div>
                      </div>
                    </div>

                    {/* Next Game (if available) */}
                    {stats.next_game_date ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${theme.colors.accent}15` }}
                        >
                          <Calendar className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                            Next Game
                          </div>
                          <div className="text-xs font-semibold truncate" style={{ color: theme.colors.text }}>
                            {stats.next_game_opponent}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${theme.colors.accent}15` }}
                        >
                          <TrendingUp className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                            Season
                          </div>
                          <div className="text-xs font-semibold" style={{ color: theme.colors.text }}>
                            Active
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
