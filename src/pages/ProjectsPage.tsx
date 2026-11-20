/* ============================================================
   ProjectsPage.tsx — Montaque Reynolds, PhD
   ------------------------------------------------------------
   Companion to CVPage.tsx. Same palette, type, and scoping
   approach (styles live under .mihl-pj) so it drops into the
   site without touching Tailwind or theme.css.

   TO UPDATE: edit the PROJECTS array below. Every project gets
   three short write-ups — why, what, how — plus optional links
   and an optional video.

   Empty fields are hidden on the live site. While running
   `npm run dev`, they show as dashed "draft" boxes so you can
   see what's still missing.

   VIDEO: paste a YouTube *embed* URL into `video`
   (https://www.youtube.com/embed/VIDEO_ID) or a path to a file
   in public/ (e.g. "/media/realitycraft-andy-jill.mp4").
   ============================================================ */

type Status = "Live" | "Nearly complete" | "In development" | "Completed" | "Ongoing";

type Project = {
  id: string;
  title: string;
  /** One line under the title. */
  tagline?: string;
  status: Status;
  /** Monty's role, e.g. "Founder", "Co-host", "Lead developer". */
  role?: string;
  year?: string;
  collaborators?: string;
  why?: string;
  what?: string;
  how?: string;
  links?: { label: string; href: string }[];
  /** YouTube embed URL or a /public path to an .mp4/.webm. */
  video?: string;
  /** Caption shown under the video. */
  videoCaption?: string;
};

const LAST_UPDATED = "November 2026";

/* ------------------------------------------------------------
   PROJECT DATA — fill in why / what / how
   ------------------------------------------------------------ */

const PROJECTS: Project[] = [
  {
    id: "mihlab",
    title: "MIHLab",
    tagline: "Moral Imagination and Hope Laboratory",
    status: "Ongoing",
    role: "Founder",
    why:
      "Songs, shows and feeds hand young people ready-made scripts about who they are, and a script repeated often enough starts to feel like a fact. I don't think any school, industry or algorithm is in a position to say what a person is. A person's worth is settled before anyone forms a verdict, and who they become is still theirs to work out. MIHLab exists to give people room to do that working out.",
    what:
      "MIHLab teaches philosophical thinking about who a person is, using narrative media: open-world games, classic and biblical texts, music and video. The work runs along three lines: curriculum that pairs readings with game labs, research on how an AI agent's beliefs about itself shape what it does, and media (games, videos and interviews) that show the method in action.",
    how:
      "Participants read first. Then they step into open-world games such as Star Citizen, Elite Dangerous and Minecraft and build situations where a choice is genuinely hard. Open worlds have real constraints and consequences, but they never tell the player what they are for, which is exactly the kind of space this question needs. Curriculum modules are released under Creative Commons, and no prior belief is required to take part.",
    links: [{ label: "mihlab.org", href: "/" }],
  },
  {
    id: "experience-machine",
    title: "The Experience Machine",
    status: "Nearly complete",
    role: "Designer & developer",
    why:
      "Robert Nozick asked whether you would plug into a machine that could give you any experience you wanted. David Chalmers, in Reality+, argues that virtual worlds can be genuine realities rather than illusions. Students usually meet these ideas on a page. I wanted a place where they could argue with them from inside a virtual world.",
    what:
      "A playable world where you meet philosopher characters and talk through questions about reality, knowledge and value. It began as a browser-based VR prototype on mihlab.org and is now being finished in Unity. Release is planned on Unity Play first, then on storefronts such as Steam and Meta Quest.",
    how:
      "Built in Unity, with branching dialogue written in Yarn Spinner and organized around the structure of Chalmers' Reality+. An earlier version ran in the browser on Three.js and WebXR. My students played a demo build as a study guide and gave feedback in class, and that feedback is shaping the final version.",
    links: [
      { label: "Play the Unity demo", href: "/play/" },
      { label: "Play the multiplayer quest", href: "/quest/" },
    ],
  },
  {
    id: "experience-machine-quest",
    title: "The Experience Machine: Multiplayer Quest",
    tagline: "A tabletop-style philosophy campaign for two to six players",
    status: "Live",
    role: "Designer & developer",
    year: "2026",
    why:
      "Tabletop role-playing already asks players to decide who their character is and what to do when a choice is hard. That makes it a natural home for philosophical questions, and a game that friends, families or a youth group can play together. The quest started as an entry for a game-design contest and grew into part of the Experience Machine.",
    what:
      "A browser-based multiplayer quest. Players choose a class (the Skeptic, the Empiricist, the Rationalist or the Pragmatist) and travel through realms built on the questions in Chalmers' Reality+, each ending with a thinker to face: Zhuangzi in Virtual Worlds, Descartes in The Search for Certainty, and Nozick in The Experience Machine itself.",
    how:
      "In each encounter the party votes on how to respond to a scene, debates, and rolls a d20 to see whether the reasoning holds. Lore cards then explain the theory behind each choice and its strongest objection. The motto is to understand the argument before you challenge the thinker. It runs in any browser with no account needed: one player creates a room and shares the code.",
    links: [{ label: "Play the quest", href: "/quest/" }],
  },
  {
    id: "realitycraft",
    title: "RealityCraft",
    tagline: "AI agents, Minecraft, and the stories we tell ourselves",
    status: "In development",
    role: "Researcher",
    why:
      "People learn who they are partly from the stories they are told about themselves. RealityCraft asks whether something similar holds for AI agents: does what an agent believes about itself change how it acts, explores and learns from others?",
    what:
      "A Minecraft server where AI agents, including Andy and Jill, live and work alongside one another. It serves as a research testbed and as a teaching tool in my philosophy of mind classes. RealityCraft studies AI agents only. No data from students or other participants is used in the research.",
    how:
      "The agents run on Mindcraft-CE, an open-source framework that connects language models to Minecraft. We change each agent's persona file, the story it is given about itself, and record what it does, comparing results across different language models. The videos show Andy and Jill at work on the server.",
    video: "",
    videoCaption: "Andy and Jill on the MIHLab Minecraft server.",
  },
  {
    id: "philosophers-in-the-verse",
    title: "Philosophers in the Verse",
    tagline: "In-universe interviews inside Star Citizen",
    status: "Ongoing",
    role: "Host",
    why:
      "Philosophy usually talks about the world from a distance. A game world turns a thought experiment into a place you can walk around in, and conversations change when the thing being discussed is right in front of you.",
    what:
      "An interview series held inside Star Citizen. Guests and I fly, walk and explore the game world together while talking through their work. Locations are chosen to fit each guest's ideas, so the setting becomes part of the argument.",
    how:
      "Each interview moves through three stages: arrival, conversation and debrief. Guests who can't play join over video, and the conversation is set against game footage recorded in the 'verse. Episodes are recorded, edited and shared with the guest for review before release.",
  },
  {
    id: "baima-interview",
    title: "Interview with Nick Baima",
    tagline: "Philosophers in the Verse",
    status: "Completed",
    role: "Interviewer",
    year: "2026",
    collaborators: "Nicholas R. Baima, Florida Atlantic University",
    why:
      "Nick Baima and Sarah Malanowski's Why It's OK to Be a Gamer (Routledge, 2024) defends gaming through virtue theory: the idea that play can help build good character. That is close to the heart of what MIHLab does, so his work was a natural place to start the series.",
    what:
      "A conversation about Why It's OK to Be a Gamer and what Aristotle's account of virtue has to say about gaming: whether time spent playing can be part of a life well lived, and what kinds of character games can help form.",
    how:
      "Nick and I spoke over Zoom. A friend and I then walked the surface of Daymar, one of Star Citizen's moons, and set our conversation over that footage, so the interview unfolds as a walk across another world.",
    links: [],
  },
];

