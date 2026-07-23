import { useState } from "react";

/* ============================================================
   CVPage.tsx — Montaque Reynolds, PhD
   ------------------------------------------------------------
   Self-contained: styles are scoped under .mihl-cv so this drops
   into any React/Vite/TS project whether or not Tailwind is used.

   TO UPDATE THE CV: edit the data arrays below. The markup renders
   from data, so you never have to touch JSX to add a publication.

   TO ADD THE PDF: put the file at public/Montaque-Reynolds-CV.pdf
   (or change PDF_HREF below).
   ============================================================ */

const PDF_HREF = "/Montaque-Reynolds-CV.pdf";
const LAST_UPDATED = "April 2025";

type Entry = {
  year?: string;
  title: string;
  /** Rendered in italic under the title — venue, institution, journal. */
  venue?: string;
  /** Plain supporting lines. */
  notes?: string[];
  href?: string;
};

type Section = {
  id: string;
  label: string;
  /** Optional sub-groupings within one section. */
  groups: { heading?: string; entries: Entry[] }[];
  /** Collapsed behind a toggle — for long, lower-priority lists. */
  collapsible?: boolean;
};

/* ------------------------------------------------------------
   CV DATA
   ------------------------------------------------------------ */

const AOS = ["Social and Moral Epistemology", "Philosophy of Mind"];
const AOC = ["Ethics", "Meta-ethics", "Aesthetics"];

