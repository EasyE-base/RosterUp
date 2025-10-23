import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get website pages for the page ID
const pageId = '2071f2af-5559-4417-ab39-74b35d244a46';

const { data: page } = await supabase
  .from('website_pages')
  .select('website_id')
  .eq('id', pageId)
  .single();

if (page) {
  const { data: pages } = await supabase
    .from('website_pages')
    .select('id, title, slug, is_home, order_index')
    .eq('website_id', page.website_id)
    .order('order_index', { ascending: true });

  console.log('\n=== IMPORTED PAGES ===');
  console.log(`Total: ${pages?.length || 0} pages\n`);
  
  pages?.forEach(p => {
    console.log(`${p.order_index + 1}. ${p.title}`);
    console.log(`   Slug: /${p.slug || 'home'}`);
    console.log(`   Home: ${p.is_home ? 'YES' : 'no'}`);
    console.log('');
  });
}
