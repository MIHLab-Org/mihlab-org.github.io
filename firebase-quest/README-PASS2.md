# Experience Machine — Pass 2 Short Quest release

**Publish the Firebase Realtime Database rules separately.** GitHub and Vite do not publish the Firebase rules.

## Scope and order

This release completes the Short Quest path: Realm I (Zhuangzi) → Realm II (Descartes) → Realm VI (Nozick) → Epilogue (STAY/UNPLUG). It does **not** add Realms III, IV, V, VII or the Full Campaign.

This is a **minimal patch on top of Pass 1 with the wildcard hotfix applied**. It does not contain the existing realm content JSON files or `firebase-config.js`, which remain unchanged in the GitHub project.

## Changed files

- `public/quest/app.js`: force Short Quest on new rooms; reject other modes on Start; clear status for all three realms and completed Epilogue; prevent duplicate Start clicks; do not probe unreadable room metadata as a nonmember.
- `public/quest/phase2-engine.js`: explicitly require a new Short Quest room to start; update the visible realm label for I, II, VI and the Exit.
- `public/quest/index.html`: Short Quest only; disabled `Full Campaign — coming soon` option; updated heading and non-game lobby copy; adds `id="game-realm-label"`.
- `firebase-quest/database.rules.json`: allow room creation only with `campaign: 'short'`; validate `campaign` as `'short'`; refuse new seat claims unless `status` is `lobby`; permit transition to started only from the Short Quest lobby.
- `firebase-quest/tests/run-all.mjs`: retains existing A–N checks and adds O–T release tests, plus exact 15-stage history-order verification.
- `firebase-quest/tests/PASS2-TEST-OUTPUT.txt`: captured result of the test runner on this package.
- `firebase-quest/README-PASS2.md`: this guide.

### Firebase changes, explicitly

No `/rooms/{code}/game`, `/abilities`, `/ballots` or `/whispers` fields are added or changed in this pass. Their existing validators remain unchanged.

Changed existing rule expressions:

1. `/rooms/$roomCode/.write`: requires `newData.child('campaign').val() === 'short'` instead of allowing `'short'` or `'full'`.
2. `/rooms/$roomCode/campaign/.validate`: allows only `'short'`.
3. `/rooms/$roomCode/seats/$slot/.write`: new seat claims require existing room status `'lobby'`. Existing members can still reconnect via their existing player record.
4. `/rooms/$roomCode/status/.write`: changing status to `'started'` requires the old status `'lobby'` and `campaign === 'short'`.

Unknown `/game` keys continue to be rejected by `$other: {".validate": false}`. The corrected `/game/readingReady/$uid` wildcard (without a second sibling `$other` wildcard) is retained.

## Installation and verification

1. Preserve the last working commit/tag before changes. Unzip from the repository root, keeping the paths above. Do not replace unchanged JSON, CSS, or Firebase config.
2. Keep **only game assets** in `public/quest`. Make sure `public/quest/database.rules.json` and `public/quest/tests/` do not exist.
3. Run `node firebase-quest/tests/run-all.mjs` from the repository root using Node 18 or newer. It uses no npm dependencies and exits nonzero on failure.
4. Publish `firebase-quest/database.rules.json` in Firebase Console → Realtime Database → Rules. Back up previously published rules first. **This step is separate from Git deployment.**
5. In your normal Vite project environment, run `npm run build` (with your project's dependencies already installed) and verify `dist/quest/index.html`, `dist/quest/app.js`, `dist/quest/phase2-engine.js`, and all three realm JSON files and the Epilogue JSON. The Node suite independently checks that the files can be served from `/quest/`.
6. Deploy the reviewed changes to the existing GitHub Pages site. Open `https://mihlab.org/quest/` in a fresh browser/private profile; avoid stale cached app files.
7. Create a new room with at least two devices (do not use an old room from before the rules change). Test I → II → VI → Exit, both endings and a tie, host handoff, reconnection, ability reveals, and phone readability.
8. Submit the contest entry only after successful live checks. The local Node suite is not a Firebase permission emulator or an actual production Vite build.

## Expected output

The local run passes **20 checks (A–N and O–T), 0 failed, 0 deferred**. Check `PASS2-TEST-OUTPUT.txt` for the complete captured run, including Monte Carlo rates. These vary slightly from run to run.

## Known limitations (intentional deferrals)

- **Actual Firebase security rules compilation and real-time multiplayer** were not exercised by Node. The Firebase console publish and two-device checks are required.
- **Production Vite build** was not executed with the project dependencies in this isolated workspace. The static file/HTTP check is not a substitute.
- **Trust model:** host clients coordinate dice, timers, and shared game state (free Firebase Spark architecture).
- **Ballot privacy:** technically sophisticated members with direct RTDB access can inspect room ballots before their UI reveal.
- **24-hour TTL:** rules deny expired rooms, but Spark does not automatically delete expired records.
- **Full Campaign** remains deliberately disabled and deferred until after contest submission.
