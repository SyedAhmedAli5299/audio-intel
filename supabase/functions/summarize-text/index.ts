import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("openai_api_key");
    if (!openAIKey) {
      console.error("OPENAI_API_KEY (or openai_api_key) is not set.");
      return new Response(
        JSON.stringify({ error: { message: "Server configuration error: The OPENAI_API_KEY is missing.", type: "server_error" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { transcript } = await req.json();
    if (!transcript) {
      return new Response(JSON.stringify({ error: { message: "No transcript provided", type: "client_error" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = "You are an expert meeting notes assistant. Return concise, structured JSON suitable for UI rendering.";
    const user = `Summarize the meeting transcript below into this exact JSON schema: {\n  "keyTakeaways": string[],\n  "actionItems": string[],\n  "topics": string[]\n}\nRules:\n- Be concise and specific.\n- Use clear, short bullet points.\n- Extract actionable tasks for actionItems with verbs.\n- Cover main themes in topics.\n\nTranscript:\n${transcript}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      console.error("OpenAI summarize error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    let summary;
    try {
      summary = JSON.parse(content);
    } catch (_) {
      summary = { keyTakeaways: [], actionItems: [], topics: [] };
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in summarize-text function:", error);
    return new Response(JSON.stringify({ error: { message: (error as Error).message, type: "server_error" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
