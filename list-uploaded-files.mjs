import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function listFiles() {
  console.log('📁 Listing files in player-media/photos/3231a3c2-2a31-41be-a48d-106ac1e169bb...\n');

  const { data, error } = await supabase.storage
    .from('player-media')
    .list('photos/3231a3c2-2a31-41be-a48d-106ac1e169bb', {
      limit: 100,
      offset: 0,
    });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log(`Found ${data.length} file(s):\n`);
    data.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   Size: ${file.metadata?.size || 'unknown'} bytes`);
      console.log(`   Type: ${file.metadata?.mimetype || 'unknown'}`);

      // Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from('player-media')
        .getPublicUrl(`photos/3231a3c2-2a31-41be-a48d-106ac1e169bb/${file.name}`);

      console.log(`   URL: ${publicUrl}`);
      console.log('');
    });
  } else {
    console.log('No files found in this folder.');
  }
}

listFiles();
