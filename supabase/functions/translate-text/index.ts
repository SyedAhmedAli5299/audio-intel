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

    const { text, targetLanguage = "English" } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: { message: "No text provided", type: "client_error" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Translate the following text into ${targetLanguage} with correct grammar and natural fluency. Only return the translated text.\n\nText:\n${text}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "You are a precise, professional translator." },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      console.error("OpenAI translate error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ translated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in translate-text function:", error);
    return new Response(JSON.stringify({ error: { message: (error as Error).message, type: "server_error" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
