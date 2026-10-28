# The Experience Machine — Realm I + II balance / bugfix release

This builds on `experience-machine-realm2-implementation-review.zip`, without changing the Realm I or Realm II authored content, Firebase configuration, or published database rules.

## Installation

Copy these **three changed files** into the existing `public/quest/` folder:

- `quest/phase2-engine.js`
- `quest/index.html`
- `quest/styles.css`

The ZIP also contains the full set of `quest/` assets for a convenient complete deployment. The remaining assets (`app.js`, `realm1-content.json`, `realm2-content.json`, `firebase-config.js`, `database.rules.json`) are unchanged from the previous Realm II package. Compare with any newer repository edits before replacing files.

**Firebase:** No rules publish or data migration is required. Spotlight rotation persists under `/game/encounters/spotlightSeen` and `/game/encounters/spotlightLast`, an existing host-writable and validated subtree. Existing auth/player/ballot schemas remain unchanged. Create a **fresh room** for testing: in-progress rooms may have earlier scoring, extra Insight cards, or legacy roll state.

## Balance changes

- Calculate `modifier = floor( sum(tag scores) / number of submitted votes )` for eligible submitted choices: STRONG = **+7**, DEFENSIBLE = **+3**, WEAK = **−2**. Absent ballots are not assigned a philosophical stance or counted as submitted votes; with no votes the modifier is zero.
- At DC 10, a unanimous STRONG party requires d20 ≥3: **18/20 = 90%**. At DC 12, it requires ≥5: **16/20 = 80%**. The modifier is independent of party size. All other class/Insight bonuses are additive as before.
- Second Look adds **+3 × attempt count**, cumulative across retries of the same challenge; shown separately in the result line. Pragmatist rerolls reuse the same attempt bonus.
- A failed check loses **1 Grip** (was 2).
- Fully Plugged In triggers at Grip 0, and **restarts the current encounter or exact boss phase**, with Grip set to 6 and a fresh selection deadline. Previous boss victories, Insight cards, and retry learning are preserved.

## Bug fixes

- DC is shown before rolling, but PASS/FAIL and the d20 equation are hidden until an actual roll exists and the animation is finished.
- Zhuangzi's Reconstruct identity illusion still applies to the party roster; vote reveal and debate reasons use the **actual player names**.
- Spotlight shows a prominent banner naming the selected player and class. A single Spotlight answer is labeled **“Spotlight response”**, not “Consensus reached.”
- Insight cards are awarded on completing the **final boss phase**, not on completing the realm's first encounter. Applies to both Zhuangzi and Descartes for consistency.
- A hidden host Continue button is now `hidden`, `disabled`, `inert`, `tabIndex=-1`, and `aria-hidden=true`; CSS makes `[hidden]` authoritative. Only enabled during applicable host-controlled progression.
- Spotlight selection tracks who has served, giving each **connected** participant a turn before anyone repeats, even across realms and repeated attempts. A new cycle avoids an immediate repeat when more than one participant is available.

## Automated checks

From the folder containing `smoke-test.mjs`, run:

```bash
node smoke-test.mjs
```

Checks cover 2/3/6-player averages, floor rounding, DC outcomes, cumulative Second Look, loss/restart behavior, Spotlight rotation with two and four players, real-name reveal, class/role banner, boss-only Insight rewards in both realms, and hidden host controls. JS syntax and HTML IDs are also verified.

## Live test checklist (two or more devices)

1. Create a new room. On the first encounter, confirm no pre-roll “FAIL” or “undefined” text appears.
2. Have everyone choose STRONG. The roll reports the party average +7 regardless of party size.
3. Cause a failed roll; verify −1 Grip, and then verify Second Look displays +3 (then +6 for a second retry).
4. At the Reconstruct boss, confirm the party list is scrambled while the revealed voter names are real.
5. At Spotlight, confirm the selected player's name and class are visible, only one voter is eligible, and the reveal says “Spotlight response.” Repeat through Realm II; Spotlight should rotate.
6. Confirm Butterfly Perspective is **not** available after Butterfly Dream, but is awarded after defeating Zhuangzi; likewise for Realm II's card after Descartes.
7. Test a zero-Grip restart during the boss. The party should remain at the same boss phase, with Grip 6 and a fresh selection timer.
8. During selection, press Tab on a keyboard or inspect with a screen reader: the hidden host progression button should not be reachable.

## Boundaries

These are local static and simulated gameplay tests, **not a live Firebase rules-engine or two-device verification**. No repository branch or live site was modified by generating this package. The hosted game still uses the host's browser to generate dice and coordinate state, as in the existing architecture.
