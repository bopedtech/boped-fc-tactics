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
  created?: string; // Timestamp from Renderz API
  sort?: any[]; // Trường phân trang - sẽ bị loại bỏ
}

const RENDERZ_API_URL = 'https://renderz.app/api/search/elasticsearch';
const BATCH_SIZE = 50; // Increased batch size for better performance
const DELAY_MS = 1000; // 1000ms delay between requests to avoid rate limiting
const MAX_PAGES_PER_INVOCATION = 3; // Process max 3 pages per function call to avoid timeout
const MAX_RETRIES = 3; // Maximum retries for 502/520 errors
const JOB_NAME = 'player_sync'; // Unique identifier for sync job

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

  // 3. Xác thực và LỌC từng cầu thủ trong danh sách (LOGIC MỚI)
  const validPlayers = players.filter((player: any) => {
    
    // A. Kiểm tra cấu trúc cơ bản (Là Object hợp lệ, có assetId và playerId)
    const isValidStructure = player &&
                             typeof player === 'object' &&
                             !Array.isArray(player) &&
                             player.assetId &&
                             player.playerId;

    if (!isValidStructure) {
      return false;
    }

    // B. Logic Lọc theo Season (Mới)
    
    // Kiểm tra nếu trường 'tags' không tồn tại hoặc không phải là chuỗi
    if (typeof player.tags !== 'string') {
      // Nếu thiếu tags, loại bỏ cầu thủ
      return false;
    }

    // Kiểm tra nếu chuỗi tags chứa "24" HOẶC "25" HOẶC "26"
    const isInSeason = player.tags.includes("24") || player.tags.includes("25") || player.tags.includes("26");

    return isInSeason;
  });
  
  // In ra thông tin về số lượng cầu thủ đã lọc
  console.log(`Trang hiện tại: Nhận được ${players.length} từ API. Hợp lệ và đúng Season: ${validPlayers.length}.`);

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
    
    // 5. Lưu created_at từ API vào created_at_renderz
    if (player.created) {
      record.created_at_renderz = player.created;
    }
    
    // 6. Cập nhật timestamp
    record.updatedAt = new Date().toISOString();
    
    return record;
  });
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load sync state from database
async function loadSyncState(supabase: any): Promise<{ cursor: any[] | null, totalSynced: number }> {
  const { data, error } = await supabase
    .from('sync_state')
    .select('last_cursor, is_complete, total_synced')
    .eq('job_name', JOB_NAME)
    .single();

  // PGRST116 = Row not found (first run)
  if (error && error.code !== 'PGRST116') {
    console.error('Error loading sync state:', error);
    throw error;
  }

  // If previous cycle completed or no state exists, start fresh
  if (data?.is_complete || !data) {
    console.log('Starting fresh sync cycle');
    return { cursor: null, totalSynced: 0 };
  }

  // Continue from last cursor
  console.log('Resuming from saved state:', { cursor: data.last_cursor, totalSynced: data.total_synced });
  return { cursor: data.last_cursor, totalSynced: data.total_synced || 0 };
}