const SECTIONS: Section[] = [
  {
    id: "education",
    label: "Education",
    groups: [
      {
        entries: [
          {
            year: "2024",
            title: "Ph.D., Philosophy",
            venue: "Saint Louis University, Saint Louis, MO",
            notes: [
              "Dissertation: Emotional Data and Spiritual Meaning — an analysis of the moral expression of sentiment in fiction.",
              "Committee: Helen De Cruz, Dan Haybron, Scott Gelfand, Scott Ragland",
            ],
          },
          {
            year: "2017",
            title: "M.A., Philosophy",
            venue: "Oklahoma State University, Stillwater, OK",
            notes: [
              "Thesis: Evolution of Religious Belief and Naturalism — agency, character and adaptation in Christian belief.",
              "Advisor: Eric Reitan",
            ],
          },
          {
            year: "2015",
            title: "B.A., Philosophy",
            venue: "Seattle Pacific University, Seattle, WA",
          },
        ],
      },
    ],
  },

  {
    id: "publications",
    label: "Publications",
    groups: [
      {
        heading: "Peer-reviewed",
        entries: [
          {
            year: "2024",
            title:
              "Adaptive Preferences: An Empirical Investigation of Feminist Perspectives",
            venue: "Experiments in Moral and Political Philosophy",
            notes: [
              "With U. Chakrabarty, R. Feiertag, A.-M. McCallion, B. McNiff, J. Prinz, S. Shahi, M. Von Ziegesar, and A. Yamamoto.",
            ],
            href: "https://www.taylorfrancis.com/chapters/edit/10.4324/9781003301424-19/adaptive-preferences-urna-chakrabarty-romy-feiertag-anne-marie-mccallion-brian-mcniff-jesse-prinz-montaque-reynolds-sukhvinder-shahi-maya-von-ziegesar-angella-yamamoto",
          },
        ],
      },
      {
        heading: "In progress",
        entries: [
          {
            title: "Play and Meaning: An Epistemology of Emotional Testimony",
            venue: "Vernon Press — under contract",
          },
          { title: "Social Agency and Other Epistemic Scaffolding" },
          {
            title:
              "Deference and the Moral Properties of Imaginative Experience",
          },
          { title: "Well-Being and Moral Worth" },
        ],
      },
    ],
  },

  {
    id: "talks",
    label: "Talks & Presentations",
    groups: [
      {
        heading: "International & national conferences",
        entries: [
          {
            year: "2024",
            title:
              "Emotional Datum: The Moral Expressions of Sentiment in Narratives",
            venue:
              "American Society for Aesthetics, Rocky Mountain Division — Santa Fe, NM",
          },
          {
            year: "2024",
            title:
              "Comments on Aliya Dewey’s “Rationalizing Behavior as Reasons Responsive”",
            venue: "Central APA Meeting — New Orleans, LA",
          },
          {
            year: "2023",
            title:
              "Love and Wonder in Country Music: Objective, not relative, authenticity and value",
            venue:
              "American Society for Aesthetics, Rocky Mountain Division — Santa Fe, NM",
          },
          {
            year: "2022",
            title: "Aesthetic Blame — commentary on Robbie Kubal",
            venue:
              "American Society for Aesthetics, Pacific Division — Berkeley, CA",
          },
          {
            year: "2022",
            title:
              "Getting Things Right in Country Music: An account of meaning in country",
            venue:
              "American Society for Aesthetics, General Meeting — Montreal, QC",
          },
          {
            year: "2022",
            title: "Sensible Self-Censorship: TV Guide to Love and Friendship",
            venue:
              "American Society for Aesthetics, Rocky Mountain Division — Santa Fe, NM",
          },
          {
            year: "2019",
            title:
              "Basically, You Are Justified: A knowledge-first account of religious belief",
            venue:
              "12th Annual LSU Graduate Philosophy Conference — Baton Rouge, LA",
          },
          {
            year: "2018",
            title:
              "Plantinga’s Unique Naturalism as a Criticism of Evolutionary Reliabilism",
            venue:
              "Great Lakes Philosophy Conference, Siena Heights University — Adrian, MI",
          },
          {
            year: "2017",
            title:
              "Convenience and Correspondence: Plantinga’s unique naturalism as a criticism of evolutionary reliabilism",
            venue: "ECST XVII — Écully, France",
          },
          {
            year: "2017",
            title: "The Evolution of Religious Belief",
            venue: "The Evolution of Religion II — Bernalillo, NM",
          },
        ],
      },
      {
        heading: "Invited talks",
        entries: [
          {
            year: "2023",
            title: "Sentiment Analysis: Hip-Hop and Country Comparison",
            venue: "Walter J. Ong Digital Humanities Center — webinar",
          },
          {
            year: "2022",
            title: "Introduction to Quanteda and Taylor Swift",
            venue:
              "Feminist X-Phi Lab, City University of New York — webinar",
          },
        ],
      },
      {
        heading: "Posters",
        entries: [
          {
            year: "2020",
            title: "Conative Moral Testimony",
            venue:
              "26th Annual Graduate Research Symposium, Saint Louis University",
          },
        ],
      },
    ],
  },

  {
    id: "teaching",
    label: "Teaching",
    groups: [
      {
        heading: "Full-time appointments",
        entries: [
          {
            year: "2025–",
            title: "Visiting Assistant Professor of Philosophy",
            venue: "Stetson University, DeLand, FL",
            notes: [
              "Philosophy of Law · Aesthetics · Introduction to Philosophy · Logic",
            ],
          },
          {
            year: "2024",
            title: "Instructor of Record",
            venue: "Saint Louis University, Saint Louis, MO",
            notes: [
              "PHIL 1700 — The Examined Life: Ultimate Questions (2 sections)",
            ],
          },
          {
            year: "2023",
            title: "Instructor of Record",
            venue: "Saint Louis University, Saint Louis, MO",
            notes: [
              "PHIL 1700 — The Examined Life: Ultimate Questions (4 sections)",
            ],
          },
          {
            year: "2022",
            title: "Instructor of Record",
            venue: "Saint Louis University, Saint Louis, MO",
            notes: ["PHIL 2050 — Ethics (online / asynchronous)"],
          },
          {
            year: "2022",
            title: "Graduate Teaching Assistant",
            venue: "Saint Louis University, Saint Louis, MO",
            notes: ["PHIL 2050 — Ethics (3 sections, online / asynchronous)"],
          },
          {
            year: "2018–19",
            title: "Graduate Teaching Assistant",
            venue: "Saint Louis University, Saint Louis, MO",
            notes: ["PHIL 1050 — Introduction to Philosophy: Self and Reality"],
          },
        ],
      },
      {
        heading: "Other teaching",
        entries: [
          {
            year: "2022",
            title: "Natural Language Workshop for Philosophers",
            venue:
              "Walter J. Ong Digital Humanities Center — workshop series",
          },
        ],
      },
    ],
  },

  {
    id: "service",
    label: "Service to the Profession",
    groups: [
      {
        entries: [
          {
            year: "2022",
            title: "Panel on Country Music — organizer",
            venue:
              "American Society for Aesthetics, Portland, OR. With J. Dyck and E. Malone.",
          },
          {
            year: "2022",
            title: "The Problem of Evil — session",
            venue:
              "Saint Louis University PGSA. With C. Holland.",
          },
          {
            year: "2021",
            title: "Virtue and Wisdom — session",
            venue: "Saint Louis University PGSA. With N. Sparks.",
          },
        ],
      },
    ],
  },

  {
    id: "training",
    label: "Workshops & Advanced Training",
    collapsible: true,
    groups: [
      {
        entries: [
          {
            year: "2023",
            title: "Deep Learning for Humanists",
            venue: "University of Victoria, BC — H. Kim",
          },
          {
            year: "2023",
            title: "Towards a Feminist X-Phi",
            venue:
              "The Philosophy Lab, CUNY Graduate Center — S. Brick & T. Zyglewicz",
          },
          {
            year: "2022",
            title: "Natural Language Processing",
            venue: "Walter J. Ong Digital Humanities Center",
          },
          {
            year: "2022",
            title: "Expanding Access to the Digital Humanities in Saint Louis",
            venue: "Saint Louis Digital Humanities Network — G. Carnes",
          },
          {
            year: "2021",
            title: "Corpus Linguistics and Experimental Philosophy",
            venue:
              "University of Zurich — M. Alfano, K. Reuter, J. Sytsma (three-day workshop)",
          },
          {
            year: "2019",
            title: "Topics in Ethics: Desire",
            venue: "Washington University — A. Hazlett",
          },
          {
            year: "2019",
            title: "Agents and Agency",
            venue: "Saint Louis University — K. Lindeman",
          },
          {
            year: "2019",
            title: "Genealogies of Morality",
            venue: "Saint Louis University — H. De Cruz",
          },
          {
            year: "2019",
            title: "Modern Philosophy: Hume & Reid",
            venue: "Saint Louis University — J. Greco",
          },
          {
            year: "2019",
            title: "Seminar in Political Philosophy: Political Morality",
            venue: "Saint Louis University — D. Haybron",
          },
          {
            year: "2019",
            title: "Special Topics: Digital Humanities",
            venue: "Saint Louis University — A. Park",
          },
          {
            year: "2018",
            title: "Issues in Epistemology",
            venue: "Saint Louis University — J. Greco",
          },
          {
            year: "2018",
            title: "Advanced Logic",
            venue: "Saint Louis University — J. Salerno",
          },
          {
            year: "2018",
            title: "Belief and the Doxastic Family",
            venue: "Saint Louis University — J. Salerno & P. Engel",
          },
        ],
      },
    ],
  },
];

