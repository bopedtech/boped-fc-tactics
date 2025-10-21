import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeagueData {
  id: number;
  name: string;
  image?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Leagues Sync ===');

    // Parse request body để lấy seasonId hoặc mode
    const { seasonId = 24, mode = 'single' } = await req.json().catch(() => ({ seasonId: 24, mode: 'single' }));
    
    // Khởi tạo Supabase client với service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let allLeagues: any[] = [];
    let seasonsToSync: number[] = [];

    if (mode === 'all') {
      // Sync tất cả seasons (24, 25, 26)
      seasonsToSync = [24, 25, 26];
      console.log('Mode: ALL - Syncing seasons 24, 25, 26');
    } else {
      // Sync một season cụ thể
      seasonsToSync = [seasonId];
      console.log(`Mode: SINGLE - Syncing season ${seasonId}`);
    }

    // Fetch data cho từng season
    for (const season of seasonsToSync) {
      console.log(`\n--- Fetching Season ${season} ---`);
      
      const RENDERZ_ENDPOINT = `https://renderz.app/api/filter/filter-data/leagues?seasonId=${season}`;
      
      const headers = new Headers({
        'Accept': 'application/json, text/plain, */*',
        'sec-ch-ua-platform': '"Android"',
        'Referer': 'https://renderz.app/24/players',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?1'
      });

      console.log(`Calling: ${RENDERZ_ENDPOINT}`);
      
      const response = await fetch(RENDERZ_ENDPOINT, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        console.error(`Failed to fetch season ${season}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch leagues for season ${season}: ${response.statusText}`);
      }

      const data = await response.json();

      // Kiểm tra lỗi đặc thù của Renderz
      if (data === "error" || !Array.isArray(data)) {
        console.error(`Invalid response from Renderz for season ${season}:`, data);
        throw new Error(`Invalid response from Renderz Leagues API for season ${season}`);
      }

      console.log(`✓ Fetched ${data.length} leagues for season ${season}`);

      // Transform data với Explicit Mapping
      const transformedLeagues = data.map((league: LeagueData) => ({
        id: league.id,
        seasonId: season,
        name: league.name,
        image: league.image || null,
        rawData: league,
        updatedAt: new Date().toISOString()
      }));

      allLeagues = allLeagues.concat(transformedLeagues);
    }

    console.log(`\n=== Total leagues to upsert: ${allLeagues.length} ===`);

    // Perform UPSERT với composite key
    if (allLeagues.length > 0) {
      console.log('Starting UPSERT operation...');
      
      const { error: upsertError } = await supabase
        .from('leagues')
        .upsert(allLeagues, {
          onConflict: 'id,seasonId',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Supabase Upsert Error:', upsertError);
        throw new Error(`Failed to upsert leagues: ${upsertError.message} (Code: ${upsertError.code})`);
      }

      console.log('✓ UPSERT completed successfully');
    }

    // Trả về kết quả
    const result = {
      success: true,
      message: 'Leagues sync completed successfully',
      mode: mode,
      seasons: seasonsToSync,
      totalLeagues: allLeagues.length,
      leaguesPerSeason: seasonsToSync.reduce((acc, season) => {
        acc[season] = allLeagues.filter(l => l.seasonId === season).length;
        return acc;
      }, {} as Record<number, number>)
    };

    console.log('=== Sync Complete ===', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== CRITICAL ERROR ===');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error during leagues sync',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
