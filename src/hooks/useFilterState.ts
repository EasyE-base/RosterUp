import { useState, useMemo, useCallback, useEffect } from 'react';

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export interface ActiveFilters {
  [key: string]: string[];
}

interface UseFilterStateOptions {
  syncWithUrl?: boolean;
  onFilterChange?: (filters: ActiveFilters) => void;
}

/**
 * Custom hook for managing multi-select filter state
 * Supports URL query param synchronization for shareable filtered views
 */
export function useFilterState(
  filterDefinitions: FilterOption[],
  options: UseFilterStateOptions = {}
) {
  const { syncWithUrl = false, onFilterChange } = options;

  // Initialize filters from URL params if sync is enabled
  const getInitialFilters = (): ActiveFilters => {
    if (!syncWithUrl || typeof window === 'undefined') {
      return {};
    }

    const params = new URLSearchParams(window.location.search);
    const filters: ActiveFilters = {};

    filterDefinitions.forEach(({ key }) => {
      const paramValue = params.get(key);
      if (paramValue) {
        filters[key] = paramValue.split(',').filter(Boolean);
      }
    });

    return filters;
  };

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(getInitialFilters);

  // Sync filters to URL when they change
  useEffect(() => {
    if (!syncWithUrl || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    // Update URL params
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      } else {
        params.delete(key);
      }
    });

    // Update URL without page reload
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [activeFilters, syncWithUrl]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
  }, [activeFilters, onFilterChange]);

  /**
   * Toggle a filter value (add if not present, remove if present)
   */
  const toggleFilter = useCallback((filterKey: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[filterKey] || [];
      const isActive = current.includes(value);

      return {
        ...prev,
        [filterKey]: isActive
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }, []);

  /**
   * Set all values for a specific filter
   */
  const setFilter = useCallback((filterKey: string, values: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: values,
    }));
  }, []);

  /**
   * Clear a specific filter
   */
  const clearFilter = useCallback((filterKey: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  }, []);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some((values) => values.length > 0);
  }, [activeFilters]);

  /**
   * Count of active filter values
   */
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce(
      (sum, values) => sum + values.length,
      0
    );
  }, [activeFilters]);

  /**
   * Check if a specific filter value is active
   */
  const isFilterActive = useCallback(
    (filterKey: string, value: string) => {
      return (activeFilters[filterKey] || []).includes(value);
    },
    [activeFilters]
  );

  /**
   * Get active filter badges for display
   */
  const getActiveFilterBadges = useMemo(() => {
    const badges: Array<{ key: string; value: string; label: string; filterLabel: string }> = [];

    filterDefinitions.forEach((filter) => {
      const activeValues = activeFilters[filter.key] || [];
      activeValues.forEach((value) => {
        const option = filter.options.find((opt) => opt.value === value);
        if (option) {
          badges.push({
            key: filter.key,
            value,
            label: option.label,
            filterLabel: filter.label,
          });
        }
      });
    });

    return badges;
  }, [activeFilters, filterDefinitions]);

  /**
   * Filter an array of items based on active filters
   * @param items Array of items to filter
   * @param getItemValue Function that extracts filter values from an item
   */
  const filterItems = useCallback(
    <T,>(
      items: T[],
      getItemValue: (item: T, filterKey: string) => string | string[] | undefined
    ): T[] => {
      if (!hasActiveFilters) return items;

      return items.filter((item) => {
        // Item must match ALL active filter groups
        return Object.entries(activeFilters).every(([filterKey, filterValues]) => {
          if (filterValues.length === 0) return true;

          const itemValue = getItemValue(item, filterKey);

          // Handle array values (e.g., tags)
          if (Array.isArray(itemValue)) {
            return filterValues.some((fv) => itemValue.includes(fv));
          }

          // Handle single values
          return itemValue ? filterValues.includes(itemValue) : false;
        });
      });
    },
    [activeFilters, hasActiveFilters]
  );

  return {
    activeFilters,
    toggleFilter,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    isFilterActive,
    getActiveFilterBadges,
    filterItems,
  };
}
