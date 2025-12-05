// Auto-sync script using native fetch (no dependencies required)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not found');
    process.exit(1);
}

async function invokeFunction(functionName, body = {}) {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

async function syncPrograms() {
    console.log('\n=== Starting Programs Sync ===');
    try {
        const data = await invokeFunction('sync-renderz-programs');
        console.log('Programs Sync Result:', data);
    } catch (error) {
        console.error('Error syncing programs:', error.message);
    }
}

async function syncPlayers() {
    console.log('\n=== Starting Players Sync ===');
    let hasMore = true;
    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    try {
        while (hasMore && iterations < MAX_ITERATIONS) {
            iterations++;
            console.log(`\n--- Iteration ${iterations} ---`);

            const data = await invokeFunction('sync-players', { mode: 'full' });

            if (!data) {
                console.error('No data returned from sync-players');
                break;
            }

            console.log(`Batch Result: ${data.message || 'OK'}`);
            console.log(`Progress: ${data.totalPlayers || 0} players synced so far.`);

            hasMore = data.hasMore && !data.isComplete;

            if (data.isComplete) {
                console.log('🎉 Player Sync Complete!');
                break;
            }

            if (hasMore) {
                console.log('More data available. Waiting 5s...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        console.error('Error in syncPlayers:', error.message);
    }
}

async function runSyncJob() {
    console.log(`\n[${new Date().toISOString()}] Starting Sync Job...`);
    await syncPrograms();
    await syncPlayers();
    console.log(`[${new Date().toISOString()}] Sync Job Finished.`);
}

// Run once and exit (GitHub Actions will schedule the next run)
runSyncJob().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
