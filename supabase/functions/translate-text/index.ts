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
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!googleApiKey) {
      console.error("GOOGLE_API_KEY is not set.");
      return new Response(
        JSON.stringify({ error: { message: "Server configuration error: The GOOGLE_API_KEY is missing.", type: "server_error" } }),
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`;
    
    const prompt = `You are a precise, professional translator. Translate the following text into ${targetLanguage} with correct grammar and natural fluency. Respond ONLY with the translated text.\n\nText:\n${text}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 600,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      console.error("Google Gemini translate error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(JSON.stringify({ translated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in translate-text function:", err.message);
    console.error("Stack trace:", err.stack);
    return new Response(JSON.stringify({ error: { message: err.message, type: "server_error" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
