import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RENDERZ_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Referer': 'https://renderz.app/24/players',
  'Accept': 'application/json',
};

interface ProgramData {
  id: string;
  name: string;
  image?: string;
  [key: string]: any;
}

interface TransformedProgram {
  id: string;
  displayName: string;
  localizationKey: string;
  image: string | null;
  rawData: any;
  updatedAt: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Programs sync from Renderz API...');

    // 1. Fetch Programs data from Renderz API
    const renderzResponse = await fetch(
      'https://renderz.app/api/filter/filter-data/programs?seasonId=24',
      { headers: RENDERZ_HEADERS }
    );

    if (!renderzResponse.ok) {
      throw new Error(`Renderz API error: ${renderzResponse.status}`);
    }

    const renderzData = await renderzResponse.json();
    
    if (renderzData.error) {
      throw new Error(`Renderz API returned error: ${renderzData.error}`);
    }

    const programsData: ProgramData[] = renderzData.data || renderzData;
    console.log(`Fetched ${programsData.length} programs from Renderz`);

    // 2. Extract unique localization keys
    const localizationKeys = [...new Set(
      programsData.map(program => program.name).filter(Boolean)
    )];

    console.log(`Extracted ${localizationKeys.length} unique localization keys`);

    // 3. Fetch translations from localization_dictionary
    const { data: translations, error: translationError } = await supabase
      .from('localization_dictionary')
      .select('key, value_en')
      .in('key', localizationKeys);

    if (translationError) {
      console.error('Translation fetch error:', translationError);
      throw translationError;
    }

    // Create lookup map
    const translationMap = new Map(
      (translations || []).map(t => [t.key, t.value_en])
    );

    console.log(`Found ${translationMap.size} translations`);

    // 4. Enrich and map data explicitly
    const transformedPrograms: TransformedProgram[] = programsData.map(program => {
      const localizationKey = program.name;
      const displayName = translationMap.get(localizationKey);

      // Fallback mechanism with warning
      if (!displayName) {
        console.warn(`No translation found for key: ${localizationKey}`);
      }

      return {
        id: program.id,
        displayName: displayName || localizationKey,
        localizationKey,
        image: program.image || null,
        rawData: program,
        updatedAt: new Date().toISOString(),
      };
    });

    console.log(`Transformed ${transformedPrograms.length} programs`);

    // 5. UPSERT into programs table
    const { data: upsertedData, error: upsertError } = await supabase
      .from('programs')
      .upsert(transformedPrograms, { onConflict: 'id', ignoreDuplicates: false });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    console.log('Programs sync completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${transformedPrograms.length} programs`,
        synced: transformedPrograms.length,
        translated: translationMap.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync-renderz-programs:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
