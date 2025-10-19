import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawPlayerData {
  assetId: number;
  playerId: number;
  firstName: string;
  lastName: string;
  commonName: string;
  cardName: string;
  position: string;
  rating: number;
  weakFoot: number;
  foot: number;
  workRateAtt: number;
  workRateDef: number;
  weight: number;
  height: number;
  birthday: string;
  bio?: string;
  bindingXml?: string;
  animation?: any;
  tags?: string;
  skillStyleId?: number;
  skillStyleSkills?: any[];
  images: any;
  skillMoves?: any;
  skillMovesLevel?: number;
  celebration?: any;
  traits?: any[];
  club: any;
  league: any;
  nation: any;
  potentialPositions?: string[];
  avgStats?: any;
  avgGkStats?: any;
  stats: any;
  priceData?: any;
  auctionable?: boolean;
  rank?: number;
  likes?: number;
  added?: string;
  revealOn?: string;
  source?: string;
  sort?: any[];
}

interface ProcessedPlayer {
  asset_id: number;
  player_id: number;
  first_name: string;
  last_name: string;
  common_name: string;
  card_name: string;
  position: string;
  rating: number;
  weak_foot: number;
  foot: number;
  work_rate_att: number;
  work_rate_def: number;
  weight: number;
  height: number;
  birthday: string;
  bio?: string;
  binding_xml?: string;
  animation?: any;
  tags?: string;
  skill_style_id?: number;
  skill_style_skills?: any[];
  images: any;
  skill_moves?: any;
  skill_moves_level?: number;
  celebration?: any;
  traits?: any[];
  club: any;
  league: any;
  nation: any;
  potential_positions?: string[];
  avg_stats?: any;
  avg_gk_stats?: any;
  stats: any;
  price_data?: any;
  auctionable?: boolean;
  rank?: number;
  likes?: number;
  added?: string;
  reveal_on?: string;
  source?: string;
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
  return rawPlayers.map((player) => {
    // Validate and provide defaults for required NOT NULL fields
    const asset_id = player.assetId ?? 0;
    const player_id = player.playerId ?? 0;
    const rating = player.rating ?? 0;
    const position = player.position || 'Unknown';
    
    // Log warning if critical fields are missing
    if (!player.assetId) {
      console.warn(`⚠️ Missing assetId for player:`, JSON.stringify(player).substring(0, 200));
    }
    if (!player.playerId) {
      console.warn(`⚠️ Missing playerId for player:`, JSON.stringify(player).substring(0, 200));
    }
    
    return {
      asset_id,
      player_id,
      first_name: player.firstName || '',
      last_name: player.lastName || '',
      common_name: player.commonName || '',
      card_name: player.cardName || '',
      position,
      rating,
      weak_foot: player.weakFoot ?? 0,
      foot: player.foot ?? 0,
      work_rate_att: player.workRateAtt ?? 0,
      work_rate_def: player.workRateDef ?? 0,
      weight: player.weight ?? 0,
      height: player.height ?? 0,
      birthday: player.birthday || '1990-01-01',
      bio: player.bio,
      binding_xml: player.bindingXml,
      animation: player.animation,
      tags: player.tags,
      skill_style_id: player.skillStyleId,
      skill_style_skills: player.skillStyleSkills,
      images: player.images,
      skill_moves: player.skillMoves,
      skill_moves_level: player.skillMovesLevel,
      celebration: player.celebration,
      traits: player.traits,
      club: player.club,
      league: player.league,
      nation: player.nation,
      potential_positions: player.potentialPositions,
      avg_stats: player.avgStats,
      avg_gk_stats: player.avgGkStats,
      stats: player.stats,
      price_data: player.priceData,
      auctionable: player.auctionable ?? false,
      rank: player.rank ?? 0,
      likes: player.likes ?? 0,
      added: player.added,
      reveal_on: player.revealOn,
      source: player.source,
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
      
      // Log first record before upsert for debugging
      console.log('📝 Sample record to upsert:', JSON.stringify(processedPlayers[0], null, 2));
      
      // Upsert to Supabase
      const { error } = await supabase
        .from('players')
        .upsert(processedPlayers, { 
          onConflict: 'asset_id',
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
