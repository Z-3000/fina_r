import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLOVA_API_URL = Deno.env.get("CLOVA_OCR_API_URL");
const CLOVA_SECRET_KEY = Deno.env.get("CLOVA_OCR_SECRET_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!CLOVA_API_URL || !CLOVA_SECRET_KEY) {
            throw new Error("Missing CLOVA OCR configuration");
        }

        const { images, requestId, timestamp, version } = await req.json();

        if (!images || !Array.isArray(images)) {
            throw new Error("Invalid request body: 'images' array is required");
        }

        console.log(`Processing OCR request: ${requestId}`);

        const response = await fetch(CLOVA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-OCR-SECRET": CLOVA_SECRET_KEY,
            },
            body: JSON.stringify({
                images,
                requestId,
                timestamp: timestamp || Date.now(),
                version: version || "V2",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("CLOVA API Error:", errorText);
            return new Response(JSON.stringify({ error: "CLOVA API Error", details: errorText }), {
                status: response.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
