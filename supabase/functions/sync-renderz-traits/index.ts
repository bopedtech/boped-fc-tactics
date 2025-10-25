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

interface TraitData {
  id: number;
  name: string;
  description?: string;
  [key: string]: any;
}

interface TransformedTrait {
  id: number;
  displayName: string;
  displayDescription: string | null;
  localizationKeyName: string;
  localizationKeyDescription: string | null;
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

    console.log('Starting Traits sync from Renderz API...');

    // 1. Fetch Traits data from Renderz API
    const renderzResponse = await fetch(
      'https://renderz.app/api/filter/filter-data/traits?seasonId=24',
      { headers: RENDERZ_HEADERS }
    );

    if (!renderzResponse.ok) {
      throw new Error(`Renderz API error: ${renderzResponse.status}`);
    }

    const renderzData = await renderzResponse.json();
    
    if (renderzData.error) {
      throw new Error(`Renderz API returned error: ${renderzData.error}`);
    }

    const traitsData: TraitData[] = renderzData.data || renderzData;
    console.log(`Fetched ${traitsData.length} traits from Renderz`);

    // 2. Extract unique localization keys from both name and description
    const nameKeys = traitsData.map(trait => trait.name).filter(Boolean);
    const descKeys = traitsData.map(trait => trait.description).filter(Boolean);
    const allKeys = [...new Set([...nameKeys, ...descKeys])];

    console.log(`Extracted ${allKeys.length} unique localization keys (names + descriptions)`);

    // 3. Fetch translations from localization_dictionary
    const { data: translations, error: translationError } = await supabase
      .from('localization_dictionary')
      .select('key, value_en')
      .in('key', allKeys);

    if (translationError) {
      console.error('Translation fetch error:', translationError);
      throw translationError;
    }

    // Create lookup map
    const translationMap = new Map(
      (translations || []).map(t => [t.key, t.value_en])
    );

    console.log(`Found ${translationMap.size} translations`);

    // 4. Enrich and map data explicitly (dual localization)
    const transformedTraits: TransformedTrait[] = traitsData.map(trait => {
      const keyName = trait.name;
      const keyDesc = trait.description || null;

      const displayName = translationMap.get(keyName) || keyName;
      const displayDescription = keyDesc ? (translationMap.get(keyDesc) || keyDesc) : null;

      return {
        id: trait.id,
        displayName,
        displayDescription,
        localizationKeyName: keyName,
        localizationKeyDescription: keyDesc,
        rawData: trait,
        updatedAt: new Date().toISOString(),
      };
    });

    console.log(`Transformed ${transformedTraits.length} traits`);

    // 5. UPSERT into traits table
    const { data: upsertedData, error: upsertError } = await supabase
      .from('traits')
      .upsert(transformedTraits, { onConflict: 'id' });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    console.log('Traits sync completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${transformedTraits.length} traits`,
        synced: transformedTraits.length,
        translated: translationMap.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync-renderz-traits:', error);
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
