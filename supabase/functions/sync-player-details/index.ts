import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Headers to mimic browser (required to avoid being blocked)
const RENDERZ_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "x-sveltekit-invalidated": "111",
  "Referer": "https://renderz.app/"
};

const BATCH_SIZE = 15;  // Number of players to process per run
const SLEEP_MS = 1500;  // 1.5s delay between requests to avoid rate limiting

// Extract data from SvelteKit hydration nodes structure
function extractDataFromNodes(json: any): any {
  if (!json || !json.nodes || !Array.isArray(json.nodes)) return null;

  // Renderz data is typically at the end of the nodes array
  // Look for nodes containing player data markers
  for (let i = json.nodes.length - 1; i >= 0; i--) {
    const node = json.nodes[i];
    if (node?.data) {
      // Identify player data by common field names
      if (node.data.stats || node.data.player || node.data.prices || node.data.playerData) {
        return node.data;
      }
    }
  }
  
  // Alternative: check if data is directly in root
  if (json.stats || json.player || json.prices) {
    return json;
  }
  
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security check
    const syncApiSecret = Deno.env.get('SYNC_API_SECRET');
    const providedSecret = req.headers.get('x-sync-secret');
    const isInternalCall = req.headers.get('x-internal-call') === 'true';
    
    if (syncApiSecret && !isInternalCall && providedSecret !== syncApiSecret) {
      console.error('Unauthorized sync-player-details attempt');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting player details sync...');

    // 1. Get queue of players missing details
    const { data: queue, error: queueError } = await supabase.rpc('get_missing_player_details', {
      batch_size: BATCH_SIZE
    });

    if (queueError) {
      console.error('Queue RPC error:', queueError);
      throw queueError;
    }

    if (!queue || queue.length === 0) {
      console.log('All players have details synced!');
      return new Response(
        JSON.stringify({ success: true, message: 'All players synced!', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queue.length} players...`);
    const results: number[] = [];
    const errors: { assetId: number; error: string }[] = [];

    // 2. Loop through queue and fetch details
    for (const item of queue) {
      const assetId = item.assetId;
      const url = `https://renderz.app/24/player/${assetId}/__data.json?x-sveltekit-invalidated=111`;

      try {
        console.log(`Fetching details for player ${assetId}...`);
        const response = await fetch(url, { headers: RENDERZ_HEADERS });

        // Handle 404 - player doesn't exist on Renderz
        if (response.status === 404) {
          console.warn(`Player ${assetId} not found (404). Marking as empty.`);
          await supabase.from('playerDetails').upsert({
            assetId,
            rawData: { error: '404_NOT_FOUND', message: 'Player not found on Renderz' },
            fetchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          continue;
        }

        if (!response.ok) {
          console.error(`Failed to fetch ${assetId}: HTTP ${response.status}`);
          errors.push({ assetId, error: `HTTP ${response.status}` });
          continue;
        }

        const rawJson = await response.json();

        // 3. Extract clean data from SvelteKit structure
        const cleanData = extractDataFromNodes(rawJson);

        // Prepare database record
        const dbRecord = {
          assetId: assetId,
          rawData: rawJson,
          stats: cleanData?.stats || cleanData?.player?.stats || cleanData?.playerStats || null,
          priceHistory: cleanData?.prices || cleanData?.priceHistory || cleanData?.priceGraph || null,
          evolution: cleanData?.evolution || cleanData?.evoData || null,
          talents: cleanData?.talents || cleanData?.talentData || null,
          fetchedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // 4. Upsert into database
        const { error: upsertError } = await supabase
          .from('playerDetails')
          .upsert(dbRecord, { onConflict: 'assetId' });

        if (upsertError) {
          console.error(`DB upsert error for ${assetId}:`, upsertError);
          errors.push({ assetId, error: upsertError.message });
        } else {
          console.log(`Successfully synced player ${assetId}`);
          results.push(assetId);
        }

        // 5. Rate limit protection - wait before next request
        await new Promise(resolve => setTimeout(resolve, SLEEP_MS));

      } catch (fetchError) {
        console.error(`Exception fetching ${assetId}:`, fetchError);
        errors.push({ assetId, error: String(fetchError) });
      }
    }

    console.log(`Sync completed. Success: ${results.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: results.length,
        syncedIds: results,
        errors: errors.length,
        errorDetails: errors.slice(0, 5) // Only return first 5 errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-player-details:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
