
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking books table schema...');
  const { data, error } = await supabase.from('books').select('*').limit(1);
  
  if (error) {
    console.error('Error fetching books:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Sample book data:', data[0]);
    console.log('Keys in book object:', Object.keys(data[0]));
  } else {
    console.log('No books found in table.');
  }
}

checkSchema();
