import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface cho dữ liệu từ API Renderz (giữ nguyên để nhận dữ liệu)
interface RawPlayerData {
  assetId?: number;
  playerId?: number;
  firstName?: string;
  lastName?: string;
  commonName?: string;
  cardName?: string;
  position?: string;
  rating?: number;
  weakFoot?: number;
  foot?: number;
  workRateAtt?: number;
  workRateDef?: number;
  weight?: number;
  height?: number;
  birthday?: string;
  bio?: string;
  bindingXml?: string;
  animation?: any;
  tags?: string;
  skillStyleId?: number;
  skillStyleSkills?: any[];
  images?: any;
  skillMoves?: any;
  skillMovesLevel?: number;
  celebration?: any;
  traits?: any[];
  club?: any;
  league?: any;
  nation?: any;
  potentialPositions?: any[];
  avgStats?: any;
  avgGkStats?: any;
  stats?: any;
  priceData?: any;
  auctionable?: boolean;
  rank?: number;
  likes?: number;
  added?: string;
  revealOn?: string;
  source?: string;
  sort?: any[]; // Trường phân trang - sẽ bị loại bỏ
}

const RENDERZ_API_URL = 'https://renderz.app/api/search/elasticsearch';
const BATCH_SIZE = 500; // Increased batch size for better performance
const DELAY_MS = 1500; // 1.5 second delay between requests

// Xử lý phản hồi API và trích xuất cầu thủ + cursor
function processApiResponse(responseData: any): { extractedPlayers: RawPlayerData[], nextCursor: any[] | null } {
  // 1. Xác thực phản hồi cơ bản
  if (typeof responseData !== 'object' || responseData === null) {
    console.error('Định dạng phản hồi API không hợp lệ.');
    return { extractedPlayers: [], nextCursor: null };
  }

  // 2. Trích xuất Cầu thủ (Trực tiếp từ khóa 'players')
  const players = responseData.players;

  // Kiểm tra nếu khóa 'players' không tồn tại hoặc không phải là mảng
  if (!Array.isArray(players)) {
    console.warn("Khóa 'players' không tìm thấy hoặc không phải mảng. Dừng xử lý.");
    return { extractedPlayers: [], nextCursor: null };
  }

  // 3. Xác thực từng cầu thủ trong danh sách
  const validPlayers = players.filter((player: any) =>
    player && 
    typeof player === 'object' && 
    !Array.isArray(player) &&
    player.assetId && 
    player.playerId
  );

  console.log(`✅ Đã lọc ${validPlayers.length}/${players.length} cầu thủ hợp lệ`);

  // 4. Trích xuất Cursor 
  let nextCursor = responseData.pagination || responseData._pagination;

  // 5. Xác thực định dạng Cursor
  if (!Array.isArray(nextCursor) || nextCursor.length === 0) {
    console.warn('Định dạng cursor không hợp lệ hoặc không tìm thấy. Sẽ dừng sau trang này.');
    nextCursor = null;
  }

  // 6. Trả về kết quả
  return {
    extractedPlayers: validPlayers,
    nextCursor: nextCursor
  };
}

