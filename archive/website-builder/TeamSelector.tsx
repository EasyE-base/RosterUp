import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getTeamPageUrlFromName, getTeamSlugFromUrl, generateTeamSlug } from '../../lib/team-routing';
import { supabase } from '../../lib/supabase';

interface Team {
  id: string;
  name: string;
  age_group?: string;
  logo_url?: string;
}

interface TeamSelectorProps {
  organizationId: string;
  websiteId?: string;
  sticky?: boolean;
}

export default function TeamSelector({ organizationId, websiteId, sticky = true }: TeamSelectorProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTeamSlug, setCurrentTeamSlug] = useState<string | null>(null);

  // Load teams from database
  useEffect(() => {
    loadTeams();
  }, [organizationId]);

  // Track current team from URL
  useEffect(() => {
    const slug = getTeamSlugFromUrl(location.pathname, location.search);
    setCurrentTeamSlug(slug);
  }, [location.pathname, location.search]);

  const loadTeams = async () => {
    try {
      setLoading(true);

      // Base query
      let query = supabase
        .from('teams')
        .select('id, name, age_group, logo_url')
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
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = (team: Team | null) => {
    setIsOpen(false);

    if (team === null) {
      // "All Teams" selected - go to overview
      navigate('/teams');
    } else {
      // Navigate to team page
      const teamUrl = getTeamPageUrlFromName(team.name);
      navigate(teamUrl);
    }
  };

  const getCurrentTeamName = (): string => {
    if (!currentTeamSlug) return 'All Teams';

    const team = teams.find(t => generateTeamSlug(t.name) === currentTeamSlug);
    return team ? team.name : 'All Teams';
  };

  if (loading || teams.length === 0) {
    return null; // Don't show selector if no teams
  }

  return (
    <div
      className={`${sticky ? 'sticky top-0 z-50' : 'relative'}`}
      style={{ backgroundColor: `${theme.colors.primary}CC`, backdropFilter: 'blur(10px)' }}
    >
      <div className={`${theme.spacing.containerMaxWidth} mx-auto px-4 py-3`}>
        <div className="relative">
          {/* Selector Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full sm:w-auto min-w-[250px] px-5 py-3 rounded-xl font-semibold transition-all shadow-lg"
            style={{
              backgroundColor: theme.colors.background,
              border: `2px solid ${isOpen ? theme.colors.accent : theme.colors.border}`,
              color: theme.colors.text,
            }}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" style={{ color: theme.colors.accent }} />
              <span>{getCurrentTeamName()}</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              style={{ color: theme.colors.textMuted }}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-full sm:w-auto min-w-[300px] rounded-xl shadow-2xl overflow-hidden z-50"
                  style={{
                    backgroundColor: theme.colors.background,
                    border: `2px solid ${theme.colors.border}`,
                  }}
                >
                  <div className="max-h-[400px] overflow-y-auto">
                    {/* All Teams Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectTeam(null)}
                      className="w-full px-5 py-3 text-left transition-colors hover:bg-opacity-80 flex items-center justify-between"
                      style={{
                        backgroundColor: !currentTeamSlug ? `${theme.colors.accent}20` : 'transparent',
                        color: !currentTeamSlug ? theme.colors.accent : theme.colors.text,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${theme.colors.primary}30` }}
                        >
                          <Users className="w-5 h-5" style={{ color: theme.colors.primary }} />
                        </div>
                        <div>
                          <div className="font-semibold">All Teams</div>
                          <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                            View organization overview
                          </div>
                        </div>
                      </div>
                      {!currentTeamSlug && (
                        <Check className="w-5 h-5" style={{ color: theme.colors.accent }} />
                      )}
                    </button>

                    {/* Divider */}
                    <div className="h-px" style={{ backgroundColor: theme.colors.border }} />

                    {/* Individual Teams */}
                    {teams.map((team) => {
                      const teamSlug = generateTeamSlug(team.name);
                      const isSelected = currentTeamSlug === teamSlug;

                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handleSelectTeam(team)}
                          className="w-full px-5 py-3 text-left transition-colors hover:bg-opacity-80 flex items-center justify-between"
                          style={{
                            backgroundColor: isSelected ? `${theme.colors.accent}20` : 'transparent',
                            color: isSelected ? theme.colors.accent : theme.colors.text,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Team Logo or Placeholder */}
                            {team.logo_url ? (
                              <img
                                src={team.logo_url}
                                alt={team.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                                style={{
                                  backgroundColor: `${theme.colors.accent}30`,
                                  color: theme.colors.accent,
                                }}
                              >
                                {team.name.charAt(0)}
                              </div>
                            )}

                            {/* Team Info */}
                            <div>
                              <div className="font-semibold">{team.name}</div>
                              {team.age_group && (
                                <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                                  {team.age_group}
                                </div>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-5 h-5" style={{ color: theme.colors.accent }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
