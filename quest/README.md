# The Experience Machine — Phase 1

Static, no-build frontend for GitHub Pages with Firebase Realtime Database and Anonymous Authentication.

## Files

Copy these files into `MIHLab-Org/mihlab-org.github.io/quest/`:

- `index.html`
- `styles.css`
- `app.js`
- `firebase-config.js`

Publish `database.rules.json` through Firebase Console → Realtime Database → Rules. Do **not** upload it as a public website file unless you want the rules source visible; it is not a secret, but it is configuration rather than a browser asset.

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

Rooms have an `expiresAt` timestamp 24 hours after creation. The rules deny room reads and writes after that timestamp, and the client treats expired rooms as unavailable. An expired room code may be reused. Realtime Database on the Spark plan does not provide a general scheduled TTL deletion mechanism, so expired records may remain stored until their code is reused or they are manually deleted in the console. They are inaccessible through these rules after expiry.

## Phase 1 limitations

- The lobby, room membership, class selection, room synchronization, and basic host handoff are implemented as the first vertical slice. Phase 2 adds encounters and boss mechanics.
- Anonymous Authentication requires no user-facing login, but it is still used to give each browser a Firebase UID.
- A reconnect token is not a password or an account. This initial version relies on Firebase's persistent anonymous identity in the same browser profile. Clearing site data or switching browsers creates a new identity; cross-device recovery is not available without an additional recovery mechanism.
- Client-coordinated dice, timers, and host migration are not tamper-proof without a trusted server. Security rules restrict room access and writes, but cannot prove that a host's client-generated dice roll is honest.
- Host migration depends on Firebase presence state. A sudden network partition can delay disconnect detection.
- This is a Phase 1 implementation, not the complete seven-realm game. Start Game currently records that the lobby is ready; Phase 2 will replace that transition with the playable Realm I.

## Security notes

The rules allow room reads only for an authenticated UID that holds one of the room's six seats. They do not allow listing `/rooms` or reading/deleting unrelated rooms. Room codes are short, so they should not be treated as cryptographic secrets; anonymous auth, seat claims, expiry, and rules are important layers, but a server-backed join endpoint would provide stronger abuse protection. Never put a Firebase Admin SDK key or service-account credential in this repository.
