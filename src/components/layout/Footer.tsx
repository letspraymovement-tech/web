import { assets, whatsappGroupUrl } from "../../data/content";
import type { ContactTopic } from "../ContactDialog";
import { useState } from "react";
const links = [
  ["About", "/#about"],
  ["Prayer Sessions", "/prayer-sessions"],
  ["Teachings", "/prayer-sessions#session-2"],
  ["IPC", "/IPC2026"],
  ["Schools Invasion", "/#movements"],
  ["Give", "/#give"],
  ["Contact", "mailto:letspraymovement4@gmail.com"],
];
export function Footer({
  onContact,
}: {
  onContact: (topic: ContactTopic) => void;
}) {
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-intro">
            <a href="/" className="footer-brand">
              <img src={assets.logo} width="46" height="59" alt="" />
              <strong>Let’s Pray</strong>
              <span>Movement</span>
            </a>
            <p>
              Let’s Pray is an interdenominational, apostolic and evangelistic
              prayer movement in Lagos, Nigeria.
            </p>
            <p className="footer-motto">By all means, prayer must go on!</p>
            <div className="social-links">
              {[
                ["Instagram", "imgAntDesignInstagramFilled"],
                ["Facebook", "imgBrandicoFacebookRect"],
                ["YouTube", "imgAntDesignYoutubeFilled"],
              ].map(([name, image]) => (
                <button
                  key={name}
                  onClick={() => onContact("community")}
                  aria-label={`Ask for the ${name} community link`}
                >
                  <img src={`/assets/${image}.svg`} alt="" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3>Quick links</h3>
            <ul>
              {links.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>The rhythm</h3>
            <p>
              <strong>Monday Intercession</strong>
              <br />
              11 PM – 12 AM WAT
            </p>
            <p>
              <strong>Tuesday Bible Teaching</strong>
              <br />
              11 PM – 12 AM WAT
            </p>
            <p>
              <strong>Monthly Gathering</strong>
              <br />
              Lagos, Nigeria
            </p>
          </div>
          <div>
            <h3>Stay rooted</h3>
            <p>Receive a weekly word and prayer prompt in your inbox.</p>
            <form
              className="mini-signup"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const email = String(new FormData(form).get("email") ?? "").trim();
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
                const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
                if (!supabaseUrl || !supabaseKey) {
                  setNewsletterStatus("error");
                  setNewsletterMessage("Newsletter signup is not configured yet.");
                  return;
                }
                setNewsletterStatus("sending");
                setNewsletterMessage("Submitting your signup…");
                try {
                  const response = await fetch(`${supabaseUrl}/functions/v1/newsletter-subscribe`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      apikey: supabaseKey,
                      Authorization: `Bearer ${supabaseKey}`,
                    },
                    body: JSON.stringify({ email }),
                  });
                  if (!response.ok) throw new Error("Newsletter signup failed");
                  setNewsletterStatus("success");
                  setNewsletterMessage("Thanks for signing up. Check your inbox to confirm your subscription. If you don't see the email, check your spam or junk folder.");
                  form.reset();
                } catch {
                  setNewsletterStatus("error");
                  setNewsletterMessage("We could not submit your signup. Please try again later.");
                }
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="Email address"
                required
                disabled={newsletterStatus === "sending"}
              />
              <button aria-label="Request subscription by email">→</button>
            </form>
            <p className="newsletter-status" role="status" aria-live="polite">{newsletterMessage}</p>
            <a className="footer-contact" href="mailto:letspraymovement4@gmail.com">
              letspraymovement4@gmail.com
            </a>
            <a
              className="text-button"
              href={whatsappGroupUrl}
            >
              WhatsApp community →
            </a>
          </div>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          <a href="/">Home</a>
          {links.slice(0, 4).map(([label, href]) => (
            <a href={href} key={label}>
              {label}
            </a>
          ))}
          <button onClick={() => onContact("prayer")}>Prayer Requests</button>
          <a href="/#testimonies">Testimonies</a>
          <a href="/#give">Give</a>
          <a href="mailto:letspraymovement4@gmail.com">Contact</a>
        </nav>
        <div className="footer-bottom">
          <span>© 2026 Let’s Pray. All rights reserved.</span>
          <span>Lagos, Nigeria · English (en-NG)</span>
        </div>
      </div>
    </footer>
  );
}
