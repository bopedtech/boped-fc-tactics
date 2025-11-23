import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Daily Sync Job ===');
    console.log('Triggered at:', new Date().toISOString());
    console.log('Vietnam Time:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // List of all sync functions to run
    const syncFunctions = [
      'sync-renderz-nations',
      'sync-renderz-teams',
      'sync-renderz-leagues',
      'sync-renderz-traits',
      'sync-renderz-programs',
      'sync-renderz-celebrations',
      'sync-renderz-skillMoves',
      'sync-players',
    ];

    const results: Array<{ function: string; status: string; message?: string; error?: string }> = [];

    // Run each sync function sequentially
    for (const funcName of syncFunctions) {
      console.log(`\n--- Starting ${funcName} ---`);
      const startTime = Date.now();

      try {
        const { data, error } = await supabase.functions.invoke(funcName, {
          body: { 
            automated: true,
            scheduledRun: true 
          },
        });

        const duration = Date.now() - startTime;

        if (error) {
          console.error(`Error in ${funcName}:`, error);
          results.push({
            function: funcName,
            status: 'error',
            error: error.message || String(error),
          });
        } else {
          console.log(`✓ ${funcName} completed in ${duration}ms`);
          results.push({
            function: funcName,
            status: 'success',
            message: `Completed in ${duration}ms`,
          });
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`Exception in ${funcName}:`, error);
        results.push({
          function: funcName,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Log summary
    console.log('\n=== Sync Job Summary ===');
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    console.log(`Successful: ${successful}/${syncFunctions.length}`);
    console.log(`Failed: ${failed}/${syncFunctions.length}`);
    
    results.forEach(result => {
      console.log(`  ${result.function}: ${result.status}${result.error ? ' - ' + result.error : ''}`);
    });

    console.log('=== Daily Sync Job Completed ===\n');

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        vietnamTime: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        results,
        summary: {
          total: syncFunctions.length,
          successful,
          failed,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Critical error in sync-all-daily:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
