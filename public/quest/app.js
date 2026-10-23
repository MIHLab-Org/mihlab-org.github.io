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
  const campaign = String(form.get("campaign") || "short");
  if (!validName(name)) return notice("Enter a display name between 1 and 20 characters.", "error");
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
          encounters: { activeId: "" },
          // Realtime Database omits empty objects; Phase 2 may populate these maps.
          votes: {},
          diceResults: {},
          grip: {},
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
    if (error.message === "NO_SEAT") notice("That room is full, unavailable, or expired. Check the code and try again.", "error");
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
    maybeTakeOverHost(room, code).catch((error) => console.warn("Host migration attempt failed", error));
  }, (error) => {
    console.error(error);
    notice(friendlyError(error), "error");
  });
}

function renderRoom(room) {
  const players = Object.entries(room.players || {}).map(([uid, player]) => ({ uid, ...player }));
  players.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  const isHost = room.hostUid === currentUser.uid;
  $("my-class").value = room.players?.[currentUser.uid]?.class || "skeptic";
  $("room-code-label").textContent = currentRoomCode;
  $("campaign-label").textContent = room.campaign === "full" ? "Full Campaign" : "Short Quest";
  $("player-count").textContent = `${players.length} / ${MAX_PLAYERS} players`;
  $("host-label").textContent = isHost ? "You are the host" : `Host: ${room.players?.[room.hostUid]?.name || "transferring…"}`;
  $("room-status").textContent = room.status === "started"
    ? "The party is ready. The encounter engine arrives in Phase 2."
    : "Waiting for the party to assemble…";
  $("start-game").hidden = !isHost || room.status === "started";
  $("start-game").disabled = !isHost || players.length < 2;
  $("start-help").hidden = !isHost || room.status === "started";
  $("phase1-started").hidden = room.status !== "started";

  const list = $("player-list");
  list.replaceChildren();
  players.forEach((player) => {
    const li = document.createElement("li");
    li.className = "player-card";
    const main = document.createElement("div");
    main.className = "player-main";
    const icon = document.createElement("span");
    icon.className = "player-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = CLASSES[player.class]?.icon || "◇";
    const details = document.createElement("div");
    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = player.name || "Player";
    const cls = document.createElement("div");
    cls.className = "player-class";
    cls.textContent = classLabel(player.class);
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
  if (!currentRoomCode || !localRoom || localRoom.hostUid !== currentUser.uid) return;
  const players = Object.keys(localRoom.players || {});
  if (players.length < 2) return notice("At least two players must join before the host can start.", "error");
  try {
    // Room-level writes are intentionally forbidden after creation. Write only to
    // the host-authorized status and game paths.
    await set(ref(db, `rooms/${currentRoomCode}/game`), {
      phase: "phase1-complete",
      schemaVersion: 1,
      startedAt: Date.now(),
      encounters: { activeId: "" },
      votes: {},
      diceResults: {},
      grip: {},
      insightCards: {}
    });
    await set(ref(db, `rooms/${currentRoomCode}/status`), "started");
    notice("Lobby test passed. Phase 1 is ready for multiplayer testing.", "success");
  } catch (error) {
    console.error(error);
    notice(friendlyError(error), "error");
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
