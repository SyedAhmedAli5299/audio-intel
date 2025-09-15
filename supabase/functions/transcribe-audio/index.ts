import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;

  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);

    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }

    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("openai_api_key");
    
    if (!openAIKey) {
      console.error("CRITICAL: OPENAI_API_KEY (or openai_api_key) is not set.");
      return new Response(
        JSON.stringify({ error: { message: "Server configuration error: The OPENAI_API_KEY is missing.", type: "server_error" } }),
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

    const binaryAudio = processBase64Chunks(audio);
    const blob = new Blob([binaryAudio], { type: mimeType || "audio/webm" });

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      console.error("OpenAI transcription API returned an error:", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("An unexpected error occurred in the transcribe-audio function:", error);
    return new Response(JSON.stringify({ error: { message: `An unexpected server error occurred: ${(error as Error).message}`, type: "server_error" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
