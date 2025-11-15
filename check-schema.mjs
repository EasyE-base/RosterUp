import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

// Get an existing page to see what website_id it uses
const { data: pages, error } = await supabase
  .from('website_pages')
  .select('*')
  .limit(1)

if (error) {
  console.error('Error:', error.message)
} else if (pages.length > 0) {
  console.log('Sample page structure:')
  console.log(JSON.stringify(pages[0], null, 2))
}
