const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: { subscribed: boolean }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ subscribed: false }, 405);

  try {
    const rawBody = await request.text();
    if (rawBody.length > 1000) return jsonResponse({ subscribed: false }, 400);
    const input = JSON.parse(rawBody) as { email?: unknown };
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ subscribed: false }, 400);
    }

    const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID");
    const dataCenter = apiKey?.match(/-(us\d+)$/i)?.[1];
    if (!apiKey || !audienceId || !dataCenter) {
      console.error("Mailchimp secrets are missing or the API key has no data center suffix");
      return jsonResponse({ subscribed: false }, 500);
    }

    const response = await fetch(
      `https://${dataCenter}.api.mailchimp.com/3.0/lists/${encodeURIComponent(audienceId)}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_address: email, status: "pending" }),
      },
    );
    if (!response.ok) {
      console.error("Mailchimp rejected newsletter signup", response.status);
      return jsonResponse({ subscribed: false }, 502);
    }
    return jsonResponse({ subscribed: true });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return jsonResponse({ subscribed: false }, 400);
  }
});
