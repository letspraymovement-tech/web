import { useEffect, useRef, useState } from "react";

type Payment = { transaction_id?: number; status?: string };
type CheckoutOptions = {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: { email: string; name: string };
  customizations: { title: string; description: string };
  callback: (payment: Payment) => void;
  onclose: () => void;
};
declare global {
  interface Window {
    FlutterwaveCheckout?: (options: CheckoutOptions) => { close: () => void };
  }
}

let checkoutScript: Promise<void> | undefined;
function loadCheckout() {
  if (window.FlutterwaveCheckout) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => {
        if (window.FlutterwaveCheckout) resolve();
        else { script.remove(); reject(new Error("Checkout unavailable")); }
      };
      script.onerror = () => { script.remove(); reject(new Error("Checkout unavailable")); };
      document.head.appendChild(script);
    }).catch(error => { checkoutScript = undefined; throw error; });
  }
  return checkoutScript;
}

export function GivingDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const limits = currency === "NGN" ? { min: 100, max: 10000000, placeholder: "5000" } : { min: 1, max: 100000, placeholder: "50" };
  const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
  const verifyUrl = import.meta.env.VITE_PAYMENT_VERIFY_URL;
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const configured = Boolean(publicKey && verifyUrl && supabasePublishableKey);
  useEffect(() => { dialog.current?.showModal(); }, []);

  return <dialog ref={dialog} className="contact-dialog giving-dialog"
    aria-labelledby="giving-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <button type="button" className="dialog-close" aria-label="Close giving dialog" disabled={busy} onClick={onClose}>×</button>
    <h2 id="giving-title">Give today</h2>
    <p>Support the work of Let’s Pray with a gift in Nigerian naira or US dollars.</p>
    {complete ? <button className="button" onClick={onClose}>Done</button> :
      <form className="giving-form" onSubmit={async event => {
        event.preventDefault();
        if (busy || !configured) return;
        const data = new FormData(event.currentTarget);
        const amount = Number(data.get("amount"));
        if (!Number.isFinite(amount) || amount < limits.min || amount > limits.max || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) {
          setMessage(`Enter an amount between ${limits.min.toLocaleString()} and ${limits.max.toLocaleString()} ${currency}, with up to two decimal places.`); return;
        }
        setBusy(true);
        setMessage("Opening secure checkout…");
        const reference = `letspray-${crypto.randomUUID()}`;
        let callbackStarted = false;
        try {
          await loadCheckout();
          // Release the native dialog's modal focus trap so Flutterwave's overlay is interactive.
          dialog.current?.close();
          const checkout = window.FlutterwaveCheckout!({
            public_key: publicKey, tx_ref: reference, amount, currency,
            customer: { email: String(data.get("email")).trim(), name: String(data.get("name")).trim() },
            customizations: { title: "Let’s Pray", description: "Support the prayer movement" },
            callback: async payment => {
              if (callbackStarted) return;
              callbackStarted = true;
              checkout.close();
              dialog.current?.showModal();
              setMessage("Confirming your payment…");
              try {
                if (!payment.transaction_id) throw new Error("Missing transaction ID");
                const response = await fetch(verifyUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    apikey: supabasePublishableKey,
                  },
                  body: JSON.stringify({ transactionId: payment.transaction_id, reference, amount, currency }),
                });
                const result = await response.json();
                if (!response.ok || result.verified !== true) throw new Error("Unverified payment");
                setComplete(true);
                setMessage("Thank you! Your gift of " + new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount) + " has been confirmed.");
              } catch {
                setComplete(true);
                setMessage(`We could not confirm this payment yet. Please check your email receipt or contact letspraymovement4@gmail.com with reference ${reference} before paying again.`);
              } finally { setBusy(false); }
            },
            onclose: () => {
              if (callbackStarted) return;
              dialog.current?.showModal();
              setBusy(false);
              setMessage("Checkout closed. If you were charged, check your receipt before trying again.");
            },
          });
        } catch {
          if (!dialog.current?.open) dialog.current?.showModal();
          setBusy(false);
          setMessage("Payment checkout could not open. Please check your connection and try again.");
        }
      }}>
        <fieldset disabled={busy}>
          <label>Your name<input name="name" autoComplete="name" maxLength={150} required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
          <label>Currency<select name="currency" value={currency} onChange={event => {
            setCurrency(event.target.value as "NGN" | "USD");
            setMessage("");
          }}>
            <option value="NGN">NGN — Nigerian naira</option>
            <option value="USD">USD — US dollar</option>
          </select></label>
          <label>Amount ({currency})<input key={currency} name="amount" type="number" inputMode="decimal" min={limits.min} max={limits.max} step="0.01" placeholder={limits.placeholder} required /></label>
        </fieldset>
        {!configured && <p>Online giving will be available soon. Contact <a href="mailto:letspraymovement4@gmail.com">letspraymovement4@gmail.com</a> for giving details.</p>}
        <button className="button" disabled={busy || !configured}>{busy ? "Please wait…" : "Continue to Flutterwave"}</button>
      </form>}
    <p role="status" className="giving-status">{message}</p>
  </dialog>;
}
