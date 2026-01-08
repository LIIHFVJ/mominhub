
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function checkUsers() {
    const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total registered users:', count);
    }

    const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
    console.log('Total books:', booksCount);
}

checkUsers();
