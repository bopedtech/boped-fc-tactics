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
const BATCH_SIZE = 500;
const DELAY_MS = 1500; // 1.5 seconds delay between requests

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
    const { mode = 'test', maxPages = 2 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting sync in ${mode} mode...`);
    
    let cursor: any[] | null = null;
    let totalSynced = 0;
    let pageCount = 0;
    const isTestMode = mode === 'test';
    const maxPagesToFetch = isTestMode ? maxPages : Infinity;

    while (pageCount < maxPagesToFetch) {
      console.log(`Fetching page ${pageCount + 1}...`);
      
      // Build the Elasticsearch query payload
      const payload: any = {
        size: BATCH_SIZE,
        query: {
          match_all: {} // Get all players
        },
        sort: [{ "_id": "asc" }], // Sort by internal _id for consistency
      };

      // Track total hits on first request
      if (pageCount === 0) {
        payload.track_total_hits = true;
      }

      // Add search_after cursor if not first request
      if (cursor) {
        payload.search_after = cursor;
      }

      console.log('Request payload:', JSON.stringify(payload));

      // Make request to Renderz API
      const response = await fetch(RENDERZ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
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
      
      // Log response structure for debugging
      console.log('Response keys:', Object.keys(data));
      console.log('Response data structure:', JSON.stringify(data).substring(0, 500));
      
      // Check total hits on first request
      if (pageCount === 0) {
        const totalHits = data?.hits?.total?.value || 0;
        console.log(`Total players found on server: ${totalHits}`);
        if (totalHits === 0) {
          console.log('Warning: Total hits is 0. Check endpoint or query.');
          console.log('Full response:', JSON.stringify(data));
        }
      }
      
      // Extract players from hits.hits
      const rawPlayers = data?.hits?.hits || [];

      console.log(`Received ${rawPlayers.length} players`);

      // If no more data, we're done
      if (rawPlayers.length === 0) {
        console.log('No more players to fetch. Sync complete!');
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
      console.log(`Synced batch. Total: ${totalSynced}`);

      // Update cursor from the last player's sort value
      const lastPlayer = rawPlayers[rawPlayers.length - 1];
      if (lastPlayer?.sort) {
        cursor = lastPlayer.sort;
      } else {
        console.log('No sort value found. Cannot continue.');
        break;
      }

      pageCount++;

      // Delay before next request to avoid rate limiting
      if (pageCount < maxPagesToFetch) {
        console.log(`Waiting ${DELAY_MS}ms before next request...`);
        await delay(DELAY_MS);
      }
    }

    const message = isTestMode 
      ? `Test sync completed: ${totalSynced} players synced across ${pageCount} pages`
      : `Full sync completed: ${totalSynced} players synced across ${pageCount} pages`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        totalPlayers: totalSynced,
        pagesProcessed: pageCount,
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
