import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseConfig } from '../config/app.config';

// Create Supabase client using centralized configuration
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

export type UserType = 'organization' | 'player' | 'trainer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string;
  primary_sport: string | null;
  subscription_tier: 'starter' | 'growth' | 'elite' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string;
  primary_sport: string | null;
  primary_position: string | null;
  height: string | null;
  weight: string | null;
  rating: number;
  profile_visibility: 'public' | 'private' | 'featured';
  parent_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  user_id: string;
  headshot_url: string | null;
  intro_video_url: string | null;
  athletic_background: any; // JSONB array of {year, title, description}
  coaching_background: any; // JSONB array of {year, title, description}
  certifications: any; // JSONB array of {name, issuer, year}
  specializations: string[];
  sports: string[];
  bio: string | null;
  tagline: string | null;
  travel_radius_miles: number | null;
  latitude: number | null;
  longitude: number | null;
  fixed_locations: any; // JSONB array of {name, address, lat, lng}
  service_areas: any; // JSONB array of {city, state, radius}
  pricing_info: any; // JSONB {hourly_rate, group_rate, show_pricing}
  is_featured: boolean;
  featured_priority: number;
  featured_start_date: string | null;
  featured_end_date: string | null;
  total_sessions: number;
  rating: number;
  total_reviews: number;
  availability_schedule: any; // JSONB weekly schedule
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  sport: string;
  age_group: string | null;
  gender: string | null;
  description: string | null;
  logo_url: string | null;
  season: string | null;
  roster_limit: number;
  is_active: boolean;
  classification: string | null; // Current team classification (A, B, C, REC, ALL_STARS)
  prior_season_classification: string | null; // Previous season classification
  classification_eligibility: any; // JSON object storing ClassificationCriteria
  last_classification_review: string | null; // Date of last classification review
  created_at: string;
  updated_at: string;
}

