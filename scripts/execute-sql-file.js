import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars if needed, but for now we'll hardcode or use what's available
// Ideally we should use dotenv, but let's stick to the pattern seen in run-sql.js
const supabaseUrl = 'https://hnaqmskjbsrltdcvinai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXFtc2tqYnNybHRkY3ZpbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTkzNTEsImV4cCI6MjA3NTc3NTM1MX0.H4CO1AvfiHXJ65E8zhFKnEYQTJLrOsVfDZOrUDsa9Ew';

const supabase = createClient(supabaseUrl, supabaseKey);

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide a SQL file path');
    process.exit(1);
}

const sqlFilePath = args[0];
const absolutePath = path.isAbsolute(sqlFilePath)
    ? sqlFilePath
    : path.resolve(process.cwd(), sqlFilePath);

console.log(`Reading SQL from: ${absolutePath}`);

try {
    const sqlContent = fs.readFileSync(absolutePath, 'utf8');

    console.log('Executing SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });

    if (error) {
        console.error('Error executing SQL:', error);
        process.exit(1);
    }

    console.log('Success!');
    if (data) console.log('Data:', data);

} catch (err) {
    console.error('Failed to read or execute file:', err);
    process.exit(1);
}