const SKILLS: { label: string; items: string }[] = [
  { label: "Programming", items: "R, Python" },
  { label: "Infrastructure", items: "Git / GitHub" },
  { label: "Data visualization", items: "R, Shiny, Tableau" },
  { label: "Markup", items: "HTML" },
  { label: "Methods", items: "OCR-based NLP, corpus linguistics" },
  {
    label: "Natural languages",
    items: "English (native), Latin (reading), French (basic), Spanish (basic)",
  },
];

const MEMBERSHIPS = [
  "American Philosophical Association",
  "American Society for Aesthetics",
  "Saint Louis Digital Humanities",
];

/* ------------------------------------------------------------
   Sentiment trace — the page's signature element.
   A valence curve of the kind produced by sentiment analysis of a
   narrative: the method at the centre of the dissertation, drawn
   as the page's masthead.
   ------------------------------------------------------------ */

const TRACE_POINTS = [
  0.52, 0.48, 0.58, 0.66, 0.55, 0.42, 0.38, 0.47, 0.61, 0.72, 0.68, 0.54,
  0.44, 0.33, 0.29, 0.36, 0.5, 0.63, 0.74, 0.8, 0.71, 0.6, 0.52, 0.57,
  0.66, 0.78, 0.86, 0.79, 0.68, 0.6,
];

