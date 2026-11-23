import { useRef, useState } from "react";
import { assets } from "../data/content";
import { Eyebrow } from "../components/ui";
export function RegistrationPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const successDialog = useRef<HTMLDialogElement>(null);
  const firstNameInput = useRef<HTMLInputElement>(null);
  return (
    <>
      <section className="page-hero registration-hero">
        <img
          src="/assets/registration.png"
          className="hero-background"
          alt="Minister teaching at the Instruction Prayer Conference"
          fetchPriority="high"
        />
        <div className="registration-shade" />
        <div className="page-hero-content">
          <div className="hero-mark">
            <img src={assets.logo} alt="" />
          </div>
          <h1>IPC 2026</h1>
          <p>Registration form</p>
        </div>
      </section>
      <section className="registration-section" id="registration">
        <div className="registration-layout container">
          <aside className="expect-card">
            <Eyebrow light>IPC 2026</Eyebrow>
            <h2>
              What to
              <br />
              {" "}expect
            </h2>
            <h3>Do I need to belong to a particular denomination?</h3>
            <p>
              No. Let’s Pray is interdenominational and welcomes every believer
              who desires to grow in prayer and the Word.
            </p>
          </aside>
          <form
            className="registration-form"
            onSubmit={async (event) => {
              event.preventDefault();
              if (status === "sending") return;
              const form = event.currentTarget;
              const data = new FormData(form);
              const firstName = String(data.get("firstName") ?? "").trim();
              const lastName = String(data.get("lastName") ?? "").trim();
              const email = String(data.get("email") ?? "").trim().toLowerCase();
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
              const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
              if (!supabaseUrl || !supabasePublishableKey) {
                setStatus("error");
                setMessage("Online registration is not configured yet. Please contact the team.");
                return;
              }
              setStatus("sending");
              setMessage("Saving your registration…");
              try {
                const response = await fetch(`${supabaseUrl}/rest/v1/registrations`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    apikey: supabasePublishableKey,
                    Prefer: "return=minimal",
                  },
                  body: JSON.stringify({
                    request_id: requestId,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone: String(data.get("phone") ?? "").trim(),
                    location: String(data.get("location") ?? "").trim(),
                    prayer_request: String(data.get("prayer") ?? "").trim(),
                    confidential: data.has("confidential"),
                    followup: data.has("followup"),
                  }),
                });
                if (!response.ok) {
                  const errorBody = await response.json().catch(() => null) as { code?: unknown } | null;
                  const errorCode = typeof errorBody?.code === "string" ? `, ${errorBody.code}` : "";
                  setStatus("error");
                  if (response.status === 409) {
                    setMessage("This email address is already registered. Please contact the team if you need help.");
                  } else {
                    const hint = response.status === 401
                      ? "Check that the Supabase URL and publishable key belong to the same project."
                      : response.status === 403
                        ? "Check the table permissions and row level security policy in the setup SQL."
                        : response.status === 404
                          ? "Check that the registrations table exists and the Supabase Data API is enabled."
                          : "Please check the form details and Supabase setup.";
                    setMessage(`We could not save your registration (HTTP ${response.status}${errorCode}). ${hint}`);
                  }
                  return;
                }
                let confirmationSent = false;
                try {
                  const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-registration-confirmation`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      apikey: supabasePublishableKey,
                      Authorization: `Bearer ${supabasePublishableKey}`,
                    },
                    body: JSON.stringify({ firstName, email }),
                  });
                  confirmationSent = emailResponse.ok;
                } catch {
                  confirmationSent = false;
                }
                setStatus("success");
                setMessage(confirmationSent
                  ? "Your registration was received. We sent a confirmation email with your registration details. If it is not in your inbox, check your spam or junk folder."
                  : "Your registration was saved successfully, but we could not send the confirmation email. Please contact the team if you need confirmation.");
                form.reset();
                setRequestId(crypto.randomUUID());
                successDialog.current?.showModal();
              } catch {
                setStatus("error");
                setMessage("We could not reach the registration service or read its response. Please check your connection and retry. Your form details are still here. (connection error)");
              }
            }}
          >
            <h2>Please provide your details</h2>
            <div className="form-grid">
              <label>
                First name
                <input
                  name="firstName"
                  ref={firstNameInput}
                  autoComplete="given-name"
                  placeholder="Your first name"
                  required
                />
              </label>
              <label>
                Last name
                <input
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Your last name"
                  required
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                WhatsApp number
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234"
                  pattern="\+[1-9][0-9]{7,14}"
                  title="Include your country code, for example +2348012345678, with no spaces."
                  required
                />
              </label>
              <label className="form-full">
                Where are you coming from
                <input
                  name="location"
                  autoComplete="address-level2"
                  placeholder="Your city and country"
                  required
                />
              </label>
              <label className="form-full">
                Prayer request
                <textarea
                  name="prayer"
                  placeholder="Write your prayer request here…"
                  rows={5}
                />
              </label>
            </div>
            <div className="consent-options">
              <label>
                <input type="checkbox" name="confidential" />
                <span>
                  <strong>Keep this confidential</strong>
                  <small>Only the prayer team will see this.</small>
                </span>
              </label>
              <label>
                <input type="checkbox" name="followup" />
                <span>
                  <strong>I would welcome a follow-up</strong>
                  <small>We may contact you with care.</small>
                </span>
              </label>
            </div>
            <button className="button registration-submit" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Registering…" : "Register now"}
            </button>
            <p className="form-note" role="status">
              {message || "Your registration details will be saved securely."}
            </p>
          </form>
        </div>
      </section>
      <dialog
        ref={successDialog}
        className="registration-success-dialog"
        aria-labelledby="registration-success-title"
        aria-describedby="registration-success-message"
        onClose={() => {
          setStatus("idle");
          setMessage("");
          firstNameInput.current?.focus();
        }}
      >
        <h2 id="registration-success-title">Registration successful</h2>
        <p id="registration-success-message">{message}</p>
        <form method="dialog">
          <button className="button" autoFocus>Done</button>
        </form>
      </dialog>
    </>
  );
}
