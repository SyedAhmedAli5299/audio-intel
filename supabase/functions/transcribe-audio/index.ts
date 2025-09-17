import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1) Try environment variables (preferred)
    const envKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");

    // 2) Fall back to request headers (useful for testing only — less secure)
    const headerKey =
      req.headers.get("apikey") ||
      req.headers.get("x-api-key") ||
      (() => {
        const auth = req.headers.get("authorization");
        if (auth && auth.toLowerCase().startsWith("bearer ")) return auth.slice(7);
        return null;
      })();

    const googleApiKey = envKey || headerKey;

    if (!googleApiKey) {
      console.error(
        "CRITICAL: GOOGLE_API_KEY or GEMINI_API_KEY is not set (env). No apikey/Authorization header provided either."
      );
      return new Response(
        JSON.stringify({
          error: {
            message:
              "Server configuration error: Google API key is missing. Set GOOGLE_API_KEY (preferred) or provide a Bearer/apikey header for testing.",
            type: "configuration_error",
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Masked logging (don't log the whole key)
    const maskedKey = googleApiKey.length > 8 ? `${googleApiKey.slice(0, 4)}...${googleApiKey.slice(-4)}` : "****";
    console.log("Using Google API key:", maskedKey);

    // Parse body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: { message: "Invalid JSON body", type: "client_error" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let { audio, mimeType } = body ?? {};

    if (!audio) {
      return new Response(
        JSON.stringify({ error: { message: "No audio data provided", type: "client_error" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If client sent a data URL like "data:audio/webm;base64,AAAA..." strip the prefix.
    if (typeof audio === "string" && audio.startsWith("data:")) {
      const commaIndex = audio.indexOf(",");
      if (commaIndex !== -1) audio = audio.slice(commaIndex + 1);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorPayload;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = await response.text();
      }
      console.error("Google Gemini API returned an error:", errorPayload);
      return new Response(JSON.stringify({ error: errorPayload }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("An unexpected error occurred in the transcribe-audio function:", error);
    return new Response(
      JSON.stringify({
        error: { message: `An unexpected server error occurred: ${String(error)}`, type: "server_error" },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