/* ------------------------------------------------------------
   Helpers
   ------------------------------------------------------------ */

const IS_DEV = import.meta.env.DEV;

function Draft({ label }: { label: string }) {
  if (!IS_DEV) return null;
  return <p className="mihl-pj-draft">Draft: add {label}</p>;
}

function Video({ src, caption }: { src: string; caption?: string }) {
  const isEmbed = /youtube\.com\/embed|player\.vimeo\.com/.test(src);
  return (
    <figure className="mihl-pj-video">
      <div className="mihl-pj-video-frame">
        {isEmbed ? (
          <iframe
            src={src}
            title={caption ?? "Project video"}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={src} controls preload="metadata" playsInline />
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

const WWH: { key: "why" | "what" | "how"; label: string }[] = [
  { key: "why", label: "Why" },
  { key: "what", label: "What" },
  { key: "how", label: "How" },
];

function ProjectSection({ p, index }: { p: Project; index: number }) {
  const hasAnyWWH = WWH.some(({ key }) => p[key]);
  const links = (p.links ?? []).filter((l) => l.href);

  return (
    <section className="mihl-pj-project" id={p.id}>
      <header className="mihl-pj-project-head">
        <span className="mihl-pj-index">{String(index + 1).padStart(2, "0")}</span>
        <div className="mihl-pj-project-titles">
          <h2 className="mihl-pj-project-title">{p.title}</h2>
          {p.tagline && <p className="mihl-pj-tagline">{p.tagline}</p>}
          <ul className="mihl-pj-meta">
            <li className={`mihl-pj-status mihl-pj-status-${p.status.replace(/\s+/g, "-").toLowerCase()}`}>
              {p.status}
            </li>
            {p.role && <li>{p.role}</li>}
            {p.year && <li>{p.year}</li>}
            {p.collaborators && <li>With {p.collaborators}</li>}
          </ul>
        </div>
      </header>

      {p.video ? (
        <Video src={p.video} caption={p.videoCaption} />
      ) : p.videoCaption ? (
        <Draft label={`video (${p.videoCaption})`} />
      ) : null}

      {(hasAnyWWH || IS_DEV) && (
        <div className="mihl-pj-wwh">
          {WWH.map(({ key, label }) =>
            p[key] ? (
              <div className="mihl-pj-wwh-col" key={key}>
                <h3>{label}</h3>
                <p>{p[key]}</p>
              </div>
            ) : IS_DEV ? (
              <div className="mihl-pj-wwh-col" key={key}>
                <h3>{label}</h3>
                <Draft label={`the “${label.toLowerCase()}”`} />
              </div>
            ) : null
          )}
        </div>
      )}

      {links.length > 0 && (
        <nav className="mihl-pj-links" aria-label={`${p.title} links`}>
          {links.map((l) => {
            const external = /^https?:/.test(l.href);
            return (
              <a
                key={l.href}
                className="mihl-pj-btn"
                href={l.href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {l.label}
                {external && <span aria-hidden="true"> ↗</span>}
              </a>
            );
          })}
        </nav>
      )}
    </section>
  );
}

/* ------------------------------------------------------------
   Page
   ------------------------------------------------------------ */

export default function ProjectsPage() {
  return (
    <div className="mihl-pj">
      <style>{CSS}</style>

      <header className="mihl-pj-hero">
        <div className="mihl-pj-hero-inner">
          <p className="mihl-pj-eyebrow">Projects</p>
          <h1 className="mihl-pj-name">
            Montaque <span className="mihl-pj-name-alt">Reynolds</span>
          </h1>
          <p className="mihl-pj-role">
            Things I am building, have built, or am part of.
          </p>

          <nav className="mihl-pj-hero-links" aria-label="Related pages">
            <a className="mihl-pj-btn" href="/cv">
              Curriculum Vitae
            </a>
            <a className="mihl-pj-btn" href="/people">
              People
            </a>
            <a className="mihl-pj-btn" href="mailto:montaque@mihlab.org">
              Email
            </a>
          </nav>
        </div>
      </header>

      <div className="mihl-pj-shell">
        <aside className="mihl-pj-rail" aria-label="Projects">
          <ul>
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <a href={`#${p.id}`}>{p.title}</a>
              </li>
            ))}
          </ul>
          <p className="mihl-pj-rail-meta">Updated {LAST_UPDATED}</p>
        </aside>

        <main className="mihl-pj-main">
          {PROJECTS.map((p, i) => (
            <ProjectSection p={p} index={i} key={p.id} />
          ))}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Styles — scoped under .mihl-pj, tokens shared with .mihl-cv
   ------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Karla:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.mihl-pj {
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
.mihl-pj *, .mihl-pj *::before, .mihl-pj *::after { box-sizing: border-box; }
.mihl-pj a { color: inherit; }
.mihl-pj :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }

/* ---------- hero ---------- */

.mihl-pj-hero { border-bottom: 1px solid var(--rule); padding: 0 0 56px; }
.mihl-pj-hero-inner { max-width: 1080px; margin: 0 auto; padding: 72px 32px 0; }

.mihl-pj-eyebrow {
  font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--accent); margin: 0 0 14px;
}
.mihl-pj-name {
  font-family: var(--display); font-weight: 600;
  font-size: clamp(2.5rem, 6.5vw, 4.25rem); line-height: 1.02;
  letter-spacing: -0.025em; margin: 0;
}
.mihl-pj-name-alt { font-style: italic; font-weight: 400; }
.mihl-pj-role { font-size: 1.02rem; color: var(--ink-soft); margin: 16px 0 0; max-width: 52ch; }

.mihl-pj-hero-links, .mihl-pj-links { display: flex; flex-wrap: wrap; gap: 10px; }
.mihl-pj-hero-links { margin-top: 32px; }
.mihl-pj-links { margin-top: 26px; }

.mihl-pj-btn {
  display: inline-block; font-size: 0.86rem; font-weight: 500; text-decoration: none;
  padding: 9px 18px; border: 1px solid var(--rule); border-radius: 999px;
  transition: border-color .18s ease, color .18s ease;
}
.mihl-pj-btn:hover { border-color: var(--accent); color: var(--accent); }

/* ---------- shell ---------- */

.mihl-pj-shell {
  max-width: 1080px; margin: 0 auto; padding: 0 32px 96px;
  display: grid; grid-template-columns: 168px 1fr; gap: 64px;
}
.mihl-pj-rail { position: sticky; top: 40px; align-self: start; padding-top: 56px; }
.mihl-pj-rail ul { list-style: none; margin: 0; padding: 0; }
.mihl-pj-rail li { margin-bottom: 9px; }
.mihl-pj-rail a {
  font-family: var(--mono); font-size: 0.71rem; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted); text-decoration: none;
  transition: color .16s ease;
}
.mihl-pj-rail a:hover { color: var(--accent); }
.mihl-pj-rail-meta {
  font-family: var(--mono); font-size: 0.66rem; color: var(--muted);
  margin-top: 28px; padding-top: 14px; border-top: 1px solid var(--rule);
}

.mihl-pj-main { min-width: 0; padding-top: 56px; }

/* ---------- project ---------- */

.mihl-pj-project {
  padding-bottom: 64px; margin-bottom: 64px;
  border-bottom: 1px solid var(--rule); scroll-margin-top: 32px;
}
.mihl-pj-project:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.mihl-pj-project-head { display: grid; grid-template-columns: 66px 1fr; gap: 22px; }
.mihl-pj-index { font-family: var(--mono); font-size: 0.76rem; color: var(--accent); padding-top: 12px; }
.mihl-pj-project-title {
  font-family: var(--display); font-weight: 600; font-size: clamp(1.6rem, 3.2vw, 2.1rem);
  line-height: 1.15; letter-spacing: -0.015em; margin: 0;
}
.mihl-pj-tagline { font-style: italic; color: var(--ink-soft); margin: 6px 0 0; }

.mihl-pj-meta {
  list-style: none; margin: 14px 0 0; padding: 0;
  display: flex; flex-wrap: wrap; gap: 6px 18px;
  font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted);
}
.mihl-pj-status {
  color: var(--accent); background: var(--accent-soft);
  padding: 2px 10px; border-radius: 999px;
}
.mihl-pj-status-completed { color: var(--ink-soft); background: var(--paper-alt); }

/* ---------- video ---------- */

.mihl-pj-video { margin: 30px 0 0 88px; }
.mihl-pj-video-frame {
  position: relative; aspect-ratio: 16 / 9; background: var(--ink);
  border-radius: 6px; overflow: hidden;
}
.mihl-pj-video-frame iframe, .mihl-pj-video-frame video {
  position: absolute; inset: 0; width: 100%; height: 100%; border: 0;
}
.mihl-pj-video figcaption { font-size: 0.85rem; color: var(--muted); margin-top: 8px; }

/* ---------- why / what / how ---------- */

.mihl-pj-wwh { display: grid; gap: 22px; margin: 30px 0 0 88px; max-width: 68ch; }
.mihl-pj-wwh-col { display: grid; grid-template-columns: 64px 1fr; gap: 18px; }
.mihl-pj-wwh-col h3 {
  font-family: var(--mono); font-size: 0.7rem; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent);
  margin: 0; padding-top: 4px;
}
.mihl-pj-wwh-col p { margin: 0; font-size: 0.97rem; color: var(--ink-soft); white-space: pre-line; }