// Direct Upsert An toàn: Xử lý dữ liệu trước khi lưu
function processPlayerData(rawPlayers: RawPlayerData[]): any[] {
  return rawPlayers.map((player) => {
    // 1. Tạo bản sao để thao tác
    const record: any = { ...player };
    
    // 2. Loại bỏ trường 'sort' nếu có (Elasticsearch search_after thêm vào)
    if (record.sort) {
      delete record.sort;
    }
    
    // 3. Lưu dữ liệu gốc vào rawData (bắt buộc theo schema)
    record.rawData = player;
    
    // 4. Đảm bảo các trường NOT NULL có giá trị
    record.assetId = player.assetId ?? 0;
    record.playerId = player.playerId ?? 0;
    record.rating = player.rating ?? 0;
    
    // 5. Cập nhật timestamp
    record.updatedAt = new Date().toISOString();
    
    return record;
  });
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = 'test', maxPages = 5 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting search_after pagination sync in ${mode} mode...`);
    console.log(`Max pages to fetch: ${mode === 'test' ? maxPages : 'unlimited'}`);
    
    let totalSynced = 0;
    let pageCount = 0;
    let cursor: any[] | null = null; // search_after cursor
    const isTestMode = mode === 'test';
    
    // Pagination loop using search_after
    while (true) {
      pageCount++;
      console.log(`\n=== Fetching page ${pageCount} ===`);
      
      // Build the simplified payload structure
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

      // Add search_after cursor if not first page
      if (cursor !== null) {
        payload.search_after = cursor;
        console.log(`Using cursor: ${JSON.stringify(cursor)}`);
      }

      // Make request to Renderz API with Android mobile browser headers
      const response = await fetch(RENDERZ_API_URL, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://renderz.app',
          'Referer': 'https://renderz.app/24/players',
          
          // Android mobile browser simulation
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
          'Sec-Ch-Ua': '"Chromium";v="141", "Google Chrome";v="141", "Not?A_Brand";v="8"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': '"Android"',
          
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Rate limited (429). Waiting 60 seconds...');
          await delay(60000);
          continue; // Retry the same request
        }
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`);
        console.error(`RAW ERROR RESPONSE (first 1000 chars): ${errorText.substring(0, 1000)}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get raw response text first for error logging
      const rawResponseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(rawResponseText);
      } catch (parseError) {
        console.error('JSON PARSE ERROR: Unable to parse response (might be HTML)');
        console.error(`RAW RESPONSE BODY (first 1000 chars): ${rawResponseText.substring(0, 1000)}`);
        throw new Error('Invalid JSON response from API');
      }
      
      // Xử lý phản hồi API bằng hàm mới
      const { extractedPlayers, nextCursor } = processApiResponse(data);

      console.log(`✅ Nhận được ${extractedPlayers.length} cầu thủ hợp lệ ở trang ${pageCount}`);

      // Nếu không còn cầu thủ, dừng đồng bộ
      if (extractedPlayers.length === 0) {
        console.log('Không còn cầu thủ. Hoàn tất đồng bộ.');
        break;
      }

      // Process và prepare data
      const processedPlayers = processPlayerData(extractedPlayers);
      
      // Log sample record
      if (processedPlayers.length > 0) {
        console.log('📝 Sample record to upsert:', JSON.stringify(processedPlayers[0], null, 2));
      }
      
      // Upsert to Supabase (sử dụng assetId làm khóa chính)
      const { error } = await supabase
        .from('players')
        .upsert(processedPlayers, { 
          onConflict: 'assetId',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting to Supabase:', error);
        throw error;
      }

      totalSynced += processedPlayers.length;
      console.log(`Đã đồng bộ ${processedPlayers.length} cầu thủ. Tổng: ${totalSynced}`);

      // Cập nhật cursor từ phản hồi API
      cursor = nextCursor;
      
      if (cursor) {
        console.log(`Cursor tiếp theo: ${JSON.stringify(cursor)}`);
      } else {
        console.log('Không có cursor tiếp theo. Hoàn tất đồng bộ.');
        break;
      }

      // Test mode: stop after maxPages
      if (isTestMode && pageCount >= maxPages) {
        console.log(`Test mode: Reached max pages (${maxPages}). Stopping.`);
        break;
      }

      // Delay before next request to avoid rate limiting
      console.log(`Waiting ${DELAY_MS}ms before next request...`);
      await delay(DELAY_MS);
    }

    const message = isTestMode 
      ? `Test sync completed: ${totalSynced} players synced (${pageCount} pages)`
      : `Full sync completed: ${totalSynced} players synced (${pageCount} pages)`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        totalPlayers: totalSynced,
        totalPages: pageCount,
        mode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
