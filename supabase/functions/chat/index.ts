import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function searchPlayers(params: any) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  let query = supabase
    .from("players")
    .select("assetId, firstName, lastName, commonName, cardName, position, rating, nation, club, league, stats, traits, skillMoves, images")
    .eq("is_visible", true)
    .order("rating", { ascending: false })
    .limit(10);

  if (params.position) {
    query = query.eq("position", params.position);
  }
  if (params.minRating) {
    query = query.gte("rating", params.minRating);
  }
  if (params.maxRating) {
    query = query.lte("rating", params.maxRating);
  }
  if (params.nationality) {
    query = query.contains("nation", { displayName: params.nationality });
  }
  if (params.minPace && params.minPace > 0) {
    query = query.gte("stats->pace", params.minPace);
  }
  if (params.minShooting && params.minShooting > 0) {
    query = query.gte("stats->shooting", params.minShooting);
  }
  if (params.minPassing && params.minPassing > 0) {
    query = query.gte("stats->passing", params.minPassing);
  }
  if (params.minDribbling && params.minDribbling > 0) {
    query = query.gte("stats->dribbling", params.minDribbling);
  }
  if (params.minDefending && params.minDefending > 0) {
    query = query.gte("stats->defending", params.minDefending);
  }
  if (params.minPhysical && params.minPhysical > 0) {
    query = query.gte("stats->physical", params.minPhysical);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error searching players:", error);
    return { error: error.message };
  }

  return { players: data };
}

const tools = [
  {
    type: "function",
    function: {
      name: "search_players",
      description: "Tìm kiếm cầu thủ trong database FC Mobile theo các tiêu chí như vị trí, chỉ số, quốc tịch. Dùng function này khi user hỏi về cầu thủ cụ thể hoặc muốn tìm cầu thủ theo yêu cầu.",
      parameters: {
        type: "object",
        properties: {
          position: {
            type: "string",
            description: "Vị trí cầu thủ (ST, CF, LW, RW, CAM, CM, CDM, LB, RB, CB, GK, etc.)"
          },
          minRating: {
            type: "number",
            description: "Rating tối thiểu (ví dụ: 85)"
          },
          maxRating: {
            type: "number",
            description: "Rating tối đa (ví dụ: 95)"
          },
          nationality: {
            type: "string",
            description: "Quốc tịch (ví dụ: Brazil, Argentina, Portugal)"
          },
          minPace: {
            type: "number",
            description: "Chỉ số tốc độ tối thiểu (0-99)"
          },
          minShooting: {
            type: "number",
            description: "Chỉ số sút bóng tối thiểu (0-99)"
          },
          minPassing: {
            type: "number",
            description: "Chỉ số chuyền bóng tối thiểu (0-99)"
          },
          minDribbling: {
            type: "number",
            description: "Chỉ số rê bóng tối thiểu (0-99)"
          },
          minDefending: {
            type: "number",
            description: "Chỉ số phòng thủ tối thiểu (0-99)"
          },
          minPhysical: {
            type: "number",
            description: "Chỉ số thể lực tối thiểu (0-99)"
          }
        }
      }
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let conversationMessages = [
      { 
        role: "system", 
        content: "Bạn là trợ lý AI của Boped FC Tactics, chuyên về FC Mobile. Bạn có quyền truy cập vào database cầu thủ và có thể tìm kiếm cầu thủ theo yêu cầu. Khi user hỏi về cầu thủ, hãy sử dụng function search_players để tìm kiếm. Hãy trả lời ngắn gọn, hữu ích và thân thiện bằng tiếng Việt. Khi giới thiệu cầu thủ, hãy nêu tên, vị trí, rating và các chỉ số nổi bật." 
      },
      ...messages,
    ];

    // First API call to get tool calls
    let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: conversationMessages,
        tools: tools,
        tool_choice: "auto",
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

    const responseData = await response.json();
    const assistantMessage = responseData.choices[0].message;

    // Check if AI wants to call functions
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      conversationMessages.push(assistantMessage);

      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === "search_players") {
          const params = JSON.parse(toolCall.function.arguments);
          console.log("Searching players with params:", params);
          const result = await searchPlayers(params);
          
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      }

      // Second API call with tool results - streaming response
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
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
