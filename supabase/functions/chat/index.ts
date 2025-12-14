// FC Mobile AI Chatbot v2 - Using Google Gemini 2.5 Flash
// Updated: Direct Gemini API with function calling
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

// Tool definitions for Gemini native format
const geminiTools = [
  {
    functionDeclarations: [
      {
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
      {
        name: "search_player_by_name",
        description: "Tìm kiếm cầu thủ theo tên. Dùng khi người dùng hỏi về một cầu thủ cụ thể như 'Gullit', 'Messi', 'Ronaldo', hoặc 'các thẻ của X'.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Tên cầu thủ cần tìm (có thể là họ, tên hoặc tên đầy đủ)",
            },
            limit: {
              type: "integer",
              description: "Số lượng kết quả trả về. Mặc định là 5.",
            }
          },
          required: ["name"],
        },
      },
      {
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
    ]
  }
];

const SYSTEM_INSTRUCTION_VI = `
Bạn là trợ lý AI chuyên gia phân tích dữ liệu FC Mobile của Boped FC Tactics - trang web cơ sở dữ liệu cầu thủ FC Mobile hàng đầu.
Nhiệm vụ của bạn là sử dụng các công cụ (Tools) để truy vấn dữ liệu chính xác từ database và tư vấn cho người chơi.

**QUAN TRỌNG - SỬ DỤNG NGỮ CẢNH CUỘC TRÒ CHUYỆN:**
1. Bạn PHẢI đọc kỹ lịch sử chat trước khi trả lời.
2. Khi người dùng xác nhận ngắn gọn như "có", "ừ", "yes", "ok", "đúng rồi" → HÃY xem lại tin nhắn trước đó để hiểu họ đang xác nhận điều gì, và thực hiện hành động tương ứng.
3. Nếu trước đó bạn đã đề cập một cầu thủ cụ thể (ví dụ: "Bạn có muốn tìm Gullit?") và người dùng xác nhận → DÙNG search_player_by_name với tên cầu thủ đó.
4. Nếu người dùng hỏi về "cầu thủ đó", "người đó", "anh ấy" → TÌM trong lịch sử chat để xác định họ đang nói về ai.
5. Luôn duy trì ngữ cảnh cuộc trò chuyện - không trả lời như thể đây là tin nhắn đầu tiên.

QUY TẮC SỬ DỤNG CÔNG CỤ:
1. Luôn sử dụng công cụ khi hỏi về dữ liệu thực tế.
2. Khi người dùng hỏi về một cầu thủ CỤ THỂ theo TÊN (Gullit, Messi, etc.) → DÙNG search_player_by_name
3. Khi người dùng hỏi về TOP/XẾP HẠNG theo chỉ số → DÙNG find_top_players
4. Khi sử dụng find_top_players - ánh xạ ngôn ngữ tự nhiên:
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
   - suggestedQuestions PHẢI được tạo dựa trên KẾT QUẢ VỪA TRẢ RA
   - VÍ DỤ CỤ THỂ:
     * Nếu vừa trả về top 5 cầu thủ sút hay nhất (Pelé, Ronaldo...) → gợi ý PHẢI liên quan: "So sánh Pelé và Ronaldo?", "Ai sút phạt hay nhất?", "Tiền đạo nào đá phạt đền tốt?"
     * Nếu vừa nói về Mbappé → gợi ý: "So sánh Mbappé với Haaland?", "Cầu thủ PSG nào hay?", "Tiền đạo Pháp tốt nhất?"
     * Nếu trả về top 5 tốc độ → gợi ý: "Ai rê bóng tốt nhất?", "Tiền vệ nào nhanh?", "So sánh với Vinicius?"
   - CÂU HỎI GỢI Ý PHẢI NGẮN GỌN (dưới 25 ký tự), HẤP DẪN, và LIÊN QUAN TRỰC TIẾP đến cầu thủ/chủ đề vừa nhắc tới
   - TUYỆT ĐỐI KHÔNG dùng câu hỏi chung chung như "Hậu vệ tấn công hay?" khi vừa nói về cầu thủ sút

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

async function executeSearchPlayerByName(supabase: any, args: { name: string, limit?: number }) {
  const searchName = args.name;
  const limit = args.limit || 5;

  console.log(`Searching for player: "${searchName}", limit=${limit}`);

  // Use the smart search RPC which handles accent-insensitive search
  const { data, error } = await supabase.rpc('search_players_smart', {
    search_term: searchName,
    result_limit: limit
  });

  if (error) {
    console.error("Search RPC Error:", error);
    // Fallback to basic ilike search
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('players')
      .select('assetId:assetId, commonName, cardName, firstName, lastName, rating, position, club, nation, league, images, stats, avgStats, avgGkStats')
      .or(`commonName.ilike.%${searchName}%,cardName.ilike.%${searchName}%,firstName.ilike.%${searchName}%,lastName.ilike.%${searchName}%`)
      .eq('is_visible', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (fallbackError) {
      return { error: fallbackError.message };
    }

    if (!fallbackData || fallbackData.length === 0) {
      return { players: [], message: `Không tìm thấy cầu thủ nào với tên "${searchName}"` };
    }

    return { players: fallbackData, search_term: searchName };
  }

  if (!data || data.length === 0) {
    return { players: [], message: `Không tìm thấy cầu thủ nào với tên "${searchName}"` };
  }

  // Map to consistent format
  const players = data.map((p: any) => ({
    assetId: p.assetId,
    playerId: p.assetId,
    commonName: p.commonName || p.cardName || `${p.firstName} ${p.lastName}`,
    cardName: p.cardName,
    firstName: p.firstName,
    lastName: p.lastName,
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

  // Deduplicate - same player with tradeable/untradeable status should count as 1
  // Key: commonName + rating + position + cardBackground (to distinguish programs)
  const seenPlayers = new Set<string>();
  const uniquePlayers = players.filter((p: any) => {
    const bgKey = p.images?.playerCardBackground || 'default';
    const key = `${p.commonName}-${p.rating}-${p.position}-${bgKey}`;
    if (seenPlayers.has(key)) {
      return false;
    }
    seenPlayers.add(key);
    return true;
  });

  console.log(`Found ${players.length} players for "${searchName}", after dedup: ${uniquePlayers.length}`);
  return { players: uniquePlayers, search_term: searchName };
}

async function executeFindTopPlayers(supabase: any, args: { stat: string, limit?: number, ascending?: boolean }) {
  const requestedLimit = args.limit || 10;
  const ascending = args.ascending || false;
  const stat = args.stat;

  // Fetch 2x the limit to ensure enough players after deduplication
  const fetchLimit = requestedLimit * 2;

  console.log(`Calling RPC: stat=${stat}, limit=${fetchLimit} (requested: ${requestedLimit}), ascending=${ascending}`);

  // Call V2 RPC to ensure we get all name fields
  const { data, error } = await supabase.rpc('get_top_players_v2', {
    stat_key: stat,
    limit_count: fetchLimit,
    sort_asc: ascending
  });

  if (error) {
    console.error("RPC Error:", error);
    return { error: error.message };
  }

  // Debug: Log first player from RPC to check data structure
  if (data && data.length > 0) {
    console.log("First player from RPC V2:", JSON.stringify(data[0], null, 2));
  }

  const players = (data || []).map((p: any) => {
    // Robust display name fallback
    let displayName = p.commonName;
    
    // If commonName is empty/null, try cardName
    if (!displayName || displayName.trim() === '') {
        displayName = p.cardName;
    }
    
    // If still empty, try firstName + lastName
    if ((!displayName || displayName.trim() === '') && p.firstName && p.lastName) {
        displayName = `${p.firstName} ${p.lastName}`;
    }
    
    // If still empty, try parts of names
    if (!displayName || displayName.trim() === '') {
        displayName = p.lastName || p.firstName || p.cardName || 'Unknown Player';
    }

    return {
      assetId: p.assetId,
      playerId: p.assetId,
      commonName: displayName,
      cardName: p.cardName,
      firstName: p.firstName,
      lastName: p.lastName,
      rating: p.rating,
      position: p.position,
      club: p.club,
      nation: p.nation,
      league: p.league,
      images: p.images,
      stats: p.stats,
      avgStats: p.avgStats,
      avgGkStats: p.avgGkStats,
    };
  });

  // Debug: Log first processed player
  if (players.length > 0) {
    console.log("First processed player:", JSON.stringify(players[0], null, 2));
  }

  // Deduplicate - same player with tradeable/untradeable status should count as 1
  // Key: commonName + rating + position + cardBackground (to distinguish different program cards)
  const seenPlayers = new Set<string>();
  const uniquePlayers = players.filter((p: any) => {
    const bgKey = p.images?.playerCardBackground || 'default';
    const key = `${p.commonName}-${p.rating}-${p.position}-${bgKey}`;
    if (seenPlayers.has(key)) {
      return false;
    }
    seenPlayers.add(key);
    return true;
  });

  // Trim to requested limit after deduplication
  const finalPlayers = uniquePlayers.slice(0, requestedLimit);

  console.log(`Players after dedup: ${uniquePlayers.length}, returning: ${finalPlayers.length}`);

  return { players: finalPlayers, stat_name: stat };
}

// Convert chat history to Gemini format
function convertToGeminiContents(messages: any[], userQuery?: string) {
  const contents: any[] = [];
  
  for (const msg of messages || []) {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    });
  }

  if (userQuery) {
    contents.push({
      role: "user",
      parts: [{ text: userQuery }]
    });
  }

  return contents;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userQuery, locale = "vi" } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY không được cấu hình");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const systemInstruction = locale === "en" ? SYSTEM_INSTRUCTION_EN : SYSTEM_INSTRUCTION_VI;
    const contents = convertToGeminiContents(messages, userQuery);

    console.log("Calling Gemini 2.5 Flash API...");

    // First call - detect tool usage
    const response1 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: contents,
          tools: geminiTools,
          toolConfig: {
            functionCallingConfig: {
              mode: "AUTO"
            }
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        }),
      }
    );

    if (!response1.ok) {
      const errorText = await response1.text();
      console.error("Gemini API error:", errorText);

      if (response1.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn API. Vui lòng đợi vài giây và thử lại.", retryAfter: 10 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Lỗi khi gọi Gemini API");
    }

    const data1 = await response1.json();
    const candidate = data1.candidates?.[0];

    if (!candidate) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    const firstPart = candidate.content?.parts?.[0];
    
    // Check if there's a function call
    if (firstPart?.functionCall) {
      const functionCall = firstPart.functionCall;
      console.log("Function call detected:", functionCall.name);

      const functionName = functionCall.name;
      const args = functionCall.args;

      console.log(`Executing: ${functionName}`, args);

      let result: any;
      let playersFromDb: any[] = [];
      
      if (functionName === "find_top_players") {
        result = await executeFindTopPlayers(supabase, args);
        if (result.players) {
          playersFromDb = result.players;
        }
      } else if (functionName === "search_player_by_name") {
        result = await executeSearchPlayerByName(supabase, args);
        if (result.players) {
          playersFromDb = result.players;
        }
      } else if (functionName === "get_player_count") {
        result = await executeGetPlayerCount(supabase, args);
      }

      console.log("Function result players count:", playersFromDb.length);
      console.log("Calling Gemini with function result...");

      // Second call - with function result
      const response2 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: [
              ...contents,
              {
                role: "model",
                parts: [{ functionCall: functionCall }]
              },
              {
                role: "user",
                parts: [{
                  functionResponse: {
                    name: functionName,
                    response: result
                  }
                }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            }
          }),
        }
      );

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error("Gemini API error (call 2):", errorText);
        throw new Error("Lỗi khi gọi Gemini API lần 2");
      }

      const data2 = await response2.json();
      let aiText = data2.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract suggested questions from AI response if available
      let suggestedQuestions: string[] = [];
      try {
        // Try to find JSON in the response
        const jsonMatch = aiText.match(/\{[\s\S]*"suggestedQuestions"[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          if (jsonData.suggestedQuestions) {
            suggestedQuestions = jsonData.suggestedQuestions;
          }
          if (jsonData.textResponse) {
            aiText = jsonData.textResponse;
          }
        }
      } catch (e) {
        console.log("Could not parse suggestions from AI:", e);
      }

      // Clean up any remaining JSON from text
      aiText = aiText.replace(/```json[\s\S]*?```/g, '').replace(/\{[\s\S]*"playerCards"[\s\S]*\}/g, '').trim();
      
      if (!aiText) {
        aiText = "Đây là kết quả tìm kiếm của bạn!";
      }

      // Build final response with playerCards from database (not from AI)
      const finalResponse = {
        playerCards: playersFromDb,
        suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined,
        textResponse: aiText
      };

      console.log("Final response playerCards count:", finalResponse.playerCards.length);

      return new Response(
        JSON.stringify({ response: finalResponse }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No function call, just return the text response
      const finalText = firstPart?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

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