.mihl-pj-links { margin-left: 88px; }

.mihl-pj-draft {
  margin: 0; padding: 10px 12px; border: 1px dashed var(--muted); border-radius: 4px;
  font-family: var(--mono); font-size: 0.7rem; color: var(--muted);
}
.mihl-pj-project > .mihl-pj-draft { margin: 30px 0 0 88px; }

/* ---------- responsive ---------- */

@media (max-width: 860px) {
  .mihl-pj-shell { grid-template-columns: 1fr; gap: 0; padding: 0 24px 72px; }
  .mihl-pj-hero-inner { padding: 48px 24px 0; }
  .mihl-pj-rail { position: static; padding-top: 40px; padding-bottom: 8px; border-bottom: 1px solid var(--rule); }
  .mihl-pj-rail ul { display: flex; flex-wrap: wrap; gap: 8px 20px; }
  .mihl-pj-rail li { margin-bottom: 0; }
  .mihl-pj-rail-meta { margin-top: 18px; border-top: none; padding-top: 0; }
  .mihl-pj-main { padding-top: 44px; }
}
@media (max-width: 560px) {
  .mihl-pj-project-head { grid-template-columns: 1fr; gap: 4px; }
  .mihl-pj-index { padding-top: 0; }
  .mihl-pj-wwh-col { grid-template-columns: 1fr; gap: 4px; }
  .mihl-pj-video, .mihl-pj-wwh, .mihl-pj-links,
  .mihl-pj-project > .mihl-pj-draft { margin-left: 0; }
}
@media print {
  .mihl-pj-rail, .mihl-pj-hero-links, .mihl-pj-video, .mihl-pj-draft { display: none !important; }
  .mihl-pj-shell { display: block; padding: 0; }
}
`;
