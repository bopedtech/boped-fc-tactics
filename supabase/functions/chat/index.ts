// FC Mobile AI Chatbot v2 - Using Lovable AI Gateway
// Updated: Dynamic suggestions & rich responses
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Tool definitions cho OpenAI format (Lovable AI Gateway)
const tools = [
  {
    type: "function",
    function: {
      name: "find_top_players",
      description: "Tìm kiếm các cầu thủ hàng đầu (Top N) dựa trên một chỉ số. Mặc định luôn tìm 10 cầu thủ trừ khi người dùng hỏi đích danh 'ai nhất' hoặc số lượng cụ thể.",
      parameters: {
        type: "object",
        properties: {
          stat: {
            type: "string",
            enum: Object.values(PlayerStat),
            description: "Chỉ số dùng để xếp hạng: RATING (OVR), HEIGHT (chiều cao), PAC (tốc độ), SHO (sút), PAS (chuyền), DRI (rê bóng), DEF (phòng thủ), PHY (thể chất)",
          },
          limit: {
            type: "integer",
            description: "Số lượng cầu thủ trả về. Mặc định là 10. Chỉ dùng 1 nếu câu hỏi là dạng 'Ai là người... nhất?' (số ít).",
          },
          ascending: {
            type: "boolean",
            description: "Sắp xếp tăng dần. false (mặc định) cho giỏi nhất. true cho tệ nhất.",
          }
        },
        required: ["stat"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_player_count",
      description: "Đếm tổng số lượng cầu thủ trong database, có thể lọc theo vị trí.",
      parameters: {
        type: "object",
        properties: {
          filterPosition: {
            type: "string",
            description: "Vị trí cụ thể (ví dụ: 'GK', 'ST', 'CM'). Nếu bỏ trống, đếm tất cả.",
          },
        },
      },
    },
  }
];

const SYSTEM_INSTRUCTION_VI = `
Bạn là trợ lý AI chuyên gia phân tích dữ liệu FC Mobile của Boped FC Tactics - trang web cơ sở dữ liệu cầu thủ FC Mobile hàng đầu.
Nhiệm vụ của bạn là sử dụng các công cụ (Tools) để truy vấn dữ liệu chính xác từ database và tư vấn cho người chơi.

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
   - Nếu hỏi chung chung (top, những cầu thủ...), đặt limit là 10.
   - Chỉ đặt limit = 1 khi hỏi cụ thể "Ai là người..." (số ít).
   - Nếu hỏi "Ai giỏi nhất/nhanh nhất/cao nhất?", đặt ascending là false.
   - Nếu hỏi "Ai chậm nhất/thấp nhất/tệ nhất?", đặt ascending là true.

QUY TẮC TRẢ LỜI (RẤT QUAN TRỌNG):
1. **LUÔN KẾT THÚC BẰNG CÂU HỎI**: Mỗi câu trả lời PHẢI kết thúc bằng một câu hỏi mở để tiếp tục cuộc trò chuyện. Ví dụ: "Bạn muốn tìm hiểu thêm về vị trí nào?", "Bạn có muốn so sánh với cầu thủ khác không?"

2. **NỘI DUNG PHONG PHÚ**: Không chỉ trả lời kết quả khô khan, hãy thêm:
   - Nhận xét về điểm mạnh/yếu của cầu thủ
   - Gợi ý cách sử dụng cầu thủ trong game (ví trí phù hợp, lối chơi)
   - So sánh ngắn với các cầu thủ cùng vị trí nếu liên quan
   - Tips hay facts thú vị về cầu thủ (chân thuận, skill moves, traits đặc biệt)

3. **CÂU HỎI GỢI Ý ĐỘNG**: suggestedQuestions phải liên quan đến ngữ cảnh cuộc trò chuyện:
   - Nếu vừa hỏi về tốc độ → gợi ý hỏi về rê bóng, so sánh cầu thủ khác
   - Nếu vừa hỏi về tiền đạo → gợi ý hỏi về tiền vệ hỗ trợ, hậu vệ
   - Nếu vừa hỏi về 1 cầu thủ → gợi ý so sánh, hỏi về CLB/Quốc gia đó
   - KHÔNG lặp lại câu hỏi đã hỏi trước đó

4. **GIỌNG VĂN THÂN THIỆN**: Viết như đang trò chuyện với bạn bè đam mê FC Mobile.

Format response (JSON):
{
  "playerCards": [<danh sách cầu thủ từ kết quả công cụ>],
  "suggestedQuestions": ["<câu hỏi gợi ý động 1>", "<câu hỏi gợi ý động 2>", "<câu hỏi gợi ý động 3>"],
  "textResponse": "<nội dung trả lời chi tiết, kết thúc bằng câu hỏi mở>"
}
`;

const SYSTEM_INSTRUCTION_EN = `
You are an AI expert analyst for FC Mobile data at Boped FC Tactics - the leading FC Mobile player database website.
Your task is to use Tools to query accurate data from the database and advise players.

TOOL USAGE RULES:
1. Always use tools when asked about actual data.
2. When using find_top_players:
   - Map natural language to stats: Speed=PAC, Shooting=SHO, OVR=RATING, Height=HEIGHT, Passing=PAS, Dribbling=DRI, Defending=DEF, Physical=PHY
   - Default limit is 10. Only set limit=1 if asked "Who is THE ...".
   - If asked "Who is the best/fastest/tallest?", set ascending to false.
   - If asked "Who is the worst/slowest/shortest?", set ascending to true.

RESPONSE RULES (VERY IMPORTANT):
1. **ALWAYS END WITH A QUESTION**: Every response MUST end with an open question to continue the conversation. Examples: "Would you like to know more about this position?", "Want to compare with other players?"

2. **RICH CONTENT**: Don't just give dry results, add:
   - Comments on player strengths/weaknesses
   - Suggestions on how to use the player in-game (suitable positions, playstyle)
   - Brief comparison with players in the same position if relevant
   - Tips or interesting facts about the player (preferred foot, skill moves, special traits)

3. **DYNAMIC SUGGESTED QUESTIONS**: suggestedQuestions must relate to conversation context:
   - If just asked about speed → suggest asking about dribbling, comparing other players
   - If just asked about strikers → suggest asking about supporting midfielders, defenders
   - If just asked about 1 player → suggest comparing, asking about that club/nation
   - DO NOT repeat questions already asked

4. **FRIENDLY TONE**: Write as if chatting with FC Mobile enthusiast friends.

Response format (JSON):
{
  "playerCards": [<list of players from tool results>],
  "suggestedQuestions": ["<dynamic suggestion 1>", "<dynamic suggestion 2>", "<dynamic suggestion 3>"],
  "textResponse": "<detailed response content, ending with an open question>"
}
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
  const limit = args.limit || 10;
  const ascending = args.ascending || false;
  const stat = args.stat;

  console.log(`Calling RPC: stat=${stat}, limit=${limit}, ascending=${ascending}`);

  const { data, error } = await supabase.rpc('get_top_players_by_stat', {
    stat_key: stat,
    limit_count: limit,
    sort_asc: ascending
  });

  if (error) {
    console.error("RPC Error:", error);
    return { error: error.message };
  }

  const players = (data || []).map((p: any) => ({
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

  return { players, stat_name: stat };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userQuery, locale = "vi" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY không được cấu hình");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const systemInstruction = locale === "en" ? SYSTEM_INSTRUCTION_EN : SYSTEM_INSTRUCTION_VI;

    // Build messages for Lovable AI Gateway (OpenAI format)
    const aiMessages = [
      { role: "system", content: systemInstruction },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    if (userQuery) {
      aiMessages.push({ role: "user", content: userQuery });
    }

    console.log("Calling Lovable AI Gateway...");

    // First call - detect tool usage
    const response1 = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools: tools,
        tool_choice: "auto",
      }),
    });

    if (!response1.ok) {
      const errorText = await response1.text();
      console.error("Lovable AI error:", errorText);

      if (response1.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn API. Vui lòng đợi vài giây và thử lại.", retryAfter: 10 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response1.status === 402) {
        return new Response(
          JSON.stringify({ error: "Hết hạn mức sử dụng AI. Vui lòng liên hệ quản trị viên." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Lỗi khi gọi AI API");
    }

    const data1 = await response1.json();
    const choice = data1.choices?.[0];

    if (!choice) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    const toolCalls = choice.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log("Tool calls detected:", toolCalls.length);

      const toolResults = [];

      for (const call of toolCalls) {
        const functionName = call.function.name;
        const args = JSON.parse(call.function.arguments);

        console.log(`Executing: ${functionName}`, args);

        let result;
        if (functionName === "find_top_players") {
          result = await executeFindTopPlayers(supabase, args);
        } else if (functionName === "get_player_count") {
          result = await executeGetPlayerCount(supabase, args);
        }

        toolResults.push({
          tool_call_id: call.id,
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      console.log("Calling Lovable AI with tool results...");

      // Second call - with tool results
      const response2 = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            ...aiMessages,
            choice.message,
            ...toolResults,
          ],
        }),
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error("Lovable AI error (call 2):", errorText);

        if (response2.status === 429) {
          return new Response(
            JSON.stringify({ error: "Đã vượt quá giới hạn API. Vui lòng đợi vài giây và thử lại.", retryAfter: 10 }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response2.status === 402) {
          return new Response(
            JSON.stringify({ error: "Hết hạn mức sử dụng AI. Vui lòng liên hệ quản trị viên." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        throw new Error("Lỗi khi gọi AI API lần 2");
      }

      const data2 = await response2.json();
      const finalText = data2.choices?.[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

      return new Response(
        JSON.stringify({ response: finalText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const finalText = choice.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

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
