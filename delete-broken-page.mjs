import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteBrokenPage() {
  const pageId = 'fa5e8a66-44a4-424e-b980-fa33e736687d'

  try {
    console.log(`🗑️  Deleting page ${pageId}...`)

    // Delete the page (cascading deletes will handle sections and blocks)
    const { error } = await supabase
      .from('website_pages')
      .delete()
      .eq('id', pageId)

    if (error) {
      console.error('❌ Error deleting page:', error)
      return
    }

    console.log('✅ Page deleted successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

deleteBrokenPage()
