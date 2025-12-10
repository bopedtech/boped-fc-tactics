import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RENDERZ_API_URL = 'https://renderz.app/api/search/elasticsearch';
const BATCH_SIZE = 500;

// Mapping an toàn để tránh lỗi PGRST204
function mapPlayerToSchema(p: any): any {
  const safeInt = (v: any) => (v && !isNaN(parseInt(v)) ? parseInt(v) : null);
  
  // Loại bỏ trường 'sort' nếu có
  const { sort, ...playerWithoutSort } = p;
  
  return {
    assetId: safeInt(p.assetId),
    playerId: safeInt(p.id || p.playerId),
    firstName: p.firstName || null,
    lastName: p.lastName || null,
    commonName: p.commonName || null,
    cardName: p.cardName || null,
    position: p.position || null,
    rating: safeInt(p.rating) || 0,
    weakFoot: safeInt(p.weakFoot),
    foot: safeInt(p.foot),
    workRateAtt: safeInt(p.workRateAtt),
    workRateDef: safeInt(p.workRateDef),
    weight: safeInt(p.weight),
    height: safeInt(p.height),
    birthday: p.birthday || null,
    bio: p.bio || null,
    bindingXml: p.bindingXml || null,
    tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags || null),
    skillStyleId: safeInt(p.skillStyleId),
    skillMovesLevel: safeInt(p.skillMovesLevel),
    auctionable: p.auctionable ?? null,
    rank: safeInt(p.rank),
    likes: safeInt(p.likes),
    added: p.added || null,
    revealOn: p.revealOn || null,
    source: p.source || null,
    created_at_renderz: p.created || null,
    workRates: p.workRates || null,
    
    // JSONB fields
    stats: p.stats || null,
    club: p.club || null,
    league: p.league || null,
    nation: p.nation || null,
    priceData: p.price || p.priceData || null,
    traits: p.traits || null,
    skillMoves: p.skillMoves || null,
    images: p.images || null,
    animation: p.animation || null,
    skillStyleSkills: p.skillStyleSkills || null,
    potentialPositions: p.potentialPositions || null,
    avgStats: p.avgStats || null,
    avgGkStats: p.avgGkStats || null,
    celebration: p.celebration || null,
    
    // Backup & System
    rawData: playerWithoutSort,
    updatedAt: new Date().toISOString()
  };
}

Deno.serve(async (req) => {
  // 1. Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Kết nối DB (Dùng Service Role để Ghi)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in Secrets");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // 3. Nhận Cursor từ Frontend
    const { cursor } = await req.json().catch(() => ({}));
    console.log(`📡 Processing Batch. Cursor: ${JSON.stringify(cursor)}`);

    // 4. Gọi Renderz API
    const payload: any = {
      query: {
        bool: {
          must: [],
          should: [],
          must_not: []
        }
      },
      sort: [
        { "rating": { "order": "desc" } },
        { "assetId": { "order": "desc" } }
      ],
      _source: [],
      size: BATCH_SIZE
    };
    
    if (cursor) {
      payload.search_after = cursor;
    }

    const res = await fetch(RENDERZ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://renderz.app',
        'Referer': 'https://renderz.app/24/players',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Renderz API Error: ${res.status} - ${errorText.substring(0, 500)}`);
      throw new Error(`Renderz API Error: ${res.status}`);
    }

    const data = await res.json();
    const players = data.players || [];
    const nextCursor = data.pagination;

    console.log(`📦 Received ${players.length} players from API`);

    // 5. Lọc Season (24, 25, 26)
    const validPlayers = players.filter((p: any) => {
      const tags = typeof p.tags === 'string' ? p.tags : JSON.stringify(p.tags || '');
      return tags.includes("24") || tags.includes("25") || tags.includes("26");
    });

    console.log(`✅ Valid players after season filter: ${validPlayers.length}`);

    // 6. UPSERT vào DB
    let upsertCount = 0;
    if (validPlayers.length > 0) {
      const dbRows = validPlayers.map(mapPlayerToSchema);
      
      const { error } = await supabase
        .from('players')
        .upsert(dbRows, { onConflict: 'assetId' });
      
      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }
      upsertCount = dbRows.length;
    }

    // 7. Trả kết quả
    const done = players.length === 0 || !nextCursor;
    
    console.log(`💾 Upserted ${upsertCount} players. Done: ${done}`);

    return new Response(JSON.stringify({
      done,
      processed: upsertCount,
      received: players.length,
      nextCursor: done ? null : nextCursor
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Sync error:', err);
    return new Response(JSON.stringify({ 
      error: err.message,
      done: false,
      processed: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
