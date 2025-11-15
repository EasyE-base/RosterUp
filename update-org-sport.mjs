import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hnaqmskjbsrltdcvinai.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew'
);

async function updateOrgSport() {
  // First, let's see all organizations
  console.log('Fetching all organizations...');
  const { data: allOrgs, error: fetchError } = await supabase
    .from('organizations')
    .select('*');

  if (fetchError) {
    console.error('Error fetching organizations:', fetchError);
    return;
  }

  console.log('All organizations:', allOrgs);
  console.log(`Found ${allOrgs.length} organization(s)`);

  // Now try to update ones with null primary_sport
  const { data, error } = await supabase
    .from('organizations')
    .update({ primary_sport: 'Softball' })
    .is('primary_sport', null)
    .select();

  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log(`Updated ${data.length} organization(s) to Softball`);
    console.log('Organizations updated:', data);
  }
}

updateOrgSport();
