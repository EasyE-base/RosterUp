// Quick test for AI Director Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing AI Director...\n');

const { data, error } = await supabase.functions.invoke('ai-director', {
    body: {
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say "Hello World" and nothing else.' }
        ]
    }
});

console.log('📊 Results:');
console.log('Error:', error);
console.log('Data:', JSON.stringify(data, null, 2));

if (data?.choices?.[0]?.message?.content) {
    console.log('\n✅ SUCCESS! AI Response:', data.choices[0].message.content);
} else {
    console.log('\n❌ FAILED - No valid response');
}
