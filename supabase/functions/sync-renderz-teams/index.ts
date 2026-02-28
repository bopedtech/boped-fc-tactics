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

interface TeamData {
  id: number;
  name: string;
  image?: string;
  leagueId?: number;
  [key: string]: any;
}

interface TransformedTeam {
  id: number;
  displayName: string;
  localizationKey: string;
  image: string | null;
  leagueId: number | null;
  rawData: any;
  updatedAt: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate sync API key for security
    const syncApiSecret = Deno.env.get('SYNC_API_SECRET');
    const providedSecret = req.headers.get('x-sync-secret');
    const isInternalCall = req.headers.get('x-internal-call') === 'true';
    const hasAuthHeader = req.headers.get('authorization')?.startsWith('Bearer ');

    if (syncApiSecret && !isInternalCall && !hasAuthHeader && providedSecret !== syncApiSecret) {
      console.error('Unauthorized sync-renderz-teams attempt');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Teams sync from Renderz API...');

    // 1. Fetch Teams data from Renderz API (using /clubs endpoint)
    const renderzResponse = await fetch(
      'https://renderz.app/api/filter/filter-data/clubs?seasonId=24',
      { headers: RENDERZ_HEADERS }
    );

    if (!renderzResponse.ok) {
      throw new Error(`Renderz API error: ${renderzResponse.status}`);
    }

    const renderzData = await renderzResponse.json();

    if (renderzData.error) {
      throw new Error(`Renderz API returned error: ${renderzData.error}`);
    }

    const teamsData: TeamData[] = renderzData.data || renderzData;
    console.log(`Fetched ${teamsData.length} teams from Renderz`);

    // 2. Extract unique localization keys
    const localizationKeys = [...new Set(
      teamsData.map(team => team.name).filter(Boolean)
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
    const { data: existingRecords } = await supabase.from('teams').select('id, image');
    const existingImagesMap = new Map((existingRecords || []).map((r: any) => [r.id, r.image]));

    const transformedTeams: TransformedTeam[] = [];
    for (const team of teamsData) {
      const localizationKey = team.name;
      const displayName = translationMap.get(localizationKey) || localizationKey;

      let imageUrl = team.image || null;
      const existingImage = existingImagesMap.get(team.id);

      if (existingImage && !existingImage.includes('renderz.app')) {
        imageUrl = existingImage;
      } else if (imageUrl && imageUrl.includes('renderz.app')) {
        try {
          const imgResp = await fetch(imageUrl, { headers: RENDERZ_HEADERS });
          if (imgResp.ok) {
            const imgBuffer = await imgResp.arrayBuffer();
            const { error: uploadError } = await supabase.storage.from('player-media').upload(`teams/${team.id}.png`, imgBuffer, { contentType: 'image/png', upsert: true });
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from('player-media').getPublicUrl(`teams/${team.id}.png`);
              imageUrl = publicUrlData.publicUrl;
            }
          }
        } catch (e) { console.error('Image upload failed', e); }
      }

      transformedTeams.push({
        id: team.id,
        displayName,
        localizationKey,
        image: imageUrl,
        leagueId: team.leagueId || null,
        rawData: team,
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`Transformed ${transformedTeams.length} teams`);

    // 5. UPSERT into teams table
    const { data: upsertedData, error: upsertError } = await supabase
      .from('teams')
      .upsert(transformedTeams, { onConflict: 'id' });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    console.log('Teams sync completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${transformedTeams.length} teams`,
        synced: transformedTeams.length,
        translated: translationMap.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync-renderz-teams:', error);
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
