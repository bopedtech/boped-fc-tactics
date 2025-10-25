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

    // Fetch the JSON file from the public folder
    console.log('Fetching localization dictionary JSON file...');
    
    // The JSON file is in the public folder, accessible via the app URL
    const appUrl = req.headers.get('origin') || req.headers.get('referer')?.split('/admin')[0];
    if (!appUrl) {
      throw new Error('Unable to determine application URL');
    }
    
    const jsonUrl = `${appUrl}/localization_dictionary_import.json`;
    console.log(`Fetching from: ${jsonUrl}`);
    
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
    }

    const dictionaryData: DictionaryEntry[] = await response.json();
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
