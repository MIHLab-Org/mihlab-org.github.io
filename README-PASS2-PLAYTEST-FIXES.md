# Short Quest — Pass 2 playtest corrections and release integration

**Republish Firebase rules.** Publish `firebase-quest/database.rules.json` in Firebase Console → Realtime Database → Rules. Do not put the JSON or tests in `public/`. Back up current Firebase rules first. This version includes Pass 2 Short Quest-only room and late-join protections, plus Realm VI validation corrections.

## Baseline and installation

This ZIP is a minimal replacement for the **current GitHub Pass 1 + wildcard hotfix** repository, bringing it through the Pass 2 Short Quest integration and the October 29 four-player playtest corrections. It does not change `firebase-config.js`, `styles.css`, `epilogue-content.json`, or any unrelated site code.

Copy the paths in the ZIP to the **repository root**, preserving directory names:

- `public/quest/app.js` — Pass 2 Short Quest-only room and lobby logic (needed if GitHub is still on Pass 1).
- `public/quest/index.html` — Short Quest lobby heading and generic, non-stale game header.
- `public/quest/phase2-engine.js` — action-only ability labels, neutral pre-lore results, immediate READING method processing, condition disclosure, empty-ballot failure, and the dynamic realm header.
- `public/quest/realm1-content.json`, `realm2-content.json`, `realm6-content.json` — all 15 distinct stage observations and arguments, plus the Hall's Observe conditional. Original scenes, questions, option action text, theory labels, and lore cards are unchanged.
- `firebase-quest/database.rules.json` — corrected Realm VI stage validation and Spotlight whisper authorization on top of the Pass 2 room protections.
- `firebase-quest/tests/run-all.mjs` — plain Node 18+ test runner (no npm install needed), including N/O/P/Q and the Realm VI rules check U.
- `firebase-quest/tests/PASS2-PLAYTEST-FIXES-OUTPUT.txt` — complete captured test output.

## New or changed database fields and validations

**No new `/game` keys or new `/abilities`, `/ballots`, `/whispers` fields.** The existing paths remain intact, and `/game/$other` continues to reject unknown keys. A new content conditional for the Hall uses the **existing** `/game/discoveredStages/s5 = true` path, already covered by `discoveredStages/$stage` validation.

Changed Firebase validators:

1. `/rooms/$roomCode/game/abilityReveals/$uid/stageIndex`: accepted numeric stage range is **0–14** (was 0–9, blocking information reveals in Realm VI).
2. `/rooms/$roomCode/whispers/$uid/.write`: Spotlight whispers are allowed at stage **13** in addition to stages 3 and 8, still limited to a connected, non-Spotlight player during CHOOSING, with permitted emoji fields only.
3. This replacement file also contains the earlier Pass 2 policy: room creation is Short Quest only and seat claims stop when gameplay starts. Publish the entire rules file, not just individual excerpts.

## Playtest changes

- Interrogate and Test buttons use the option action text, shortened if necessary; neither their results nor the initial result reveal exposes stance labels, tags, or internal option IDs.
- Observations describe concrete, scene-specific clues. Every stage has a unique premise–conclusion argument.
- The Hall of Ordinary Things now reacts to **Observe**: without the evidence, **take the familiar key** is strongest; after Observe reveals two incompatible key impressions, **test the key together** becomes strongest. The information reveal explains the change using the action text, while names/tags wait for lore.
- During READING, the host processes abilities instead of leaving them queued until CHOOSING.
- Zero-ballot rounds show **“No answers submitted — the check fails automatically.”** The UI hides the die and total, even if the host's internal roll happens to exceed DC.
- On every transition the UI labels Realm I, Realm II, Realm VI, or the Exit. Full Campaign remains disabled and labeled “coming soon.”

## Run the checks

At repository root:

```
node firebase-quest/tests/run-all.mjs
```

Expected: **25 passed, 0 failed, 0 deferred.** Monte Carlo figures vary. The checks cover DOM wiring, field coverage, structural rule wildcard collisions, 15 stages with lore, diversity/length, dice probabilities, 2/3/6-player complete journeys, abilities and visibility, boss weakness class selection, vote persistence, reroll independence, READING/CHOOSING, N (pre-lore leak), O (unique observations and arguments), P (conditional evidence), Q (empty ballot auto-fail), and U (Realm VI validation coverage).

## Vite and Firebase release verification

1. Run the Node suite above and your existing site build (`npm run build`) in your own Vite environment; ensure `dist/quest/` has `index.html`, engine, and all realm and epilogue JSON files.
2. Publish the updated Firebase rules separately. The GitHub upload by itself **does not** publish Firebase rules.
3. Deploy the changed `public/quest/` assets to your site and hard-refresh both devices; always create a new room after a rules update.
4. Test Interrogate and Test on different choices, Observe in the Hall, empty-ballot auto-fail, Realm II and Realm VI headings, and non-Spotlight whispers in Realm VI's second boss phase.
5. Finish the Short Quest and verify STAY, UNPLUG, and an even-party tie with a host decision. On phones, evaluate the pacing and readability during READING, CHOOSING, and lore.

## Known unresolved risks / intentional scope

- Rules JSON and expressions were checked locally but **not compiled or executed by the live Firebase Rules service**. Actual publishing and two-device permission checks are essential.
- Node mock testing does not replace a production Vite build or live, browser-based Firebase playtest.
- Host client still coordinates dice/timers; technically sophisticated room members can inspect ballots directly via Firebase. Replacing that trust model is out of scope before the contest.
- Firebase denies access after 24 hours but does not automatically delete expired room records.
- Realms III, IV, V, VII and Full Campaign remain after-submission work; no code was added for them.
