
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://obvrirdhqnwjmfaiqfki.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Usually we need service role for delete, but let's try.

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicates() {
    console.log("Fetching adhkar...");
    const { data, error } = await supabase.from('adhkar').select('id, content, category, type');
    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    const seen = new Set();
    const toDelete = [];

    for (const item of data) {
        const key = `${item.category}-${item.content}`;
        if (seen.has(key)) {
            toDelete.push(item.id);
        } else {
            seen.add(key);
        }
    }

    console.log(`Found ${toDelete.length} duplicates to delete.`);

    if (toDelete.length > 0) {
        // Delete in batches of 10
        for (let i = 0; i < toDelete.length; i += 10) {
            const batch = toDelete.slice(i, i + 10);
            const { error: delError } = await supabase.from('adhkar').delete().in('id', batch);
            if (delError) {
                console.error("Error deleting batch:", delError);
            } else {
                console.log(`Deleted batch ${i / 10 + 1}`);
            }
        }
    }
}

cleanDuplicates();