function SentimentTrace() {
  const w = 1000;
  const h = 90;
  const step = w / (TRACE_POINTS.length - 1);
  const line = TRACE_POINTS.map(
    (v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${((1 - v) * h).toFixed(1)}`
  ).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg
      className="mihl-cv-trace"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mihl-cv-trace-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path className="mihl-cv-trace-area" d={area} />
      <path className="mihl-cv-trace-line" d={line} />
      {TRACE_POINTS.map((v, i) => (
        <circle
          key={i}
          className="mihl-cv-trace-dot"
          cx={(i * step).toFixed(1)}
          cy={((1 - v) * h).toFixed(1)}
          r="1.6"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------
   Entry list
   ------------------------------------------------------------ */

function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ol className="mihl-cv-entries">
      {entries.map((e, i) => (
        <li className="mihl-cv-entry" key={i}>
          <div className="mihl-cv-entry-year">{e.year ?? ""}</div>
          <div className="mihl-cv-entry-body">
            <h4 className="mihl-cv-entry-title">
              {e.href ? (
                <a href={e.href} target="_blank" rel="noreferrer">
                  {e.title}
                </a>
              ) : (
                e.title
              )}
            </h4>
            {e.venue && <p className="mihl-cv-entry-venue">{e.venue}</p>}
            {e.notes?.map((n, j) => (
              <p className="mihl-cv-entry-note" key={j}>
                {n}
              </p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------
   Page
   ------------------------------------------------------------ */

export default function CVPage() {
  const [openTraining, setOpenTraining] = useState(false);

  return (
    <div className="mihl-cv">
      <style>{CSS}</style>

      <header className="mihl-cv-hero">
        <SentimentTrace />
        <div className="mihl-cv-hero-inner">
          <p className="mihl-cv-eyebrow">Curriculum Vitae</p>
          <h1 className="mihl-cv-name">
            Montaque <span className="mihl-cv-name-alt">Reynolds</span>
            <span className="mihl-cv-degree">, Ph.D.</span>
          </h1>
          <p className="mihl-cv-role">
            Visiting Assistant Professor of Philosophy · Stetson University
          </p>

          <dl className="mihl-cv-areas">
            <div>
              <dt>Specialization</dt>
              <dd>{AOS.join(" · ")}</dd>
            </div>
            <div>
              <dt>Competence</dt>
              <dd>{AOC.join(" · ")}</dd>
            </div>
          </dl>

          <nav className="mihl-cv-links" aria-label="Contact and profiles">
            <a className="mihl-cv-btn mihl-cv-btn-primary" href={PDF_HREF} download>
              Download CV (PDF)
            </a>
            <a className="mihl-cv-btn" href="mailto:montaque.reynolds@gmail.com">
              Email
            </a>
            <a
              className="mihl-cv-btn"
              href="https://www.linkedin.com/in/montaque-reynolds"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="mihl-cv-btn"
              href="https://mihlab.org/people"
              target="_blank"
              rel="noreferrer"
            >
              Personal site
            </a>
          </nav>
        </div>
      </header>

      <div className="mihl-cv-shell">
        <aside className="mihl-cv-rail" aria-label="Sections">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
            <li>
              <a href="#skills">Skills</a>
            </li>
          </ul>
          <p className="mihl-cv-rail-meta">Updated {LAST_UPDATED}</p>
        </aside>

        <main className="mihl-cv-main">
          {SECTIONS.map((section) => {
            const isCollapsed = section.collapsible && !openTraining;
            return (
              <section
                className="mihl-cv-section"
                id={section.id}
                key={section.id}
              >
                <h2 className="mihl-cv-section-head">
                  <span>{section.label}</span>
                </h2>

                {!isCollapsed &&
                  section.groups.map((g, i) => (
                    <div className="mihl-cv-group" key={i}>
                      {g.heading && (
                        <h3 className="mihl-cv-group-head">{g.heading}</h3>
                      )}
                      <EntryList entries={g.entries} />
                    </div>
                  ))}

                {section.collapsible && (
                  <button
                    className="mihl-cv-toggle"
                    onClick={() => setOpenTraining((v) => !v)}
                    aria-expanded={openTraining}
                  >
                    {openTraining
                      ? "Hide advanced training"
                      : `Show ${section.groups[0].entries.length} workshops and seminars`}
                  </button>
                )}
              </section>
            );
          })}

          <section className="mihl-cv-section" id="skills">
            <h2 className="mihl-cv-section-head">
              <span>Skills</span>
            </h2>
            <dl className="mihl-cv-skills">
              {SKILLS.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.items}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mihl-cv-group-head mihl-cv-group-head-spaced">
              Memberships
            </h3>
            <ul className="mihl-cv-memberships">
              {MEMBERSHIPS.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>

            <p className="mihl-cv-refs">
              References available on request.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Styles — scoped under .mihl-cv
   ------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Karla:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.mihl-cv {
  --paper:       #FCFBF9;
  --paper-alt:   #F3F1EC;
  --ink:         #22262B;
  --ink-soft:    #4C525A;
  --muted:       #83878E;
  --rule:        #E2DFD9;
  --accent:      #5B4B8A;
  --accent-soft: #EDEAF6;

  --display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --body:    'Karla', system-ui, -apple-system, sans-serif;
  --mono:    'IBM Plex Mono', ui-monospace, Menlo, monospace;

  background: var(--paper);
  color: var(--ink);
  font-family: var(--body);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.mihl-cv *, .mihl-cv *::before, .mihl-cv *::after { box-sizing: border-box; }

.mihl-cv a { color: inherit; }
.mihl-cv :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 2px;
}

/* ---------- hero ---------- */

.mihl-cv-hero {
  position: relative;
  border-bottom: 1px solid var(--rule);
  padding: 0 0 56px;
  overflow: hidden;
}

.mihl-cv-trace {
  display: block;
  width: 100%;
  height: 116px;
  opacity: 0.9;
}
.mihl-cv-trace-area  { fill: url(#mihl-cv-trace-grad); }
.mihl-cv-trace-line  {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.4;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  animation: mihl-cv-draw 1.8s cubic-bezier(.22,.61,.36,1) forwards;
}
.mihl-cv-trace-dot {
  fill: var(--accent);
  opacity: 0;
  animation: mihl-cv-fade .6s ease forwards .9s;
}
@keyframes mihl-cv-draw { to { stroke-dashoffset: 0; } }
@keyframes mihl-cv-fade { to { opacity: .45; } }

@media (prefers-reduced-motion: reduce) {
  .mihl-cv-trace-line { animation: none; stroke-dashoffset: 0; }
  .mihl-cv-trace-dot  { animation: none; opacity: .45; }
}

.mihl-cv-hero-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 32px 0;
}

.mihl-cv-eyebrow {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 14px;
}

.mihl-cv-name {
  font-family: var(--display);
  font-weight: 600;
  font-size: clamp(2.5rem, 6.5vw, 4.25rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0;
}
.mihl-cv-name-alt { font-style: italic; font-weight: 400; }
.mihl-cv-degree {
  font-size: 0.42em;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--muted);
  vertical-align: middle;
}

.mihl-cv-role {
  font-size: 1.02rem;
  color: var(--ink-soft);
  margin: 16px 0 0;
  max-width: 46ch;
}

.mihl-cv-areas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 48px;
  margin: 30px 0 0;
}
.mihl-cv-areas dt {
  font-family: var(--mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 4px;
}
.mihl-cv-areas dd {
  margin: 0;
  font-size: 0.94rem;
  color: var(--ink);
}

.mihl-cv-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 32px;
}
.mihl-cv-btn {
  display: inline-block;
  font-size: 0.86rem;
  font-weight: 500;
  text-decoration: none;
  padding: 9px 18px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: transparent;
  transition: border-color .18s ease, background .18s ease, color .18s ease;
}
.mihl-cv-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.mihl-cv-btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.mihl-cv-btn-primary:hover {
  background: #4a3d74;
  border-color: #4a3d74;
  color: #fff;
}

/* ---------- shell ---------- */

.mihl-cv-shell {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 32px 96px;
  display: grid;
  grid-template-columns: 168px 1fr;
  gap: 64px;
}

.mihl-cv-rail {
  position: sticky;
  top: 40px;
  align-self: start;
  padding-top: 56px;
}
.mihl-cv-rail ul { list-style: none; margin: 0; padding: 0; }
.mihl-cv-rail li { margin-bottom: 9px; }
.mihl-cv-rail a {
  font-family: var(--mono);
  font-size: 0.71rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  transition: color .16s ease;
}
.mihl-cv-rail a:hover { color: var(--accent); }
.mihl-cv-rail-meta {
  font-family: var(--mono);
  font-size: 0.66rem;
  color: var(--muted);
  margin-top: 28px;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
}

/* ---------- sections ---------- */

.mihl-cv-main { min-width: 0; padding-top: 56px; }

.mihl-cv-section { margin-bottom: 64px; scroll-margin-top: 32px; }
.mihl-cv-section:last-child { margin-bottom: 0; }

.mihl-cv-section-head {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 28px;
}
.mihl-cv-section-head::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--rule);
}

.mihl-cv-group { margin-bottom: 34px; }
.mihl-cv-group:last-child { margin-bottom: 0; }

.mihl-cv-group-head {
  font-family: var(--body);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 16px;
}
.mihl-cv-group-head-spaced { margin-top: 40px; }

/* ---------- entries ---------- */

.mihl-cv-entries { list-style: none; margin: 0; padding: 0; }

.mihl-cv-entry {
  display: grid;
  grid-template-columns: 66px 1fr;
  gap: 22px;
  padding: 15px 0;
  border-top: 1px solid var(--rule);
}
.mihl-cv-entry:first-child { border-top: none; padding-top: 0; }

.mihl-cv-entry-year {
  font-family: var(--mono);
  font-size: 0.76rem;
  color: var(--accent);
  padding-top: 2px;
  white-space: nowrap;
}

.mihl-cv-entry-body { min-width: 0; }

.mihl-cv-entry-title {
  font-family: var(--body);
  font-size: 0.99rem;
  font-weight: 600;
  line-height: 1.42;
  margin: 0;
  color: var(--ink);
}
.mihl-cv-entry-title a {
  text-decoration: none;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  padding-bottom: 1px;
  transition: color .16s ease;
}
.mihl-cv-entry-title a:hover { color: var(--accent); }

.mihl-cv-entry-venue {
  font-style: italic;
  font-size: 0.9rem;
  color: var(--ink-soft);
  margin: 4px 0 0;
}
.mihl-cv-entry-note {
  font-size: 0.875rem;
  color: var(--muted);
  margin: 6px 0 0;
  line-height: 1.55;
}

/* ---------- toggle ---------- */

.mihl-cv-toggle {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 999px;
  padding: 9px 18px;
  cursor: pointer;
  transition: border-color .16s ease, background .16s ease;
}
.mihl-cv-toggle:hover { border-color: var(--accent); background: var(--accent-soft); }

/* ---------- skills ---------- */

.mihl-cv-skills { margin: 0; }
.mihl-cv-skills > div {
  display: grid;
  grid-template-columns: 168px 1fr;
  gap: 22px;
  padding: 11px 0;
  border-top: 1px solid var(--rule);
}
.mihl-cv-skills > div:first-child { border-top: none; padding-top: 0; }
.mihl-cv-skills dt {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  padding-top: 2px;
}
.mihl-cv-skills dd { margin: 0; font-size: 0.94rem; }

.mihl-cv-memberships {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mihl-cv-memberships li {
  font-size: 0.86rem;
  padding: 6px 14px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  color: var(--ink-soft);
}

.mihl-cv-refs {
  font-size: 0.875rem;
  color: var(--muted);
  margin-top: 40px;
  padding-top: 18px;
  border-top: 1px solid var(--rule);
}

/* ---------- responsive ---------- */

@media (max-width: 860px) {
  .mihl-cv-shell {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0 24px 72px;
  }
  .mihl-cv-hero-inner { padding: 32px 24px 0; }
  .mihl-cv-rail {
    position: static;
    padding-top: 40px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--rule);
  }
  .mihl-cv-rail ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
  }
  .mihl-cv-rail li { margin-bottom: 0; }
  .mihl-cv-rail-meta { margin-top: 18px; border-top: none; padding-top: 0; }
  .mihl-cv-main { padding-top: 44px; }
  .mihl-cv-trace { height: 84px; }
}

@media (max-width: 560px) {
  .mihl-cv-entry {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .mihl-cv-skills > div { grid-template-columns: 1fr; gap: 2px; }
  .mihl-cv-areas { gap: 16px 28px; }
}

/* ---------- print ---------- */

@media print {
  .mihl-cv { background: #fff; font-size: 10.5pt; }
  .mihl-cv-trace, .mihl-cv-rail, .mihl-cv-links, .mihl-cv-toggle { display: none !important; }
  .mihl-cv-shell { display: block; padding: 0; max-width: none; }
  .mihl-cv-hero { padding-bottom: 18px; border-bottom: 1px solid #999; }
  .mihl-cv-hero-inner { padding: 0; max-width: none; }
  .mihl-cv-main { padding-top: 20px; }
  .mihl-cv-section { margin-bottom: 24px; page-break-inside: avoid; }
  .mihl-cv-entry { page-break-inside: avoid; }
  .mihl-cv-name { font-size: 26pt; }
}
`;
