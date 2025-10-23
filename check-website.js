// Quick script to check website data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gxswglqujavrcepvujpk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4c3dnbHF1amF2cmNlcHZ1anBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MjMyMjcsImV4cCI6MjA2MDAwMjIyN30.HY2Mf2gLRxcS4D_nV6l_Ql57o5wJUTk_S9c0RfJg6co'
);

// Get website for the page
const { data: page } = await supabase
  .from('website_pages')
  .select('website_id')
  .eq('id', '5bec7def-4855-4f9f-8208-040a226a745d')
  .single();

if (page) {
  const { data: website } = await supabase
    .from('organization_websites')
    .select('id, subdomain, website_mode, clone_html, clone_css')
    .eq('id', page.website_id)
    .single();

  console.log('Website data:');
  console.log({
    id: website?.id,
    subdomain: website?.subdomain,
    website_mode: website?.website_mode,
    has_clone_html: !!website?.clone_html,
    clone_html_length: website?.clone_html?.length || 0,
    has_clone_css: !!website?.clone_css,
    clone_css_length: website?.clone_css?.length || 0
  });
}
