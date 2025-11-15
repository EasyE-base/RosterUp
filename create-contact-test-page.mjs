import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('📦 Creating Contact Section test page (without base_slug field)...\n')

// Get website - fix: don't use .single() with limit(1)
const { data: websites, error: websiteError } = await supabase
  .from('websites')
  .select('id')
  .limit(1)

if (websiteError || !websites || websites.length === 0) {
  console.error('❌ No website found:', websiteError?.message)
  process.exit(1)
}

const websiteId = websites[0].id
console.log(`Using website: ${websiteId}`)

// Read template
const template = JSON.parse(await readFile('./public/templates/contact.json', 'utf-8'))
const section = template.sections[0]

// Create unique slug (timestamp only, to avoid base_slug constraint)
const timestamp = Date.now()
const slug = `contact-section-test-${timestamp}`

console.log(`Creating page with slug: ${slug}`)

// Create page WITHOUT base_slug field
const { data: newPage, error: pageError } = await supabase
  .from('website_pages')
  .insert({
    website_id: websiteId,
    title: 'Contact Section',
    slug: slug,
    is_home: false,
    is_published: false,
    order_index: 99
  })
  .select()
  .single()

if (pageError) {
  console.error('❌ Page creation failed:', pageError.message)
  process.exit(1)
}

console.log(`✅ Page created: ${newPage.id}`)

// Create section
const { data: newSection, error: sectionError } = await supabase
  .from('website_sections')
  .insert({
    page_id: newPage.id,
    name: section.name,
    section_type: section.section_type,
    content: section.content,
    styles: section.styles || {},
    order_index: 0
  })
  .select()
  .single()

if (sectionError) {
  console.error('❌ Section creation failed:', sectionError.message)
  process.exit(1)
}

console.log(`✅ Section created: ${newSection.id}`)
console.log(`\n✨ Success! Page URL: /website-builder/page/${newPage.id}`)
console.log(`   Slug: /${slug}`)
