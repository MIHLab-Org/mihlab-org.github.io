/* ============================================================
   projects.ts — the one list of projects.
   Used by /projects (full why / what / how write-ups) and by the
   project cards on /media. Edit here and both pages update.
   ============================================================ */

export type Status = "Live" | "Nearly complete" | "In development" | "Completed" | "Ongoing";

export type Project = {
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
  /** One or two sentences for the project card on /media. */
  summary?: string;
};

export const LAST_UPDATED = "November 2026";

/* ------------------------------------------------------------
   PROJECT DATA — fill in why / what / how
   ------------------------------------------------------------ */

export const PROJECTS: Project[] = [
  {
    id: "mihlab",
    summary:
      "The lab behind everything here: reading paired with open-world game labs, research on AI self-models, and media that shows the method at work.",
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
    summary:
      "Walk through a forest with Socrates and talk with philosophers about reality, knowledge and value. Playable right here on this page.",
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
    summary:
      "A browser-based philosophy campaign for two to six players. Pick a class, vote, debate, and roll to see if your reasoning holds.",
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
    id: "experience-machine-elite",
    title: "The Experience Machine: Elite Dangerous",
    tagline: "Philosophical missions in the Milky Way",
    summary:
      "A plugin that puts philosopher mission givers into Elite Dangerous. Their missions are thought experiments: fly to Sol, then ask whether you went anywhere.",
    status: "In development",
    role: "Designer & developer",
    year: "2026",
    why:
      "The same motivation as the Experience Machine, in another world. Elite Dangerous already asks players to spend days crossing a galaxy that exists only on a screen. That makes it a natural place to ask what it means to travel, to be somewhere, or to have an experience at all.",
    what:
      "Another version of the Experience Machine, built inside Elite Dangerous. Players visit stations and settlements and meet mission givers, but the missions are not the usual cargo runs or bounties. Each one is a task meant to get the player thinking about a philosophical claim. One sends you to the Sol system. You are sitting at your computer the whole time, so did you travel anywhere? And if you didn't, why did it take so many days?",
    how:
      "A plugin for Elite Dangerous Market Connector (EDMC), the community tool that reads the game's official journal files. Mission givers are philosopher personas who reply in character, aloud and in on-screen subtitles. Missions are plain JSON files and course units are Markdown, so a new mission can be added without touching the code. It follows earlier Experience Machine prototypes for Skyrim and Fallout 4.",
    links: [
      { label: "View on GitHub", href: "https://github.com/MIHLab-Org/the-experience-machine-elite" },
    ],
  },
  {
    id: "realitycraft",
    summary:
      "AI agents living on a Minecraft server, used to test whether the story an agent is told about itself changes what it does.",
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
    summary:
      "Interviews with philosophers held inside Star Citizen, where the setting becomes part of the argument.",
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
    summary:
      "A conversation with Nick Baima about Why It's OK to Be a Gamer and Aristotle on virtue, set over a walk across Daymar.",
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
  {
    id: "tolle-lege",
    title: "Tolle Lege",
    tagline: "Christian philosophers: a course bibliography",
    summary:
      "A searchable bibliography of historical and contemporary Christian philosophers, organized by course and subject, for philosophers, pastors and Bible study leaders who want to teach from them.",
    status: "Live",
    role: "Creator",
    year: "2026",
    why:
      "Evangelical Christian philosophers, pastors, Bible study leaders and other teachers in the church often want to draw on the long tradition of Christian thought, but the older texts can be hard to find, hard to place and hard to read. Tolle Lege is meant to make those texts approachable, so historical Christian thinkers can become an ordinary part of a syllabus, a sermon series or a study group.",
    what:
      "A bibliography of 205 works, from the Church Fathers to today, sorted under the courses I teach: logic, philosophy of law, mind, personal identity, metaphysics, aesthetics and introduction to philosophy. Each entry says why the work belongs in that course. Courses have primers, subjects have pages on their authors, and many works have their own deep-dive pages.",
    how:
      "A lightweight web page that works well on a phone. You can search by thinker, title or topic, filter by course and by era, and show only texts that are free to read online. The name comes from Augustine's Confessions: \u201ctake up and read.\u201d",
    links: [{ label: "Open Tolle Lege", href: "/tolle-lege/" }],
  },
];
