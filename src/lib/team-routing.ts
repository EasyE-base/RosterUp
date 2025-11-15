/**
 * Team Routing Helpers
 * Utilities for generating and parsing team-specific URLs
 */

/**
 * Generate a URL-safe slug from team name
 */
export function generateTeamSlug(teamName: string): string {
  return teamName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate team page URL
 */
export function getTeamPageUrl(teamSlug: string): string {
  return `/teams/${teamSlug}`;
}

/**
 * Generate team page URL from team name
 */
export function getTeamPageUrlFromName(teamName: string): string {
  return getTeamPageUrl(generateTeamSlug(teamName));
}

/**
 * Parse team slug from pathname
 * Returns null if not a team page
 */
export function parseTeamSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/teams\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Check if current path is a team page
 */
export function isTeamPage(pathname: string): boolean {
  return pathname.startsWith('/teams/') && pathname !== '/teams';
}

/**
 * Check if current path is the teams overview page
 */
export function isTeamsOverviewPage(pathname: string): boolean {
  return pathname === '/teams' || pathname === '/teams/';
}

/**
 * Get base URL (removes team slug if present)
 */
export function getBaseUrl(pathname: string): string {
  if (isTeamPage(pathname)) {
    return pathname.split('/teams/')[0] || '/';
  }
  return pathname;
}

/**
 * Add team context to URL query params
 */
export function addTeamToUrl(url: string, teamSlug: string): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('team', teamSlug);
  return urlObj.pathname + urlObj.search;
}

/**
 * Remove team context from URL query params
 */
export function removeTeamFromUrl(url: string): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.delete('team');
  return urlObj.pathname + urlObj.search;
}

/**
 * Get team slug from URL (either path or query param)
 */
export function getTeamSlugFromUrl(pathname: string, search: string): string | null {
  // First check path
  const pathSlug = parseTeamSlugFromPath(pathname);
  if (pathSlug) return pathSlug;

  // Then check query params
  const params = new URLSearchParams(search);
  return params.get('team');
}
