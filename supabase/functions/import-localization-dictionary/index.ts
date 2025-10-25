import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DictionaryEntry {
  key: string;
  value_en: string;
  source: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Localization Dictionary Import ===');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body to get dictionary data
    console.log('Parsing dictionary data from request body...');
    
    const requestBody = await req.json();
    
    // Support both array format and object format
    let dictionaryData: DictionaryEntry[];
    
    if (Array.isArray(requestBody)) {
      // Already in array format
      dictionaryData = requestBody;
    } else if (typeof requestBody === 'object' && requestBody !== null) {
      // Convert object format {"key": "value"} to array format
      dictionaryData = Object.keys(requestBody).map(key => ({
        key: key,
        value_en: requestBody[key],
        source: 'Renderz_Runtime_Extraction'
      }));
    } else {
      throw new Error('Invalid request body format. Expected array or object.');
    }
    console.log(`✓ Loaded ${dictionaryData.length} dictionary entries from JSON`);

    if (dictionaryData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No dictionary entries found in JSON file',
          totalImported: 0
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate data structure
    const validEntries = dictionaryData.filter(entry => 
      entry.key && entry.value_en && typeof entry.key === 'string' && typeof entry.value_en === 'string'
    );

    console.log(`✓ Validated ${validEntries.length} out of ${dictionaryData.length} entries`);

    // Import in batches to avoid timeout
    const BATCH_SIZE = 500;
    let totalImported = 0;

    for (let i = 0; i < validEntries.length; i += BATCH_SIZE) {
      const batch = validEntries.slice(i, i + BATCH_SIZE);
      console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(validEntries.length / BATCH_SIZE)}...`);

      const { error: upsertError } = await supabase
        .from('localization_dictionary')
        .upsert(batch, {
          onConflict: 'key',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error(`Error importing batch ${i / BATCH_SIZE + 1}:`, upsertError);
        throw new Error(`Failed to import dictionary batch: ${upsertError.message}`);
      }

      totalImported += batch.length;
      console.log(`✓ Imported ${totalImported} / ${validEntries.length} entries`);
    }

    const result = {
      success: true,
      message: 'Localization dictionary imported successfully',
      totalImported: totalImported,
      totalEntries: dictionaryData.length,
      validEntries: validEntries.length
    };

    console.log('=== Import Complete ===', result);

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
        message: 'Internal Server Error during dictionary import',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
