import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Dummy API called at:", new Date().toISOString());
    
    // Dummy response - simulating a robot credits/status check
    const dummyResponse = {
      success: true,
      message: "API call successful!",
      data: {
        credits: 150,
        lastUpdated: new Date().toISOString(),
        robotsOnline: 5,
      }
    };

    console.log("Returning dummy response:", dummyResponse);

    return new Response(JSON.stringify(dummyResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in dummy-api:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
