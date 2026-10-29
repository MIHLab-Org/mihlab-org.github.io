# The Experience Machine — Pass 0: Abilities & philosophical lore

## Baseline and scope

Apply this patch to the working **Epilogue** version of `public/quest/` (the version of `phase2-engine.js` with Git blob SHA `f5e4453773eb0e56fb00d3e1d5c98a5f3d053101`). This baseline was verified against the GitHub copy of `MIHLab-Org/mihlab-org.github.io` on October 29, 2026. **No files were committed or deployed by this package.**

Changed/new files only:

- `public/quest/phase2-engine.js`: new class and Insight processing, bonus/conditional tags, visible events, explanations, lore formatting, dice helper.
- `public/quest/styles.css`: responsive styling for the new method buttons, personal reveals, and party event feed.
- `public/quest/realm1-content.json`: preserved scenes/questions/option identities; added theory cards and ability data, one ability-triggered conditional result, boss weakness labels; minimal three length-balancing adjustments across both realms.
- `public/quest/realm2-content.json`: same, plus rebalanced metadata to recognize Moore and Dewey as STRONG, an observation-dependent Workshop answer, and Lichtenberg-dependent Cogito answer.
- `firebase-quest/database.rules.json`: the **only** rules file to store in Git. Publish its contents separately in Firebase Console → Realtime Database → Rules.
- `firebase-quest/tests/run-all.mjs`: Node 18+ tests, run from repo root with `node firebase-quest/tests/run-all.mjs`.
- `firebase-quest/README-PASS0.md`: this file.

**Important:** Delete the obsolete `public/quest/database.rules.json` from Git, if it exists. It is not part of this patch and must not be published by Vite. Keep all tests and the rules file under `firebase-quest/` at the repository root. No Vite build-step changes are required.

## Class methods

Each connected player can use their **class method once per realm**, during either `choice` or `debate`:

- **Skeptic — Interrogate:** pick an option, see its `hiddenPremise`.
- **Empiricist — Observe:** see the stage `observation`. In Fish (Realm I) and the Workshop (Realm II), revealing new information changes which answer is STRONG.
- **Rationalist — Deduce:** see the stage `argumentForm` premises and conclusion. In Descartes' Cogito, the revelation changes the best-supported answer.
- **Pragmatist — Test:** choose an option to preview its `consequence`; the existing failed-roll reroll is preserved as a **separate, once-per-realm** action.

Insight cards remain boss rewards, usable once per **player per campaign**, independent of class use (and each card itself remains once per campaign). Accepted actions and rejected requests write party-visible messages; a personal detail appears only in that player’s interface, although room members technically have Firebase read access to all `/game` data.

Boss stages are DC 16. They display a weakness class and grant +5 if that class's method is used in the phase, including during debate. Boss weakness discoveries survive Second Look retries of the same phase.

## Rules changes — REPUBLISH REQUIRED

New `/game` keys (all explicitly present in the `$other: false` allowlist and validated):

| Key | Data | Validation |
|---|---|---|
| `classUses/{uid}/r1`, `classUses/{uid}/r2` | Boolean `true` | Only known per-realm flags; unknown child keys rejected |
| `insightUses/{uid}` | Boolean `true` | Boolean use receipt |
| `rerollUses/{uid}/r1`, `rerollUses/{uid}/r2` | Boolean `true` | Separate per-realm reroll receipt |
| `abilityReveals/{uid}` | Stage index, realm, class type, reveal detail, option ID, timestamp | Required field list, field-type validators, unknown fields denied |
| `abilityFeedback/{uid}` | Request ID, round ID, accepted flag, message, timestamp | Required field list, validators, unknown fields denied |
| `abilityEvents/{eventId}` | Player ID, round ID, realm, visible message, accepted flag, timestamp | Required field list, validators, unknown fields denied |
| `discoveredStages/s{index}` | Boolean `true` | Tracks conditional evidence across retries |
| `weaknessStages/s{index}` | Boolean `true` | Records a boss weakness triggered in the stage |
| `learningBonus` | Nonnegative number | Range 0–99; emitted by roll results |
| `weaknessBonus` | Number | Only 0 or 5 |

