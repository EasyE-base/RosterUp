import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSections() {
  try {
    // Get all pages
    const { data: pages, error: pagesError } = await supabase
      .from('website_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (pagesError) {
      console.error('Error loading pages:', pagesError)
      return
    }

    console.log('\n📄 Pages:', pages?.length || 0)
    if (pages && pages.length > 0) {
      pages.forEach(page => {
        console.log(`  - ${page.title} (${page.slug}) - ID: ${page.id}`)
      })
    } else {
      console.log('  (No pages found)')
    }

    // Get all sections
    const { data: sections, error: sectionsError } = await supabase
      .from('website_sections')
      .select('*')
      .order('created_at', { ascending: false })

    if (sectionsError) {
      console.error('Error loading sections:', sectionsError)
      return
    }

    console.log(`\n🎨 Sections (${sections.length} total):`)
    sections.forEach(section => {
      console.log(`  - ${section.name} (type: ${section.section_type}) - Page ID: ${section.page_id}`)
    })

    // Check for the specific page
    const targetPageId = 'fa5e8a66-44a4-424e-b980-fa33e736687d'
    const pageSections = sections.filter(s => s.page_id === targetPageId)
    console.log(`\n🔍 Sections for page ${targetPageId}: ${pageSections.length}`)
    if (pageSections.length > 0) {
      pageSections.forEach(s => {
        console.log(`  - ${s.name} (${s.section_type})`)
        console.log(`    Styles:`, s.styles)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSections()
