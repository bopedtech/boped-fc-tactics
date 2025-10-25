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

interface TransformedLeague {
  id: number;
  name: string;
  image: string | null;
  rawData: LeagueData;
  updatedAt: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Universal Leagues Sync ===');

    // Use Season 24 as reference to fetch universal leagues data
    const REFERENCE_SEASON_ID = 24;
    
    // Khởi tạo Supabase client với service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching universal leagues data using Season 24 as reference...');
      
    const RENDERZ_ENDPOINT = `https://renderz.app/api/filter/filter-data/leagues?seasonId=${REFERENCE_SEASON_ID}`;
      
    const headers = new Headers({
      'Accept': 'application/json, text/plain, */*',
      'sec-ch-ua-platform': '"Android"',
      'Referer': `https://renderz.app/${REFERENCE_SEASON_ID}/players`,
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
      console.error(`Failed to fetch leagues: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch leagues: ${response.statusText}`);
    }

    const data = await response.json();

    // Kiểm tra lỗi đặc thù của Renderz
    if (data === "error" || !Array.isArray(data)) {
      console.error('Invalid response from Renderz:', data);
      throw new Error('Invalid response from Renderz Leagues API');
    }

    console.log(`✓ Fetched ${data.length} universal leagues`);

    if (data.length === 0) {
      console.log('No leagues found.');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No leagues to sync',
          totalLeagues: 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 2: Query internal localization dictionary
    console.log('Querying internal localization dictionary...');
    
    const localizationKeys = [...new Set(data.map((league: LeagueData) => league.name))];
    console.log(`Found ${localizationKeys.length} unique localization keys to translate`);
    
    const { data: dictionaryData, error: dictError } = await supabase
      .from('localization_dictionary')
      .select('key, value_en')
      .in('key', localizationKeys);
    
    if (dictError) {
      console.error('Error querying localization dictionary:', dictError);
      throw new Error(`Failed to query dictionary: ${dictError.message}`);
    }
    
    // Create a Map for O(1) lookup
    const localizationMap = new Map(
      (dictionaryData || []).map((entry: any) => [entry.key, entry.value_en])
    );
    
    console.log(`Successfully loaded ${localizationMap.size} translations from DB`);

    // Step 3: Transform data with internal lookup (Explicit Mapping)
    const transformedLeagues = data.map((league: LeagueData) => {
      const localizationKey = league.name;
      const displayName = localizationMap.get(localizationKey);
      
      // Fallback mechanism with warning
      if (!displayName) {
        console.warn(`Warning: Translation missing for key: ${localizationKey}`);
      }
      
      return {
        id: league.id,
        localizationKey: localizationKey,
        displayName: displayName || localizationKey, // Fallback to key if translation missing
        image: league.image || null,
        rawData: league,
        updatedAt: new Date().toISOString()
      };
    });

    console.log(`\n=== Total leagues to upsert: ${transformedLeagues.length} ===`);

    // Perform UPSERT với single primary key
    console.log('Starting UPSERT operation...');
    
    const { error: upsertError } = await supabase
      .from('leagues')
      .upsert(transformedLeagues, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Supabase Upsert Error:', upsertError);
      if (upsertError.code === 'PGRST204') {
        console.error('PGRST204 Error: Column mismatch. Ensure no extra columns (e.g., seasonId) are sent.');
      }
      throw new Error(`Failed to upsert leagues: ${upsertError.message} (Code: ${upsertError.code})`);
    }

    console.log('✓ UPSERT completed successfully');

    // Trả về kết quả
    const result = {
      success: true,
      message: 'Universal leagues sync completed successfully',
      totalLeagues: transformedLeagues.length,
      reference: `Used Season ${REFERENCE_SEASON_ID} as API reference`
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
