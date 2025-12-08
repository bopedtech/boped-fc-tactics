import { createClient } from "@supabase/supabase-js";

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

// Tool definitions cho AI
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
    }
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
    }
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
   - Nếu hỏi chung chung (top, những cầu thủ...), đặt limit là 10.
   - Chỉ đặt limit = 1 khi hỏi cụ thể "Ai là người..." (số ít).
   - Nếu hỏi "Ai giỏi nhất/nhanh nhất/cao nhất?", đặt ascending là false.
   - Nếu hỏi "Ai chậm nhất/thấp nhất/tệ nhất?", đặt ascending là true.
3. Sau khi nhận kết quả từ công cụ, hãy tổng hợp câu trả lời tự nhiên, rõ ràng và thân thiện bằng tiếng Việt.
   - **Phần 1: Tập trung vào Top 1**. Nhận xét chi tiết về các chỉ số nổi bật của cầu thủ này (Tốc độ, Sút, v.v.), tại sao lại đứng đầu.
   - **Phần 2: Nhận xét tóm tắt về các cầu thủ còn lại (Top 2-10)**. So sánh ngắn gọn (ví dụ: "Theo sau là X và Y với chỉ số cũng rất cao...").
   - **Phần 3: Câu hỏi mở/Tương tác**. Hỏi người dùng xem họ có muốn xem chi tiết ai không, hoặc so sánh ai với ai.
4. QUAN TRỌNG: Trả lời với format JSON có playerCards và suggestedQuestions:

Format response:
{
  "playerCards": [<danh sách cầu thủ từ kết quả công cụ>],
  "suggestedQuestions": ["<câu hỏi gợi ý 1>", "<câu hỏi gợi ý 2>", "<câu hỏi gợi ý 3>"],
  "textResponse": "<phần giải thích văn bản>"
}

Về suggestedQuestions:
- Dựa vào ngữ cảnh để gợi ý 3 câu hỏi tiếp theo thú vị để người dùng bấm vào hỏi tiếp.
- Ví dụ: Nếu vừa hỏi về Tốc độ (PAC), gợi ý: "Ai sút hay nhất?", "So sánh [Top 1] và [Top 2]", "Xem chi tiết [Top 2]".
- **Tối ưu hóa hành động**: Câu hỏi nên ngắn gọn, kích thích tò mò.
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
   - Default limit is 10. Only set limit=1 if asked "Who is THE ...".
   - If asked "Who is the best/fastest/tallest?", set ascending to false.
   - If asked "Who is the worst/slowest/shortest?", set ascending to true.
3. After receiving tool results, provide a natural, clear, and friendly answer in English.
   - **Part 1: Focus on Top 1**. Provide detailed commentary on this player's standout stats (Pace, Shooting, etc.), and why they are #1.
   - **Part 2: Summary of the rest (Top 2-10)**. Brief comparison (e.g., "Following closely are X and Y with also very high stats...").
   - **Part 3: Open-ended/Interactive**. Ask the user if they want to see details for anyone, or compare A vs B.
4. IMPORTANT: Respond with JSON format containing playerCards and suggestedQuestions:

Response format:
{
  "playerCards": [<list of players from tool results>],
  "suggestedQuestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "textResponse": "<text explanation>"
}

About suggestedQuestions:
- Suggest 3 interesting follow-up questions based on context for the user to click.
- Example: If asked about Speed (PAC), suggest: "Who has best shooting?", "Compare [Top 1] vs [Top 2]", "Details for [Top 2]".
- **Action-oriented**: Keep questions short and engaging.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userQuery, locale = "vi" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY không được cấu hình");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const conversationHistory = messages || [];
    const query = userQuery || (conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : "");

    const systemInstruction = locale === "en" ? SYSTEM_INSTRUCTION_EN : SYSTEM_INSTRUCTION_VI;

    // Build messages for Lovable AI Gateway (OpenAI compatible format)
    const aiMessages = [
      { role: "system", content: systemInstruction },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    if (userQuery) {
      aiMessages.push({ role: "user", content: userQuery });
    }

    console.log("Calling Lovable AI Gateway...");

    // First call to Lovable AI with tools
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
          JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response1.status === 402) {
        return new Response(
          JSON.stringify({ error: "Cần nạp thêm credits. Vui lòng kiểm tra workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lỗi AI Gateway: ${response1.status}`);
    }

    const data1 = await response1.json();
    const choice = data1.choices?.[0];

    if (!choice) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    // Check if there are tool calls
    const toolCalls = choice.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log("Tool calls detected:", toolCalls.length);

      const toolResults = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`Executing: ${functionName}`, args);

        let result;
        if (functionName === "find_top_players") {
          result = await executeFindTopPlayers(supabase, args);
        } else if (functionName === "get_player_count") {
          result = await executeGetPlayerCount(supabase, args);
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result)
        });
      }

      // Second call with tool results
      console.log("Calling Lovable AI with tool results...");

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
            ...toolResults
          ],
        }),
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error("Lovable AI error (call 2):", errorText);
        throw new Error(`Lỗi AI Gateway lần 2: ${response2.status}`);
      }

      const data2 = await response2.json();
      const finalText = data2.choices?.[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

      return new Response(
        JSON.stringify({ response: finalText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No tool calls, return directly
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
