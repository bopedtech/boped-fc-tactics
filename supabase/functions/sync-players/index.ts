import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawPlayerData {
  _source: {
    id: string;
    c: string; // name
    r: number; // rating/ovr
    pos: string; // position
    n: string; // nation
    t?: string; // club
    s?: {
      pac?: number;
      sho?: number;
      pas?: number;
      dri?: number;
      def?: number;
      phy?: number;
      // GK stats
      div?: number;
      han?: number;
      kic?: number;
      ref?: number;
      spd?: number;
      pos_gk?: number;
    };
    wf?: number; // work rate
    wr?: string; // work rates combined
    sk?: string[]; // traits
    alt_p?: string[]; // alternative positions
  };
  sort?: any[];
}

interface ProcessedPlayer {
  external_id: string;
  name: string;
  ovr: number;
  position: string;
  nation?: string;
  club?: string;
  image_url?: string;
  stats: any;
  traits?: string[];
  work_rate_att?: string;
  work_rate_def?: string;
  alternative_positions?: string[];
}

const RENDERZ_API_URL = 'https://renderz.app/api/search/elasticsearch';
const BATCH_SIZE = 500; // Increased batch size for better performance
const DELAY_MS = 1500; // 1.5 second delay between requests

// Extract players from Object response (not standard Elasticsearch format)
function extractPlayersFromObject(responseData: any): RawPlayerData[] | null {
  // Check if response is a valid object (not string, null, array, etc.)
  if (typeof responseData !== 'object' || responseData === null || Array.isArray(responseData)) {
    console.error('Invalid response format: not an object');
    return null;
  }
  
  // Check for explicit error response
  if (responseData === 'error' || (typeof responseData === 'string')) {
    console.error('Error response received from API');
    return null;
  }
  
  const players: RawPlayerData[] = [];
  
  // Loop through all keys in the object
  for (const [key, value] of Object.entries(responseData)) {
    // Skip the _pagination key
    if (key !== '_pagination') {
      players.push(value as RawPlayerData);
    }
  }
  
  return players;
}

function processPlayerData(rawPlayers: RawPlayerData[]): ProcessedPlayer[] {
  return rawPlayers.map((item) => {
    const player = item._source;
    const isGK = player.pos === 'GK';
    
    // Parse work rates
    let workRateAtt = 'Medium';
    let workRateDef = 'Medium';
    if (player.wr) {
      const rates = player.wr.split('/');
      if (rates.length === 2) {
        workRateAtt = rates[0].trim();
        workRateDef = rates[1].trim();
      }
    }

    // Process stats based on position
    const stats = isGK ? {
      speed: player.s?.spd || 50,
      diving: player.s?.div || 50,
      handling: player.s?.han || 50,
      kicking: player.s?.kic || 50,
      reflexes: player.s?.ref || 50,
      positioning: player.s?.pos_gk || 50,
    } : {
      pace: player.s?.pac || 50,
      shooting: player.s?.sho || 50,
      passing: player.s?.pas || 50,
      dribbling: player.s?.dri || 50,
      defense: player.s?.def || 50,
      physicality: player.s?.phy || 50,
    };

    return {
      external_id: player.id,
      name: player.c,
      ovr: player.r,
      position: player.pos,
      nation: player.n,
      club: player.t,
      image_url: `https://cdn.sofifa.com/players/${player.id.slice(0, 3)}/${player.id.slice(3)}/25_120.png`,
      stats,
      traits: player.sk || [],
      work_rate_att: workRateAtt,
      work_rate_def: workRateDef,
      alternative_positions: player.alt_p || [],
    };
  });
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = 'test', maxPages = 5 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting search_after pagination sync in ${mode} mode...`);
    console.log(`Max pages to fetch: ${mode === 'test' ? maxPages : 'unlimited'}`);
    
    let totalSynced = 0;
    let pageCount = 0;
    let cursor: any[] | null = null; // search_after cursor
    const isTestMode = mode === 'test';
    
    // Pagination loop using search_after
    while (true) {
      pageCount++;
      console.log(`\n=== Fetching page ${pageCount} ===`);
      
      // Build the simplified payload structure
      const payload: any = {
        query: {
          bool: {
            must: [],
            should: [],
            must_not: []
          }
        },
        sort: [
          { "rating": { "order": "desc" } },
          { "assetId": { "order": "desc" } }
        ],
        _source: [],
        size: BATCH_SIZE
      };

      // Add search_after cursor if not first page
      if (cursor !== null) {
        payload.search_after = cursor;
        console.log(`Using cursor: ${JSON.stringify(cursor)}`);
      }

      // Make request to Renderz API with Android mobile browser headers
      const response = await fetch(RENDERZ_API_URL, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://renderz.app',
          'Referer': 'https://renderz.app/24/players',
          
          // Android mobile browser simulation
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
          'Sec-Ch-Ua': '"Chromium";v="141", "Google Chrome";v="141", "Not?A_Brand";v="8"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': '"Android"',
          
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Rate limited (429). Waiting 60 seconds...');
          await delay(60000);
          continue; // Retry the same request
        }
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`);
        console.error(`RAW ERROR RESPONSE (first 1000 chars): ${errorText.substring(0, 1000)}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get raw response text first for error logging
      const rawResponseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(rawResponseText);
      } catch (parseError) {
        console.error('JSON PARSE ERROR: Unable to parse response (might be HTML)');
        console.error(`RAW RESPONSE BODY (first 1000 chars): ${rawResponseText.substring(0, 1000)}`);
        throw new Error('Invalid JSON response from API');
      }
      
      // Extract players using the Object-based logic
      const rawPlayers = extractPlayersFromObject(data);

      // Check if extraction failed (null return)
      if (rawPlayers === null) {
        console.error('FORMAT ERROR: Invalid response format or error received');
        console.error(`RAW RESPONSE BODY (first 1000 chars): ${rawResponseText.substring(0, 1000)}`);
        throw new Error('Invalid response format from API');
      }

      console.log(`Received ${rawPlayers.length} players on page ${pageCount}`);

      // If no more players, pagination complete
      if (rawPlayers.length === 0) {
        console.log('No more players. Pagination complete.');
        break;
      }

      // Process and save players
      const processedPlayers = processPlayerData(rawPlayers);
      
      // Upsert to Supabase
      const { error } = await supabase
        .from('players')
        .upsert(processedPlayers, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting to Supabase:', error);
        throw error;
      }

      totalSynced += processedPlayers.length;
      console.log(`Synced ${processedPlayers.length} players. Total: ${totalSynced}`);

      // Extract cursor from last player's sort field
      const lastPlayer = rawPlayers[rawPlayers.length - 1];
      if (lastPlayer && lastPlayer.sort) {
        cursor = lastPlayer.sort;
        console.log(`Extracted cursor from last player: ${JSON.stringify(cursor)}`);
      } else {
        console.log('No sort field found on last player. Pagination complete.');
        break;
      }

      // Test mode: stop after maxPages
      if (isTestMode && pageCount >= maxPages) {
        console.log(`Test mode: Reached max pages (${maxPages}). Stopping.`);
        break;
      }

      // Delay before next request to avoid rate limiting
      console.log(`Waiting ${DELAY_MS}ms before next request...`);
      await delay(DELAY_MS);
    }

    const message = isTestMode 
      ? `Test sync completed: ${totalSynced} players synced (${pageCount} pages)`
      : `Full sync completed: ${totalSynced} players synced (${pageCount} pages)`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        totalPlayers: totalSynced,
        totalPages: pageCount,
        mode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
