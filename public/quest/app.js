import { makeEngine } from "./phase2-engine.js";
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getAuth, signInAnonymously, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  getDatabase, ref, get, set, update, onValue, runTransaction, onDisconnect
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const $ = (id) => document.getElementById(id);
const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O; letters only
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_PLAYERS = 6;
const SHORT_REALM_LABELS = { 1: "I", 2: "II", 6: "VI" };
const CLASSES = {
  skeptic: { label: "The Skeptic", icon: "◈" },
  empiricist: { label: "The Empiricist", icon: "⌕" },
  rationalist: { label: "The Rationalist", icon: "△" },
  pragmatist: { label: "The Pragmatist", icon: "↻" }
};

let app, auth, db, currentUser = null;
let currentRoomCode = null;
let roomUnsubscribe = null;
let localRoom = null;
let busy = false;
let roomSession = 0;
let engine = null;

function notice(message, kind = "info") {
  const el = $("notice");
  el.textContent = message;
  el.className = `notice visible ${kind}`;
}
function clearNotice() {
  $("notice").className = "notice";
  $("notice").textContent = "";
}
function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 20);
}
function validName(value) {
  return value.length >= 1 && value.length <= 20;
}
function makeCode() {
  let result = "";
  for (let i = 0; i < 4; i++) result += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  return result;
}
function roomRef(code) { return ref(db, `rooms/${code}`); }
function seatRef(code, slot) { return ref(db, `rooms/${code}/seats/${slot}`); }
function playerRef(code, uid) { return ref(db, `rooms/${code}/players/${uid}`); }
function classLabel(value) { return CLASSES[value]?.label || "Adventurer"; }

function setBusy(value) {
  busy = value;
  document.querySelectorAll("form button").forEach((button) => button.disabled = value);
}
function showHome() {
  $("home-view").hidden = false;
  $("room-view").hidden = true;
}
function showRoom() {
  $("home-view").hidden = true;
  $("room-view").hidden = false;
}
function leaveLocalRoom() {
  roomSession++;
  if (roomUnsubscribe) roomUnsubscribe();
  roomUnsubscribe = null;
  currentRoomCode = null;
  localRoom = null;
  showHome();
}

function configIsReady() {
  return firebaseConfig.apiKey !== "PASTE_API_KEY_HERE" &&
    firebaseConfig.projectId !== "PASTE_PROJECT_ID_HERE" &&
    firebaseConfig.databaseURL !== "PASTE_REALTIME_DATABASE_URL_HERE";
}

async function initialize() {
  if (!configIsReady()) {
    notice("Firebase setup is needed. Follow README.md, then fill in firebase-config.js.", "error");
    return;
  }
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInAnonymously(auth);
    currentUser = credential.user;
    db = getDatabase(app);
    const response = await fetch('./realm1-content.json');
    if (!response.ok) throw new Error('Realm I content failed to load');
    const content = await response.json();
    const realm2Response = await fetch('./realm2-content.json');
    if (!realm2Response.ok) throw new Error('Realm II content failed to load');
    const realm2Content = await realm2Response.json();
    const realm6Response = await fetch('./realm6-content.json');
    if (!realm6Response.ok) throw new Error('Realm VI content failed to load');
    const realm6Content = await realm6Response.json();
    const epilogueResponse = await fetch('./epilogue-content.json');
    if (!epilogueResponse.ok) throw new Error('Epilogue content failed to load');
    const epilogueContent = await epilogueResponse.json();
    engine = makeEngine({ db, api: { ref, set, update, runTransaction },
      getContext: () => ({ room: localRoom, uid: currentUser?.uid, code: currentRoomCode }),
      content, realm2Content, realm6Content, epilogueContent, notice });
    notice("Connected. Create a room or join your party.", "success");
  } catch (error) {
    console.error(error);
    notice(friendlyError(error), "error");
  }
}

