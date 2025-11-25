import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tools = [
  {
    type: "function",
    function: {
      name: "search_players",
      description: "Tìm kiếm cầu thủ trong database theo các tiêu chí như tên, vị trí, rating, câu lạc bộ, quốc tịch, chân thuận, skill moves, weak foot, traits, chiều cao, cân nặng, work rates, v.v. Chỉ sử dụng dữ liệu từ database, không tìm thông tin bên ngoài.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Tên cầu thủ (tìm kiếm gần đúng)"
          },
          position: {
            type: "string",
            description: "Vị trí (ST, CF, LW, RW, CAM, CM, CDM, LB, RB, CB, GK, etc.)"
          },
          min_rating: {
            type: "number",
            description: "Rating tối thiểu"
          },
          max_rating: {
            type: "number",
            description: "Rating tối đa"
          },
          min_height: {
            type: "number",
            description: "Chiều cao tối thiểu (cm)"
          },
          max_height: {
            type: "number",
            description: "Chiều cao tối đa (cm)"
          },
          min_weight: {
            type: "number",
            description: "Cân nặng tối thiểu (kg)"
          },
          max_weight: {
            type: "number",
            description: "Cân nặng tối đa (kg)"
          },
          club: {
            type: "string",
            description: "Tên câu lạc bộ"
          },
          nation: {
            type: "string",
            description: "Quốc tịch"
          },
          league: {
            type: "string",
            description: "Tên giải đấu"
          },
          foot: {
            type: "string",
            enum: ["Left", "Right"],
            description: "Chân thuận (Left hoặc Right)"
          },
          min_skill_moves: {
            type: "number",
            description: "Skill moves tối thiểu (1-5)"
          },
          min_weak_foot: {
            type: "number",
            description: "Weak foot tối thiểu (1-5)"
          },
          work_rate_att: {
            type: "number",
            description: "Work rate tấn công (1=Low, 2=Medium, 3=High)"
          },
          work_rate_def: {
            type: "number",
            description: "Work rate phòng ngự (1=Low, 2=Medium, 3=High)"
          },
          trait: {
            type: "string",
            description: "Trait đặc biệt của cầu thủ"
          },
          limit: {
            type: "number",
            description: "Số lượng kết quả trả về (mặc định 10, tối đa 50)"
          }
        }
      }
    }
  }
];

async function searchPlayers(supabase: any, params: any) {
  let query = supabase.from('players').select('*');
  
  if (params.name) {
    query = query.or(`firstName.ilike.%${params.name}%,lastName.ilike.%${params.name}%,commonName.ilike.%${params.name}%,cardName.ilike.%${params.name}%`);
  }
  
  if (params.position) {
    query = query.eq('position', params.position);
  }
  
  if (params.min_rating) {
    query = query.gte('rating', params.min_rating);
  }
  
  if (params.max_rating) {
    query = query.lte('rating', params.max_rating);
  }
  
  if (params.min_height) {
    query = query.gte('height', params.min_height);
  }
  
  if (params.max_height) {
    query = query.lte('height', params.max_height);
  }
  
  if (params.min_weight) {
    query = query.gte('weight', params.min_weight);
  }
  
  if (params.max_weight) {
    query = query.lte('weight', params.max_weight);
  }
  
  if (params.club) {
    query = query.ilike('club->>displayName', `%${params.club}%`);
  }
  
  if (params.nation) {
    query = query.ilike('nation->>displayName', `%${params.nation}%`);
  }
  
  if (params.league) {
    query = query.ilike('league->>displayName', `%${params.league}%`);
  }
  
  if (params.foot) {
    const footValue = params.foot === "Left" ? 0 : 1;
    query = query.eq('foot', footValue);
  }
  
  if (params.min_skill_moves) {
    query = query.gte('skillMovesLevel', params.min_skill_moves);
  }
  
  if (params.min_weak_foot) {
    query = query.gte('weakFoot', params.min_weak_foot);
  }
  
  if (params.work_rate_att) {
    query = query.eq('workRateAtt', params.work_rate_att);
  }
  
  if (params.work_rate_def) {
    query = query.eq('workRateDef', params.work_rate_def);
  }
  
  if (params.trait) {
    query = query.contains('traits', [{ displayName: params.trait }]);
  }
  
  const limit = Math.min(params.limit || 10, 50);
  query = query.limit(limit);
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Database error:", error);
    return { error: error.message };
  }
  
  return {
    players: data.map((player: any) => ({
      assetId: player.assetId,
      playerId: player.playerId,
      rating: player.rating,
      position: player.position,
      commonName: player.commonName || player.cardName || `${player.firstName || ''} ${player.lastName || ''}`.trim(),
      firstName: player.firstName,
      lastName: player.lastName,
      cardName: player.cardName,
      club: player.club,
      nation: player.nation,
      league: player.league,
      images: player.images,
      stats: player.stats,
      avgStats: player.avgStats,
      avgGkStats: player.avgGkStats,
      foot: player.foot,
      skillMovesLevel: player.skillMovesLevel,
      weakFoot: player.weakFoot,
      height: player.height,
      weight: player.weight,
      workRates: player.workRates,
      traits: player.traits,
      auctionable: player.auctionable,
      source: player.source
    })),
    count: data.length
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    let conversationMessages = [
      { 
        role: "system", 
        content: `Bạn là trợ lý AI của Boped FC Tactics, chuyên về FC Mobile. Bạn có quyền truy cập vào database cầu thủ của hệ thống. 

QUAN TRỌNG - FORMAT RESPONSE:
- Khi trả lời về cầu thủ, LUÔN bao gồm một JSON block với TOÀN BỘ dữ liệu cầu thủ từ database
- Format JSON: \`\`\`json\n{"playerCards": [<toàn bộ object cầu thủ từ search_players>]}\n\`\`\`
- JSON block này phải đứng TRƯỚC phần text mô tả
- Bao gồm TẤT CẢ các trường: assetId, playerId, rating, position, commonName, firstName, lastName, cardName, club, nation, league, images, stats, foot, skillMovesLevel, weakFoot, height, weight, workRates, traits
- Chỉ trả lời dựa trên dữ liệu có trong database
- Trả lời ngắn gọn, hữu ích và thân thiện bằng tiếng Việt

VÍ DỤ RESPONSE:
\`\`\`json
{"playerCards": [{...toàn bộ dữ liệu cầu thủ từ kết quả search_players...}]}
\`\`\`

Đây là cầu thủ cao nhất trong database...` 
      },
      ...messages,
    ];

    while (true) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools: tools,
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Đã vượt quá giới hạn, vui lòng thử lại sau." }), 
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Cần nạp thêm credits để sử dụng AI." }), 
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Lỗi kết nối AI gateway" }), 
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const message = data.choices[0].message;
      
      // If no tool calls, return the final response
      if (!message.tool_calls || message.tool_calls.length === 0) {
        // Stream the final response
        const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: conversationMessages,
            stream: true,
          }),
        });

        return new Response(streamResponse.body, {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      // Handle tool calls
      conversationMessages.push(message);
      
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === "search_players") {
          const params = JSON.parse(toolCall.function.arguments);
          console.log("Searching players with params:", params);
          const results = await searchPlayers(supabase, params);
          
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(results),
          });
        }
      }
    }
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Lỗi không xác định" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
