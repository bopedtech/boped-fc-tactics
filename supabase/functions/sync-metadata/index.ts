import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const METADATA_API_URL = 'https://renderz.app/24/programs/__data.json?x-sveltekit-invalidated=111';

// Hàm đệ quy để duyệt toàn bộ cấu trúc JSON
function traverseAndExtract(node: any, foundData: any): void {
  // Điều kiện dừng đệ quy
  if (!node || typeof node !== 'object') return;

  // Nếu là mảng, duyệt qua từng phần tử
  if (Array.isArray(node)) {
    node.forEach(item => traverseAndExtract(item, foundData));
    return;
  }

  // Logic nhận dạng đối tượng (Heuristics)
  if (node.id != null && node.name) {
    const id = node.id;
    const name = String(node.name);

    // 1. Nhận dạng Clubs (ID số, tên bắt đầu bằng TeamName_)
    if (typeof id === 'number' && name.startsWith("TeamName_")) {
      foundData.clubs.set(id, node);
    } 
    // 2. Nhận dạng Leagues (ID số, tên bắt đầu bằng LeagueName_)
    else if (typeof id === 'number' && name.startsWith("LeagueName_")) {
      foundData.leagues.set(id, node);
    }
    // 3. Nhận dạng Nations (ID số, tên bắt đầu bằng NationName_)
    else if (typeof id === 'number' && name.startsWith("NationName_")) {
      foundData.nations.set(id, node);
    }
    // 4. Nhận dạng Programs (ID chuỗi, viết hoa, độ dài > 3)
    else if (typeof id === 'string' && id === id.toUpperCase() && id.length > 3) {
      // Kiểm tra thêm nếu có trường image hoặc sort để tăng độ chính xác
      if (node.image || node.sort !== undefined) {
        foundData.programs.set(id, node);
      }
    }
  }

  // Tiếp tục duyệt sâu vào các thuộc tính con
  Object.values(node).forEach(child => traverseAndExtract(child, foundData));
}

// Hàm trợ giúp để Upsert dữ liệu
async function upsertData(supabase: any, tableName: string, dataList: any[]): Promise<void> {
  if (dataList.length === 0) {
    console.log(`Không có dữ liệu để upsert cho bảng ${tableName}`);
    return;
  }

  const { error } = await supabase
    .from(tableName)
    .upsert(dataList, { onConflict: 'id' });

  if (error) {
    console.error(`❌ Lỗi nghiêm trọng khi Upsert vào bảng ${tableName}:`);
    console.error(`Code: ${error.code}, Message: ${error.message}`);
    console.error(`Details: ${JSON.stringify(error.details || {})}`);
    throw new Error(`Supabase Upsert failed on table ${tableName}. Code: ${error.code}`);
  } else {
    console.log(`✅ Upsert thành công ${dataList.length} bản ghi vào ${tableName}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Bắt đầu đồng bộ metadata...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Gọi API với xử lý lỗi chi tiết
    console.log(`📡 Đang gọi API: ${METADATA_API_URL}`);
    let response;
    let rawApiData;
    
    try {
      response = await fetch(METADATA_API_URL, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://renderz.app/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
          'Sec-Ch-Ua': '"Chromium";v="141", "Google Chrome";v="141", "Not?A_Brand";v="8"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': '"Android"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });

      // Kiểm tra HTTP status
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ LỖI HTTP: API Renderz trả về status ${response.status}`);
        console.error(`❌ Nội dung phản hồi (1000 ký tự đầu): ${errorText.substring(0, 1000)}`);
        throw new Error(`API Fetch Failure: Status ${response.status}`);
      }

      // Kiểm tra Content-Type
      const contentType = response.headers.get('content-type');
      console.log(`📊 Content-Type: ${contentType}`);

      // Phân tích JSON
      console.log('🔄 Đang phân tích JSON...');
      const responseText = await response.text();
      console.log(`📊 Response length: ${responseText.length} characters`);
      console.log(`📊 First 500 chars: ${responseText.substring(0, 500)}`);
      
      rawApiData = JSON.parse(responseText);
      console.log('✅ Phân tích JSON thành công');
      
    } catch (error) {
      console.error('❌ LỖI CRITICAL (Fetch/Parse):');
      console.error(`Message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      throw error;
    }

    // Bộ chứa để lưu trữ kết quả
    const foundData = {
      clubs: new Map(),
      leagues: new Map(),
      nations: new Map(),
      programs: new Map()
    };

    // 2. Bắt đầu quá trình trích xuất
    console.log('🔍 Bắt đầu trích xuất dữ liệu...');
    traverseAndExtract(rawApiData, foundData);

    console.log(`📊 Kết quả trích xuất:`);
    console.log(`   - Clubs: ${foundData.clubs.size}`);
    console.log(`   - Leagues: ${foundData.leagues.size}`);
    console.log(`   - Nations: ${foundData.nations.size}`);
    console.log(`   - Programs: ${foundData.programs.size}`);

    // 3. Chuẩn bị dữ liệu và Ánh xạ Rõ ràng
    const mapToBasicSchema = (item: any) => ({
      id: item.id,
      name: item.name,
      image: item.image || null,
      rawData: item,
      updatedAt: new Date().toISOString()
    });

    const mapToProgramSchema = (item: any) => ({
      id: item.id,
      name: item.name,
      image: item.image || null,
      sort: item.sort !== undefined ? item.sort : null,
      rawData: item,
      updatedAt: new Date().toISOString()
    });

    const clubsToUpsert = Array.from(foundData.clubs.values()).map(mapToBasicSchema);
    const leaguesToUpsert = Array.from(foundData.leagues.values()).map(mapToBasicSchema);
    const nationsToUpsert = Array.from(foundData.nations.values()).map(mapToBasicSchema);
    const programsToUpsert = Array.from(foundData.programs.values()).map(mapToProgramSchema);

    // 4. Lưu dữ liệu vào Supabase
    console.log('💾 Bắt đầu lưu dữ liệu vào Supabase...');
    await upsertData(supabase, 'clubs', clubsToUpsert);
    await upsertData(supabase, 'leagues', leaguesToUpsert);
    await upsertData(supabase, 'nations', nationsToUpsert);
    await upsertData(supabase, 'programs', programsToUpsert);

    const totalRecords = clubsToUpsert.length + leaguesToUpsert.length + 
                        nationsToUpsert.length + programsToUpsert.length;

    console.log(`🎉 Hoàn tất đồng bộ metadata! Tổng: ${totalRecords} bản ghi`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Metadata sync completed successfully',
        data: {
          clubs: clubsToUpsert.length,
          leagues: leaguesToUpsert.length,
          nations: nationsToUpsert.length,
          programs: programsToUpsert.length,
          total: totalRecords
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ LỖI NGHIÊM TRỌNG (Global Handler):');
    console.error(`Message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error during metadata sync',
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
