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
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("AIzaSyDMQI_t4__OGh9YSq5fsdfoLvS77A_a9vQ");
    if (!googleApiKey) {
      console.error("CRITICAL: GOOGLE_API_KEY or GEMINI_API_KEY is not set.");
      return new Response(
        JSON.stringify({ 
          error: { 
            message: "Server configuration error: Google API key is missing. Please set GOOGLE_API_KEY or GEMINI_API_KEY in your Supabase project settings.", 
            type: "configuration_error" 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { audio, mimeType } = await req.json();
    if (!audio) {
      return new Response(JSON.stringify({ error: { message: "No audio data provided", type: "client_error" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${googleApiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: "Transcribe this audio file. Respond only with the transcribed text." },
            {
              inline_data: {
                mime_type: mimeType || "audio/webm",
                data: audio,
              },
            },
          ],
        },
      ],
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
      console.error("Google Gemini API returned an error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as Error;
    console.error("An unexpected error occurred in the transcribe-audio function:", err.message);
    console.error("Stack trace:", err.stack);
    return new Response(JSON.stringify({ error: { message: `An unexpected server error occurred: ${err.message}`, type: "server_error" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
