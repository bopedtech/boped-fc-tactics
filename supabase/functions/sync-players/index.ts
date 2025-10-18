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
const BATCH_SIZE = 200;
const DELAY_MS = 1000; // 1 second delay between requests
const MAX_OFFSET = 9800; // Safety limit for pagination
const MIN_OVR = 40;
const MAX_OVR = 130;

// Extract players from Object response (not standard Elasticsearch format)
function extractPlayersFromObject(responseData: any): RawPlayerData[] {
  const players: RawPlayerData[] = [];
  
  // Check for error or invalid format
  if (typeof responseData !== 'object' || responseData === null || responseData === 'error') {
    console.log('Invalid response format or error received');
    return players;
  }
  
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
    const { mode = 'test' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting OVR slice pagination sync in ${mode} mode...`);
    
    let totalSynced = 0;
    const isTestMode = mode === 'test';
    
    // Outer loop: Iterate through OVR ratings from high to low
    const startOvr = isTestMode ? MAX_OVR : MAX_OVR;
    const endOvr = isTestMode ? MAX_OVR - 2 : MIN_OVR; // Test mode: only 3 OVR levels
    
    for (let currentOvr = startOvr; currentOvr >= endOvr; currentOvr--) {
      console.log(`\n=== Starting sync for OVR ${currentOvr} ===`);
      let offset = 0;
      let ovrPlayerCount = 0;

      // Inner loop: Paginate through players at current OVR
      while (offset <= MAX_OFFSET) {
        console.log(`Fetching OVR ${currentOvr}, offset ${offset}...`);
        
        // Build the payload with OVR filter
        const payload = {
          size: BATCH_SIZE,
          from: offset,
          query: {
            bool: {
              filter: [
                { term: { platform: "mobile" } },
                { term: { is_card: true } },
                { term: { is_sold: false } },
                { term: { "stats.rating": currentOvr } } // OVR filter
              ]
            }
          },
          sort: [{ "id": "asc" }] // Consistent sorting within OVR
        };

        // Make request to Renderz API
        const response = await fetch(RENDERZ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Origin': 'https://renderz.app',
            'Referer': 'https://renderz.app/',
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract players using the new Object-based logic
        const rawPlayers = extractPlayersFromObject(data);

        console.log(`Received ${rawPlayers.length} players for OVR ${currentOvr}`);

        // If no more players at this OVR, move to next OVR
        if (rawPlayers.length === 0) {
          console.log(`No more players at OVR ${currentOvr}. Moving to next OVR.`);
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

        ovrPlayerCount += processedPlayers.length;
        totalSynced += processedPlayers.length;
        console.log(`Synced ${processedPlayers.length} players. OVR ${currentOvr} total: ${ovrPlayerCount}, Grand total: ${totalSynced}`);

        // Move to next page
        offset += BATCH_SIZE;

        // Delay before next request to avoid rate limiting
        console.log(`Waiting ${DELAY_MS}ms before next request...`);
        await delay(DELAY_MS);
      }
      
      console.log(`Completed OVR ${currentOvr}. Total players: ${ovrPlayerCount}`);
    }

    const message = isTestMode 
      ? `Test sync completed: ${totalSynced} players synced (OVR ${startOvr}-${endOvr})`
      : `Full sync completed: ${totalSynced} players synced (OVR ${MAX_OVR}-${MIN_OVR})`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        totalPlayers: totalSynced,
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
