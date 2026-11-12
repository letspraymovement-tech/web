import { assets, whatsappGroupUrl } from "../../data/content";
import type { ContactTopic } from "../ContactDialog";
const links = [
  ["About", "/#about"],
  ["Prayer Sessions", "/prayer-sessions"],
  ["Teachings", "/prayer-sessions#session-2"],
  ["IPC", "/ipc"],
  ["Schools Invasion", "/#movements"],
  ["Give", "/#give"],
  ["Contact", "mailto:hello@letspray.ng"],
];
export function Footer({
  onContact,
}: {
  onContact: (topic: ContactTopic) => void;
}) {
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
              onSubmit={(event) => {
                event.preventDefault();
                const email = new FormData(event.currentTarget).get(
                  "email",
                ) as string;
                window.location.href = `mailto:hello@letspray.ng?subject=Newsletter%20subscription&body=${encodeURIComponent(`Please add ${email} to the weekly word and prayer newsletter.`)}`;
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
              />
              <button aria-label="Request subscription by email">→</button>
            </form>
            <a className="footer-contact" href="mailto:hello@letspray.ng">
              hello@letspray.ng
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
          <a href="mailto:hello@letspray.ng">Contact</a>
        </nav>
        <div className="footer-bottom">
          <span>© 2026 Let’s Pray. All rights reserved.</span>
          <span>Lagos, Nigeria · English (en-NG)</span>
        </div>
      </div>
    </footer>
  );
}
