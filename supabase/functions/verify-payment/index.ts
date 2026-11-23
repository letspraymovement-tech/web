const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type VerificationRequest = {
  transactionId?: unknown;
  reference?: unknown;
  amount?: unknown;
  currency?: unknown;
};

function jsonResponse(body: { verified: boolean }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ verified: false }, 405);
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > 2000) return jsonResponse({ verified: false }, 400);
    const input = JSON.parse(rawBody) as VerificationRequest;
    const transactionId = String(input.transactionId ?? "");
    const reference = input.reference;
    const amount = input.amount;
    const currency = input.currency;
    const limits = currency === "NGN"
      ? { min: 100, max: 10_000_000 }
      : currency === "USD"
        ? { min: 1, max: 100_000 }
        : null;

    if (
      !/^[1-9][0-9]{0,19}$/.test(transactionId) ||
      typeof reference !== "string" ||
      !/^letspray-[a-f0-9-]{36}$/i.test(reference) ||
      !limits ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount < limits.min ||
      amount > limits.max ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001
    ) {
      return jsonResponse({ verified: false }, 400);
    }

    const secretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!secretKey) {
      console.error("Missing FLUTTERWAVE_SECRET_KEY Supabase secret");
      return jsonResponse({ verified: false }, 500);
    }

    const providerResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    if (!providerResponse.ok) return jsonResponse({ verified: false });

    const result = await providerResponse.json();
    const payment = result?.data;
    const verified =
      result?.status === "success" &&
      payment?.status === "successful" &&
      String(payment.id) === transactionId &&
      payment.tx_ref === reference &&
      payment.currency === currency &&
      Number.isFinite(Number(payment.amount)) &&
      Math.round(Number(payment.amount) * 100) === Math.round(amount * 100);

    return jsonResponse({ verified: Boolean(verified) });
  } catch (error) {
    console.error("Payment verification request failed", error);
    return jsonResponse({ verified: false }, 400);
  }
});
