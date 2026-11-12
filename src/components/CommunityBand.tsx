import { Eyebrow } from "./ui";
import { whatsappGroupUrl } from "../data/content";
export function CommunityBand() {
  return (
    <section className="community-section" aria-labelledby="community-title">
      <div className="community-band container">
        <div className="band-texture band-texture--left" aria-hidden="true" />
        <div className="band-texture band-texture--right" aria-hidden="true" />
        <div className="community-content">
          <Eyebrow light>Come as you are</Eyebrow>
          <h2 id="community-title">
            You do not have to be an expert to pray.
            <br />
            You only have to begin.
          </h2>
          <div className="button-row">
            <a className="button" href={whatsappGroupUrl}>
              Join on WhatsApp
            </a>
            <a
              className="button button--outline button--pill"
              href="/prayer-sessions"
            >
              Prayer Sessions
            </a>
          </div>
          <p className="serif-note">By all means, prayer must go on!</p>
        </div>
      </div>
    </section>
  );
}
