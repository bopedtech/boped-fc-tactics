import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enum cho các chỉ số cầu thủ
enum PlayerStat {
  RATING = "RATING",
  HEIGHT = "HEIGHT",
  PACE = "PAC",
  SHOOTING = "SHO",
  PASSING = "PAS",
  DRIBBLING = "DRI",
  DEFENDING = "DEF",
  PHYSICAL = "PHY",
}

// Tool definitions cho Gemini
const tools = [
  {
    functionDeclarations: [
      {
        name: "find_top_players",
        description: "Tìm kiếm các cầu thủ hàng đầu (Top N) dựa trên một chỉ số. Dùng khi hỏi ai giỏi nhất, nhanh nhất, cao nhất, hoặc tệ nhất, chậm nhất.",
        parameters: {
          type: "OBJECT",
          properties: {
            stat: {
              type: "STRING",
              enum: Object.values(PlayerStat),
              description: "Chỉ số dùng để xếp hạng: RATING (OVR), HEIGHT (chiều cao), PAC (tốc độ), SHO (sút), PAS (chuyền), DRI (rê bóng), DEF (phòng thủ), PHY (thể chất)",
            },
            limit: {
              type: "INTEGER",
              description: "Số lượng cầu thủ trả về (Mặc định 5). Dùng 1 nếu hỏi 'Ai nhất?'.",
            },
            ascending: {
              type: "BOOLEAN",
              description: "Sắp xếp tăng dần. FALSE (mặc định) cho giỏi nhất. TRUE cho tệ nhất.",
            }
          },
          required: ["stat"],
        },
      },
      {
        name: "get_player_count",
        description: "Đếm tổng số lượng cầu thủ trong database, có thể lọc theo vị trí.",
        parameters: {
          type: "OBJECT",
          properties: {
            filterPosition: {
              type: "STRING",
              description: "Vị trí cụ thể (ví dụ: 'GK', 'ST', 'CM'). Nếu bỏ trống, đếm tất cả.",
            },
          },
        },
      }
    ]
  }
];

const SYSTEM_INSTRUCTION_VI = `
Bạn là trợ lý AI chuyên gia phân tích dữ liệu FC Mobile của Boped FC Tactics.
Nhiệm vụ của bạn là sử dụng các công cụ (Tools) để truy vấn dữ liệu chính xác từ database.

QUY TẮC SỬ DỤNG CÔNG CỤ:
1. Luôn sử dụng công cụ khi hỏi về dữ liệu thực tế.
2. Khi sử dụng find_top_players:
   - Ánh xạ ngôn ngữ tự nhiên sang chỉ số:
     * Tốc độ/Chạy nhanh/Pace = PAC
     * Sút/Dứt điểm/Shooting = SHO
     * OVR/Rating = RATING
     * Chiều cao = HEIGHT
     * Chuyền bóng/Passing = PAS
     * Rê bóng/Dribbling = DRI
     * Phòng thủ/Defending = DEF
     * Thể chất/Sức mạnh/Physical = PHY
   - Nếu hỏi "Ai nhất?", đặt limit là 1.
   - Nếu hỏi "Ai giỏi nhất/nhanh nhất/cao nhất?", đặt ascending là FALSE.
   - Nếu hỏi "Ai chậm nhất/thấp nhất/tệ nhất?", đặt ascending là TRUE.
3. Sau khi nhận kết quả từ công cụ, hãy tổng hợp câu trả lời tự nhiên, rõ ràng và thân thiện bằng tiếng Việt.
4. QUAN TRỌNG: Trả lời với format JSON có playerCards để hiển thị thẻ cầu thủ:

Format response:
\`\`\`json
{"playerCards": [<danh sách cầu thủ với đầy đủ thông tin từ kết quả công cụ>]}
\`\`\`

Sau đó thêm phần giải thích văn bản ngắn gọn.

VÍ DỤ RESPONSE TỐT:
\`\`\`json
{"playerCards": [{"assetId": 123, "commonName": "Mbappe", "rating": 91, ...}]}
\`\`\`

Đây là cầu thủ có tốc độ cao nhất trong FC Mobile với PAC 97.
`;

const SYSTEM_INSTRUCTION_EN = `
You are an AI expert analyst for FC Mobile data at Boped FC Tactics.
Your task is to use Tools to query accurate data from the database.

TOOL USAGE RULES:
1. Always use tools when asked about actual data.
2. When using find_top_players:
   - Map natural language to stats:
     * Speed/Fast/Pace = PAC
     * Shooting/Finishing = SHO
     * OVR/Rating = RATING
     * Height = HEIGHT
     * Passing = PAS
     * Dribbling = DRI
     * Defending/Defense = DEF
     * Physical/Strength = PHY
   - If asked "Who is the best?", set limit to 1.
   - If asked "Who is the best/fastest/tallest?", set ascending to FALSE.
   - If asked "Who is the worst/slowest/shortest?", set ascending to TRUE.
3. After receiving tool results, provide a natural, clear, and friendly answer in English.
4. IMPORTANT: Respond with JSON format containing playerCards to display player cards:

Response format:
\`\`\`json
{"playerCards": [<list of players with full information from tool results>]}
\`\`\`

Then add a brief text explanation.

GOOD RESPONSE EXAMPLE:
\`\`\`json
{"playerCards": [{"assetId": 123, "commonName": "Mbappe", "rating": 91, ...}]}
\`\`\`

This is the player with the highest pace in FC Mobile with PAC 97.
`;

