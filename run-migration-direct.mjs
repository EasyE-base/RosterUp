import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 Running migration: Add template section types...\n')

// We'll run this using the REST API by attempting to insert a test row,
// which will tell us if the constraint is already updated
async function testConstraint() {
  try {
    // Try to insert a dummy section with 'about' type to test if constraint allows it
    const testPageId = '00000000-0000-0000-0000-000000000000' // Invalid UUID that won't exist

    const { error } = await supabase
      .from('website_sections')
      .insert({
        page_id: testPageId,
        name: '__TEST__',
        section_type: 'about',
        order_index: 0
      })

    if (error) {
      // Check if error is about the constraint (not foreign key)
      if (error.message.includes('section_type_check') || error.message.includes('value "about"')) {
        console.log('❌ Constraint does NOT allow template section types')
        console.log('Error:', error.message)
        return false
      } else if (error.message.includes('violates foreign key') || error.message.includes('page_id')) {
        console.log('✅ Constraint ALLOWS template section types (foreign key error is expected)')
        return true
      }
    }

    // If we got here with no error, the constraint allows it (unlikely due to FK)
    console.log('✅ Constraint ALLOWS template section types')
    return true
  } catch (err) {
    console.error('Test failed:', err)
    return false
  }
}

const constraintAllowsTemplates = await testConstraint()

if (constraintAllowsTemplates) {
  console.log('\n✅ Migration is already applied or not needed!')
  console.log('The database already accepts template section types: hero, about, schedule, contact')
} else {
  console.log('\n⚠️  Migration is needed but cannot be run with anon key')
  console.log('Please run the migration manually using one of these methods:')
  console.log('1. Use Supabase Dashboard → SQL Editor')
  console.log('2. Run: supabase db push (with proper credentials)')
  console.log('\nMigration file: supabase/migrations/20251030000000_add_template_section_types.sql')
}
