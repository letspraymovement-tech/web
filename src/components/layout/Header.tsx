import { useEffect, useState } from "react";
import { assets, whatsappGroupUrl } from "../../data/content";
const navigation = [
  {
    label: "Pray",
    links: [
      ["Prayer Sessions", "/prayer-sessions"],
      ["How to join", "/prayer-sessions#how-to-join"],
    ],
  },
  {
    label: "Learn",
    links: [
      ["Bible Teaching", "/prayer-sessions#session-2"],
      ["Rooted Messages", "/prayer-sessions#session-3"],
    ],
  },
  {
    label: "Events",
    links: [
      ["IPC 2026", "/IPC2026"],
      ["Monthly Gathering", "/prayer-sessions#session-4"],
    ],
  },
  {
    label: "Community",
    links: [
      ["Who we are", "/#about"],
      ["Testimonies", "/#testimonies"],
    ],
  },
  { label: "Give", links: [["Support the assignment", "/#give"]] },
];
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(
      "#main > .home-hero, #main > .page-hero",
    );
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastHero(entry.boundingClientRect.bottom <= 0);
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`site-header${pastHero ? " site-header--past-hero" : ""}`}
    >
      <a href="/" className="brand" aria-label="Let's Pray home">
        <img
          src={assets.logo}
          alt="Let's Pray Movement"
          width="55"
          height="70"
        />
      </a>
      <button
        className="menu-toggle"
        aria-expanded={mobileOpen}
        aria-controls="primary-navigation"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? "Close" : "Menu"}{" "}
        <span aria-hidden="true">{mobileOpen ? "×" : "☰"}</span>
      </button>
      <nav
        id="primary-navigation"
        className={
          mobileOpen ? "primary-navigation is-open" : "primary-navigation"
        }
        aria-label="Primary navigation"
      >
        <a href="/#about">About</a>
        {navigation.map((item) => (
          <details
            className="nav-dropdown"
            name="primary-menu"
            key={item.label}
          >
            <summary>
              {item.label}
              <img src={assets.chevron} alt="" />
            </summary>
            <div className="dropdown-panel">
              {item.links.map(([label, href]) => (
                <a key={href} href={href}>
                  {label}
                </a>
              ))}
            </div>
          </details>
        ))}
      </nav>
      <a className="button header-join" href={whatsappGroupUrl}>
        Join the community
      </a>
    </header>
  );
}
