import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./LandingPage.css";

// Import branding assets
import opencraftBlack from "@/Assets/opencraft-black.png";
import opencraftWhite from "@/Assets/opencraft-white.png";
import { PrivacyDialog, TermsDialog } from "./LegalModals";

type PageId = "home" | "features" | "writing" | "organize" | "why";

export function LandingPage() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [scrolled, setScrolled] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Reveal animation logic
    const initReveal = () => {
      const els = document.querySelectorAll(".page.active .fade-up:not(.vis)");
      if (!els.length) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("vis");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
      );

      els.forEach((el) => obs.observe(el));
      return obs;
    };

    const obs = initReveal();
    return () => obs?.disconnect();
  }, [activePage]);

  const goPage = (id: PageId) => {
    setActivePage(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const enterApp = () => {
    localStorage.setItem("opencraft_visited", "true");
    navigate({ to: "/app" });
  };

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav id="main-nav" className={scrolled ? "scrolled" : ""}>
        <div className="logo-wrap" onClick={() => goPage("home")}>
          <img src={opencraftBlack} alt="OpenCraft" style={{ height: "60px", width: "auto" }} />
        </div>
        <ul className="nav-links">
          <li>
            <a
              onClick={() => goPage("features")}
              className={activePage === "features" ? "active" : ""}
            >
              Features
            </a>
          </li>
          <li>
            <a
              onClick={() => goPage("writing")}
              className={activePage === "writing" ? "active" : ""}
            >
              Writing
            </a>
          </li>
          <li>
            <a
              onClick={() => goPage("organize")}
              className={activePage === "organize" ? "active" : ""}
            >
              Organize
            </a>
          </li>
          <li>
            <a onClick={() => goPage("why")} className={activePage === "why" ? "active" : ""}>
              Why OpenCraft?
            </a>
          </li>
        </ul>
        <div className="nav-right">
          <button
            className="btn btn-ghost"
            onClick={() => window.open("https://github.com/hariharen9/OpenCraft", "_blank")}
          >
            GitHub
          </button>
          <button className="btn btn-dark" onClick={enterApp}>
            Open App
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════
           HOME PAGE
      ════════════════════════════════════ */}
      <div id="page-home" className={`page ${activePage === "home" ? "active" : ""}`}>
        <section className="hero ruled">
          <div className="hero-bg"></div>
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot"></div>
              Open Source · MIT Licensed · Free Forever
            </div>
            <h1 className="display-xl hero-title">
              Write
              <br />
              <span style={{ color: "var(--ink-3)" }}>Without</span>
              <br />
              The&nbsp;Noise
            </h1>
            <p className="body-lg hero-sub">
              No AI. No collaboration bloat. No subscription. Just a beautiful, fast note editor
              that gets out of your way — and stays that way.
            </p>
            <div className="hero-actions">
              <button className="btn btn-dark-lg" onClick={enterApp}>
                Open App
              </button>
              <button className="btn btn-outline-lg" onClick={() => goPage("features")}>
                Explore Features
              </button>
            </div>
            <div className="creator-tag fade-up delay-4" style={{ marginTop: '24px', fontSize: '13px', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--ink-4)' }}></div>
              Created by <a href="https://hariharen.site" target="_blank" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>Hariharen</a>
            </div>
            <div className="hero-stats">
              <div className="hs-item">
                <span className="hs-num">MIT</span>
                <span className="hs-label">Licensed</span>
              </div>
              <div className="hs-div"></div>
              <div className="hs-item">
                <span className="hs-num">100%</span>
                <span className="hs-label">Private</span>
              </div>
              <div className="hs-div"></div>
              <div className="hs-item">
                <span className="hs-num">∞</span>
                <span className="hs-label">Notes free</span>
              </div>
              <div className="hs-div"></div>
              <div className="hs-item">
                <span className="hs-num">Local</span>
                <span className="hs-label">First</span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "28px",
                flexWrap: "wrap",
                animation: "landingFadeUp .7s .48s ease both",
              }}
            >
              <span className="st-badge st-green">✕ No AI</span>
              <span className="st-badge st-blue">✕ No Account</span>
              <span className="st-badge st-rust">✓ Open Source</span>
              <span className="st-badge st-gold">✓ Local First</span>
              <span className="st-badge st-purple">✓ MIT Licensed</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="note-stack">
              <div className="nc nc-1">
                <div className="nc-cover nc-c1"></div>
                <div className="nc-title">Tokyo Trip 2026</div>
                <div className="nc-line full"></div>
                <div className="nc-line short"></div>
                <div className="nc-line shorter"></div>
                <div className="nc-tag t-rust">✈ Travel</div>
              </div>
              <div className="nc nc-2">
                <div className="nc-cover nc-c2"></div>
                <div className="nc-title">Morning Routine</div>
                <div className="nc-check">
                  <div className="nc-check-box done">✓</div> Meditate 10 min
                </div>
                <div className="nc-check">
                  <div className="nc-check-box done">✓</div> Write 300 words
                </div>
                <div className="nc-check">
                  <div className="nc-check-box"></div> Read 20 pages
                </div>
                <div className="nc-check">
                  <div className="nc-check-box"></div> Cold shower
                </div>
              </div>
              <div className="nc nc-3">
                <div className="nc-cover nc-c3"></div>
                <div className="nc-title">May Reflections</div>
                <div className="nc-line full"></div>
                <div className="nc-line full"></div>
                <div className="nc-line short"></div>
                <div
                  style={{
                    marginTop: "10px",
                    fontFamily: "'Lora',serif",
                    fontSize: "11px",
                    fontStyle: "italic",
                    color: "var(--ink-4)",
                    lineHeight: "1.5",
                  }}
                >
                  "Slow down. The good stuff isn't going anywhere."
                </div>
              </div>
              <div className="nc nc-4">
                <div className="nc-cover nc-c4"></div>
                <div className="nc-title">API Design Notes</div>
                <div
                  style={{
                    background: "var(--cream-dark)",
                    borderRadius: "5px",
                    padding: "8px 10px",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    color: "var(--ink-3)",
                    lineHeight: "1.6",
                    marginTop: "4px",
                  }}
                >
                  GET /notes/:id
                  <br />
                  POST /notes/new
                  <br />
                  <span style={{ color: "var(--accent)" }}>→ 200 {"{id, body}"}</span>
                </div>
                <div className="nc-tag t-blue">⌨ Dev</div>
              </div>
              <div className="nc nc-5">
                <div className="nc-cover nc-c5"></div>
                <div className="nc-title">Side Project Ideas</div>
                <div className="nc-line full"></div>
                <div className="nc-line short"></div>
                <div className="nc-line full"></div>
                <div className="nc-line shorter"></div>
                <div
                  className="nc-tag"
                  style={{ background: "rgba(123,47,190,.12)", color: "#7B2FBE" }}
                >
                  💡 Ideas
                </div>
              </div>
            </div>
          </div>

          <div className="hero-scroll">
            scroll<div className="hero-scroll-line"></div>
          </div>
          <div className="hero-stripe"></div>
        </section>

        <div className="ticker">
          <div className="ticker-track">
            <div className="ticker-item">
              <div className="ticker-gem"></div>No accounts required
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>100% offline first
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>MIT Licensed
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Zero telemetry
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Local files, always yours
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Dark &amp; light mode
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Markdown export
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Beautiful typography
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Cross-platform
            </div>
            {/* Duplicated for loop */}
            <div className="ticker-item">
              <div className="ticker-gem"></div>No accounts required
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>100% offline first
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>MIT Licensed
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Zero telemetry
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Local files, always yours
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Dark &amp; light mode
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Markdown export
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Beautiful typography
            </div>
            <div className="ticker-item">
              <div className="ticker-gem"></div>Cross-platform
            </div>
          </div>
        </div>

        <section className="sec">
          <div className="inner">
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <div className="eyebrow fade-up">The editor</div>
              <h2 className="display-lg fade-up delay-1" style={{ marginBottom: "14px" }}>
                Built for
                <br />
                real&nbsp;thinking
              </h2>
              <p
                className="body-lg fade-up delay-2"
                style={{ maxWidth: "480px", margin: "0 auto" }}
              >
                Rich, beautiful, keyboard-driven. Every pixel earns its place.
              </p>
            </div>
            <div className="editor-win fade-up delay-3">
              <div className="ew-bar">
                <div className="ew-dot ew-d-r"></div>
                <div className="ew-dot ew-d-y"></div>
                <div className="ew-dot ew-d-g"></div>
                <span className="ew-title">Tokyo Trip · OpenCraft</span>
              </div>
              <div className="ew-body">
                <div className="ew-sidebar">
                  <div className="ew-slabel" style={{ marginTop: "4px" }}>
                    Spaces
                  </div>
                  <div className="ew-sitem on">
                    <svg
                      className="ew-sicon"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <rect x="1" y="1" width="12" height="12" rx="2" />
                      <path d="M4 5h6M4 8h4" />
                    </svg>
                    Personal
                  </div>
                  <div className="ew-sitem">
                    <svg
                      className="ew-sicon"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <path d="M7 1l1.6 3.9H13l-3.6 2.7 1.4 4.3L7 9.4l-3.8 2.5 1.4-4.3L1 4.9h4.4z" />
                    </svg>
                    Work
                  </div>
                  <div className="ew-gap"></div>
                  <div className="ew-slabel">Notes</div>
                  <div className="ew-sitem">
                    <svg
                      className="ew-sicon"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <path d="M2 2h10v10H2zM5 5h4M5 8h2" />
                    </svg>
                    Ideas
                  </div>
                  <div className="ew-sitem on">
                    <svg
                      className="ew-sicon"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <path d="M1 4h12M1 7h9M1 10h6" />
                    </svg>
                    Tokyo Trip
                  </div>
                  <div className="ew-sitem">
                    <svg
                      className="ew-sicon"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <circle cx="7" cy="7" r="6" />
                      <path d="M7 4v3l2 2" />
                    </svg>
                    Daily Log
                  </div>
                </div>
                <div className="ew-main">
                  <div className="ew-doc-title">Tokyo — Summer 2026</div>
                  <div className="ew-doc-meta">Last edited moments ago · 847 words</div>
                  <div className="ew-h2">Overview</div>
                  <p className="ew-p">
                    Two weeks through Japan — <span className="ew-mark">starting in Tokyo</span>,
                    south to Kyoto, then a few still days in Hakone before flying home from Osaka.
                    The plan is loose by design.
                  </p>
                  <div className="ew-h2">Must-do in Tokyo</div>
                  <div className="ew-li">Senso-ji at dawn before the crowds arrive</div>
                  <div className="ew-li">Shimokitazawa for vintage shops and late jazz</div>
                  <div className="ew-li">Full evening in Shinjuku — wherever it leads</div>
                  <div className="ew-li">
                    Ramen at Fuunji — arrive 30 min before opening<span className="cursor"></span>
                  </div>
                  <div className="ew-callout">
                    ✦ Pack light. Everything fits in a carry-on. Laundry every 4 days.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="marquee-sec">
          <div style={{ overflow: "hidden", marginBottom: "14px" }}>
            <div className="marquee-row r1">
              <div className="mq-card">
                <div className="mq-tag">Writer</div>
                <div className="mq-label">Book outlines &amp; drafts</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Student</div>
                <div className="mq-label">Course notes &amp; summaries</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Developer</div>
                <div className="mq-label">Tech specs &amp; research</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Podcaster</div>
                <div className="mq-label">Show notes &amp; scripts</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Traveler</div>
                <div className="mq-label">Trip plans &amp; itineraries</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Designer</div>
                <div className="mq-label">Mood boards &amp; briefs</div>
              </div>
              {/* Duplicates */}
              <div className="mq-card">
                <div className="mq-tag">Writer</div>
                <div className="mq-label">Book outlines &amp; drafts</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Student</div>
                <div className="mq-label">Course notes &amp; summaries</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Developer</div>
                <div className="mq-label">Tech specs &amp; research</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Podcaster</div>
                <div className="mq-label">Show notes &amp; scripts</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Traveler</div>
                <div className="mq-label">Trip plans &amp; itineraries</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Designer</div>
                <div className="mq-label">Mood boards &amp; briefs</div>
              </div>
            </div>
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="marquee-row r2">
              <div className="mq-card">
                <div className="mq-tag">PM</div>
                <div className="mq-label">Product specs &amp; OKRs</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Journalist</div>
                <div className="mq-label">Research &amp; interview notes</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Parent</div>
                <div className="mq-label">Family checklists &amp; logs</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Teacher</div>
                <div className="mq-label">Lesson plans &amp; resources</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Maker</div>
                <div className="mq-label">Project docs &amp; parts lists</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Lawyer</div>
                <div className="mq-label">Case notes &amp; research</div>
              </div>
              {/* Duplicates */}
              <div className="mq-card">
                <div className="mq-tag">PM</div>
                <div className="mq-label">Product specs &amp; OKRs</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Journalist</div>
                <div className="mq-label">Research &amp; interview notes</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Parent</div>
                <div className="mq-label">Family checklists &amp; logs</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Teacher</div>
                <div className="mq-label">Lesson plans &amp; resources</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Maker</div>
                <div className="mq-label">Project docs &amp; parts lists</div>
              </div>
              <div className="mq-card">
                <div className="mq-tag">Lawyer</div>
                <div className="mq-label">Case notes &amp; research</div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" style={{ background: "var(--cream-mid)" }}>
          <div className="inner">
            <div style={{ marginBottom: "52px" }}>
              <div className="eyebrow fade-up">What's inside</div>
              <h2
                className="display-lg fade-up delay-1"
                style={{ maxWidth: "560px", marginBottom: "14px" }}
              >
                Everything you need.
                <br />
                Nothing&nbsp;you&nbsp;don't.
              </h2>
              <p className="body-lg fade-up delay-2" style={{ maxWidth: "480px" }}>
                One thing, done beautifully. OpenCraft is a note editor. Full stop.
              </p>
            </div>
            <div className="feat-grid">
              <div className="feat-card fade-up">
                <span className="feat-ico">✍️</span>
                <div className="feat-t">Block Editor</div>
                <p className="feat-d">
                  Rich blocks — text, headings, images, code, callouts, dividers. Craft your notes
                  exactly the way you think.
                </p>
              </div>
              <div className="feat-card fade-up delay-1">
                <span className="feat-ico">🗂️</span>
                <div className="feat-t">Spaces &amp; Folders</div>
                <p className="feat-d">
                  Separate spaces for work and life. Nested folders. Tags that work across
                  everything.
                </p>
              </div>
              <div className="feat-card fade-up delay-2">
                <span className="feat-ico">🎨</span>
                <div className="feat-t">Beautiful Themes</div>
                <p className="feat-d">
                  Light, dark, sepia, midnight. Rich cover images. Typography obsessed-over so you
                  don't have to be.
                </p>
              </div>
              <div className="feat-card fade-up delay-3">
                <span className="feat-ico">📁</span>
                <div className="feat-t">Local First</div>
                <p className="feat-d">
                  Your notes live in your browser's secure storage. No cloud required. 
                  Privacy is built-in, not an afterthought.
                </p>
              </div>
              <div className="feat-card fade-up delay-4">
                <span className="feat-ico">↗️</span>
                <div className="feat-t">Markdown Export</div>
                <p className="feat-d">
                  Universal compatibility. Export your writing as clean Markdown files. 
                  Take your thoughts anywhere.
                </p>
              </div>
              <div className="feat-card fade-up delay-5">
                <span className="feat-ico">⌨️</span>
                <div className="feat-t">Command Palette</div>
                <p className="feat-d">
                  Full shortcuts for everything. Universal search, slash commands, and a keyboard-first 
                  quick switcher (`⌘K`).
                </p>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "40px" }} className="fade-up">
              <button className="btn btn-dark-lg" onClick={() => goPage("features")}>
                See all features →
              </button>
            </div>
          </div>
        </section>

        <section className="sec dark-panel">
          <div className="inner">
            <div className="split-grid">
              <div>
                <div className="eyebrow light fade-up">Write</div>
                <h2 className="display-lg light fade-up delay-1" style={{ marginBottom: "16px" }}>
                  From first
                  <br />
                  thought to
                  <br />
                  <span style={{ color: "rgba(246,242,235,.25)" }}>final form</span>
                </h2>
                <p className="body-lg fade-up delay-2" style={{ marginBottom: "28px" }}>
                  OpenCraft gives your writing room to breathe. Beautiful defaults, powerful
                  formatting, a canvas that feels like paper.
                </p>
                <div className="pills fade-up delay-3">
                  <div className="pill on">Rich Blocks</div>
                  <div className="pill">Code Blocks</div>
                  <div className="pill">Callouts</div>
                  <div className="pill">Markdown</div>
                  <div className="pill">Cover Images</div>
                  <div className="pill">Slash Commands</div>
                </div>
                <div style={{ marginTop: "32px" }} className="fade-up delay-4">
                  <button
                    className="btn btn-outline-lg"
                    style={{ borderColor: "rgba(246,242,235,.2)", color: "var(--cream)" }}
                    onClick={() => goPage("writing")}
                  >
                    Explore writing →
                  </button>
                </div>
              </div>
              <div className="fade-up delay-2">
                <div className="write-demo">
                  <div className="wd-title">The Slow Morning</div>
                  <div className="wd-meta">Daily Notes · May 9, 2026</div>
                  <div className="wd-divider"></div>
                  <p className="wd-p">
                    There's something about writing before the world starts. Coffee, an open window,
                    no agenda. Just whatever rises to the surface.
                  </p>
                  <div className="wd-quote">
                    The morning belongs to no one until you claim it for yourself.
                  </div>
                  <p className="wd-p">
                    Three months of notes now. Some days a paragraph. Some days three pages.
                    <span className="cursor" style={{ background: "rgba(246,242,235,.7)" }}></span>
                  </p>
                  <div className="toolbar">
                    <div className="tb-btn on">
                      <b>B</b>
                    </div>
                    <div className="tb-btn">
                      <i>I</i>
                    </div>
                    <div className="tb-btn">
                      <u>U</u>
                    </div>
                    <div className="tb-sep"></div>
                    <div className="tb-btn">H₁</div>
                    <div className="tb-btn">H₂</div>
                    <div className="tb-btn">≡</div>
                    <div className="tb-sep"></div>
                    <div className="tb-btn">&lt;/&gt;</div>
                    <div className="tb-btn">🔗</div>
                    <div className="tb-btn">⬆</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="inner">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "60px",
                alignItems: "end",
                marginBottom: "52px",
              }}
            >
              <div>
                <div className="eyebrow fade-up">Organize</div>
                <h2 className="display-lg fade-up delay-1" style={{ marginBottom: "0" }}>
                  Structure that
                  <br />
                  adapts to
                  <br />
                  your&nbsp;thinking
                </h2>
              </div>
              <div>
                <p className="body-lg fade-up" style={{ marginBottom: "22px" }}>
                  Spaces, folders, and tags. No forced hierarchy. Just the structure your brain
                  actually uses.
                </p>
                <button className="btn btn-dark fade-up delay-1" onClick={() => goPage("organize")}>
                  Learn more →
                </button>
              </div>
            </div>
            <div className="org-grid">
              <div className="org-card fade-up">
                <div className="org-tag t-blue">🏠 Spaces</div>
                <div className="org-t">Switch contexts instantly</div>
                <p className="org-d">
                  Separate spaces for work and life — each with its own colours, folders, and feel.
                </p>
                <div className="tree">
                  <div className="t-row">📁 Personal</div>
                  <div className="t-row ind">📄 Journaling</div>
                  <div className="t-row ind">📄 Reading List</div>
                  <div className="t-row">📁 Work</div>
                  <div className="t-row ind">📄 Projects</div>
                </div>
              </div>
              <div className="org-card fade-up delay-1">
                <div className="org-tag t-green">🏷️ Tags</div>
                <div className="org-t">Cross-link ideas</div>
                <p className="org-d">
                  Tag any note and pull everything together across folders and spaces in one click.
                </p>
                <div className="tree">
                  <div className="t-row">🏷️ #idea</div>
                  <div className="t-row">🏷️ #reference</div>
                  <div className="t-row">🏷️ #someday</div>
                  <div className="t-row">🏷️ #writing</div>
                </div>
              </div>
              <div className="org-card fade-up delay-2">
                <div className="org-tag t-rust">⚡ Quick Find</div>
                <div className="org-t">Find anything fast</div>
                <p className="org-d">
                  Full-text search across all notes in milliseconds. Press ⌘K and start typing.
                </p>
                <div className="tree">
                  <div className="t-row">🔍 "tokyo"</div>
                  <div className="t-row ind hi">📄 Tokyo Trip 2026</div>
                  <div className="t-row ind hi">📄 Japan Packing List</div>
                  <div className="t-row ind">📄 Bucket List</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" style={{ background: "var(--paper)" }}>
          <div className="inner">
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <div
                className="mit-badge fade-up"
                style={{ marginBottom: "18px", display: "inline-flex" }}
              >
                <div className="mit-dot"></div> MIT Licensed
              </div>
              <h2 className="display-lg fade-up delay-1" style={{ marginBottom: "14px" }}>
                Built in the open.
                <br />
                Owned by&nbsp;no&nbsp;one.
              </h2>
              <p
                className="body-lg fade-up delay-2"
                style={{ maxWidth: "460px", margin: "0 auto" }}
              >
                Free software, forever. Read the code, fork it, improve it, ship it.
              </p>
            </div>
            <div className="oss-grid">
              <div className="oss-p fade-up">
                <div className="oss-n">01</div>
                <div className="oss-t">MIT License</div>
                <p className="oss-d">
                  Fork, build, sell. Do whatever you want with it. No restrictions.
                </p>
              </div>
              <div className="oss-p fade-up delay-1">
                <div className="oss-n">02</div>
                <div className="oss-t">No Telemetry</div>
                <p className="oss-d">Zero analytics, zero crash reports sent anywhere. Period.</p>
              </div>
              <div className="oss-p fade-up delay-2">
                <div className="oss-n">03</div>
                <div className="oss-t">Community Driven</div>
                <p className="oss-d">
                  Features are driven by issues and PRs, not a closed roadmap.
                </p>
              </div>
              <div className="oss-p fade-up delay-3">
                <div className="oss-n">04</div>
                <div className="oss-t">Audit Everything</div>
                <p className="oss-d">Every line of code is readable. Trust through transparency.</p>
              </div>
            </div>
            <div style={{ textAlign: "center" }} className="fade-up">
              <button
                className="gh-btn"
                onClick={() => window.open("https://github.com/hariharen9/OpenCraft", "_blank")}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C17.134 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                </svg>
                Star on GitHub <span className="gh-star">★ 0</span>
              </button>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="inner-sm">
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <h2 className="display-md fade-up" style={{ marginBottom: "12px" }}>
                Why switch?
              </h2>
              <p className="body-lg fade-up delay-1">
                The note editor for people who just want to write.
              </p>
            </div>
            <div className="cmp-table fade-up delay-1">
              <div className="cmp-head">
                <div className="cmp-hc">Feature</div>
                <div className="cmp-hc hi">OpenCraft</div>
                <div className="cmp-hc">Notion</div>
                <div className="cmp-hc">Craft</div>
              </div>
              <div className="cmp-row">
                <div className="cmp-c">Free forever</div>
                <div className="cmp-c hi">
                  <span className="ck">✓</span> Always
                </div>
                <div className="cmp-c">
                  <span className="cx">—</span> Paywalled
                </div>
                <div className="cmp-c">
                  <span className="cx">—</span> Limited
                </div>
              </div>
              <div className="cmp-row">
                <div className="cmp-c">Open source</div>
                <div className="cmp-c hi">
                  <span className="ck">✓</span> MIT
                </div>
                <div className="cmp-c">
                  <span className="cx">✕</span>
                </div>
                <div className="cmp-c">
                  <span className="cx">✕</span>
                </div>
              </div>
              <div className="cmp-row">
                <div className="cmp-c">Offline first</div>
                <div className="cmp-c hi">
                  <span className="ck">✓</span> Always
                </div>
                <div className="cmp-c">
                  <span className="cx">—</span> Cloud-dependent
                </div>
                <div className="cmp-c">
                  <span className="ck">✓</span>
                </div>
              </div>
              <div className="cmp-row">
                <div className="cmp-c">No account needed</div>
                <div className="cmp-c hi">
                  <span className="ck">✓</span> Zero signup
                </div>
                <div className="cmp-c">
                  <span className="cx">✕</span> Required
                </div>
                <div className="cmp-c">
                  <span className="cx">✕</span> Required
                </div>
              </div>
              <div className="cmp-row">
                <div className="cmp-c">No telemetry</div>
                <div className="cmp-c hi">
                  <span className="ck">✓</span> Zero tracking
                </div>
                <div className="cmp-c">
                  <span className="cx">✕</span>
                </div>
                <div className="cmp-c">
                  <span className="cx">—</span>
                </div>
              </div>
              <div className="cmp-row">
                <div className="cmp-c">Craft-quality design</div>
                <div className="cmp-c hi">
                  <span className="ck">✓</span> Inspired by the best
                </div>
                <div className="cmp-c">
                  <span className="cx">—</span> Complex UI
                </div>
                <div className="cmp-c">
                  <span className="ck">✓</span> Original
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "28px" }} className="fade-up">
              <button
                className="btn btn-ghost"
                onClick={() => goPage("why")}
                style={{ fontSize: "14px", color: "var(--accent)" }}
              >
                Read the full story of why I built this →
              </button>
            </div>
          </div>
        </section>

        <div className="quote-sec">
          <div className="q-deco">"</div>
          <p className="q-text fade-up">
            "The best note app is the one that disappears while you write."
          </p>
          <p className="q-attr fade-up delay-1">— Design philosophy behind OpenCraft</p>
        </div>

        <section className="cta-sec">
          <div className="cta-bg"></div>
          <div className="eyebrow fade-up" style={{ marginBottom: "20px" }}>
            Get started
          </div>
          <h2
            className="display-lg fade-up delay-1"
            style={{
              marginBottom: "14px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Start writing today.
          </h2>
          <p
            className="body-lg fade-up delay-2"
            style={{ maxWidth: "420px", margin: "0 auto 44px" }}
          >
            Free, open source, no account, no credit card. No catch.
          </p>
          <div className="cta-actions fade-up delay-3">
            <button className="btn btn-dark-lg" onClick={enterApp}>
              Try OpenCraft Web
            </button>
            <button
              className="btn btn-outline-lg"
              onClick={() => window.open("https://github.com/hariharen9/OpenCraft", "_blank")}
            >
              View Source
            </button>
          </div>
          <p className="cta-note fade-up delay-4">
            Available on Web · Desktop · Mobile coming soon
          </p>
        </section>

        <footer>
          <div className="ft-inner">
            <div className="ft-top">
              <div>
                <div
                  className="logo-wrap"
                  onClick={() => goPage("home")}
                  style={{ marginBottom: "0" }}
                >
                  <img
                    src={opencraftWhite}
                    alt="OpenCraft"
                    style={{ height: "56px", width: "auto" }}
                  />
                </div>
                <p className="ft-brand-desc">
                  The open source note editor. Beautiful, private, and free — forever.
                </p>
                <div className="ft-social">
                  <a
                    href="https://github.com/hariharen9/OpenCraft"
                    className="ft-sl"
                    target="_blank"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C17.134 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <div className="ft-col-h">Product</div>
                <ul className="ft-links">
                  <li>
                    <a onClick={() => goPage("features")}>Features</a>
                  </li>
                  <li>
                    <a onClick={() => goPage("writing")}>Writing</a>
                  </li>
                  <li>
                    <a onClick={() => goPage("organize")}>Organize</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="ft-col-h">Community</div>
                <ul className="ft-links">
                  <li>
                    <a href="https://github.com/hariharen9/OpenCraft" target="_blank">
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="ft-col-h">More</div>
                <ul className="ft-links">
                  <li>
                    <a onClick={() => goPage("why")}>Why OpenCraft?</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="ft-bottom">
              <span className="ft-copy">
                © 2026 OpenCraft. Created by <a href="https://hariharen.site" target="_blank" style={{ color: 'white', textDecoration: 'underline', textUnderlineOffset: '4px' }}>Hariharen</a>. 
                Open Source under the MIT License.
              </span>
              <div className="ft-legal">
                <a onClick={() => setPrivacyOpen(true)}>Privacy</a>
                <a onClick={() => setTermsOpen(true)}>Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />

      {/* ════════════════════════════════════
           WRITING PAGE
      ════════════════════════════════════ */}
      <div id="page-writing" className={`page ${activePage === "writing" ? "active" : ""}`}>
        <section className="subhero ruled">
          <div className="subhero-bg wp-bg"></div>
          <div className="subhero-content">
            <div className="eyebrow light">Writing</div>
            <h1 className="display-xl light" style={{ marginBottom: "20px" }}>
              The editor
              <br />
              you deserve<span style={{ color: "rgba(246,242,235,.2)" }}>.</span>
            </h1>
            <p className="body-lg" style={{ maxWidth: "500px" }}>
              Rich, beautiful, keyboard-driven. No feature bloat. No AI suggestions. Just your
              words, beautifully rendered.
            </p>
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "36px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .28s ease both",
              }}
            >
              <div>
                <div className="sh-num light">4</div>
                <div className="sh-label light">Themes</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num light">Canvas</div>
                <div className="sh-label light">Whiteboard</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num light">Kanban</div>
                <div className="sh-label light">Boards</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num light">∞</div>
                <div className="sh-label light">Block Types</div>
              </div>
            </div>
            <div
              className="pills"
              style={{ marginTop: "24px", animation: "landingFadeUp .6s .36s ease both" }}
            >
              <div className="pill on">Rich Text</div>
              <div className="pill">Code Blocks</div>
              <div className="pill">Callouts</div>
              <div className="pill">Tables</div>
              <div className="pill">Checklists</div>
              <div className="pill">Images</div>
              <div className="pill">Quotes</div>
            </div>
          </div>
          <div className="subhero-stripe wp-stripe"></div>
        </section>

        <section className="sec dark-panel">
          <div className="inner">
            <div className="eyebrow light fade-up">Block types</div>
            <h2 className="display-md light fade-up delay-1" style={{ marginBottom: "14px" }}>
              Every block
              <br />
              earns its place
            </h2>
            <p className="body-md fade-up delay-2" style={{ maxWidth: "500px", marginBottom: "0" }}>
              Everything you'd want, nothing you won't need.
            </p>
            <div className="wf-blocks">
              <div className="wf-block fade-up">
                <div className="wf-ico">📝</div>
                <div className="wf-t">Text &amp; Headings</div>
                <p className="wf-d">
                  H1 through H3 with beautiful spacing and rhythm. Body text that's a pleasure to
                  read at every size.
                </p>
              </div>
              <div className="wf-block fade-up delay-1">
                <div className="wf-ico">💡</div>
                <div className="wf-t">Callouts &amp; Quotes</div>
                <p className="wf-d">
                  Block quotes with pull-out styling. Callout boxes for highlights, warnings, or
                  anything you need to surface.
                </p>
              </div>
              <div className="wf-block fade-up delay-2">
                <div className="wf-ico">🖼️</div>
                <div className="wf-t">Images &amp; Media</div>
                <p className="wf-d">
                  Drag in images. Full-width or inline. Captions. Cover images that make your
                  documents feel intentional.
                </p>
              </div>
              <div className="wf-block fade-up delay-3">
                <div className="wf-ico">💻</div>
                <div className="wf-t">Code Blocks</div>
                <p className="wf-d">
                  Syntax highlighted code blocks for 50+ languages. Monospace, beautiful, copyable
                  in one click.
                </p>
              </div>
              <div className="wf-block fade-up">
                <div className="wf-ico">✅</div>
                <div className="wf-t">Checklists &amp; Kanban</div>
                <p className="wf-d">
                  Tasks embedded right in your notes. Use checklists for simple logs or Kanban boards 
                  for visual project tracking.
                </p>
              </div>
              <div className="wf-block fade-up delay-1">
                <div className="wf-ico">🎨</div>
                <div className="wf-t">Whiteboards</div>
                <p className="wf-d">
                  Integrated tldraw whiteboards. Sketch your ideas directly inside your documents. 
                  Visual and text combined.
                </p>
              </div>
              <div className="wf-block fade-up delay-2">
                <div className="wf-ico">📊</div>
                <div className="wf-t">Mermaid &amp; Tables</div>
                <p className="wf-d">
                  Create flowcharts, sequence diagrams, and Gantt charts with Mermaid. Plus clean, 
                  keyboard-navigable tables.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec dark-panel" style={{ paddingTop: 0 }}>
          <div className="inner">
            <div className="split-grid">
              <div>
                <div className="eyebrow light fade-up">Typography</div>
                <h2 className="display-md light fade-up delay-1" style={{ marginBottom: "16px" }}>
                  Type that
                  <br />
                  feels right
                </h2>
                <p className="body-md fade-up delay-2" style={{ marginBottom: "20px" }}>
                  Lora for document titles — warm, scholarly, unmistakably crafted. DM Sans for
                  body. The combination is intentional.
                </p>
                <p className="body-md fade-up delay-3">
                  Four carefully chosen themes — Light, Dark, Sepia, and Midnight — each with their
                  own colour temperature, tuned for that mood.
                </p>
              </div>
              <div className="fade-up delay-2">
                <div className="write-demo">
                  <div
                    style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}
                  >
                    <div
                      style={{
                        background: "rgba(246,242,235,.12)",
                        padding: "5px 12px",
                        borderRadius: "var(--r-pill)",
                        fontSize: "12px",
                        color: "rgba(246,242,235,.7)",
                      }}
                    >
                      Lora (Titles)
                    </div>
                    <div
                      style={{
                        background: "rgba(246,242,235,.12)",
                        padding: "5px 12px",
                        borderRadius: "var(--r-pill)",
                        fontSize: "12px",
                        color: "rgba(246,242,235,.7)",
                      }}
                    >
                      DM Sans (Body)
                    </div>
                    <div
                      style={{
                        background: "rgba(246,242,235,.12)",
                        padding: "5px 12px",
                        borderRadius: "var(--r-pill)",
                        fontSize: "12px",
                        color: "rgba(246,242,235,.7)",
                      }}
                    >
                      15px / 1.78 lh
                    </div>
                  </div>
                  <div className="wd-title">Chapter One</div>
                  <div className="wd-divider"></div>
                  <p className="wd-p">
                    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor
                    jugs.
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: "14px",
                      lineHeight: 1.8,
                      color: "rgba(246,242,235,.55)",
                      fontStyle: "italic",
                      marginBottom: "16px",
                    }}
                  >
                    Sphinx of black quartz, judge my vow.
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <div
                      style={{
                        flex: 1,
                        height: "28px",
                        borderRadius: "5px",
                        background: "#FDFAF5",
                      }}
                    ></div>
                    <div
                      style={{
                        flex: 1,
                        height: "28px",
                        borderRadius: "5px",
                        background: "#1A1714",
                      }}
                    ></div>
                    <div
                      style={{
                        flex: 1,
                        height: "28px",
                        borderRadius: "5px",
                        background: "#F5EFDE",
                      }}
                    ></div>
                    <div
                      style={{
                        flex: 1,
                        height: "28px",
                        borderRadius: "5px",
                        background: "#0F1117",
                      }}
                    ></div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
                    <div
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        color: "rgba(246,242,235,.3)",
                        textAlign: "center",
                      }}
                    >
                      Light
                    </div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        color: "rgba(246,242,235,.3)",
                        textAlign: "center",
                      }}
                    >
                      Dark
                    </div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        color: "rgba(246,242,235,.3)",
                        textAlign: "center",
                      }}
                    >
                      Sepia
                    </div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        color: "rgba(246,242,235,.3)",
                        textAlign: "center",
                      }}
                    >
                      Midnight
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" style={{ background: "var(--cream-mid)" }}>
          <div className="inner">
            <div className="eyebrow fade-up">Keyboard &amp; speed</div>
            <h2 className="display-md fade-up delay-1" style={{ marginBottom: "48px" }}>
              Hands on
              <br />
              the keys, always
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
              <div className="org-card fade-up">
                <div className="org-tag t-blue">⌘K</div>
                <div className="org-t">Quick Switcher</div>
                <p className="org-d">
                  Jump to any note, space, or command instantly. No mouse needed.
                </p>
              </div>
              <div className="org-card fade-up delay-1">
                <div className="org-tag t-rust">/ Slash</div>
                <div className="org-t">Slash Commands</div>
                <p className="org-d">
                  Type / anywhere to insert any block — heading, image, code, callout, table.
                </p>
              </div>
              <div className="org-card fade-up delay-2">
                <div className="org-tag t-green">⌘⇧P</div>
                <div className="org-t">Command Palette</div>
                <p className="org-d">
                  Every action accessible by keyboard. Export, theme change, new space.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-sec" style={{ background: "var(--paper)" }}>
          <div className="cta-bg"></div>
          <h2 className="display-md fade-up" style={{ marginBottom: "14px" }}>
            Try the editor.
          </h2>
          <p
            className="body-lg fade-up delay-1"
            style={{ maxWidth: "400px", margin: "0 auto 40px" }}
          >
            Free, no signup, no account. Open it and start writing.
          </p>
          <div className="cta-actions fade-up delay-2">
            <button className="btn btn-dark-lg" onClick={enterApp}>
              Open App
            </button>
            <button className="btn btn-outline-lg" onClick={() => goPage("home")}>
              Back to home
            </button>
          </div>
        </section>

        <footer>
          <div className="ft-inner">
            <div className="ft-bottom" style={{ paddingTop: 0, borderTop: "none" }}>
              <div className="logo-wrap" onClick={() => goPage("home")}>
                <img
                  src={opencraftWhite}
                  alt="OpenCraft"
                  style={{ height: "48px", width: "auto" }}
                />
              </div>
              <div className="ft-legal">
                <a onClick={() => goPage("home")}>Home</a>
                <a onClick={() => goPage("features")}>Features</a>
                <a onClick={() => goPage("organize")}>Organize</a>
                <a onClick={() => goPage("why")}>Why</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════
           ORGANIZE PAGE
      ════════════════════════════════════ */}
      <div id="page-organize" className={`page ${activePage === "organize" ? "active" : ""}`}>
        <section className="subhero ruled">
          <div className="subhero-bg op-bg"></div>
          <div className="subhero-content">
            <div className="eyebrow">Organize</div>
            <h1 className="display-xl" style={{ marginBottom: "20px" }}>
              Structure
              <br />
              for how you
              <br />
              <span style={{ color: "var(--ink-4)" }}>actually think</span>
            </h1>
            <p className="body-lg" style={{ maxWidth: "520px" }}>
              Not how a product manager thinks you should think. Your brain, your hierarchy, your
              tags.
            </p>
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "36px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .28s ease both",
              }}
            >
              <div>
                <div className="sh-num">∞</div>
                <div className="sh-label">Spaces</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num">∞</div>
                <div className="sh-label">Nested Folders</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num">&lt;200</div>
                <div className="sh-label">ms Search</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num">∞</div>
                <div className="sh-label">Tags</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "24px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .36s ease both",
              }}
            >
              <span className="st-badge st-blue">🏠 Unlimited Spaces</span>
              <span className="st-badge st-green">🏷️ Universal Tags</span>
              <span className="st-badge st-rust">⭐ Starred Notes</span>
              <span className="st-badge st-gold">🧠 Brain Index</span>
            </div>
          </div>
          <div className="subhero-stripe op-stripe"></div>
        </section>

        <section className="sec" style={{ background: "var(--cream-mid)" }}>
          <div className="inner">
            <div className="of-split">
              <div>
                <div className="eyebrow fade-up">Spaces</div>
                <h2 className="serif-lg fade-up delay-1" style={{ marginBottom: "16px" }}>
                  One app, many
                  <br />
                  <em>versions of you</em>
                </h2>
                <p className="body-md fade-up delay-2" style={{ marginBottom: "24px" }}>
                  Create distinct spaces for work, personal life, side projects. Each has its own
                  sidebar, colours, and tone. Switch with one click.
                </p>
                <p className="body-md fade-up delay-3">
                  Your Work space can be tight and structured. Your Personal space can be loose and
                  exploratory. Both in the same app, never bleeding into each other.
                </p>
              </div>
              <div className="fade-up delay-2">
                <div className="of-card" style={{ marginBottom: "14px" }}>
                  <div className="of-card-h">Personal Space</div>
                  <div className="of-card-d">Journals, reading lists, travel plans, ideas.</div>
                  <div className="of-demo">
                    <div className="of-drow">📁 Journaling</div>
                    <div className="of-drow" style={{ paddingLeft: "18px", fontSize: "12.5px" }}>
                      📄 May reflections
                    </div>
                    <div className="of-drow" style={{ paddingLeft: "18px", fontSize: "12.5px" }}>
                      📄 April reflections
                    </div>
                    <div className="of-drow">📁 Reading</div>
                    <div className="of-drow">📁 Travel</div>
                  </div>
                </div>
                <div className="of-card">
                  <div className="of-card-h">Work Space</div>
                  <div className="of-card-d">Projects, specs, meeting notes, references.</div>
                  <div className="of-demo">
                    <div className="of-drow">📁 Projects</div>
                    <div
                      className="of-drow act"
                      style={{ paddingLeft: "18px", fontSize: "12.5px" }}
                    >
                      📄 OpenCraft v0.1
                    </div>
                    <div className="of-drow" style={{ paddingLeft: "18px", fontSize: "12.5px" }}>
                      📄 Landing page notes
                    </div>
                    <div className="of-drow">📁 Archive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="inner">
            <div className="of-split">
              <div className="fade-up">
                <div className="of-card" style={{ marginBottom: "14px" }}>
                  <div className="of-card-h">Tags in action</div>
                  <div className="of-card-d">Notes tagged across spaces, pulled into one view.</div>
                  <div className="of-demo">
                    <div className="of-drow">
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>#idea</span> &nbsp;→
                      12 notes
                    </div>
                    <div
                      className="of-drow act"
                      style={{ fontSize: "12.5px", paddingLeft: "16px" }}
                    >
                      📄 App concept notes
                    </div>
                    <div
                      className="of-drow act"
                      style={{ fontSize: "12.5px", paddingLeft: "16px" }}
                    >
                      📄 Side project braindump
                    </div>
                    <div
                      className="of-drow act"
                      style={{ fontSize: "12.5px", paddingLeft: "16px" }}
                    >
                      📄 Feature wishlist
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="eyebrow fade-up">Tags &amp; Search</div>
                <h2 className="serif-lg fade-up delay-1" style={{ marginBottom: "16px" }}>
                  Your second
                  <br />
                  <em>brain, indexed</em>
                </h2>
                <p className="body-md fade-up delay-2" style={{ marginBottom: "24px" }}>
                  Tag any note with any word. Tags work across all spaces and folders. Click a tag
                  and see every related note you've ever written.
                </p>
                <p className="body-md fade-up delay-3">
                  Full-text search across every word in every note. Press ⌘K — results in under
                  200ms. Even notes you forgot you wrote.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" style={{ background: "var(--cream-mid)" }}>
          <div className="inner">
            <div className="eyebrow fade-up">More structure</div>
            <h2 className="display-md fade-up delay-1" style={{ marginBottom: "48px" }}>
              Every tool
              <br />
              for every mind
            </h2>
            <div className="org-grid">
              <div className="org-card fade-up">
                <div className="org-tag t-blue">📌 Starred</div>
                <div className="org-t">Star anything</div>
                <p className="org-d">
                  Star your most-used notes or folders. They pin to the top of any space for instant
                  access.
                </p>
              </div>
              <div className="org-card fade-up delay-1">
                <div className="org-tag t-green">📋 Templates</div>
                <div className="org-t">Start fast</div>
                <p className="org-d">
                  Create templates for meeting notes, journals, book reviews — anything you repeat.
                </p>
              </div>
              <div className="org-card fade-up delay-2">
                <div className="org-tag t-rust">📅 Daily Notes</div>
                <div className="org-t">Journal built in</div>
                <p className="org-d">
                  One keystroke to today's daily note. Date-organised automatically. Always there
                  when you need it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-sec" style={{ background: "var(--paper)" }}>
          <div className="cta-bg"></div>
          <h2 className="display-md fade-up" style={{ marginBottom: "14px" }}>
            Build your system.
          </h2>
          <p
            className="body-lg fade-up delay-1"
            style={{ maxWidth: "400px", margin: "0 auto 40px" }}
          >
            Free, no signup, no lock-in. Organize on your terms.
          </p>
          <div className="cta-actions fade-up delay-2">
            <button className="btn btn-dark-lg" onClick={enterApp}>
              Open App
            </button>
            <button className="btn btn-outline-lg" onClick={() => goPage("home")}>
              Back to home
            </button>
          </div>
        </section>

        <footer>
          <div className="ft-inner">
            <div className="ft-bottom" style={{ paddingTop: 0, borderTop: "none" }}>
              <div className="logo-wrap" onClick={() => goPage("home")}>
                <img
                  src={opencraftWhite}
                  alt="OpenCraft"
                  style={{ height: "48px", width: "auto" }}
                />
              </div>
              <div className="ft-legal">
                <a onClick={() => goPage("home")}>Home</a>
                <a onClick={() => goPage("features")}>Features</a>
                <a onClick={() => goPage("writing")}>Writing</a>
                <a onClick={() => goPage("why")}>Why</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════
           FEATURES PAGE
      ════════════════════════════════════ */}
      <div id="page-features" className={`page ${activePage === "features" ? "active" : ""}`}>
        <section className="subhero ruled">
          <div className="subhero-bg fp-bg"></div>
          <div className="subhero-content">
            <div className="eyebrow">Features</div>
            <h1 className="display-xl" style={{ marginBottom: "20px" }}>
              Everything
              <br />
              you&nbsp;need.
              <br />
              <span style={{ color: "var(--ink-4)" }}>Nothing&nbsp;you&nbsp;don't.</span>
            </h1>
            <p className="body-lg" style={{ maxWidth: "520px" }}>
              A complete list of what OpenCraft does. No upsells. No "upgrade to unlock." Just
              features.
            </p>
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "36px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .28s ease both",
              }}
            >
              <div>
                <div className="sh-num">08</div>
                <div className="sh-label">Core Features</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num">Web</div>
                <div className="sh-label">First</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num">100%</div>
                <div className="sh-label">Free</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num">MIT</div>
                <div className="sh-label">Licensed</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "24px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .36s ease both",
              }}
            >
              <span className="st-badge st-blue">✍️ Block Editor</span>
              <span className="st-badge st-green">📁 Local First</span>
              <span className="st-badge st-rust">⌨️ Keyboard First</span>
              <span className="st-badge st-gold">↗️ Export</span>
              <span className="st-badge st-purple">🎨 Themes</span>
            </div>
          </div>
          <div className="subhero-stripe fp-stripe"></div>
        </section>

        <section className="sec" style={{ background: "var(--cream-mid)" }}>
          <div className="inner">
            <div className="eyebrow fade-up">Core editor</div>
            <h2 className="display-md fade-up delay-1" style={{ marginBottom: "48px" }}>
              The writing experience
            </h2>
            <div className="fp-big-grid">
              <div className="fp-big-card fade-up">
                <div className="fp-tag ft-blue">Editor</div>
                <div className="fp-num">01</div>
                <div className="fp-t">Block-based Editor</div>
                <p className="fp-d">
                  Text, headings, images, code, callouts, quotes, tables, checklists, dividers.
                  Every block you need. Drag to reorder. Nest freely.
                </p>
              </div>
              <div className="fp-big-card fade-up delay-1">
                <div className="fp-tag ft-rust">Typography</div>
                <div className="fp-num">02</div>
                <div className="fp-t">Beautiful Defaults</div>
                <p className="fp-d">
                  Lora for titles, DM Sans for body. Line-height and spacing tuned for sustained
                  reading. Four themes: Light, Dark, Sepia, Midnight.
                </p>
              </div>
              <div className="fp-big-card fade-up delay-2">
                <div className="fp-tag ft-grn">Keyboard</div>
                <div className="fp-num">03</div>
                <div className="fp-t">Keyboard First</div>
                <p className="fp-d">
                  ⌘K quick switcher. / slash commands. Full keyboard navigation. Every action has a
                  shortcut. Your hands never leave the keys.
                </p>
              </div>
              <div className="fp-big-card fade-up delay-3">
                <div className="fp-tag ft-gold">Export</div>
                <div className="fp-num">04</div>
                <div className="fp-t">Markdown Export</div>
                <p className="fp-d">
                  Universal compatibility. Export your writing as clean Markdown files. 
                  Take your thoughts anywhere without proprietary lock-in.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="inner">
            <div className="eyebrow fade-up">Organisation</div>
            <h2 className="display-md fade-up delay-1" style={{ marginBottom: "48px" }}>
              Structure &amp; navigation
            </h2>
            <div className="feat-grid">
              <div className="feat-card fade-up">
                <span className="feat-ico">🏠</span>
                <div className="feat-t">Spaces</div>
                <p className="feat-d">
                  Create distinct spaces for work, personal, and side projects. One-click switching.
                </p>
              </div>
              <div className="feat-card fade-up delay-1">
                <span className="feat-ico">📁</span>
                <div className="feat-t">Nested Folders</div>
                <p className="feat-d">
                  Unlimited folder nesting. Drag and drop to reorganise. Exactly as expected.
                </p>
              </div>
              <div className="feat-card fade-up delay-2">
                <span className="feat-ico">🏷️</span>
                <div className="feat-t">Tags</div>
                <p className="feat-d">
                  Tag notes across spaces. Click any tag to see every related note instantly.
                </p>
              </div>
              <div className="feat-card fade-up delay-3">
                <span className="feat-ico">⭐</span>
                <div className="feat-t">Starred Notes</div>
                <p className="feat-d">
                  Star your most-used notes for one-click access from anywhere.
                </p>
              </div>
              <div className="feat-card fade-up delay-4">
                <span className="feat-ico">📅</span>
                <div className="feat-t">Daily Notes</div>
                <p className="feat-d">
                  Built-in daily notes. Auto-dated. One keystroke away, every day.
                </p>
              </div>
              <div className="feat-card fade-up delay-5">
                <span className="feat-ico">🔍</span>
                <div className="feat-t">Full-text Search</div>
                <p className="feat-d">
                  Search across every word in every note. Results in under 200ms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" style={{ background: "var(--cream-mid)" }}>
          <div className="inner">
            <div className="eyebrow fade-up">Privacy &amp; data</div>
            <h2 className="display-md fade-up delay-1" style={{ marginBottom: "48px" }}>
              Your data, your rules
            </h2>
            <div className="fp-big-grid">
              <div className="fp-big-card fade-up">
                <div className="fp-tag ft-grn">Local</div>
                <div className="fp-num">05</div>
                <div className="fp-t">Local First</div>
                <p className="fp-d">
                  Notes live in your browser's secure storage. Zero cloud dependency. 
                  Privacy by default, no account required.
                </p>
              </div>
              <div className="fp-big-card fade-up delay-1">
                <div className="fp-tag ft-blue">Privacy</div>
                <div className="fp-num">06</div>
                <div className="fp-t">Private &amp; Secure</div>
                <p className="fp-d">
                  OpenCraft is built for solo writers. Your data stays on your machine, 
                  shielded from the prying eyes of corporate cloud servers.
                </p>
              </div>
              <div className="fp-big-card fade-up delay-2">
                <div className="fp-tag ft-rust">Privacy</div>
                <div className="fp-num">07</div>
                <div className="fp-t">Zero Telemetry</div>
                <p className="fp-d">
                  No analytics. No crash reports. No usage data sent anywhere. We literally cannot
                  see what you write.
                </p>
              </div>
              <div className="fp-big-card fade-up delay-3">
                <div className="fp-tag ft-gold">Open</div>
                <div className="fp-num">08</div>
                <div className="fp-t">MIT Licensed</div>
                <p className="fp-d">
                  Fork it, modify it, distribute it. The code is yours to read, audit, and own. No
                  black boxes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-sec" style={{ background: "var(--paper)" }}>
          <div className="cta-bg"></div>
          <h2 className="display-md fade-up" style={{ marginBottom: "14px" }}>
            All of this.
            <br />
            Free forever.
          </h2>
          <p
            className="body-lg fade-up delay-1"
            style={{ maxWidth: "400px", margin: "0 auto 40px" }}
          >
            No feature tiers. No paywalls. Every feature listed here is free, for everyone,
            permanently.
          </p>
          <div className="cta-actions fade-up delay-2">
            <button className="btn btn-dark-lg" onClick={enterApp}>
              Open App
            </button>
            <button className="btn btn-outline-lg" onClick={() => goPage("home")}>
              Back to home
            </button>
          </div>
        </section>

        <footer>
          <div className="ft-inner">
            <div className="ft-bottom" style={{ paddingTop: 0, borderTop: "none" }}>
              <div className="logo-wrap" onClick={() => goPage("home")}>
                <img
                  src={opencraftWhite}
                  alt="OpenCraft"
                  style={{ height: "48px", width: "auto" }}
                />
              </div>
              <div className="ft-legal">
                <a onClick={() => goPage("home")}>Home</a>
                <a onClick={() => goPage("features")}>Features</a>
                <a onClick={() => goPage("writing")}>Writing</a>
                <a onClick={() => goPage("organize")}>Organize</a>
                <a onClick={() => goPage("why")}>Why</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════
           WHY PAGE
      ════════════════════════════════════ */}
      <div id="page-why" className={`page ${activePage === "why" ? "active" : ""}`}>
        <section className="subhero ruled" style={{ paddingBottom: "100px" }}>
          <div className="subhero-bg why-bg"></div>
          <div className="subhero-content">
            <div className="eyebrow light">Why OpenCraft</div>
            <h1 className="display-xl light" style={{ marginBottom: "22px" }}>
              I was
              <br />
              frustrated<span style={{ color: "var(--rust)" }}>.</span>
            </h1>
            <p className="body-lg" style={{ maxWidth: "560px", color: "rgba(246,242,235,.55)" }}>
              Craft is the most beautiful note app ever made. Then I hit the paywall. Notion is
              powerful — after three hours of configuration. Apple Notes is free, then you try to
              format something. This is the story of why none of them were enough, and why I decided
              to build my own.
            </p>
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "36px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .28s ease both",
              }}
            >
              <div>
                <div className="sh-num light">2026</div>
                <div className="sh-label light">Built This Year</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num light">MIT</div>
                <div className="sh-label light">License</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num light">0</div>
                <div className="sh-label light">AI Features</div>
              </div>
              <div className="sh-div"></div>
              <div>
                <div className="sh-num light">100%</div>
                <div className="sh-label light">Local-First</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "24px",
                flexWrap: "wrap",
                animation: "landingFadeUp .6s .36s ease both",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(43,104,69,.28)",
                  border: "1px solid rgba(43,104,69,.44)",
                  color: "#7EE8A2",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#7EE8A2",
                  }}
                ></div>
                Open Source
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(246,242,235,.08)",
                  border: "1px solid rgba(246,242,235,.15)",
                  color: "rgba(246,242,235,.7)",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                No Telemetry
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(246,242,235,.08)",
                  border: "1px solid rgba(246,242,235,.15)",
                  color: "rgba(246,242,235,.7)",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                No Account
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(246,242,235,.08)",
                  border: "1px solid rgba(246,242,235,.15)",
                  color: "rgba(246,242,235,.7)",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                Free Forever
              </div>
            </div>
          </div>
          <div className="subhero-stripe why-stripe"></div>
        </section>

        <section className="sec dark-panel" style={{ paddingTop: 0 }}>
          <div className="inner">
            <div className="eyebrow light fade-up" style={{ marginBottom: "28px" }}>
              The competition, honestly
            </div>
            <div className="rant-grid">
              <div className="rant-card rc-notion fade-up">
                <div className="rant-app-name">Notion</div>
                <div className="rant-verdict rv-ugly">✕ Overcomplicated</div>
                <div className="rant-title">
                  A database that forgot it was supposed to be a note app
                </div>
                <p className="rant-body">
                  Genuinely impressive software. But I don't want to set up a relational database
                  every time I want to jot down a thought. The blank-page experience is daunting.
                  Formatting is clunky. Slow on mobile. And everything interesting is behind a paid
                  plan.
                </p>
                <div className="rant-gripe">
                  <div className="rant-gripe-item">
                    Feels like enterprise software, not a writing tool
                  </div>
                  <div className="rant-gripe-item">Terrible offline experience</div>
                  <div className="rant-gripe-item">Interesting features sit behind paywalls</div>
                  <div className="rant-gripe-item">Massively overkill for personal notes</div>
                </div>
              </div>
              <div className="rant-card rc-apple fade-up delay-1">
                <div className="rant-app-name">Apple Notes</div>
                <div className="rant-verdict rv-ok">Decent for basics</div>
                <div className="rant-title">
                  The reliable Honda Civic of note apps — adequate, forgettable
                </div>
                <p className="rant-body">
                  Fast, reliable, syncs perfectly. Genuinely good for quick captures. But the moment
                  you want a heading, a callout, any visual structure — you hit the ceiling. Every
                  note looks the same. Flat, forgettable. No joy in opening them.
                </p>
                <div className="rant-gripe">
                  <div className="rant-gripe-item">No real formatting beyond basic styles</div>
                  <div className="rant-gripe-item">Locked to Apple ecosystem entirely</div>
                  <div className="rant-gripe-item">No cover images, no personality</div>
                  <div className="rant-gripe-item">Files aren't directly accessible</div>
                </div>
              </div>
              <div className="rant-card rc-obs fade-up delay-2">
                <div className="rant-app-name">Obsidian</div>
                <div className="rant-verdict rv-ok">Powerful but austere</div>
                <div className="rant-title">A hacker's paradise. A designer's nightmare.</div>
                <p className="rant-body">
                  The plugin ecosystem is extraordinary. If you want a second brain with
                  bidirectional links and graph views, it's unmatched. But out of the box it looks
                  like a code editor from 2009. Good design is not optional for a writing tool.
                </p>
                <div className="rant-gripe">
                  <div className="rant-gripe-item">Requires extensive configuration</div>
                  <div className="rant-gripe-item">Ugly default experience</div>
                  <div className="rant-gripe-item">Sync costs extra</div>
                  <div className="rant-gripe-item">Not built for casual writers</div>
                </div>
              </div>
              <div className="rant-card rc-craft fade-up">
                <div className="rant-app-name">Craft</div>
                <div className="rant-verdict rv-bad">✦ Best design. Paywalled.</div>
                <div className="rant-title">The one I love. The one that charges me for it.</div>
                <p className="rant-body">
                  Craft is genuinely beautiful. The block editor is excellent. The document design
                  is the best in class — I used it every day for months. Then more features moved
                  behind the Plus plan. AI I don't want. A subscription I can't justify. And closed
                  source, so I can't fix it myself. That frustration is exactly why OpenCraft
                  exists.
                </p>
                <div className="rant-gripe">
                  <div className="rant-gripe-item">Subscription required for real use</div>
                  <div className="rant-gripe-item">Closed source — no transparency</div>
                  <div className="rant-gripe-item">AI features nobody asked for</div>
                  <div className="rant-gripe-item">Collaboration bloat for solo writers</div>
                </div>
              </div>
              <div className="rant-card rc-bear fade-up delay-1">
                <div className="rant-app-name">Bear</div>
                <div className="rant-verdict rv-ok">Charming but limited</div>
                <div className="rant-title">
                  Beautiful for writers. Frustrating for everyone else.
                </div>
                <p className="rant-body">
                  Bear has wonderful taste. The typography is warm, the design is considered, and
                  the tag system is clever. But it's Markdown-only — limiting for rich notes. Rich
                  features sit behind the Pro plan. And it's Apple-only, excluding Android and
                  Windows users entirely.
                </p>
                <div className="rant-gripe">
                  <div className="rant-gripe-item">Apple ecosystem only</div>
                  <div className="rant-gripe-item">Rich features behind Pro plan</div>
                  <div className="rant-gripe-item">Markdown-only limits non-technical users</div>
                </div>
              </div>
              <div className="rant-card rc-typora fade-up delay-2">
                <div className="rant-app-name">Typora</div>
                <div className="rant-verdict rv-ok">Clean editor, one-time buy</div>
                <div className="rant-title">Closest to "just write" — but no organisation</div>
                <p className="rant-body">
                  Typora gets the writing experience right. WYSIWYG Markdown, clean defaults, no
                  distractions. Honest one-time pricing. But there's no note organisation system —
                  you end up managing hundreds of .md files in Finder. That's a text editor, not a
                  note app.
                </p>
                <div className="rant-gripe">
                  <div className="rant-gripe-item">No organisational features at all</div>
                  <div className="rant-gripe-item">Paid (though one-time, to be fair)</div>
                  <div className="rant-gripe-item">Sparse design — nothing beautiful about it</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec dark-panel" style={{ paddingTop: "20px" }}>
          <div className="inner">
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <div className="eyebrow light fade-up">The manifesto</div>
              <h2 className="display-md light fade-up delay-1" style={{ marginBottom: "14px" }}>
                So I built OpenCraft
              </h2>
              <p
                className="body-lg fade-up delay-2"
                style={{ maxWidth: "480px", margin: "0 auto" }}
              >
                Here's what I believe a note editor should be.
              </p>
            </div>
            <div className="manifesto">
              <div className="mf-block fade-up">
                <div className="mf-num">01</div>
                <div className="mf-title">Design is not optional.</div>
                <p className="mf-body">
                  How a tool looks affects how you think inside it. A beautiful writing environment
                  invites you to write more, to care more, to return. Craft understood this.{" "}
                  <strong>OpenCraft keeps that truth.</strong> Ugly tools produce less thinking, or
                  no thinking at all.
                </p>
                <div className="mf-highlight">
                  If the app isn't a joy to open, you won't open it. The experience is the product.
                </div>
              </div>
              <div className="mf-block fade-up">
                <div className="mf-num">02</div>
                <div className="mf-title">Your notes should be free. Not free-to-try.</div>
                <p className="mf-body">
                  Software that charges you to access your own words is software you don't actually
                  own. <strong>OpenCraft is free. Permanently.</strong> Not "free tier with 50
                  notes." Free because it's MIT licensed and you can host it yourself, fork it
                  yourself, or just use it without ever touching a payment form.
                </p>
              </div>
              <div className="mf-block fade-up">
                <div className="mf-num">03</div>
                <div className="mf-title">AI is a distraction from writing.</div>
                <p className="mf-body">
                  Every note app is now racing to put AI everywhere — autocomplete your sentences,
                  summarise your thoughts, "enhance" your writing. I don't want that.{" "}
                  <strong>I want to write my own sentences.</strong> The value of a note is that
                  it's yours — your thinking, your phrasing, your memory. AI-generated notes are no
                  one's notes.
                </p>
                <div className="mf-highlight">
                  OpenCraft has no AI. Not now, not ever. The ⌘ key is yours.
                </div>
              </div>
              <div className="mf-block fade-up">
                <div className="mf-num">04</div>
                <div className="mf-title">Local-first. Private. Yours.</div>
                <p className="mf-body">
                  Cloud-first apps hold your data hostage. When the company folds or raises prices, 
                  your notes are at risk. <strong>OpenCraft prioritizes your machine.</strong> 
                  We use secure local storage to keep your thoughts fast, accessible offline, and 
                  under your total control.
                </p>
              </div>
              <div className="mf-block fade-up">
                <div className="mf-num">05</div>
                <div className="mf-title">Simple things should be simple.</div>
                <p className="mf-body">
                  Notion gave us relational databases and took away the feeling of just writing.{" "}
                  <strong>OpenCraft does one thing: notes.</strong> Not project management. Not
                  wikis. Not team collaboration. You can have one note or ten thousand — but the app
                  never asks you to configure it before you can start.
                </p>
                <div className="mf-highlight">
                  Open the app. Start writing. That should be the entire onboarding.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-sec dark-panel" style={{ background: "var(--ink-2)" }}>
          <h2 className="display-md light fade-up" style={{ marginBottom: "14px" }}>
            If you've felt
            <br />
            the same frustration —
          </h2>
          <p
            className="body-lg fade-up delay-1"
            style={{ maxWidth: "460px", margin: "0 auto 40px" }}
          >
            OpenCraft is yours. Free, open, and unapologetically simple. Come build it with me.
          </p>
          <div className="cta-actions fade-up delay-2">
            <button
              className="gh-btn"
              onClick={() => window.open("https://github.com/hariharen9/OpenCraft", "_blank")}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C17.134 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
              </svg>
              Star on GitHub &amp; Contribute <span className="gh-star">★ 0</span>
            </button>
            <button
              className="btn btn-dark-lg"
              style={{
                background: "rgba(246,242,235,.1)",
                boxShadow: "none",
                border: "1.5px solid rgba(246,242,235,.15)",
              }}
              onClick={enterApp}
            >
              Open the app
            </button>
          </div>
        </section>

        <footer>
          <div className="ft-inner">
            <div className="ft-bottom" style={{ paddingTop: 0, borderTop: "none" }}>
              <div className="logo-wrap" onClick={() => goPage("home")}>
                <img
                  src={opencraftWhite}
                  alt="OpenCraft"
                  style={{ height: "48px", width: "auto" }}
                />
              </div>
              <div className="ft-legal">
                <a onClick={() => goPage("home")}>Home</a>
                <a onClick={() => goPage("features")}>Features</a>
                <a onClick={() => goPage("writing")}>Writing</a>
                <a onClick={() => goPage("organize")}>Organize</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