function friendlyError(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) return "Firebase denied that action. Check Anonymous Authentication and the published Realtime Database rules.";
  if (code.includes("network")) return "Network connection failed. Check your connection and the Firebase database URL.";
  if (code.includes("auth/operation-not-allowed")) return "Anonymous sign-in is disabled. Enable it in Firebase Authentication → Sign-in method.";
  if (code.includes("app/invalid-api-key")) return "The Firebase API key in firebase-config.js is missing or incorrect.";
  return `Something went wrong (${code || "unknown error"}). Check the browser console for details.`;
}

async function createRoom(event) {
  event.preventDefault();
  if (busy || !currentUser || !db) return;
  const form = new FormData(event.currentTarget);
  const name = cleanName(form.get("name"));
  const playerClass = String(form.get("class") || "skeptic");
  // This release deliberately offers only Short Quest. The full campaign is not built.
  const campaign = "short";
  if (!validName(name)) return notice("Enter a display name between 1 and 20 characters.", "error");
  if (!CLASSES[playerClass]) return notice("Choose an available class.", "error");
  setBusy(true);
  notice("Creating your room…");
  try {
    for (let attempt = 0; attempt < 12; attempt++) {
      const code = makeCode();
      const now = Date.now();
      const room = {
        hostUid: currentUser.uid,
        createdAt: now,
        expiresAt: now + ROOM_TTL_MS,
        status: "lobby",
        campaign,
        seats: { "1": currentUser.uid },
        players: {
          [currentUser.uid]: {
            name, class: playerClass, joinedAt: now, connected: true
          }
        },
        game: {
          phase: "lobby",
          schemaVersion: 1,
          encounters: { activeId: "lobby" },
          // Realtime Database omits empty objects; Phase 2 may populate these maps.
          votes: {},
          diceResults: {},
          grip: { value: 10 },
          insightCards: {}
        }
      };
      try {
        // A plain set avoids a transaction read at /rooms/$code, which is intentionally
        // unreadable to non-members. Rules allow creation only if the code is unused
        // or its previous room has expired.
        await set(roomRef(code), room);
        await enterRoom(code);
        return;
      } catch (error) {
        // A permission denial can mean this short code is already occupied. Try another.
        // After several failures, surface a setup error rather than silently proceeding.
        if (attempt === 11) throw error;
      }
    }
    notice("Couldn't find an available room code. Please try again.", "error");
  } catch (error) {
    console.error(error);
    notice(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function joinRoom(event) {
  event.preventDefault();
  if (busy || !currentUser || !db) return;
  const form = new FormData(event.currentTarget);
  const code = String(form.get("code") || "").toUpperCase().replace(/[^A-Z]/g, "");
  const name = cleanName(form.get("name"));
  const playerClass = String(form.get("class") || "skeptic");
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/.test(code)) return notice("Enter a valid four-letter room code (I and O are not used).", "error");
  if (!validName(name)) return notice("Enter a display name between 1 and 20 characters.", "error");
  if (!CLASSES[playerClass]) return notice("Choose an available class.", "error");
  setBusy(true);
  notice("Looking for your room…");
  try {
    // Existing anonymous auth persists in this browser, so rejoining uses the same UID.
    const existingPlayer = await get(playerRef(code, currentUser.uid)).catch(() => null);
    if (existingPlayer?.exists()) {
      await update(playerRef(code, currentUser.uid), { name, class: playerClass });
      await enterRoom(code);
      return;
    }

    // The room is intentionally unreadable until a seat is claimed. Never probe
    // /status as a nonmember: Firebase would reject that read. The seat write
    // rule rejects late joining when the quest has already begun.
    // Claim one of six fixed seats. The database rules prevent two players claiming the same seat.
    let claimed = false;
    for (let slot = 1; slot <= MAX_PLAYERS; slot++) {
      const result = await runTransaction(seatRef(code, slot), (value) => {
        if (value === null) return currentUser.uid;
        return;
      }, { applyLocally: false }).catch(() => null);
      if (result?.committed) {
        claimed = true;
        break;
      }
    }
    if (!claimed) throw new Error("NO_SEAT");
    await set(playerRef(code, currentUser.uid), {
      name, class: playerClass, joinedAt: Date.now(), connected: true
    });
    await enterRoom(code);
  } catch (error) {
    console.error(error);
    if (error.message === "NO_SEAT") notice("That room is full, already started, unavailable, or expired. Check the code and try again.", "error");
    else notice(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function enterRoom(code) {
  if (roomUnsubscribe) roomUnsubscribe();
  currentRoomCode = code;
  const thisSession = ++roomSession;
  const myPlayer = playerRef(code, currentUser.uid);
  await onDisconnect(ref(db, `rooms/${code}/players/${currentUser.uid}/connected`)).set(false);
  await update(myPlayer, { connected: true, lastSeenAt: Date.now() });
  showRoom();
  $("room-code-label").textContent = code;
  notice(`Joined room ${code}. Your seat is synced.`, "success");

  roomUnsubscribe = onValue(roomRef(code), (snapshot) => {
    if (thisSession !== roomSession) return;
    if (!snapshot.exists()) {
      leaveLocalRoom();
      notice("This room no longer exists or has expired. Create or join another room.", "error");
      return;
    }
    const room = snapshot.val();
    if (Number(room.expiresAt || 0) <= Date.now()) {
      leaveLocalRoom();
      notice("This room has expired. Rooms are valid for 24 hours.", "error");
      return;
    }
    localRoom = room;
    renderRoom(room);
    engine?.render(room);
    if ($('notice').textContent.startsWith('Request sent') && room.game?.abilityFeedback?.[currentUser.uid]?.roundId === room.game?.roundId) clearNotice();
    maybeTakeOverHost(room, code).catch((error) => console.warn("Host migration attempt failed", error));
  }, (error) => {
    console.error(error);
    notice(friendlyError(error), "error");
  });
}

function renderRoom(room) {
  const game = room.game || {};
  const twistActive = game.realm === 1 && game.stageIndex === 2 &&
    !["lore", "realm-complete"].includes(game.phase) &&
    !(game.phase === "result" && game.success === true);
  const players = Object.entries(room.players || {}).map(([uid, player]) => ({ uid, ...player }));
  players.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  const isHost = room.hostUid === currentUser.uid;
  $("my-class").value = room.players?.[currentUser.uid]?.class || "skeptic";
  $("room-code-label").textContent = currentRoomCode;
  $("campaign-label").textContent = room.campaign === "full" ? "Full Campaign — unavailable" : "Short Quest · I → II → VI → Epilogue";
  $("player-count").textContent = `${players.length} / ${MAX_PLAYERS} players`;
  const hostDisplayUid = twistActive ? (game.identityMask?.[room.hostUid] || room.hostUid) : room.hostUid;
  $("host-label").textContent = isHost ? "You are the host" : `Host: ${room.players?.[hostDisplayUid]?.name || "transferring…"}`;
  document.querySelector(".class-picker").hidden = room.status === "started";
  const connectedCount = players.filter(player => player.connected).length;
  $("room-status").textContent = game.phase === "epilogue-finished"
    ? "Short Quest complete — the party has reached an ending."
    : game.phase?.startsWith("epilogue-")
      ? "The party has reached the Exit."
      : room.status === "started"
        ? `Realm ${SHORT_REALM_LABELS[game.realm] || "I"} is underway.`
        : "Waiting for the party to assemble…";
  $("start-game").hidden = !isHost || room.status !== "lobby";
  $("start-game").disabled = !isHost || room.status !== "lobby" || room.campaign !== "short" || connectedCount < 2;
  $("start-help").hidden = !isHost || room.status !== "lobby";
  $("start-help").textContent = room.campaign !== "short"
    ? "Full Campaign is coming soon. Create a new Short Quest room."
    : connectedCount < 2 ? "Two connected players are required to start the Short Quest."
    : "Ready: the host can start the Short Quest.";
  $("phase1-started").hidden = true;

  const list = $("player-list");
  list.replaceChildren();
  players.forEach((player) => {
    // Visual identity swap only: no changes to Firebase player names, classes or auth.
    const identityUid = twistActive ? (game.identityMask?.[player.uid] || player.uid) : player.uid;
    const displayed = room.players?.[identityUid] || player;
    const li = document.createElement("li");
    li.className = "player-card";
    const main = document.createElement("div");
    main.className = "player-main";
    const icon = document.createElement("span");
    icon.className = "player-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = CLASSES[displayed.class]?.icon || "◇";
    const details = document.createElement("div");
    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = displayed.name || "Player";
    const cls = document.createElement("div");
    cls.className = "player-class";
    cls.textContent = classLabel(displayed.class);
    details.append(name, cls);
    main.append(icon, details);
    const badges = document.createElement("div");
    badges.className = "player-badges";
    if (player.uid === room.hostUid) {
      const hostBadge = document.createElement("span");
      hostBadge.className = "pill host";
      hostBadge.textContent = "HOST";
      badges.append(hostBadge);
    }
    const statusBadge = document.createElement("span");
    statusBadge.className = "pill";
    statusBadge.textContent = player.connected ? "CONNECTED" : "RECONNECTING";
    badges.append(statusBadge);
    li.append(main, badges);
    list.append(li);
  });
}

async function maybeTakeOverHost(room, code) {
  if (!currentUser || room.hostUid === currentUser.uid) return;
  const oldHost = room.players?.[room.hostUid];
  const me = room.players?.[currentUser.uid];
  if (!oldHost || oldHost.connected !== false || !me || me.connected !== true) return;
  // The rules independently verify that the previous host is disconnected and the new host is a room member.
  await runTransaction(ref(db, `rooms/${code}/hostUid`), (currentHostUid) => {
    if (currentHostUid !== room.hostUid) return;
    if (room.players?.[currentHostUid]?.connected !== false) return;
    if (room.players?.[currentUser.uid]?.connected !== true) return;
    return currentUser.uid;
  }, { applyLocally: false });
}

async function startGame() {
  if (!engine || !localRoom || localRoom.hostUid !== currentUser.uid) return;
  if (localRoom.status !== "lobby" || localRoom.campaign !== "short") {
    notice("Only the Short Quest can be started in this release.", "error");
    return;
  }
  const start = $("start-game");
  start.disabled = true;
  try { await engine.begin(); }
  catch (error) {
    console.error(error);
    notice(friendlyError(error), "error");
    if (localRoom?.status === "lobby") start.disabled = false;
  }
}

async function leaveRoom() {
  if (!currentRoomCode || !currentUser) return;
  const code = currentRoomCode;
  const room = localRoom;
  try {
    // Deliberately keep the seat and player record so the same browser can reconnect.
    await update(playerRef(code, currentUser.uid), { connected: false, lastSeenAt: Date.now() });
    // Other connected players observe this presence change and can take over
    // through the guarded hostUid rule. This client is leaving the room view.
  } catch (error) {
    console.warn("Leave presence update failed", error);
  }
  leaveLocalRoom();
  notice("You left the room view. Rejoin with the same room code in this browser to reclaim your seat.", "info");
}

$("create-form").addEventListener("submit", createRoom);
$("join-form").addEventListener("submit", joinRoom);
$("start-game").addEventListener("click", startGame);
$("leave-room").addEventListener("click", leaveRoom);
$("my-class").addEventListener("change", async (event) => {
  if (!currentRoomCode || !currentUser || !localRoom || localRoom.status !== "lobby") return;
  try {
    await update(playerRef(currentRoomCode, currentUser.uid), { class: event.target.value });
    notice("Your class has been updated.", "success");
  } catch (error) {
    console.error(error);
    notice(friendlyError(error), "error");
  }
});
$("copy-code").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentRoomCode || "");
    notice("Room code copied.", "success");
  } catch {
    notice(`Share this room code: ${currentRoomCode}`, "info");
  }
});
$("join-code").addEventListener("input", (event) => {
  event.target.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
});

initialize();

// A hidden tab has its timers throttled by the browser, which would freeze the
// host's phase clock for everyone. Report hidden pages as disconnected so a
// visible player takes over hosting through the existing guarded handoff, and
// report presence again when the page becomes visible.
document.addEventListener("visibilitychange", () => {
  if (!currentUser || !currentRoomCode || !db) return;
  const visible = document.visibilityState === "visible";
  update(playerRef(currentRoomCode, currentUser.uid), { connected: visible, lastSeenAt: Date.now() })
    .catch((error) => console.warn("Presence update failed", error));
});
