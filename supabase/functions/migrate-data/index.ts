import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tables to migrate (in order to respect dependencies)
const TABLES_TO_MIGRATE = [
  'localization_dictionary',
  'nations',
  'leagues', 
  'teams',
  'programs',
  'traits',
  'skillmoves',
  'celebrations',
  'formations',
  'players',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tables, clearExisting = false } = await req.json().catch(() => ({}));
    
    // Old Supabase project
    const oldSupabaseUrl = Deno.env.get('OLD_SUPABASE_URL');
    const oldSupabaseKey = Deno.env.get('OLD_SUPABASE_SERVICE_ROLE_KEY');
    
    // Current Lovable Cloud project
    const newSupabaseUrl = Deno.env.get('SUPABASE_URL');
    const newSupabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!oldSupabaseUrl || !oldSupabaseKey) {
      throw new Error('Missing OLD_SUPABASE_URL or OLD_SUPABASE_SERVICE_ROLE_KEY');
    }

    if (!newSupabaseUrl || !newSupabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const oldClient = createClient(oldSupabaseUrl, oldSupabaseKey);
    const newClient = createClient(newSupabaseUrl, newSupabaseKey);

    const tablesToMigrate = tables || TABLES_TO_MIGRATE;
    const results: Record<string, { success: boolean; count?: number; error?: string }> = {};

    for (const table of tablesToMigrate) {
      console.log(`Starting migration for table: ${table}`);
      
      try {
        // Clear existing data if requested
        if (clearExisting) {
          console.log(`Clearing existing data in ${table}...`);
          const { error: deleteError } = await newClient
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
          
          if (deleteError) {
            console.log(`Warning: Could not clear ${table}: ${deleteError.message}`);
          }
        }

        // Fetch all data from old project (paginated for large tables)
        let allData: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await oldClient
            .from(table)
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (error) {
            throw new Error(`Failed to fetch from ${table}: ${error.message}`);
          }

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            page++;
            console.log(`Fetched ${allData.length} rows from ${table}...`);
          }

          hasMore = data && data.length === pageSize;
        }

        if (allData.length === 0) {
          results[table] = { success: true, count: 0 };
          console.log(`No data to migrate for ${table}`);
          continue;
        }

        // Insert data in batches
        const batchSize = 500;
        let insertedCount = 0;

        for (let i = 0; i < allData.length; i += batchSize) {
          const batch = allData.slice(i, i + batchSize);
          
          const { error: insertError } = await newClient
            .from(table)
            .upsert(batch, { 
              onConflict: getConflictColumn(table),
              ignoreDuplicates: false 
            });

          if (insertError) {
            console.error(`Error inserting batch into ${table}: ${insertError.message}`);
            throw new Error(`Failed to insert into ${table}: ${insertError.message}`);
          }

          insertedCount += batch.length;
          console.log(`Inserted ${insertedCount}/${allData.length} rows into ${table}`);
        }

        results[table] = { success: true, count: insertedCount };
        console.log(`Successfully migrated ${insertedCount} rows to ${table}`);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error migrating ${table}:`, error);
        results[table] = { success: false, error: errorMessage };
      }
    }

    const totalMigrated = Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.count || 0), 0);

    const failedTables = Object.entries(results)
      .filter(([, r]) => !r.success)
      .map(([table]) => table);

    return new Response(
      JSON.stringify({
        success: failedTables.length === 0,
        message: `Migration complete. Total rows migrated: ${totalMigrated}`,
        results,
        failedTables,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to get the primary key column for upsert
function getConflictColumn(table: string): string {
  switch (table) {
    case 'localization_dictionary':
      return 'key';
    case 'formations':
      return 'id';
    case 'players':
      return 'playerId';
    default:
      return 'id';
  }
}