New `/abilities/{uid}` request keys: `requestId` (required string), `optionId` (optional validated string for Interrogate/Test), `intent` (optional, only `reroll` for Pragmatist). Existing `roundId`, `type`, and `cardId` are retained. The client may no longer overwrite its own pending ability request; the host clears requests after accepting or rejecting them. That prevents one rapid request from silently replacing another.

No new ballot or whisper fields. Their existing field validators and `$other: false` remain in effect. No changes to the `/rooms/{code}` room skeleton, host role, lobby, or `/game` ownership.

**Before publishing**, back up your live rules; paste this entire file into Firebase Console's Rules editor; click Publish. Saving `database.rules.json` to GitHub does **not** publish rules to Firebase.

## Balance

- The roll helper used by both the engine and Monte Carlo tests computes the rounded-down party average: STRONG +7, DEFENSIBLE +3, WEAK −2.
- Second Look remains +3 cumulative; Grip loss remains 1; zero Grip retains the active stage.
- All existing encounter DCs in Realms I and II are set to 10, so unanimous STRONG has ~90% success. The DC 12 test is included as a diagnostic (~80%) but no current encounter uses it. Boss DC 16 yields ~60% without weakness, ~85% with weakness.
- The explicit all-WEAK target (≤30%) is incompatible with a straight −2 average at DC 10, which otherwise succeeds 45% of the time. To satisfy that target without altering the mandated average, an all-WEAK party can pass only on a natural 20; this is a deliberate additional reasoning gate and is covered by tests.

## Tests

From the repository root:

```bash
node firebase-quest/tests/run-all.mjs
```

The test runner performs A–H checks; logs individual PASS/FAIL results and exits nonzero when a test fails. It uses Node built-ins, an in-memory Firebase adapter, the actual engine, simulated timers, and 100,000 trials per dice case. Test G fully covers **the implemented I → II → Epilogue path** with 2, 3, and 6 players and both endings. **The VI portion of C/D/E/G is explicitly DEFERRED to Pass 1**, because Realm VI does not exist yet. No fake VI completion is reported. No browser or live rules-engine tests are claimed.

## Manual two-device validation

1. Both devices can join a fresh room; a class ability used on one announces the use on both.
2. Interrogate/Test display option-specific information; Observe/Deduce show a readable scene clue/argument on a phone.
3. Use abilities once in the choice phase and again in a new realm; an exhausted method states why it cannot be used.
4. During a split vote, trigger an ability in debate; confirm the event appears to both devices before roll.
5. Observe at Joy of the Fish and Revisable Maps, then confirm the new evidence changes the evaluated STRONG answer; Deduce should do likewise at the Cogito.
6. A matching boss weakness shows +5, boss DC is 16, and Second Look still awards +3 per retry and costs 1 Grip.
7. Earn Butterfly Perspective by defeating Zhuangzi; spend Insight independently of class use, then verify it cannot be spent twice by the same player.
8. Finish Descartes and vote both Epilogue endings; check lore-card readability and party-event feedback on narrow phones.

## Known limitations

- Realm VI, the complete Short Quest route, and its full-run test are intentionally excluded until Passes 1 and 2. Do not submit this patch as the finished contest entry.
- The runner cannot compile or enforce Firebase security expressions: publish to Firebase and perform a two-device test after backing up live rules.
- The host still controls dice/timers and members can inspect shared `/game` paths. Ability details are UI-private but not cryptographically secret to authenticated room members. Reworking the backend for secret reveals would violate the agreed free Firebase architecture and deadline scope.
- An all-WEAK natural-20 exception is a deliberate gameplay rule to meet the required success-rate ceiling; review its classroom feel during the manual test.
