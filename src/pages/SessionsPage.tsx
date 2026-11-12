import { assets, sessions } from "../data/content";
import { Eyebrow, SectionHeading } from "../components/ui";
export function SessionsPage({ onJoin }: { onJoin: () => void }) {
  return (
    <>
      <section className="page-hero sessions-hero">
        <img
          className="hero-background"
          src="/assets/sessions.png"
          alt="Believers praying together"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="page-hero-content">
          <div className="hero-mark">
            <img src={assets.logo} alt="" />
          </div>
          <h1>
            Pray With Us <span>This Week</span>
          </h1>
          <p>
            Wherever you are in Lagos, in Nigeria or across the world, there is
            a place for you in our weekly rhythm. No cost. No registration maze.
            Just show up and pray.
          </p>
          <button className="button button--pill" onClick={onJoin}>
            Join the WhatsApp Group <img src="/assets/join-group.svg" alt="" />
          </button>
        </div>
      </section>
      <section className="session-list-section">
        <div className="container session-list">
          {sessions.map((session, index) => (
            <article
              className="session-row"
              id={`session-${index + 1}`}
              key={session.title}
            >
              <div className="session-number">
                <span>0{index + 1}</span>
                <small>{session.format}</small>
              </div>
              <div className="session-description">
                <h2>{session.title}</h2>
                <p>{session.description}</p>
                <strong>{session.time}</strong>
              </div>
              <div className="session-actions">
                <button
                  className="button button--green button--pill"
                  onClick={onJoin}
                >
                  Join Session <img src="/assets/join-session.svg" alt="" />
                </button>
                <details>
                  <summary>
                    Learn more <img src="/assets/learn-more.svg" alt="" />
                  </summary>
                  <p>
                    {index < 2
                      ? "Join us online through the WhatsApp community. All times are West Africa Time (UTC+1)."
                      : index === 2
                        ? "Ask the team for this week’s messages and listening links."
                        : "Join the community for the next gathering date and Lagos venue."}
                  </p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="join-section" id="how-to-join">
        <div className="container">
          <SectionHeading eyebrow="How to join" title="Three simple steps." />
          <div className="steps-grid">
            {[
              [
                "Click the join button",
                "Enter the WhatsApp community for the session.",
              ],
              [
                "Introduce yourself",
                "Tell us your name and where you are joining from.",
              ],
              [
                "Show up and pray",
                "Come on time with your Bible and an open heart.",
              ],
            ].map(([title, description], index) => (
              <article key={title}>
                <small>0{index + 1}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <aside className="timezone-note">
            <Eyebrow light>Diaspora time note</Eyebrow>
            <p>
              All meeting times are West Africa Time (WAT, UTC+1). Please check
              the equivalent time in your city before joining.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
