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

interface SkillMoveData {
  id: number;
  name: string;
  description?: string;
  stars?: number;
  starRating?: number;
  level?: number;
  mediaUrl?: string;
  image?: string;
  video?: string;
  [key: string]: any;
}

interface TransformedSkillMove {
  id: number;
  displayName: string;
  displayDescription: string | null;
  localizationKeyName: string;
  localizationKeyDescription: string | null;
  stars: number | null;
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
    console.log('=== Starting SkillMoves Sync ===');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch skillMoves data from Renderz API
    console.log('Fetching skillMoves data from Renderz API...');
    const renderzResponse = await fetch(
      'https://renderz.app/api/filter/filter-data/skillmoves?seasonId=24',
      { headers: RENDERZ_HEADERS }
    );

    if (!renderzResponse.ok) {
      throw new Error(`Renderz API error: ${renderzResponse.status} ${renderzResponse.statusText}`);
    }

    const renderzData = await renderzResponse.json();
    
    if (renderzData.error) {
      throw new Error(`Renderz API returned error: ${renderzData.error}`);
    }

    console.log(`✓ Fetched ${renderzData.length} skillMoves from Renderz`);

    // Extract unique localization keys (Dual: name + description)
    const localizationKeys = new Set<string>();
    renderzData.forEach((skillMove: SkillMoveData) => {
      if (skillMove.name) localizationKeys.add(skillMove.name);
      if (skillMove.description) localizationKeys.add(skillMove.description);
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

    // Transform and enrich skillMoves with explicit mapping
    const transformedSkillMoves: TransformedSkillMove[] = renderzData.map((skillMove: SkillMoveData) => {
      const keyName = skillMove.name;
      const keyDesc = skillMove.description || null;
      
      const displayName = translationMap.get(keyName) || keyName;
      const displayDescription = keyDesc ? (translationMap.get(keyDesc) || keyDesc) : null;

      // Defensive architecture for stars
      const stars = skillMove.stars ?? skillMove.starRating ?? skillMove.level ?? null;
      
      // Defensive architecture for mediaUrl
      const mediaUrl = skillMove.mediaUrl || skillMove.image || skillMove.video || null;

      return {
        id: skillMove.id,
        displayName,
        displayDescription,
        localizationKeyName: keyName,
        localizationKeyDescription: keyDesc,
        stars,
        mediaUrl,
        rawData: skillMove,
        updatedAt: new Date().toISOString()
      };
    });

    console.log(`✓ Transformed ${transformedSkillMoves.length} skillMoves with explicit mapping`);

    // Upsert to skillMoves table
    const { error: upsertError } = await supabase
      .from('skillMoves')
      .upsert(transformedSkillMoves, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error upserting skillMoves:', upsertError);
      throw new Error(`Failed to upsert skillMoves: ${upsertError.message}`);
    }

    console.log('✓ Successfully upserted skillMoves');

    const result = {
      success: true,
      message: 'SkillMoves synchronized successfully',
      synced: transformedSkillMoves.length,
      translationsUsed: translationMap.size
    };

    console.log('=== SkillMoves Sync Complete ===', result);

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
        message: 'Internal Server Error during skillMoves sync',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
