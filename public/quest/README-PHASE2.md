# The Experience Machine — Phase 2: Realm I

## Deploy
Copy `index.html`, `styles.css`, `app.js`, `phase2-engine.js`, `realm1-content.json`, and `firebase-config.js` into `public/quest/` (or the existing website's `/quest/` directory). Do not upload `database.rules.json` or the console test script to the public site. Publish `database.rules.json` in Firebase Console → Realtime Database → Rules **before** testing the new frontend. Preserve your old rules as a backup.

## Gameplay
Host creates a room, a second browser joins, host presses Start. All players choose answers in 45 seconds. The host publishes a simultaneous reveal, d20 result and modifier. On failure Grip drops by 2 and the encounter repeats with a hint. At 0 Grip the realm restarts at 6. Each encounter shows a lore card after success. Boss has Reconstruct, Spotlight (one random player answers, others whisper), Reply. Winning awards Butterfly Perspective and ends Realm I. The other realms remain for subsequent phases.

## Security limitations
Firebase Realtime Database `.read` permissions cascade. Every room member can inspect the raw `/ballots` values with developer tools, even though the UI withholds reveal until the round closes. The free Spark configuration uses a **client-side host coordinator** rather than a trusted server: the host chooses random dice results and timestamps, and a malicious host can fabricate `/game` values. This is suitable for cooperative classroom play, not adversarial or prize-based competition. Preventing raw ballot inspection and host tampering requires an authenticated server-side coordinator or a different schema plus restricted reads; it cannot be guaranteed by the current room-level read grant. A host leaving during an active round may result in a late transition until another host takes over.

## Acceptance checklist
1. Two devices create/join, choose classes, start, and see identical Realm I scene.
2. Vote in each device; check no on-screen reveal until everyone answers or 45 seconds elapse. The host's dice result matches on both devices.
3. Continue after a failed roll: Grip decreases by 2, Second Look appears with hint; repeat until passed.
4. Continue after success: lore appears before advancing.
5. Complete both encounters; boss Reconstruct, Spotlight (only chosen player answers; others whisper), Reply; see 3 Conviction pips fall and Butterfly Perspective reward.
6. Refresh/rejoin during a round; check same persisted round and choices.
7. Disconnect host and verify another connected player becomes host and can continue.
8. Run `security-test-console.js` from a non-host browser after joining a room. Denied writes should show PASS. The script does not prove every possible rule path.

## Known scope boundaries
This is a static-code build with syntax/JSON checks, **not** a Firebase-emulator or live multiplayer test. The game does not yet have Phase 3 continuation, production-quality dice animation, or tamper-proof secret ballots. Realm I's philosophical text is original and editable in `realm1-content.json`.
