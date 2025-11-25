import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import type { FilterOption, ActiveFilters } from '../../../hooks/useFilterState';

interface FilterBarProps {
  filters: FilterOption[];
  activeFilters: ActiveFilters;
  onToggleFilter: (filterKey: string, value: string) => void;
  onClearFilter: (filterKey: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  getActiveFilterBadges: Array<{
    key: string;
    value: string;
    label: string;
    filterLabel: string;
  }>;
  resultCount?: number;
  totalCount?: number;
}

export default function FilterBar({
  filters,
  activeFilters,
  onToggleFilter,
  onClearFilter,
  onClearAll,
  activeFilterCount,
  getActiveFilterBadges,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const { theme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleDropdown = (filterKey: string) => {
    setOpenDropdown(openDropdown === filterKey ? null : filterKey);
  };

  const handleSelectValue = (filterKey: string, value: string) => {
    onToggleFilter(filterKey, value);
    // Keep dropdown open for multi-select behavior
  };

  const isValueActive = (filterKey: string, value: string) => {
    return (activeFilters[filterKey] || []).includes(value);
  };

  return (
    <div
      className="rounded-xl p-4 mb-6"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.accent}05)`,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" style={{ color: theme.colors.accent }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            Filters
            {activeFilterCount > 0 && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.textInverse,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Result count */}
          {resultCount !== undefined && totalCount !== undefined && (
            <span className="text-sm" style={{ color: theme.colors.textMuted }}>
              Showing {resultCount} of {totalCount}
            </span>
          )}

          {/* Clear all button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: `${theme.colors.error}20`,
                color: theme.colors.error,
              }}
            >
              Clear All
            </button>
          )}

          {/* Collapse toggle (mobile) */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Filter dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              {filters.map((filter) => (
                <div key={filter.key} className="relative">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(filter.key)}
                    className="w-full px-4 py-2.5 rounded-lg text-left flex items-center justify-between transition-all"
                    style={{
                      backgroundColor: theme.colors.backgroundAlt,
                      border: `1px solid ${
                        (activeFilters[filter.key]?.length || 0) > 0
                          ? theme.colors.accent
                          : theme.colors.border
                      }`,
                      color: theme.colors.text,
                    }}
                  >
                    <span className="text-sm font-medium">
                      {filter.label}
                      {(activeFilters[filter.key]?.length || 0) > 0 && (
                        <span
                          className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: theme.colors.accent,
                            color: theme.colors.textInverse,
                          }}
                        >
                          {activeFilters[filter.key].length}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === filter.key ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {openDropdown === filter.key && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 mt-1 w-full rounded-lg shadow-xl overflow-hidden"
                        style={{
                          backgroundColor: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <div className="max-h-64 overflow-y-auto">
                          {filter.options.map((option) => {
                            const isActive = isValueActive(filter.key, option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelectValue(filter.key, option.value)}
                                className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:opacity-90"
                                style={{
                                  backgroundColor: isActive
                                    ? `${theme.colors.accent}20`
                                    : 'transparent',
                                  color: isActive ? theme.colors.accent : theme.colors.text,
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {/* Checkbox */}
                                  <div
                                    className="w-4 h-4 rounded border flex items-center justify-center"
                                    style={{
                                      borderColor: isActive
                                        ? theme.colors.accent
                                        : theme.colors.border,
                                      backgroundColor: isActive
                                        ? theme.colors.accent
                                        : 'transparent',
                                    }}
                                  >
                                    {isActive && (
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: theme.colors.textInverse }}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Clear individual filter button */}
                        {(activeFilters[filter.key]?.length || 0) > 0 && (
                          <div
                            className="border-t px-4 py-2"
                            style={{ borderColor: theme.colors.border }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onClearFilter(filter.key);
                                setOpenDropdown(null);
                              }}
                              className="text-xs font-medium transition-opacity hover:opacity-80"
                              style={{ color: theme.colors.error }}
                            >
                              Clear {filter.label}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Active filter badges */}
            {getActiveFilterBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {getActiveFilterBadges.map((badge) => (
                  <motion.div
                    key={`${badge.key}-${badge.value}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                    style={{
                      backgroundColor: `${theme.colors.accent}15`,
                      border: `1px solid ${theme.colors.accent}30`,
                      color: theme.colors.text,
                    }}
                  >
                    <span className="text-xs font-semibold" style={{ color: theme.colors.accent }}>
                      {badge.filterLabel}:
                    </span>
                    <span className="font-medium">{badge.label}</span>
                    <button
                      type="button"
                      onClick={() => onToggleFilter(badge.key, badge.value)}
                      className="ml-1 p-0.5 rounded-full transition-colors hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenDropdown(null)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