// Save sync state to database
async function saveSyncState(
  supabase: any, 
  cursor: any[] | null, 
  isComplete: boolean, 
  totalSynced: number
) {
  const { error } = await supabase
    .from('sync_state')
    .upsert({
      job_name: JOB_NAME,
      last_cursor: cursor,
      is_complete: isComplete,
      total_synced: totalSynced,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving sync state:', error);
    throw error;
  }
  
  console.log('Saved sync state:', { cursor, isComplete, totalSynced });
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
    
    // Load sync state from database (resumable sync)
    const { cursor: startCursor, totalSynced: previousTotalSynced } = await loadSyncState(supabase);
    
    const isTestMode = mode === 'test';
    const maxPagesToProcess = isTestMode ? maxPages : MAX_PAGES_PER_INVOCATION;
    
    console.log(`Max pages to fetch: ${maxPagesToProcess}`);
    if (startCursor) {
      console.log(`Resuming from cursor: ${JSON.stringify(startCursor)}`);
      console.log(`Previously synced: ${previousTotalSynced} players`);
    }
    
    let totalSynced = previousTotalSynced;
    let currentBatchSynced = 0;
    let pageCount = 0;
    let cursor: any[] | null = startCursor;
    let isSyncComplete = false;
    
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

      // Retry logic for 520 errors
      let retryCount = 0;
      let response: Response | null = null;
      
      while (retryCount <= MAX_RETRIES) {
        // Make request to Renderz API with Android mobile browser headers
        response = await fetch(RENDERZ_API_URL, {
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
            retryCount++;
            continue; // Retry the same request
          }
          
          // Retry for 502 Bad Gateway and 520 errors
          if (response.status === 502 || response.status === 520) {
            retryCount++;
            if (retryCount <= MAX_RETRIES) {
              const waitTime = 5000 * retryCount; // 5s, 10s, 15s (faster retries)
              console.log(`Got ${response.status} error. Retry ${retryCount}/${MAX_RETRIES}. Waiting ${waitTime/1000} seconds...`);
              await delay(waitTime);
              continue; // Retry the same request
            }
          }
          
          const errorText = await response.text();
          console.error(`HTTP error! status: ${response.status}`);
          console.error(`RAW ERROR RESPONSE (first 1000 chars): ${errorText.substring(0, 1000)}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Success - break out of retry loop
        break;
      }
      
      if (!response) {
        throw new Error('Failed to get response after retries');
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
      
      // Get raw players count before filtering
      const rawPlayersCount = data.players?.length || 0;

      console.log(`✅ Trang ${pageCount}: Nhận ${rawPlayersCount} cầu thủ từ API, ${extractedPlayers.length} hợp lệ sau khi lọc`);

      // CRITICAL: Check if API returned empty RAW data (true end condition)
      if (rawPlayersCount === 0) {
        console.log('API trả về trang rỗng. Hoàn tất đồng bộ.');
        isSyncComplete = true;
        break;
      }
      
      // IMPORTANT: Even if no valid players after filtering, continue to next page
      // Only stop when API returns empty raw data
      if (extractedPlayers.length === 0) {
        console.warn('Trang này không có cầu thủ hợp lệ sau khi lọc. Tiếp tục sang trang kế tiếp.');
        // Update cursor and continue - don't break!
        cursor = nextCursor;
        if (!cursor) {
          console.log('Không có cursor tiếp theo. Hoàn tất đồng bộ.');
          isSyncComplete = true;
          break;
        }
        pageCount++;
        
        // Save state even when no valid players (maintain progress)
        await saveSyncState(supabase, cursor, false, totalSynced);
        
        console.log(`Waiting ${DELAY_MS}ms before next request...`);
        await delay(DELAY_MS);
        continue; // Skip to next iteration
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

      currentBatchSynced += processedPlayers.length;
      totalSynced += processedPlayers.length;
      console.log(`Đã đồng bộ ${processedPlayers.length} cầu thủ. Tổng batch: ${currentBatchSynced}, Tổng toàn bộ: ${totalSynced}`);

      // Cập nhật cursor từ phản hồi API
      cursor = nextCursor;
      
      if (cursor) {
        console.log(`Cursor tiếp theo: ${JSON.stringify(cursor)}`);
      } else {
        console.log('Không có cursor tiếp theo. Hoàn tất đồng bộ.');
        isSyncComplete = true;
        break;
      }
      
      // SAVE STATE AFTER EACH PAGE (Durability guarantee)
      await saveSyncState(supabase, cursor, false, totalSynced);

      // Check if reached max pages for this invocation
      if (pageCount >= maxPagesToProcess) {
        console.log(`Reached max pages (${maxPagesToProcess}) for this invocation. Will continue in next call if needed.`);
        break;
      }

      // Delay before next request to avoid rate limiting
      console.log(`Waiting ${DELAY_MS}ms before next request...`);
      await delay(DELAY_MS);
    }

    // Mark as complete if sync finished
    if (isSyncComplete) {
      await saveSyncState(supabase, null, true, totalSynced);
      console.log('✅ Hoàn tất toàn bộ quá trình đồng bộ.');
    }
    
    const hasMore = !isSyncComplete && cursor !== null;
    const message = isTestMode 
      ? `Test sync completed: ${currentBatchSynced} players synced in this batch (${pageCount} pages). Total: ${totalSynced}`
      : isSyncComplete
        ? `🎉 Full sync completed: ${totalSynced} total players synced`
        : `Batch completed: ${currentBatchSynced} players synced (${pageCount} pages). Total: ${totalSynced}. More data available.`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        batchPlayers: currentBatchSynced,
        totalPlayers: totalSynced,
        totalPages: pageCount,
        mode,
        hasMore,
        isComplete: isSyncComplete,
        nextCursor: cursor,
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
