// Quick script to check the last import details
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkLastImport() {
  // Get all pages ordered by creation date
  const { data: pages, error: pagesError } = await supabase
    .from('website_pages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (pagesError) {
    console.error('Error fetching pages:', pagesError);
    return;
  }

  if (!pages || pages.length === 0) {
    console.log('No pages found');
    return;
  }

  // Group by website_id
  const grouped = {};
  pages.forEach(page => {
    if (!grouped[page.website_id]) {
      grouped[page.website_id] = [];
    }
    grouped[page.website_id].push(page);
  });

  // Show the most recent website
  const websiteIds = Object.keys(grouped);
  const mostRecentWebsiteId = websiteIds[0];
  const websitePages = grouped[mostRecentWebsiteId];

  console.log('\n📦 MOST RECENT IMPORT:');
  console.log(`  Website ID: ${mostRecentWebsiteId}`);
  console.log(`  Created: ${new Date(websitePages[0].created_at).toLocaleString()}`);

  console.log(`\n📄 PAGES IMPORTED: ${websitePages.length}`);
  websitePages
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .forEach((page, i) => {
      const hasCloneHtml = page.clone_html && page.clone_html.length > 0;
      console.log(`  ${i + 1}. ${page.title} ${page.slug ? `(/${page.slug})` : '(home)'}`);
      console.log(`     Has clone_html: ${hasCloneHtml} ${hasCloneHtml ? `(${Math.round(page.clone_html.length / 1024)}KB)` : ''}`);
    });
}

checkLastImport().then(() => process.exit(0)).catch(console.error);
