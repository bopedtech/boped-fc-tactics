import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function getConflictColumn(table: string): string {
  if (table === 'localization_dictionary') return 'key';
  if (table === 'players') return 'playerId';
  return 'id';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const tables = body.tables || TABLES_TO_MIGRATE;
    const clearExisting = body.clearExisting || false;

    const oldSupabaseUrl = Deno.env.get('OLD_SUPABASE_URL');
    const oldSupabaseKey = Deno.env.get('OLD_SUPABASE_SERVICE_ROLE_KEY');
    const newSupabaseUrl = Deno.env.get('SUPABASE_URL');
    const newSupabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Starting migration...');
    console.log('Old URL:', oldSupabaseUrl ? 'Set' : 'Missing');
    console.log('New URL:', newSupabaseUrl ? 'Set' : 'Missing');

    if (!oldSupabaseUrl || !oldSupabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing OLD_SUPABASE_URL or OLD_SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newSupabaseUrl || !newSupabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oldClient = createClient(oldSupabaseUrl, oldSupabaseKey);
    const newClient = createClient(newSupabaseUrl, newSupabaseKey);

    const results: Record<string, { success: boolean; count?: number; error?: string }> = {};

    for (const table of tables) {
      console.log('Migrating table:', table);

      try {
        if (clearExisting) {
          console.log('Clearing existing data in', table);
          await newClient.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

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
            throw new Error('Failed to fetch from ' + table + ': ' + error.message);
          }

          if (data && data.length > 0) {
            allData = allData.concat(data);
            page++;
            console.log('Fetched', allData.length, 'rows from', table);
          }

          hasMore = data !== null && data.length === pageSize;
        }

        if (allData.length === 0) {
          results[table] = { success: true, count: 0 };
          console.log('No data to migrate for', table);
          continue;
        }

        const batchSize = 500;
        let insertedCount = 0;

        for (let i = 0; i < allData.length; i += batchSize) {
          const batch = allData.slice(i, i + batchSize);

          const { error: insertError } = await newClient
            .from(table)
            .upsert(batch, {
              onConflict: getConflictColumn(table),
              ignoreDuplicates: false,
            });

          if (insertError) {
            console.error('Error inserting batch into', table, insertError.message);
            throw new Error('Failed to insert into ' + table + ': ' + insertError.message);
          }

          insertedCount += batch.length;
          console.log('Inserted', insertedCount, '/', allData.length, 'rows into', table);
        }

        results[table] = { success: true, count: insertedCount };
        console.log('Successfully migrated', insertedCount, 'rows to', table);

      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Error migrating', table, msg);
        results[table] = { success: false, error: msg };
      }
    }

    const totalMigrated = Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.count || 0), 0);

    const failedTables = Object.entries(results)
      .filter(([_, r]) => !r.success)
      .map(([t]) => t);

    return new Response(
      JSON.stringify({
        success: failedTables.length === 0,
        message: 'Migration complete. Total rows migrated: ' + totalMigrated,
        results,
        failedTables,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Migration error:', msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
