import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawPlayerData {
  id: number;
  name: string;
  rating: number;
  position: string;
  nation?: string;
  club?: string;
  imageUrl?: string;
  workRates?: { attacking: string; defensive: string };
  alternativePositions?: string[];
  stats?: {
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
    // Goalkeeper stats
    diving?: number;
    handling?: number;
    kicking?: number;
    reflexes?: number;
    speed?: number;
    positioning?: number;
  };
  traits?: string[];
}

function processPlayerData(rawPlayers: RawPlayerData[]) {
  return rawPlayers.map(player => ({
    id: player.id,
    name: player.name,
    ovr: player.rating,
    position: player.position,
    nation: player.nation || 'Unknown',
    club: player.club || 'Unknown',
    image_url: player.imageUrl || `https://cdn.sofifa.com/players/${player.id}/25_120.png`,
    work_rate_att: player.workRates?.attacking || 'Medium',
    work_rate_def: player.workRates?.defensive || 'Medium',
    alternative_positions: player.alternativePositions || [],
    stats: player.stats || {},
    traits: player.traits || [],
  }));
}

async function fetchPlayersFromRenderz(page: number = 1): Promise<RawPlayerData[] | null> {
  try {
    // Note: This URL is conceptual - you need to inspect network requests on FIFA Renderz
    // to find the actual API endpoint they use
    const url = `https://www.fifarenderz.com/api/players?page=${page}&limit=100`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch page ${page}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.players || data.items || data;
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { searchParams } = new URL(req.url);
    const maxPages = parseInt(searchParams.get('maxPages') || '5');
    const mode = searchParams.get('mode') || 'test'; // 'test' or 'full'

    console.log(`Starting sync with mode: ${mode}, maxPages: ${maxPages}`);

    let totalSynced = 0;
    let currentPage = 1;
    const pagesToProcess = mode === 'test' ? Math.min(maxPages, 2) : maxPages;

    while (currentPage <= pagesToProcess) {
      console.log(`Fetching page ${currentPage}...`);
      
      const rawPlayers = await fetchPlayersFromRenderz(currentPage);
      
      if (!rawPlayers || rawPlayers.length === 0) {
        console.log('No more players found, stopping...');
        break;
      }

      const processedPlayers = processPlayerData(rawPlayers);
      
      console.log(`Processing ${processedPlayers.length} players from page ${currentPage}`);

      const { error } = await supabaseAdmin
        .from('players')
        .upsert(processedPlayers, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting players:', error);
        throw error;
      }

      totalSynced += processedPlayers.length;
      currentPage++;

      // Delay to avoid rate limiting
      if (currentPage <= pagesToProcess) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalSynced} players across ${currentPage - 1} pages`,
        totalPlayers: totalSynced,
        mode: mode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in sync-players function:', error);
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

