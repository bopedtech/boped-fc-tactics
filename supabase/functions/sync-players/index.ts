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

// Extract và validate players từ Object response
function extractPlayersFromObject(responseData: any): RawPlayerData[] {
  // Kiểm tra đầu vào cơ bản
  if (typeof responseData !== 'object' || responseData === null || Array.isArray(responseData)) {
    console.error('Invalid response format: not an object');
    return [];
  }
  
  // Check for explicit error response
  if (responseData === 'error' || (typeof responseData === 'string')) {
    console.error('Error response received from API');
    return [];
  }
  
  const validPlayers: RawPlayerData[] = [];
  
  // Loop through all keys in the object
  for (const [key, value] of Object.entries(responseData)) {
    // Bỏ qua _pagination
    if (key === '_pagination') continue;
    
    let item = value; // Sử dụng 'let' vì sẽ gán lại giá trị sau khi unwrap
    
    // --- LOGIC MỚI: Xử lý thông minh định dạng Mảng (Unwrapping) ---
    
    // Kiểm tra nếu item là một Mảng (Array)
    if (Array.isArray(item)) {
      
      // Trường hợp A: "Mảng Cầu thủ" hợp lệ (Ví dụ: [{"assetId": ...}])
      // Điều kiện: Độ dài là 1, phần tử đầu tiên là Object, và không phải null/array
      if (item.length === 1 && typeof item[0] === 'object' && item[0] !== null && !Array.isArray(item[0])) {
        item = item[0]; // Trích xuất (Unwrap) đối tượng cầu thủ từ mảng
        console.log(`✅ Unwrapped player array for key ${key}`);
      } 
      
      // Trường hợp B: "Mảng Sort" hoặc mảng không hợp lệ (Ví dụ: [110, 24021501])
      else {
        console.warn(`⚠️ Bỏ qua item: Định dạng Mảng không hợp lệ (có thể là mảng sort)`, JSON.stringify(item));
        continue; // Bỏ qua và chuyển sang item tiếp theo
      }
    }
    
    // Kiểm tra lại sau khi trích xuất: Đảm bảo item bây giờ là một Object hợp lệ
    if (typeof item !== 'object' || item === null) {
      console.warn(`⚠️ Bỏ qua item: Không phải là Object hợp lệ`, JSON.stringify(item));
      continue;
    }
    
    // --- KẾT THÚC LOGIC MỚI ---
    
    const playerData = item as any;
    
    // Đảm bảo các trường cơ bản tồn tại
    if (!playerData.assetId || !playerData.playerId) {
      console.warn(`⚠️ Bỏ qua item: Thiếu assetId/playerId`, JSON.stringify(playerData).substring(0, 200));
      continue;
    }
    
    // Nếu vượt qua tất cả kiểm tra, đây là cầu thủ hợp lệ
    validPlayers.push(playerData as RawPlayerData);
  }
  
  return validPlayers;
}

// Đơn giản hóa: Chuyển đổi trực tiếp sang camelCase schema
function processPlayerData(rawPlayers: RawPlayerData[]): any[] {
  return rawPlayers.map((player) => {
    // Tạo bản sao để thao tác
    const record: any = { ...player };
    
    // Loại bỏ trường 'sort' (dùng cho phân trang, không có trong schema DB)
    delete record.sort;
    
    // Lưu dữ liệu gốc vào rawData (bắt buộc theo schema mới)
    record.rawData = player;
    
    // Đảm bảo các trường NOT NULL có giá trị
    record.assetId = player.assetId ?? 0;
    record.playerId = player.playerId ?? 0;
    record.rating = player.rating ?? 0;
    
    // Cập nhật timestamp
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
      
      // Extract và validate players
      const rawPlayers = extractPlayersFromObject(data);

      console.log(`✅ Received ${rawPlayers.length} valid players on page ${pageCount}`);

      // If no more players, pagination complete
      if (rawPlayers.length === 0) {
        console.log('No more players. Pagination complete.');
        break;
      }

      // Process và prepare data
      const processedPlayers = processPlayerData(rawPlayers);
      
      // Log sample record
      console.log('📝 Sample record to upsert:', JSON.stringify(processedPlayers[0], null, 2));
      
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
      console.log(`Synced ${processedPlayers.length} players. Total: ${totalSynced}`);

      // Extract cursor from last player's sort field
      const lastPlayer = rawPlayers[rawPlayers.length - 1];
      if (lastPlayer && lastPlayer.sort) {
        cursor = lastPlayer.sort;
        console.log(`Extracted cursor from last player: ${JSON.stringify(cursor)}`);
      } else {
        console.log('No sort field found on last player. Pagination complete.');
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
