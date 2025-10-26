import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RENDERZ_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Referer': 'https://renderz.app/24/players',
  'Accept': 'application/json',
};

interface CelebrationData {
  id: number;
  name: string;
  description?: string;
  mediaUrl?: string;
  image?: string;
  video?: string;
  [key: string]: any;
}

interface TransformedCelebration {
  id: number;
  displayName: string;
  displayDescription: string | null;
  localizationKeyName: string;
  localizationKeyDescription: string | null;
  mediaUrl: string | null;
  rawData: any;
  updatedAt: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Celebrations Sync ===');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch celebrations data from Renderz API
    console.log('Fetching celebrations data from Renderz API...');
    const renderzResponse = await fetch(
      'https://renderz.app/api/filter/filter-data/celebrations?seasonId=24',
      { headers: RENDERZ_HEADERS }
    );

    if (!renderzResponse.ok) {
      throw new Error(`Renderz API error: ${renderzResponse.status} ${renderzResponse.statusText}`);
    }

    const renderzData = await renderzResponse.json();
    
    if (renderzData.error) {
      throw new Error(`Renderz API returned error: ${renderzData.error}`);
    }

    console.log(`✓ Fetched ${renderzData.length} celebrations from Renderz`);

    // Extract unique localization keys (Dual: name + description)
    const localizationKeys = new Set<string>();
    renderzData.forEach((celebration: CelebrationData) => {
      if (celebration.name) localizationKeys.add(celebration.name);
      if (celebration.description) localizationKeys.add(celebration.description);
    });

    console.log(`✓ Extracted ${localizationKeys.size} unique localization keys`);

    // Fetch translations from localization_dictionary
    const { data: translations, error: translationError } = await supabase
      .from('localization_dictionary')
      .select('key, value_en')
      .in('key', Array.from(localizationKeys));

    if (translationError) {
      console.error('Error fetching translations:', translationError);
      throw new Error(`Failed to fetch translations: ${translationError.message}`);
    }

    console.log(`✓ Fetched ${translations?.length || 0} translations from dictionary`);

    // Create translation map for efficient lookup
    const translationMap = new Map<string, string>();
    translations?.forEach((t: any) => {
      translationMap.set(t.key, t.value_en);
    });

    // Transform and enrich celebrations with explicit mapping
    const transformedCelebrations: TransformedCelebration[] = renderzData.map((celebration: CelebrationData) => {
      const keyName = celebration.name;
      const keyDesc = celebration.description || null;
      
      const displayName = translationMap.get(keyName) || keyName;
      const displayDescription = keyDesc ? (translationMap.get(keyDesc) || keyDesc) : null;

      // Defensive architecture for mediaUrl
      const mediaUrl = celebration.mediaUrl || celebration.image || celebration.video || null;

      return {
        id: celebration.id,
        displayName,
        displayDescription,
        localizationKeyName: keyName,
        localizationKeyDescription: keyDesc,
        mediaUrl,
        rawData: celebration,
        updatedAt: new Date().toISOString()
      };
    });

    console.log(`✓ Transformed ${transformedCelebrations.length} celebrations with explicit mapping`);

    // Upsert to celebrations table
    const { error: upsertError } = await supabase
      .from('celebrations')
      .upsert(transformedCelebrations, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error upserting celebrations:', upsertError);
      throw new Error(`Failed to upsert celebrations: ${upsertError.message}`);
    }

    console.log('✓ Successfully upserted celebrations');

    const result = {
      success: true,
      message: 'Celebrations synchronized successfully',
      synced: transformedCelebrations.length,
      translationsUsed: translationMap.size
    };

    console.log('=== Celebrations Sync Complete ===', result);

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
        message: 'Internal Server Error during celebrations sync',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
