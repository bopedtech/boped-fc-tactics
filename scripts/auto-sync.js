import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Using publishable key as we are client-side to the function

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not found in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncPrograms() {
    console.log('\n=== Starting Programs Sync ===');
    try {
        const { data, error } = await supabase.functions.invoke('sync-renderz-programs');
        if (error) throw error;
        console.log('Programs Sync Result:', data);
    } catch (error) {
        console.error('Error syncing programs:', error.message);
    }
}

async function syncPlayers() {
    console.log('\n=== Starting Players Sync ===');
    let totalSyncedOverall = 0;
    let totalPages = 0;
    let hasMore = true;
    let iterations = 0;
    const MAX_ITERATIONS = 1000; // Safety limit

    try {
        while (hasMore && iterations < MAX_ITERATIONS) {
            iterations++;
            console.log(`\n--- Iteration ${iterations} ---`);

            const { data, error } = await supabase.functions.invoke('sync-players', {
                body: {
                    mode: 'full',
                    // maxPages is handled by the function default or internal logic, 
                    // but we can pass it if we want to control batch size per call.
                    // The function defaults to 3 pages per call.
                }
            });

            if (error) {
                console.error('Error calling sync-players:', error);
                // If error is 504 Gateway Timeout, we might want to retry, but for now let's break or continue?
                // Let's retry a few times in a real robust script, but here we'll log and break to avoid infinite error loops.
                break;
            }

            if (!data) {
                console.error('No data returned from sync-players');
                break;
            }

            // Update totals
            totalSyncedOverall = data.totalPlayers || totalSyncedOverall;
            totalPages += data.totalPages || 0;
            hasMore = data.hasMore && !data.isComplete;

            console.log(`Batch Result: ${data.message}`);
            console.log(`Progress: ${totalSyncedOverall} players synced so far.`);

            if (data.isComplete) {
                console.log('🎉 Player Sync Complete!');
                break;
            }

            if (hasMore) {
                console.log('More data available. Continuing to next batch...');
                // Wait a bit before next call to be nice to the server
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        console.error('Critical Error in syncPlayers loop:', error);
    }
}

async function runSyncJob() {
    console.log(`\n\n[${new Date().toISOString()}] Starting Scheduled Sync Job...`);

    // 1. Sync Programs
    await syncPrograms();

    // 2. Sync Players
    await syncPlayers();

    console.log(`[${new Date().toISOString()}] Scheduled Sync Job Finished.`);
}

// Run immediately on start
runSyncJob();

// Schedule every 4 hours (4 * 60 * 60 * 1000 ms)
const INTERVAL_MS = 4 * 60 * 60 * 1000;
setInterval(runSyncJob, INTERVAL_MS);

console.log(`Sync script started. Running every 4 hours (${INTERVAL_MS}ms).`);
