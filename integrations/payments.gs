// This handles the payment verification from AppScript
// And notify the website if the payment was successful
// or not and give it the exact amount that was processed
function doPost(e) {
  try {
    if (!e || !e.postData || e.postData.contents.length > 2000)
      throw new Error("Invalid request");
    const input = JSON.parse(e.postData.contents);
    const transactionId = String(input.transactionId || "");
    const reference = input.reference;
    const amount = input.amount;
    const currency = input.currency;
    const limits =
      currency === "NGN"
        ? { min: 100, max: 10000000 }
        : { min: 1, max: 100000 };
    if (
      !/^[1-9][0-9]{0,19}$/.test(transactionId) ||
      typeof reference !== "string" ||
      !/^letspray-[a-f0-9-]{36}$/i.test(reference) ||
      (currency !== "NGN" && currency !== "USD") ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount < limits.min ||
      amount > limits.max ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001
    )
      throw new Error("Invalid payment");
    const secret = PropertiesService.getScriptProperties().getProperty(
      "FLUTTERWAVE_SECRET_KEY",
    );
    if (!secret) throw new Error("Payment verification is not configured");
    const response = UrlFetchApp.fetch(
      "https://api.flutterwave.com/v3/transactions/" +
        transactionId +
        "/verify",
      {
        method: "get",
        headers: { Authorization: "Bearer " + secret.trim() },
        muteHttpExceptions: true,
      },
    );
    if (response.getResponseCode() !== 200)
      throw new Error("Provider verification failed");
    const result = JSON.parse(response.getContentText());
    const payment = result.data;
    // These are voluntary donations. The donor chooses the amount; no goods or access are granted.
    const verified =
      result.status === "success" &&
      payment &&
      payment.status === "successful" &&
      String(payment.id) === transactionId &&
      payment.tx_ref === reference &&
      payment.currency === currency &&
      Number.isFinite(Number(payment.amount)) &&
      Math.round(Number(payment.amount) * 100) === Math.round(amount * 100);
    return paymentJson_({ verified: Boolean(verified) });
  } catch (error) {
    console.error(
      "Payment verification failed; inspect Flutterwave transaction logs and script configuration.",
    );
    return paymentJson_({ verified: false });
  }
}

function paymentJson_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// Run once in the editor to authorize external requests and check the key without charging anyone.
function setupPayments() {
  const secret = PropertiesService.getScriptProperties().getProperty(
    "FLUTTERWAVE_SECRET_KEY",
  );
  if (!secret)
    throw new Error("Add FLUTTERWAVE_SECRET_KEY in Script Properties first");
  const response = UrlFetchApp.fetch(
    "https://api.flutterwave.com/v3/balances",
    {
      headers: { Authorization: "Bearer " + secret.trim() },
      muteHttpExceptions: true,
    },
  );
  if (response.getResponseCode() !== 200)
    throw new Error(
      "Flutterwave key check failed. Check your secret key and API access.",
    );
  console.log("Flutterwave API access authorized. No payment was made.");
}
