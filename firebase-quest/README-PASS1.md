# The Experience Machine — Pass 1: Realm VI and playtest fixes

## Scope
This patch builds Realm VI (Nozick) with two encounters, a three-phase boss, Machine dialogue, and structured philosophical lore. It preserves the existing Realm I and II JSON verbatim. The runtime has a provisional I → II → VI → Epilogue route for regression playtesting. Final Short Quest release gating, lobby labeling, and live release testing belong to Pass 2.

## Copy these files into your Vite repository
- `public/quest/app.js` — replace
- `public/quest/phase2-engine.js` — replace
- `public/quest/styles.css` — replace
- `public/quest/realm6-content.json` — add
- `firebase-quest/database.rules.json` — replace/add at repository root
- `firebase-quest/tests/run-all.mjs` — replace/add at repository root
- `firebase-quest/README-PASS1.md` — add at repository root
- `firebase-quest/tests/PASS1-TEST-OUTPUT.txt` — local check log

Do not place rules or tests under `public/`. Remove the obsolete `public/quest/database.rules.json` from your Git repository if it is still present; do not put a copy in the deployed directory. The game is served by Vite from `public/quest/`. Existing realm1/realm2/epilogue content files and `index.html` are unchanged.

## Firebase — republish required
Paste `firebase-quest/database.rules.json` into Firebase Console → Realtime Database → Rules → Publish. Back up the current published rules first. Simply committing the rules file to GitHub does not publish it to Firebase.

### Schema changes
- `/game/readingReady/{uid}`: member may write boolean true during `reading` or `epilogue-reading` only once; unknown children rejected.
- `/game/readingDeadline`: nonnegative timestamp (milliseconds).
- `/game/readingSeconds`: number in [15,30].
- `/game/bossWeakness`: empty string or `skeptic`, `empiricist`, `rationalist`, `pragmatist`.
- `/game/classUses/{uid}/r1|r2|r6/encounter|boss`: separate true flags; unknown keys rejected.
- `/game/rerollUses/{uid}/r6`: Boolean true, independent of Test.
- `/game/abilityReveals/{uid}/realm` and `/game/abilityEvents/{eventId}/realm`: now allow 6 (1 and 2 retained).
- `/game/insightCards/lived-agency` and `/game/usedCards/lived-agency`: Boolean true; all three known card IDs explicitly validated, unknown IDs rejected.
- `/game/history/{entry}`: `realm` (1,2,6), `stageId`, `title`, `choices/{uid}/{choice,stance,tag}`; unknown record fields rejected. Realm VI records are `r6-s10` through `r6-s14`.
- `/game/diceResults/{round}`: `die, modifier, learningBonus, weaknessBonus, total, dc, success, at`; unknown result fields rejected. No change to the dice algorithm.
- `/abilities/{uid}/cardId`: allow `lived-agency` in addition to the two existing cards.
- `/ballots/{uid}`: add stage index 13 as a Spotlight-only ballot; existing READING restrictions are enforced because ballot `.write` permits only `choice`, `debate` and `epilogue-vote`.
- No new `/whispers` fields. No new room-level record paths.

### Timing and gameplay
Encounter/boss READING durations are calculated from scene+option length and clamped to 15–30 seconds; Epilogue reading is scaled the same way. Everyone can tap Ready (or wait out the timer), after which CHOOSING runs for 30 seconds, or 45 seconds for a Spotlight boss stage. Abilities work during READING, CHOOSING, or debate. Class methods are once per player per encounter/boss section per realm, with independent campaign Insight and independent Pragmatist reroll receipts.

All player-visible evidence reveals identify the user and method. A pending vote stays selected through stale room snapshots. The request banner clears when the host's ability feedback arrives. Hidden host controls are inaccessible during debate.

## Node tests
From the repository root:
```
node firebase-quest/tests/run-all.mjs
```
Requires Node 18+ only; no npm install, Firebase credentials, or network access. The suite checks A–H and four requested regressions: present-class weaknesses, stale-render ballots, independent Test rerolls, and timed READING/CHOOSING. A further check verifies party-visible reveal attribution.

## Not live-verified
Firebase's actual rules compiler/permissions, reconnect across devices, time drift, real browser screen-reader behavior, and Vite deployment are not exercised by the Node-only test suite. Do **not** deploy over the contest submission build until you have published the rules and completed a fresh two-device playtest. The existing host-authoritative dice/phase model and inspectable ballots are deliberately unchanged.
