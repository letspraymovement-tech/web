const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: { sent: boolean }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ sent: false }, 405);

  try {
    const rawBody = await request.text();
    if (rawBody.length > 1000) return jsonResponse({ sent: false }, 400);
    const input = JSON.parse(rawBody) as { firstName?: unknown; email?: unknown };
    const firstName = typeof input.firstName === "string" ? input.firstName.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    if (firstName.length < 1 || firstName.length > 100 || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ sent: false }, 400);
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    const fromEmail = Deno.env.get("REGISTRATION_FROM_EMAIL");
    const fromName = Deno.env.get("REGISTRATION_FROM_NAME") || "Let's Pray Movement";
    if (!apiKey || !fromEmail) {
      console.error("Brevo registration email secrets are not configured");
      return jsonResponse({ sent: false }, 500);
    }

    const safeFirstName = escapeHtml(firstName);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email, name: firstName }],
        subject: "IPC 2026 registration confirmation",
        textContent: `Hello ${firstName},\n\nYour registration for IPC 2026 has been received successfully. We look forward to welcoming you.\n\nIf you have questions, reply to this email or contact letspraymovement4@gmail.com.\n\nLet's Pray Movement`,
        htmlContent: `<html><body><p>Hello ${safeFirstName},</p><p>Your registration for <strong>IPC 2026</strong> has been received successfully. We look forward to welcoming you.</p><p>If you have questions, reply to this email or contact <a href="mailto:letspraymovement4@gmail.com">letspraymovement4@gmail.com</a>.</p><p>Let's Pray Movement</p></body></html>`,
      }),
    });

    if (!response.ok) {
      const errorDetails = (await response.text()).slice(0, 500);
      console.error("Brevo rejected IPC registration confirmation", response.status, errorDetails);
      return jsonResponse({ sent: false }, 502);
    }
    return jsonResponse({ sent: true });
  } catch (error) {
    console.error("IPC registration confirmation failed", error);
    return jsonResponse({ sent: false }, 400);
  }
});
