import { useMemo } from 'react';
import InlineEditor from '../InlineEditor';
import ScrollReveal from '../../../animations/ScrollReveal';
import FilterBar from '../FilterBar';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { GraduationCap, Trophy, MapPin, Star } from 'lucide-react';
import { useFilterState } from '../../../../hooks/useFilterState';

interface Commitment {
  player_name?: string;
  grad_year?: number;
  institution_name?: string;
  institution_type?: 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO' | 'Professional' | 'International' | 'Other';
  institution_logo_url?: string;
  position?: string;
  team_name?: string;
  is_featured?: boolean;
}

interface CommitmentsSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    commitments?: Commitment[];
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function CommitmentsSection({
  content,
  styles = {},
  editMode,
  onUpdate
}: CommitmentsSectionProps) {
  const { theme, typography } = useTheme();
  const animations = useThemeAnimations();

  // Defensive coding
  const commitments: Commitment[] = Array.isArray(content.commitments) ? content.commitments : [];
  const safeTitle = typeof content.title === 'string' ? content.title : 'Player Commitments';
  const safeSubtitle = typeof content.subtitle === 'string' ? content.subtitle : 'Celebrating our athletes\' achievements';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateCommitment = (index: number, field: keyof Commitment, value: any) => {
    const newCommitments = [...commitments];
    newCommitments[index] = { ...(newCommitments[index] ?? {}), [field]: value };
    updateField('commitments', newCommitments);
  };

  const addCommitment = () => {
    const newCommitments = [...commitments, {
      player_name: '',
      grad_year: new Date().getFullYear(),
      institution_name: '',
      institution_type: 'D1' as const,
      position: '',
      team_name: '',
      is_featured: false
    }];
    updateField('commitments', newCommitments);
  };

  const deleteCommitment = (index: number) => {
    const newCommitments = commitments.filter((_, i) => i !== index);
    updateField('commitments', newCommitments);
  };

  const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');

  // Extract unique values for filter options
  const filterDefinitions = useMemo(() => {
    const years = Array.from(new Set(commitments.map(c => c.grad_year?.toString()).filter(Boolean))).sort().reverse();
    const types = Array.from(new Set(commitments.map(c => c.institution_type).filter(Boolean)));
    const teams = Array.from(new Set(commitments.map(c => c.team_name).filter(Boolean)));

    return [
      {
        key: 'year',
        label: 'Grad Year',
        options: years.map(year => ({ value: year!, label: year! }))
      },
      {
        key: 'type',
        label: 'Division',
        options: types.map(type => ({ value: type!, label: type! }))
      },
      {
        key: 'team',
        label: 'Team',
        options: teams.map(team => ({ value: team!, label: team! }))
      }
    ].filter(f => f.options.length > 0);
  }, [commitments]);

  // Initialize filter state
  const {
    activeFilters,
    toggleFilter,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
    getActiveFilterBadges,
    filterItems,
  } = useFilterState(filterDefinitions, { syncWithUrl: !editMode });

  // Apply filters to commitments
  const filteredCommitments = useMemo(() => {
    return filterItems(commitments, (commitment, filterKey) => {
      if (filterKey === 'year') return commitment.grad_year?.toString();
      if (filterKey === 'type') return commitment.institution_type;
      if (filterKey === 'team') return commitment.team_name;
      return undefined;
    });
  }, [commitments, filterItems]);

  // Sort: featured first, then by year (descending)
  const sortedCommitments = useMemo(() => {
    const toSort = editMode ? commitments : filteredCommitments;
    return [...toSort].sort((a, b) => {
      // Featured first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      // Then by year (newest first)
      return (b.grad_year || 0) - (a.grad_year || 0);
    });
  }, [commitments, filteredCommitments, editMode]);

  // Badge colors by institution type
  const getTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'D1': return { bg: `${theme.colors.accent}30`, text: theme.colors.accent };
      case 'D2': return { bg: `${theme.colors.primary}30`, text: theme.colors.primary };
      case 'D3': return { bg: `${theme.colors.accentLight}30`, text: theme.colors.accentLight };
      case 'NAIA': return { bg: `${theme.colors.primaryDark}30`, text: theme.colors.primaryDark };
      case 'JUCO': return { bg: `${theme.colors.text}20`, text: theme.colors.text };
      case 'Professional': return { bg: `${theme.colors.accent}40`, text: theme.colors.textInverse };
      default: return { bg: `${theme.colors.textMuted}20`, text: theme.colors.textMuted };
    }
  };

  return (
    <div className={theme.spacing.sectionPadding} style={{ backgroundColor: theme.colors.backgroundAlt, ...styles }}>
      <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1} duration={animations.duration / 1000}>
          <div className="text-center mb-12 space-y-3">
            <InlineEditor
              value={safeTitle}
              onChange={(val) => updateField('title', val)}
              type="heading"
              editMode={editMode}
              className={headingClasses}
              style={{ color: theme.colors.text }}
            />
            <InlineEditor
              value={safeSubtitle}
              onChange={(val) => updateField('subtitle', val)}
              type="text"
              editMode={editMode}
              className={subheadingClasses}
              style={{ color: theme.colors.textMuted }}
            />
          </div>
        </ScrollReveal>

        {/* FilterBar */}
        {commitments.length > 0 && filterDefinitions.length > 0 && !editMode && (
          <FilterBar
            filters={filterDefinitions}
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            onClearFilter={clearFilter}
            onClearAll={clearAllFilters}
            activeFilterCount={activeFilterCount}
            getActiveFilterBadges={getActiveFilterBadges}
            resultCount={filteredCommitments.length}
            totalCount={commitments.length}
          />
        )}

        {/* Empty State */}
        {commitments.length === 0 && (
          <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: theme.colors.background, border: `2px solid ${theme.colors.border}` }}>
              <p className="mb-4" style={{ color: theme.colors.textMuted }}>
                {editMode ? 'No commitments added yet. Add your first commitment below!' : 'No commitments to display yet.'}
              </p>
              {editMode && (
                <button
                  type="button"
                  onClick={addCommitment}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.textInverse }}
                >
                  + Add First Commitment
                </button>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* No Results State */}
        {commitments.length > 0 && filteredCommitments.length === 0 && !editMode && (
          <ScrollReveal direction="up" delay={0.2} duration={animations.duration / 1000}>
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: theme.colors.background, border: `2px solid ${theme.colors.border}` }}>
              <p className="mb-4" style={{ color: theme.colors.textMuted }}>
                No commitments match your selected filters.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: theme.colors.primary, color: theme.colors.textInverse }}
              >
                Clear Filters
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Commitments Grid */}
        {commitments.length > 0 && sortedCommitments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCommitments.map((commitment, index) => {
              const badgeColors = getTypeBadgeColor(commitment.institution_type);

              return (
                <ScrollReveal
                  key={index}
                  direction="up"
                  delay={0.2 + index * 0.05}
                  duration={animations.duration / 1000}
                >
                  <motion.div
                    className="rounded-xl p-6 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.accent}05)`,
                      border: `2px solid ${commitment.is_featured ? theme.colors.accent : theme.colors.border}`,
                    }}
                    whileHover={{ y: editMode ? 0 : -8, boxShadow: `0 20px 40px ${theme.colors.primary}15` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Featured Star */}
                    {commitment.is_featured && (
                      <div className="absolute top-4 right-4">
                        <Star className="w-5 h-5 fill-current" style={{ color: theme.colors.accent }} />
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Institution Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <InlineEditor
                            value={commitment.institution_type ?? 'D1'}
                            onChange={(val) => updateCommitment(index, 'institution_type', val)}
                            editMode={editMode}
                            className="inline"
                          />
                        </div>

                        {/* Grad Year */}
                        <div
                          className="px-3 py-1 rounded-lg text-sm font-semibold"
                          style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary }}
                        >
                          <InlineEditor
                            value={commitment.grad_year?.toString() ?? new Date().getFullYear().toString()}
                            onChange={(val) => updateCommitment(index, 'grad_year', parseInt(val) || new Date().getFullYear())}
                            editMode={editMode}
                            className="inline"
                          />
                        </div>
                      </div>

                      {/* Player Name */}
                      <div>
                        <InlineEditor
                          value={commitment.player_name ?? ''}
                          onChange={(val) => updateCommitment(index, 'player_name', val)}
                          editMode={editMode}
                          className="text-2xl font-bold"
                          style={{ color: theme.colors.text }}
                        />
                        {commitment.position && (
                          <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                            <InlineEditor
                              value={commitment.position}
                              onChange={(val) => updateCommitment(index, 'position', val)}
                              editMode={editMode}
                              className="inline"
                            />
                          </p>
                        )}
                      </div>

                      {/* Institution */}
                      <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${theme.colors.background}80` }}>
                        <GraduationCap className="w-5 h-5 mt-0.5" style={{ color: theme.colors.accent }} />
                        <div className="flex-1">
                          <InlineEditor
                            value={commitment.institution_name ?? ''}
                            onChange={(val) => updateCommitment(index, 'institution_name', val)}
                            editMode={editMode}
                            className="font-semibold"
                            style={{ color: theme.colors.text }}
                          />
                        </div>
                      </div>

                      {/* Edit Mode Fields */}
                      {editMode && (
                        <div className="pt-4 border-t space-y-3" style={{ borderColor: theme.colors.border }}>
                          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.colors.textMuted }}>
                            Additional Fields
                          </div>

                          <div>
                            <label className="text-xs" style={{ color: theme.colors.textMuted }}>Team</label>
                            <InlineEditor
                              value={commitment.team_name ?? ''}
                              onChange={(val) => updateCommitment(index, 'team_name', val)}
                              editMode={editMode}
                              className="text-sm"
                              style={{ color: theme.colors.text }}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={commitment.is_featured || false}
                              onChange={(e) => updateCommitment(index, 'is_featured', e.target.checked)}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: theme.colors.accent }}
                            />
                            <label className="text-sm" style={{ color: theme.colors.text }}>
                              Featured Commitment
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Delete Button */}
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => deleteCommitment(index)}
                          className="w-full mt-4 px-4 py-2 text-xs rounded-lg transition-colors"
                          style={{ backgroundColor: `${theme.colors.error}20`, color: theme.colors.error }}
                        >
                          Remove Commitment
                        </button>
                      )}
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Add Commitment Button */}
        {editMode && commitments.length > 0 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={addCommitment}
              className="px-8 py-4 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.textInverse }}
            >
              + Add Another Commitment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
