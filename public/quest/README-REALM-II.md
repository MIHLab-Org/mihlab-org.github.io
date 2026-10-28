# The Experience Machine — Realm II Integration (review build)

## Status

This is a **local review build**, not a production deployment. The current GitHub production versions of `app.js`, `phase2-engine.js`, `styles.css`, `index.html`, `realm1-content.json`, and `database.rules.json` were compared against the previous Realm I revision and matched byte-for-byte at the start of this work. No GitHub files, Firebase rules, or DNS were changed as part of this package.

## Install as one revision

Copy the entire contents of the `quest/` folder into your repository's `public/quest/` folder, replacing existing files and adding `realm2-content.json`. The `firebase-config.js` is the pre-existing public Firebase web configuration. Publish **the included `database.rules.json`** separately in Firebase Console > Realtime Database > Rules, after saving a backup of the working rules.

**Do not deploy only `app.js` by itself:** initialization loads both `realm1-content.json` and `realm2-content.json`.

## What changed

- Added Realm II — The Search for Certainty, using the approved story, two encounters, three-stage Descartes boss, Machine dialogue, and Insight card.
- Kept the complete Realm I content file unchanged.
- Added a host-controlled transition from Realm I victory into Realm II; no forced reset of Grip or earned / spent Insight cards. The boss counter resets when Realm II begins.
- Realm II starts with 60-second encounter choices, 45-second boss choices, and 30-second disagreement debate. Realm I's selection windows also increase to 60/45 seconds. Consensus ends the selection period early.
- Each realm has its own lobby-independent stage content, hint, clue, Machine dialogue, lore, dice animation timing, and victory/failure copy.
- Realm II Spotlight retains the one-voter / companion-whisper behavior.
- Realm II's palette uses CSS, not image assets.
- After Realm II victory, the interface says the next realm is not yet available. Realm VI and the epilogue remain future work.

## Why the Firebase rules require a change

The existing ballot and whisper rules hard-code Realm I's Spotlight at `stageIndex == 3`. Realm II Spotlight is `stageIndex == 8`, so the rules now authorize *only* the designated player to vote in either Spotlight; everyone else may whisper. Also, the optional `abilities/$uid/cardId` property now allows exactly the two known Insight IDs, so an unused Realm I card can be carried into Realm II. No new top-level database paths or broader host permissions were added.

## Local checks completed

- Both JSON documents and the database rules parse.
- Both JS files pass `node --check`.
- All literal DOM ID lookups resolve to elements in `index.html`.
- A deterministic 10-stage, two-player in-memory test passes: room start; both realms; countdowns; ballots; debate reason and single revision; consensus skip; Spotlight; DC/roll/result; first-encounter Insight rewards; completion and transfer with Grip/Insight preserved; no transition to unfinished Realm VI.

**Limitations:** The in-memory test does not emulate Firebase Security Rules or an actual multi-device connection. Before production, test the rule publication in Firebase Console and play both realms from two separate devices with one host handoff, at least one failed roll / Second Look, and a Spotlight whisper. Firebase rules do not create or migrate database state automatically; this build uses the existing game subtree and only its established room data.

## Files

- `quest/index.html`, `styles.css`, `app.js`, `firebase-config.js`: normal no-build site layout.
- `quest/phase2-engine.js`: shared Realm I–II engine.
- `quest/realm1-content.json`: unchanged approved Realm I content.
- `quest/realm2-content.json`: approved Realm II content.
- `quest/database.rules.json`: proposed rule modifications; must be published separately.
- `smoke-test.mjs`: optional local test. Execute with Node from any directory; its checked-in relative file paths can be adjusted if needed.
