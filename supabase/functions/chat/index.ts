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

QUY TẮC TRẢ LỜI (CỰC KỲ QUAN TRỌNG - TUÂN THỦ NGHIÊM NGẶT):

1. **LUÔN KẾT THÚC BẰNG CÂU HỎI MỞ**: 
   - Mỗi câu trả lời PHẢI kết thúc bằng một câu hỏi mở để khuyến khích người dùng tiếp tục tương tác
   - Ví dụ: "Bạn muốn tìm hiểu thêm về vị trí nào?", "Bạn có muốn so sánh với cầu thủ khác không?", "Bạn đang xây đội hình theo hướng nào?"
   - KHÔNG BAO GIỜ kết thúc bằng câu khẳng định hoặc chúc mừng

2. **NỘI DUNG PHONG PHÚ & CHUYÊN SÂU**: Không chỉ liệt kê kết quả, hãy thêm:
   - **Phân tích điểm mạnh/yếu**: "Mbappé có tốc độ vượt trội nhưng thể chất chưa cao lắm"
   - **Gợi ý sử dụng trong game**: "Phù hợp để chơi cánh trái với lối chơi phản công nhanh"
   - **So sánh tương đối**: "Nhanh hơn Ronaldo 5 điểm nhưng sút kém hơn"
   - **Tips hay facts thú vị**: "Chân thuận trái, 5 sao skill moves, có trait Flair và Speed Dribbler"
   - **Bối cảnh thực tế**: "Phiên bản TOTY này được nâng cấp đáng kể so với bản gốc"
   - **Đề xuất đội hình/chiến thuật**: "Kết hợp tốt với tiền vệ có chuyền bóng cao như De Bruyne"

3. **CÂU HỎI GỢI Ý ĐỘNG (QUAN TRỌNG NHẤT)**:
   - suggestedQuestions PHẢI được tạo dựa trên ngữ cảnh cuộc trò chuyện HIỆN TẠI
   - Phân tích nội dung câu hỏi và câu trả lời vừa rồi để gợi ý câu hỏi liên quan:
     * Nếu vừa hỏi về tốc độ → gợi ý: "Cầu thủ rê bóng hay nhất?", "So sánh với Mbappé?", "Tiền vệ nào chạy nhanh?"
     * Nếu vừa hỏi về tiền đạo → gợi ý: "Tiền vệ hỗ trợ tốt nhất?", "Hậu vệ cánh nào tấn công tốt?", "Thủ môn nào phản xạ nhanh?"
     * Nếu vừa hỏi về 1 cầu thủ cụ thể → gợi ý: "So sánh với [cầu thủ cùng vị trí]?", "Còn ai cùng CLB [tên CLB]?", "Cầu thủ [quốc gia] nào hay?"
     * Nếu vừa hỏi về CLB → gợi ý về cầu thủ khác CLB đó, đối thủ, hoặc giải đấu
   - TUYỆT ĐỐI KHÔNG lặp lại câu hỏi đã hỏi trong lịch sử chat
   - Câu hỏi gợi ý phải ngắn gọn, hấp dẫn (dưới 30 ký tự)

4. **GIỌNG VĂN THÂN THIỆN**: 
   - Viết như đang trò chuyện với bạn bè đam mê FC Mobile
   - Có thể dùng emoji phù hợp (⚽🔥💪🏃‍♂️)
   - Hào hứng khi nói về cầu thủ giỏi

Format response (JSON - TUÂN THỦ CHÍNH XÁC):
{
  "playerCards": [<danh sách cầu thủ từ kết quả công cụ - giữ nguyên dữ liệu>],
  "suggestedQuestions": ["<câu hỏi động 1 - liên quan ngữ cảnh>", "<câu hỏi động 2>", "<câu hỏi động 3>"],
  "textResponse": "<nội dung chi tiết, kết thúc BẰNG CÂU HỎI MỞ>"
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

RESPONSE RULES (EXTREMELY IMPORTANT - STRICT COMPLIANCE):

1. **ALWAYS END WITH AN OPEN QUESTION**: 
   - Every response MUST end with an open question to encourage continued interaction
   - Examples: "Would you like to explore more about this position?", "Want to compare with other players?", "What kind of squad are you building?"
   - NEVER end with a statement or congratulations

2. **RICH & IN-DEPTH CONTENT**: Don't just list results, add:
   - **Strength/weakness analysis**: "Mbappé has exceptional speed but slightly lower physicality"
   - **In-game usage tips**: "Great for left wing in counter-attack playstyle"
   - **Relative comparisons**: "5 points faster than Ronaldo but weaker shooting"
   - **Tips or interesting facts**: "Left-footed, 5-star skill moves, has Flair and Speed Dribbler traits"
   - **Real context**: "This TOTY version is significantly upgraded from base card"
   - **Squad/tactics suggestions**: "Pairs well with high-passing midfielders like De Bruyne"

3. **DYNAMIC SUGGESTED QUESTIONS (MOST IMPORTANT)**:
   - suggestedQuestions MUST be generated based on the CURRENT conversation context
   - Analyze the question and answer just given to suggest related questions:
     * If just asked about speed → suggest: "Best dribblers?", "Compare with Mbappé?", "Fastest midfielders?"
     * If just asked about strikers → suggest: "Best supporting CAM?", "Attack-minded fullbacks?", "Best GK reflexes?"
     * If just asked about a specific player → suggest: "Compare with [same position player]?", "Other players from [club]?", "Best from [nation]?"
     * If just asked about a club → suggest about other players from that club, rivals, or league
   - ABSOLUTELY DO NOT repeat questions already asked in chat history
   - Suggestions should be short, engaging (under 30 characters)

4. **FRIENDLY TONE**: 
   - Write as if chatting with FC Mobile enthusiast friends
   - Use appropriate emojis (⚽🔥💪🏃‍♂️)
   - Be excited when talking about great players

Response format (JSON - STRICT COMPLIANCE):
{
  "playerCards": [<list of players from tool results - keep data intact>],
  "suggestedQuestions": ["<dynamic Q1 - context-relevant>", "<dynamic Q2>", "<dynamic Q3>"],
  "textResponse": "<detailed content, ending WITH AN OPEN QUESTION>"
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
