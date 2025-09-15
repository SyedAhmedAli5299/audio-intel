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
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("gemini_api_key");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY (or gemini_api_key) is not set.");
      return new Response(
        JSON.stringify({ error: { message: "Server configuration error: The GEMINI_API_KEY is missing.", type: "server_error" } }),
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

    const prompt = `You are an expert meeting notes assistant. Analyze the meeting transcript below and return a JSON response with this exact structure:

{
  "keyTakeaways": ["takeaway1", "takeaway2", ...],
  "actionItems": ["action1", "action2", ...],
  "topics": ["topic1", "topic2", ...]
}

Rules:
- Be concise and specific
- Use clear, short bullet points
- Extract actionable tasks for actionItems with verbs
- Cover main themes in topics
- Return ONLY the JSON object, no additional text or formatting

Transcript:
${transcript}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.1,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      console.error("Gemini summarize error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let summary;
    try {
      // Clean the response to extract JSON if it's wrapped in markdown or other formatting
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      summary = JSON.parse(jsonString);
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