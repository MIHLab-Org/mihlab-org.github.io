# The Experience Machine — Phase 1

Static, no-build frontend for GitHub Pages with Firebase Realtime Database and Anonymous Authentication.

## Files

Copy these files into `MIHLab-Org/mihlab-org.github.io/quest/`:

- `index.html`
- `styles.css`
- `app.js`
- `firebase-config.js`

Publish `database.rules.json` through Firebase Console → Realtime Database → Rules. Keep `database.rules.json` and `security-test-console.js` as setup/test files; they do not need to be copied into the public website folder.

## Firebase setup

1. Open https://console.firebase.google.com/ and select **Create a project**.
2. Give it a project ID you can recognize, such as `experience-machine-mihlab`. Project IDs are permanent and globally unique. Analytics is optional for this game.
3. In **Build → Authentication → Get started → Sign-in method**, enable **Anonymous**.
4. In **Build → Realtime Database**, choose **Create Database**.
5. Choose a database region close to the expected players. For a mostly US audience, `us-central1` (Iowa) is a reasonable default; choose the closest supported US region offered in the console if your players are concentrated elsewhere. The database region cannot be changed after creation. Use Realtime Database, not Cloud Firestore.
6. Select **Locked mode** if asked. Then open the **Rules** tab, replace the rules with the contents of `database.rules.json`, and click **Publish**. Do not use open/test rules for a public game.
7. Register a Web app in Project settings (gear icon) → **General** → **Your apps** → Web (`</>`). Give it a name such as `experience-machine-web`. Registering the app does not require Firebase Hosting.
8. In the app setup/config panel, copy the `firebaseConfig` values into `firebase-config.js`. Specifically replace `apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`. The `databaseURL` is shown in Realtime Database; it often looks like `https://PROJECT_ID-default-rtdb.firebaseio.com` or `https://PROJECT_ID-REGION.firebasedatabase.app`.
9. Under Authentication → Settings → Authorized domains, ensure `mihlab.org` is listed. Add it if necessary. The exact console labels can change.
10. Commit the four frontend files to the `MIHLab-Org/mihlab-org.github.io` repository under `quest/`. Keep existing root files untouched.
11. Open `https://mihlab.org/quest/`. If the custom domain's HTTPS/DNS and GitHub Pages configuration are already correct, it should load there. Otherwise test first at the repository's GitHub Pages URL with `/quest/` appended.
12. Test with three separate browser profiles or devices. A normal tab and a private tab have separate anonymous identities; the same browser profile should retain its Firebase anonymous identity across refreshes.

## No build step

The page uses relative file paths (`./styles.css`, `./app.js`, `./firebase-config.js`) and imports Firebase SDK modules from Google's CDN. No npm, Node build, bundler, or output folder is required. The Firebase SDK is pinned to version `13.1.0` in `app.js` to match the supplied config snippet; keep all Firebase imports on the same version.

## Room expiry and cleanup

Rooms have an `expiresAt` timestamp 24 hours after creation. The rules deny room reads and writes after that timestamp, and the client treats expired rooms as unavailable. Existing expired room records cannot be reused automatically by this ruleset; the short-code generator will try another code if it collides with an old record. Realtime Database on the Spark plan does not provide a general scheduled TTL deletion mechanism, so expired records may remain stored until manually deleted in the console by an administrator. They are inaccessible through these rules after expiry.

## Phase 1 limitations

- The lobby, room membership, class selection, room synchronization, and basic host handoff are implemented as the first vertical slice. Phase 2 adds encounters and boss mechanics.
- Anonymous Authentication requires no user-facing login, but it is still used to give each browser a Firebase UID.
- A reconnect token is not a password or an account. This initial version relies on Firebase's persistent anonymous identity in the same browser profile. Clearing site data or switching browsers creates a new identity; cross-device recovery is not available without an additional recovery mechanism.
- Client-coordinated dice, timers, and host migration are not tamper-proof without a trusted server. Security rules restrict room access and writes, but cannot prove that a host's client-generated dice roll is honest.
- Host migration depends on Firebase presence state. A sudden network partition can delay disconnect detection.
- This is a Phase 1 implementation, not the complete seven-realm game. Start Game currently records that the lobby is ready; Phase 2 will replace that transition with the playable Realm I.

## Revised database security model

- After a room is created, writes at `/rooms/{code}` are not permitted. Room creation is the only operation allowed at that parent path.
- Each player may update only their own `/players/{uid}` record, with validated fields and values. A seat can be claimed only when empty; an occupied seat cannot be overwritten.
- The room host may update `/status` and the `/game` subtree. Other players cannot write there. The host cannot use this permission to edit player records, seats, room expiry, or the host UID.
- All Phase 2 shared state belongs under `/game`: `encounters`, `votes`, `diceResults`, `grip`, and `insightCards`, alongside `phase`, `schemaVersion`, and optional `startedAt`. The host-only write permission is granted at `/game`, so new fields under those game-state categories do not require broader room permissions. Empty maps may be absent in Realtime Database until the first entry is written; Phase 2 code should treat missing maps as empty maps.
- Host takeover is permitted only for a seated, connected player when the previous host's player record is marked disconnected.
- These rules are stricter than the first draft but are **not claimed to be verified against the live Firebase Rules engine**. Publish them to a test project or use the Firebase Emulator Suite before relying on them for a public game.

## Run the browser-console security checks

1. Publish `database.rules.json` in Firebase Console → Realtime Database → Rules.
2. Open the game, join a room, and preferably use a non-host player's browser.
3. Open DevTools → Console, paste the complete contents of `security-test-console.js`, and press Enter.
4. Check the `console.table` output. Every attempted forbidden operation should report `PASS — denied`; `FAIL` means a write/read unexpectedly succeeded, and `ERROR` means the result is inconclusive.
5. To check a known expired room, put its four-letter code in `EXPIRED_ROOM_CODE` near the top of the script before pasting it.

The console script uses same-value writes for current-room tests so a failed rule does not intentionally change names, classes, presence, status, or game phase. The optional expired-room metadata probe writes `0` to `expiresAt`; use it only with a known expired test room, never a live room.

Room codes are short and are not cryptographic secrets. Anonymous auth, seat claims, expiry, and rules help, but a server-backed join endpoint would provide stronger abuse protection. Never put a Firebase Admin SDK key or service-account credential in this repository.
