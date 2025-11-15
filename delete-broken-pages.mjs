import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteBrokenPages() {
  try {
    console.log('🔍 Finding pages to delete...\n')

    // Get all pages
    const { data: pages, error: pagesError } = await supabase
      .from('website_pages')
      .select('id, title, slug')
      .order('created_at', { ascending: false })

    if (pagesError) {
      console.error('❌ Error loading pages:', pagesError)
      return
    }

    console.log(`Found ${pages.length} pages:`)
    pages.forEach(page => {
      console.log(`  - ${page.title} (${page.slug || '/'})`)
    })

    // Find pages with "Section" in the title (About Section, Schedule Section, etc.)
    // but NOT "Sports Hero Section" (that one works)
    const pagesToDelete = pages.filter(p =>
      p.title.includes('Section') &&
      !p.title.includes('Sports Hero Section')
    )

    if (pagesToDelete.length === 0) {
      console.log('\n✅ No broken pages to delete!')
      return
    }

    console.log(`\n🗑️  Deleting ${pagesToDelete.length} broken pages:`)
    pagesToDelete.forEach(p => console.log(`  - ${p.title} (${p.slug})`))

    for (const page of pagesToDelete) {
      console.log(`\n  Deleting: ${page.title}...`)

      // Delete content blocks
      const { error: blocksError } = await supabase
        .from('website_content_blocks')
        .delete()
        .eq('page_id', page.id)

      if (blocksError) {
        console.error(`  ⚠️  Error deleting blocks:`, blocksError.message)
      }

      // Delete sections
      const { error: sectionsError } = await supabase
        .from('website_sections')
        .delete()
        .eq('page_id', page.id)

      if (sectionsError) {
        console.error(`  ⚠️  Error deleting sections:`, sectionsError.message)
      }

      // Delete the page
      const { error: pageError } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', page.id)

      if (pageError) {
        console.error(`  ❌ Error deleting page:`, pageError.message)
      } else {
        console.log(`  ✅ Deleted successfully`)
      }
    }

    console.log('\n✅ Cleanup complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

deleteBrokenPages()