// Hàm thực thi công cụ
async function executeGetPlayerCount(supabase: any, args: { filterPosition?: string }) {
  let query = supabase.from('players').select('*', { count: 'estimated', head: true }).eq('is_visible', true);
  
  if (args.filterPosition) {
    query = query.eq('position', args.filterPosition.toUpperCase());
  }

  const { count, error } = await query;
  
  if (error || count === null) {
    console.error("Count error:", error);
    return { error: error?.message || "Không thể đếm số lượng." };
  }
  
  return { total_players: count };
}

async function executeFindTopPlayers(supabase: any, args: { stat: string, limit?: number, ascending?: boolean }) {
  const limit = args.limit || 5;
  const ascending = args.ascending || false;
  const stat = args.stat;

  console.log(`Gọi RPC: stat=${stat}, limit=${limit}, ascending=${ascending}`);

  const { data, error } = await supabase.rpc('get_top_players_by_stat', {
    stat_key: stat,
    limit_count: limit,
    sort_asc: ascending
  });

  if (error) {
    console.error("RPC Error:", error);
    return { error: error.message };
  }

  // Transform data để match với PlayerCard component
  const players = data.map((p: any) => ({
    assetId: p.assetId,
    playerId: p.assetId,
    commonName: p.commonName,
    rating: p.rating,
    position: p.position,
    club: p.club,
    nation: p.nation,
    league: p.league,
    images: p.images,
    stats: p.stats,
    avgStats: p.avgStats,
    avgGkStats: p.avgGkStats,
  }));

  return { players, stat_name: stat, stat_value_key: args.stat };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userQuery, locale = "vi" } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY không được cấu hình");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Gọi Gemini với tool support
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const conversationHistory = messages || [];
    const query = userQuery || (conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : "");

    // First call to Gemini
    let geminiMessages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }))
    ];

    if (userQuery) {
      geminiMessages.push({
        role: "user",
        parts: [{ text: userQuery }]
      });
    }

    const systemInstruction = locale === "en" ? SYSTEM_INSTRUCTION_EN : SYSTEM_INSTRUCTION_VI;
    
    const requestBody = {
      contents: geminiMessages,
      tools: tools,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    console.log("Gọi Gemini lần 1...");
    const response1 = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response1.ok) {
      const errorText = await response1.text();
      console.error("Gemini error:", errorText);
      throw new Error("Lỗi khi gọi Gemini API");
    }

    const data1 = await response1.json();
    const candidate = data1.candidates?.[0];
    
    if (!candidate) {
      throw new Error("Không nhận được phản hồi từ Gemini");
    }

    // Kiểm tra xem có tool calls không
    const functionCalls = candidate.content?.parts?.filter((part: any) => part.functionCall);

    if (functionCalls && functionCalls.length > 0) {
      console.log("Phát hiện tool calls:", functionCalls.length);
      
      // Thực thi các tool calls
      const functionResponses = [];
      
      for (const call of functionCalls) {
        const functionName = call.functionCall.name;
        const args = call.functionCall.args;
        
        console.log(`Thực thi: ${functionName}`, args);
        
        let result;
        if (functionName === "find_top_players") {
          result = await executeFindTopPlayers(supabase, args);
        } else if (functionName === "get_player_count") {
          result = await executeGetPlayerCount(supabase, args);
        }
        
        functionResponses.push({
          functionResponse: {
            name: functionName,
            response: result
          }
        });
      }

      // Gọi Gemini lần 2 với kết quả từ tools
      console.log("Gọi Gemini lần 2 với kết quả tools...");
      
      const requestBody2 = {
        contents: [
          ...geminiMessages,
          {
            role: "model",
            parts: functionCalls
          },
          {
            role: "user",
            parts: functionResponses
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      };

      const response2 = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody2),
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error("Gemini error (call 2):", errorText);
        throw new Error("Lỗi khi gọi Gemini API lần 2");
      }

      const data2 = await response2.json();
      const finalText = data2.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này.";
      
      return new Response(
        JSON.stringify({ response: finalText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Không có tool calls, trả về trực tiếp
      const finalText = candidate.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này.";
      
      return new Response(
        JSON.stringify({ response: finalText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Lỗi không xác định" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
