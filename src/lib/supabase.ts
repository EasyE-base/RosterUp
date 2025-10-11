import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseConfig } from '../config/app.config';

// Create Supabase client using centralized configuration
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

export type UserType = 'organization' | 'player';

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
  start_date: string;
  end_date: string;
  registration_deadline: string;
  location_name: string;
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
  rules: any;
  status: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';
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

export interface WebsiteContentBlock {
  id: string;
  page_id: string;
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
