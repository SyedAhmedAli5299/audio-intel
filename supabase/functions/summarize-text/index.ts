import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to strip markdown from JSON
const stripMarkdown = (text: string) => {
  return text.replace(/```json\n?|```/g, "").trim();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    if (!googleApiKey) {
      console.error("GOOGLE_API_KEY or GEMINI_API_KEY is not set.");
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

    const { transcript } = await req.json();
    if (!transcript) {
      return new Response(JSON.stringify({ error: { message: "No transcript provided", type: "client_error" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`;
    
    const prompt = `You are an expert meeting notes assistant. Summarize the meeting transcript below into this exact JSON schema:\n{\n  "keyTakeaways": string[],\n  "actionItems": string[],\n  "topics": string[]\n}\nRules:\n- Respond ONLY with the JSON object.\n- Be concise and specific.\n- Use clear, short bullet points.\n- Extract actionable tasks for actionItems with verbs.\n- Cover main themes in topics.\n\nTranscript:\n${transcript}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        maxOutputTokens: 800,
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
      console.error("Google Gemini summarize error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    
    let summary;
    try {
      // Gemini might wrap the JSON in markdown, so we strip it.
      summary = JSON.parse(stripMarkdown(content));
    } catch (_) {
      console.error("Failed to parse summary JSON from Gemini:", content);
      summary = { keyTakeaways: [], actionItems: [], topics: [] };
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in summarize-text function:", err.message);
    console.error("Stack trace:", err.stack);
    return new Response(JSON.stringify({ error: { message: err.message, type: "server_error" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
