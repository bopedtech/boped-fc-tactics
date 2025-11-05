import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Vietnamese Translation ===');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch all records that need translation (where value_vi is null or empty)
    const { data: records, error: fetchError } = await supabase
      .from('localization_dictionary')
      .select('key, value_en')
      .or('value_vi.is.null,value_vi.eq.');

    if (fetchError) {
      throw new Error(`Failed to fetch records: ${fetchError.message}`);
    }

    console.log(`Found ${records?.length || 0} records to translate`);

    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No records to translate',
          translated: 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process in batches to avoid rate limits and timeouts
    const BATCH_SIZE = 20;
    let totalTranslated = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      console.log(`Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}...`);

      // Prepare batch for translation
      const textsToTranslate = batch.map(r => r.value_en).join('\n---\n');

      // Call Lovable AI to translate
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a professional Vietnamese translator specializing in football/soccer terminology. Translate English text to Vietnamese accurately while preserving football terms appropriately.'
            },
            {
              role: 'user',
              content: `Translate the following English texts to Vietnamese. Each text is separated by "---". Return ONLY the translations in the same order, separated by "---", without any additional text or explanations:\n\n${textsToTranslate}`
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI translation error:', aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (aiResponse.status === 402) {
          throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
        }
        throw new Error(`AI translation failed: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const translatedText = aiData.choices?.[0]?.message?.content || '';
      const translations = translatedText.split('---').map((t: string) => t.trim());

      // Update each record with its translation
      for (let j = 0; j < batch.length; j++) {
        const record = batch[j];
        const translation = translations[j] || record.value_en; // Fallback to English if translation missing

        const { error: updateError } = await supabase
          .from('localization_dictionary')
          .update({ value_vi: translation })
          .eq('key', record.key);

        if (updateError) {
          console.error(`Error updating key ${record.key}:`, updateError);
        } else {
          totalTranslated++;
        }
      }

      console.log(`✓ Translated ${totalTranslated} / ${records.length} records`);

      // Add small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < records.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const result = {
      success: true,
      message: 'Translation completed successfully',
      totalRecords: records.length,
      translated: totalTranslated
    };

    console.log('=== Translation Complete ===', result);

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
        message: 'Translation failed',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
