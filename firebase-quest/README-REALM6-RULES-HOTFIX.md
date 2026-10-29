# Realm VI rules hotfix — October 29, 2026

The current test U fails because the local `firebase-quest/database.rules.json` still has the older Realm VI validation.

This rules file restores two narrowly scoped allowances already present in the corrected Pass 2 playtest package:

1. `/rooms/$roomCode/game/abilityReveals/$uid/stageIndex/.validate`: accept 0–14 instead of 0–9.
2. `/rooms/$roomCode/whispers/$uid/.write`: permit Spotlight whispering when `game.stageIndex` is 13 (Realm VI), as well as 3 and 8.

No new `/game`, `/abilities`, `/ballots`, or `/whispers` fields are added. No game source files are changed.

Copy `firebase-quest/database.rules.json` into your repository, keeping it outside `public/`. To preserve any local rule edits, compare the proposed file against your local version before replacement (`git diff -- firebase-quest/database.rules.json`).

Run `node firebase-quest/tests/run-all.mjs` from the repository root. The supplied regression run reports 27 passed, 0 failed. Once satisfied, separately paste the updated JSON into Firebase Console > Realtime Database > Rules and publish it. GitHub commits do not publish Firebase rules.
