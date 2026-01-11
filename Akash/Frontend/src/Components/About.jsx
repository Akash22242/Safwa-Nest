import React, { useState } from "react";
import Navbar from "./Navbar.jsx";
import "./About.css";

const About = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [imageOk, setImageOk] = useState(true);

  // 🔧 Replace these placeholders with your real company info anytime
  const COMPANY = {
    name: "Your Company",
    tagline:
      "We design and deliver reliable, human-centered digital products.",
    mission:
      "Empower businesses with simple, secure, and scalable software that people love to use.",
    founded: "2019",
    headquarters: "Your City, Country",
    employees: "25–50",
    customers: "120+",
    uptime: "99.98%",
    email: "hello@yourcompany.com",
    phone: "+1 (555) 555‑1234",
  };

  return (
    <>
     

      <main className="about">
        {/* ===== Hero ===== */}
        <section className="container hero" aria-labelledby="about-title">
          <div className="hero__text">
            <h1 id="about-title" className="hero__heading">
              About {COMPANY.name}
            </h1>
            <p className="hero__tagline">{COMPANY.tagline}</p>

            <div className="hero__cta">
              <a className="btn btn--primary" href="#tab-panels" onClick={(e)=>{e.preventDefault(); setActiveTab("about"); document.getElementById("tab-panels")?.scrollIntoView({behavior:"smooth"});}}>
                Read our story
              </a>
              <a className="btn btn--ghost" href="#contact">
                Contact us
              </a>
            </div>
          </div>

          <div className="hero__media" aria-hidden="true">
            {imageOk ? (
              <img
                src="https://thumbs.dreamstime.com/b/serious-indian-professional-business-man-office-portrait-serious-young-ambitious-indian-businessman-project-leader-dressed-367980912.jpg"
                alt="Professional at work in a modern office"
                loading="lazy"
                onError={() => setImageOk(false)}
              />
            ) : (
              <div className="hero__fallback">
                <div className="dots" />
              </div>
            )}
          </div>
        </section>

        {/* ===== Tabs (About / Details) ===== */}
        <section className="container tabs" id="tab-panels">
          <div
            className="tabs__list"
            role="tablist"
            aria-label="About page sections"
          >
            <button
              id="tab-about"
              role="tab"
              aria-selected={activeTab === "about"}
              aria-controls="panel-about"
              className={`tabs__btn ${activeTab === "about" ? "is-active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
            <button
              id="tab-details"
              role="tab"
              aria-selected={activeTab === "details"}
              aria-controls="panel-details"
              className={`tabs__btn ${
                activeTab === "details" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
          </div>

          {/* ===== Panel: About ===== */}
          <section
            id="panel-about"
            role="tabpanel"
            aria-labelledby="tab-about"
            hidden={activeTab !== "about"}
            className="panel"
          >
            <div className="grid two">
              <article className="card">
                <h2>Who we are</h2>
                <p>
                  {COMPANY.name} builds dependable software with a focus on{" "}
                  <strong>clarity</strong>, <strong>security</strong>, and{" "}
                  <strong>speed</strong>. From the first whiteboard sketch to
                  global launch, our team partners closely with clients to
                  deliver outcomes—not just output.
                </p>
                <p>
                  Our cross‑functional squad of engineers, designers, and
                  product strategists blends craft with pragmatism to ship value
                  quickly and iterate with real customer feedback.
                </p>
              </article>

              <article className="card">
                <h2>Mission</h2>
                <p>{COMPANY.mission}</p>
                <ul className="list check">
                  <li>Design with empathy</li>
                  <li>Default to open communication</li>
                  <li>Prioritize reliability and security</li>
                  <li>Continuously learn and improve</li>
                </ul>
              </article>
            </div>

            <div className="values">
              <h3 className="values__title">Our values</h3>
              <div className="grid three">
                <div className="card value">
                  <div className="value__icon" aria-hidden="true">💡</div>
                  <h4>Clarity</h4>
                  <p>Make it simple. Make it understandable. Make it usable.</p>
                </div>
                <div className="card value">
                  <div className="value__icon" aria-hidden="true">🛡️</div>
                  <h4>Trust</h4>
                  <p>Keep promises, protect data, and earn confidence daily.</p>
                </div>
                <div className="card value">
                  <div className="value__icon" aria-hidden="true">⚡</div>
                  <h4>Momentum</h4>
                  <p>Ship small, ship often, and measure what matters.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Panel: Details ===== */}
          <section
            id="panel-details"
            role="tabpanel"
            aria-labelledby="tab-details"
            hidden={activeTab !== "details"}
            className="panel"
          >
            <div className="grid two">
              <article className="card">
                <h2>Company snapshot</h2>
                <dl className="kv">
                  <div>
                    <dt>Founded</dt>
                    <dd>{COMPANY.founded}</dd>
                  </div>
                  <div>
                    <dt>Headquarters</dt>
                    <dd>{COMPANY.headquarters}</dd>
                  </div>
                  <div>
                    <dt>Team size</dt>
                    <dd>{COMPANY.employees}</dd>
                  </div>
                  <div>
                    <dt>Customers</dt>
                    <dd>{COMPANY.customers}</dd>
                  </div>
                  <div>
                    <dt>Uptime (12 mo)</dt>
                    <dd>{COMPANY.uptime}</dd>
                  </div>
                </dl>
              </article>

              <article className="card">
                <h2>Milestones</h2>
                <ol className="timeline">
                  <li>
                    <span className="timeline__year">2019</span>
                    Company founded and first MVP launched.
                  </li>
                  <li>
                    <span className="timeline__year">2021</span>
                    Reached 10,000 monthly active users.
                  </li>
                  <li>
                    <span className="timeline__year">2023</span>
                    Expanded platform with real‑time analytics.
                  </li>
                  <li>
                    <span className="timeline__year">2024</span>
                    Opened new HQ and doubled engineering team.
                  </li>
                </ol>
              </article>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat__num">95%</div>
                <div className="stat__label">On‑time delivery</div>
              </div>
              <div className="stat">
                <div className="stat__num">50K+</div>
                <div className="stat__label">Deploys / year</div>
              </div>
              <div className="stat">
                <div className="stat__num">24/7</div>
                <div className="stat__label">Support coverage</div>
              </div>
            </div>
          </section>
        </section>

        {/* ===== Contact / CTA ===== */}
        <section className="container contact" id="contact" aria-labelledby="contact-title">
          <div className="card contact__card">
            <h2 id="contact-title">Let’s talk</h2>
            <p>
              Have a project in mind or just exploring options? We’d love to
              learn more and see how we can help.
            </p>
            <div className="contact__actions">
              <a className="btn btn--primary" href={`mailto:${COMPANY.email}`}>
                Email us
              </a>
              <a className="btn btn--ghost" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
                Call {COMPANY.phone}
              </a>
            </div>
          </div>
        </section>

        <footer className="container footer">
          <small>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </small>
          <small className="muted">
            Image is a stock placeholder. Ensure you have the proper license for
            production use.
          </small>
        </footer>
      </main>
    </>
  );
};

export default About;