export interface Tryout {
  id: string;
  team_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  sport: string;
  date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  address: string | null;
  age_group: string | null;
  gender: string | null;
  total_spots: number;
  spots_available: number;
  requirements: any;
  status: 'open' | 'closed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TryoutApplication {
  id: string;
  tryout_id: string;
  player_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlist' | 'withdrawn';
  notes: string | null;
  evaluation_score: number | null;
  evaluation_notes: string | null;
  applied_at: string;
  evaluated_at: string | null;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  event_type: 'game' | 'practice' | 'tryout' | 'meeting' | 'other';
  date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  sport: string;
  sanctioning_body: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  location_name: string;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  format_type: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number | null;
  prize_info: string | null;
  requirements: any;
  rules: any;
  status: 'draft' | 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';
  image_url: string | null;
  classification_acceptance: string | null; // Tournament classification acceptance policy
  accepted_classifications: string[] | null; // Custom list of accepted classifications
  classification_rules: any; // Additional classification-specific rules
  age_group: string | null; // Age group for classification rule exceptions
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  team_id: string | null;
  organization_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
  confirmed_at: string | null;
  check_in_status: 'not_checked_in' | 'checked_in' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationWebsite {
  id: string;
  organization_id: string;
  is_published: boolean;
  custom_domain: string | null;
  subdomain: string;
  theme: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  custom_css: string | null;
  analytics_enabled: boolean;
  theme_id: string | null;
  header_code: string | null;
  footer_code: string | null;
  google_analytics_id: string | null;
  website_mode?: 'blocks' | 'clone';
  clone_html?: string | null;
  clone_css?: string | null;
  clone_js?: string | null;
  clone_assets?: any;
  created_at: string;
  updated_at: string;
}

export interface WebsitePage {
  id: string;
  website_id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  seo_keywords: string | null;
  og_image: string | null;
  template_id: string | null;
  is_home: boolean;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSection {
  id: string;
  page_id: string;
  name: string;
  section_type:
  | 'header'
  | 'content'
  | 'footer'
  | 'hero'
  | 'about'
  | 'schedule'
  | 'contact'
  | 'navigation-center-logo'
  | 'commitments'
  | 'gallery'
  | 'roster';
  background_color?: string;
  background_image?: string;
  background_size?: string;
  background_position?: string;
  padding_top?: string;
  padding_bottom?: string;
  padding_left?: string;
  padding_right?: string;
  max_width?: string;
  full_width: boolean;
  order_index: number;
  styles: any;
  created_at: string;
  updated_at: string;
}

export interface WebsiteContentBlock {
  id: string;
  page_id: string;
  section_id?: string;
  block_type: string;
  content: any;
  styles: any;
  visibility: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  config: any;
  pages_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteTheme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
  button_style: any;
  spacing_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteMedia {
  id: string;
  website_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  thumbnail_url: string | null;
  folder: string;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteForm {
  id: string;
  website_id: string;
  name: string;
  fields: any;
  submit_action: string;
  notification_email: string | null;
  success_message: string;
  redirect_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteFormSubmission {
  id: string;
  form_id: string;
  data: any;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  submitted_at: string;
}

export interface WebsiteAnalytics {
  id: string;
  website_id: string;
  page_id: string | null;
  event_type: string;
  event_data: any;
  visitor_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface WebsitePermission {
  id: string;
  website_id: string;
  user_id: string;
  role: string;
  can_edit_content: boolean;
  can_publish: boolean;
  can_manage_users: boolean;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteBlockTemplate {
  id: string;
  website_id: string | null;
  name: string;
  description: string | null;
  block_type: string;
  content: any;
  thumbnail_url: string | null;
  is_global: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteVersion {
  id: string;
  website_id: string;
  page_id: string | null;
  version_number: number;
  change_type: string;
  change_description: string | null;
  snapshot_data: any;
  created_by: string | null;
  created_at: string;
}

export interface WebsiteComment {
  id: string;
  website_id: string;
  page_id: string | null;
  block_id: string | null;
  comment: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WebsiteDesignSystem {
  id: string;
  website_id: string;
  colors: any;
  typography: any;
  spacing: any;
  buttons: any;
  effects: any;
  created_at: string;
  updated_at: string;
}

// Player Marketplace Types
export interface PlayerProfile {
  id: string;
  user_id: string;
  sport: string;
  age_group: string | null;
  classification: string | null; // A, B, C, REC, ALL_STARS
  position: string[] | null; // Changed to array for multiple positions
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string;
  photo_url: string | null;
  profile_completeness: number;
  profile_views: number;
  is_active: boolean;
  is_visible_in_search: boolean;
  // Enhanced profile fields
  academic_year: string | null;
  gpa: number | null;
  graduation_year: number | null;
  college_committed: string | null;
  recruiting_status: 'open' | 'committed' | 'closed';
  preferred_contact_method: string | null;
  parent_phone: string | null;
  highlight_video_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export interface PlayerMedia {
  id: string;
  player_id: string;
  media_type: 'photo' | 'video' | 'document';
  file_url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  file_size: number | null;
  mime_type: string | null;
  duration: number | null; // for videos, in seconds
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerStatistics {
  id: string;
  player_id: string;
  season: string;
  sport: string;
  stats_data: any; // Sport-specific stats as JSON
  games_played: number;
  highlights: string | null;
  source: string; // 'manual', 'gamechanger', 'imported'
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerAchievement {
  id: string;
  player_id: string;
  achievement_type: 'award' | 'record' | 'milestone' | 'championship';
  title: string;
  description: string | null;
  date_achieved: string | null;
  image_url: string | null;
  organization: string | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerPhysicalMeasurements {
  id: string;
  player_id: string;
  measured_date: string;
  height_inches: number | null;
  weight_lbs: number | null;
  wingspan_inches: number | null;
  // Speed/Agility
  forty_yard_dash: number | null;
  shuttle_run: number | null;
  three_cone_drill: number | null;
  sixty_yard_dash: number | null;
  // Strength
  bench_press_max: number | null;
  squat_max: number | null;
  deadlift_max: number | null;
  // Jump
  vertical_jump: number | null;
  broad_jump: number | null;
  // Baseball/Softball specific
  exit_velocity: number | null;
  throwing_velocity: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerTeamHistory {
  id: string;
  player_id: string;
  team_name: string;
  organization_name: string | null;
  season: string;
  sport: string;
  division: string | null;
  classification: string | null;
  position_played: string | null;
  jersey_number: number | null;
  win_loss_record: string | null;
  tournaments_attended: number;
  tournament_results: string | null;
  championships_won: number;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachInterest {
  id: string;
  player_id: string;
  coach_user_id: string;
  organization_id: string | null;
  interest_type: 'view' | 'request_info' | 'invite_camp' | 'mark_prospect';
  message: string | null;
  contact_info: string | null;
  status: 'pending' | 'contacted' | 'in_process' | 'closed';
  player_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerProfileView {
  id: string;
  player_id: string;
  viewer_user_id: string | null;
  viewer_organization_id: string | null;
  viewer_type: 'coach' | 'scout' | 'anonymous' | null;
  referrer: string | null;
  device_type: string | null;
  browser: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  session_duration: number | null;
  pages_viewed: number;
  viewed_at: string;
}

export interface PlayerContactRequest {
  id: string;
  player_id: string;
  organization_id: string;
  message: string;
  contact_email: string;
  contact_phone: string | null;
  status: 'pending' | 'viewed' | 'responded' | 'expired';
  viewed_at: string | null;
  responded_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SearchAnalytics {
  id: string;
  organization_id: string | null;
  search_filters: any; // JSONB with filter criteria
  result_count: number;
  clicked_player_id: string | null;
  contact_initiated: boolean;
  created_at: string;
}
