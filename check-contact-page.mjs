import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

// Check for Contact Section pages
const { data: pages, error } = await supabase
  .from('website_pages')
  .select('id, title, slug')
  .ilike('title', '%contact%')

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('Contact pages found:', pages.length)
  pages.forEach(p => console.log(`  - ${p.title} (${p.slug})`))
  
  if (pages.length === 0) {
    console.log('\n❌ No Contact Section pages found in database')
    console.log('Cannot complete full testing without base_slug migration applied')
  }
}
