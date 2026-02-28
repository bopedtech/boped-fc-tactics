// Test script to check player data in DB
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Or service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Checking player data...");
    const { data, error } = await supabase.from('players').select('assetId, rawData').limit(1);

    if (error) {
        console.error("DB Error:", error);
    } else {
        const p = data[0];
        console.log("Player JSON:", JSON.stringify(p.rawData.images, null, 2));
    }
}
main();
