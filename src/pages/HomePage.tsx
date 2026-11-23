import { assets, movements, sessions, testimonies } from "../data/content";
import { Eyebrow, SectionHeading } from "../components/ui";
import { Countdown } from "../components/Countdown";
import type { ContactTopic } from "../components/ContactDialog";
export function HomePage({
  onContact,
}: {
  onContact: (topic: ContactTopic) => void;
}) {
  return (
    <>
      <section className="home-hero" aria-labelledby="hero-title">
        <img
          className="hero-background"
          src={assets.hero}
          alt="Believers gathered together at Let’s Pray"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="hero-mark">
            <img src={assets.logo} alt="" />
          </div>
          <h1 id="hero-title">
            By All Means,
            <br />
            <span>Prayer Must Go On!</span>
          </h1>
          <p>
            We are a gathering of believers learning to understand the ministry
            of prayer by praying together, consistently, and with faith.
          </p>
          <p className="hero-tagline">
            Understanding the ministry of prayer by praying.
          </p>
          <div className="button-row">
            <a className="button" href="/prayer-sessions">
              Join This Week’s Prayer
            </a>
            <button
              className="button button--outline"
              onClick={() => onContact("prayer")}
            >
              Send a Prayer Request
            </button>
          </div>
        </div>
      </section>
      <section className="meeting-section" aria-labelledby="meeting-title">
        <div className="meeting-card">
          <img className="meeting-watermark" src={assets.whatsapp} alt="" />
          <div className="meeting-photo">
            <img
              src={assets.meeting}
              alt="A minister leading the prayer meeting"
            />
          </div>
          <div className="meeting-content">
            <Eyebrow light>Next meeting</Eyebrow>
            <Countdown titleId="meeting-title" />
          </div>
        </div>
      </section>
      <section className="sessions-section" id="sessions">
        <div className="wide-container">
          <div className="section-topline">
            <SectionHeading
              eyebrow="The assignment"
              title="Four movements, one assignment."
              description="Prayer forms a people. These are the rhythms through which we make room for that formation."
            />
            <a
              className="button button--dark-outline button--pill"
              href="#movements"
            >
              Discover our mission
            </a>
          </div>
          <div className="session-cards">
            {sessions.map((session, index) => (
              <a
                className="session-card"
                href={`/prayer-sessions#session-${index + 1}`}
                key={session.title}
              >
                <img
                  className="session-card-photo"
                  src={session.image}
                  alt=""
                  loading="lazy"
                />
                <span className="session-day">{session.day}</span>
                <div className="session-card-title">
                  <h3>
                    {index === 3 ? "Monthly Physical Gathering" : session.title}
                  </h3>
                  <img src={assets.arrow} alt="" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-copy">
            <Eyebrow>Who we are</Eyebrow>
            <h2>
              A gathering of believers who decided prayer would not be an
              afterthought.
            </h2>
            <p>
              Let’s Pray is an interdenominational, apostolic and evangelistic
              prayer movement founded in Lagos, Nigeria. We exist to help
              believers build a life of prayer that is rooted in Scripture,
              alive to the Spirit and faithful in every season.
            </p>
            <p>
              We do not gather around performance. We gather around the presence
              of God to intercede, learn, worship and be sent back into our
              homes, churches, schools and cities.
            </p>
            <blockquote>
              “Prayer is not the preparation for the work. Prayer is the work.”
            </blockquote>
            <a className="button" href="#movements">
              Learn more about us
            </a>
            <div className="values">
              <span>Word-rooted</span>
              <span>Spirit-led</span>
              <span>Christ-centred</span>
            </div>
          </div>
          <figure className="minister-figure">
            <img
              src={assets.minister}
              alt="Minister Ochu Ikechukwu teaching"
              loading="lazy"
            />
            <figcaption>
              <strong>Minister Ochu Ikechukwu</strong>
              <span>Our set man</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="movements-section" id="movements">
        <div className="container">
          <SectionHeading
            eyebrow="The assignment"
            title="Four movements, one assignment."
            description="Prayer forms a people. These are the rhythms through which we make room for that formation."
          />
          <div className="movements-grid">
            {movements.map((item, index) => (
              <article key={item.title}>
                <span className="movement-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a className="explore-link" href={item.href}>
                  Explore <span>→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="conference-section" id="events">
        <div className="conference-card container">
          <img
            className="cover-image"
            src={assets.conference}
            alt=""
            loading="lazy"
          />
          <div className="conference-shade" />
          <div className="conference-content">
            <Eyebrow light>Featured event · December 2026</Eyebrow>
            <h2>
              Instruction Prayer
              <br />
              Conference 2026
            </h2>
            <p>
              Three days of Word, prayer and spiritual formation around the
              theme <em>“Built upon the altar.”</em>
            </p>
            <div className="event-meta">
              <span>December 2026</span>
              <span>Lagos + Online</span>
              <span>Registration free</span>
            </div>
            <div className="button-row">
              <a className="button button--pill" href="/IPC2026">
                Register now
              </a>
              <a
                className="button button--outline button--pill"
                href="/IPC2026#registration"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="giving-section" id="give">
        <img
          src={assets.giving}
          alt="The congregation gathered for worship"
          className="giving-image"
          loading="lazy"
        />
        <div className="giving-shade" />
        <div className="container giving-content">
          <Eyebrow light>Give</Eyebrow>
          <h2>
            Put generosity
            <br />
            <span>behind the assignment.</span>
          </h2>
          <p>
            Your giving keeps prayer gatherings free, sends teams into schools
            and opens the doors of the Instruction Prayer Conference.
          </p>
          <button className="button" onClick={() => onContact("giving")}>
            Give today
          </button>
        </div>
      </section>
      <section className="testimonies-section" id="testimonies">
        <div className="container">
          <div className="section-topline">
            <SectionHeading
              eyebrow="Stories of grace"
              title="Prayer changes things."
              description="Quiet stories. Lasting fruit. God is still at work among us."
            />
            <button
              className="button button--dark-outline button--pill"
              onClick={() => onContact("prayer")}
            >
              Share your story
            </button>
          </div>
          <div className="testimony-grid">
            {testimonies.map((item) => (
              <figure className="testimony-card" key={item.name}>
                <blockquote>“{item.quote}”</blockquote>
                <div className="quote-line" />
                <figcaption>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.city}</span>
                  </div>
                  <span className="testimony-category">{item.category}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
