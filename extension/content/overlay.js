console.log("[BT] content script loaded");

// ── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 5000;
const GUESS_DURATION = 30; // seconds
const ANSWER_DURATION = 10; // seconds

// ── Playlist ─────────────────────────────────────────────────────────────────

// YouTube IDs: best-effort from training knowledge — verify manually in Chrome.
// Track 1: xSMC6F_xH9I — "Coconut Mall" MKWii OST (low confidence)
// Track 2: NMEGBpEXENA — "One Summer's Day" Spirited Away (low confidence)
// Track 3: _dxNQIfGZss — Clair Obscur: Expedition 33 Main Theme (very low confidence)
const PLAYLIST = [
  {
    name: "Coconut Mall",
    source: "Mario Kart Wii",
    youtubeId: "cscuCIzItZQ",
    startAt: 0,
  },
  {
    name: "One Summer's Day",
    source: "Spirited Away",
    youtubeId: "iOYAl37AScY",
    startAt: 10,
  },
  {
    name: "Monoco Theme",
    source: "Clair Obscur: Expedition 33",
    youtubeId: "TcEdif_2PNY",
    startAt: 8,
  },
];

// ── State ────────────────────────────────────────────────────────────────────

const STATE = { LISTENING: "LISTENING", REVEAL: "REVEAL", END: "END" };

let currentIndex = 0;
let currentState = STATE.LISTENING;
let countdownInterval = null;
let isInitialised = false;

// ── Utilities ────────────────────────────────────────────────────────────────

function waitForElement(selector) {
  return new Promise((resolve, reject) => {
    const immediate = document.querySelector(selector);
    if (immediate) {
      resolve(immediate);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if (Date.now() - start > POLL_TIMEOUT_MS) {
        clearInterval(timer);
        reject(new Error(`[BT] Timed out waiting for ${selector}`));
      }
    }, POLL_INTERVAL_MS);
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clearCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// ── YouTube element hiding ────────────────────────────────────────────────────

const HIDDEN_SELECTORS = ["#title", "#owner", "ytd-watch-metadata"];

function hideYouTubeMetadata() {
  HIDDEN_SELECTORS.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.style.visibility = "hidden";
  });
}

function showYouTubeMetadata() {
  HIDDEN_SELECTORS.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.style.visibility = "";
  });
}

// ── Overlay creation ──────────────────────────────────────────────────────────

function getOrCreateOverlay() {
  let overlay = document.getElementById("bt-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "bt-overlay";
  }
  return overlay;
}

// ── Render functions ──────────────────────────────────────────────────────────

function renderListening(overlay, track, trackIndex, secondsLeft) {
  overlay.className = "bt-listening";
  overlay.innerHTML = `
    <div class="bt-track-counter">Track ${trackIndex + 1} / ${PLAYLIST.length}</div>
    <div class="bt-countdown" id="bt-countdown">${formatTime(secondsLeft)}</div>
    <div class="bt-subtitle">🎵 Guess the track</div>
    <div class="bt-hint">Press R to reveal early</div>
  `;
}

function renderReveal(overlay, track, trackIndex, secondsLeft) {
  overlay.className = "bt-reveal";
  overlay.innerHTML = `
    <div class="bt-answer-label">✓ Answer</div>
    <div class="bt-song-name">${track.name}</div>
    <div class="bt-source-title">${track.source}</div>
    <div class="bt-divider"></div>
    <div class="bt-countdown" id="bt-countdown">Next in ${formatTime(secondsLeft)}</div>
  `;
}

function renderEnd(overlay) {
  overlay.className = "bt-end";
  overlay.innerHTML = `
    <div class="bt-end-emoji">🎉</div>
    <div class="bt-end-title">Session complete</div>
    <div class="bt-end-subtitle">${PLAYLIST.length} tracks played</div>
  `;
}

// ── State transitions ─────────────────────────────────────────────────────────

function transitionToReveal(overlay) {
  clearCountdown();
  showYouTubeMetadata();
  currentState = STATE.REVEAL;

  const track = PLAYLIST[currentIndex];
  let secondsLeft = ANSWER_DURATION;
  renderReveal(overlay, track, currentIndex, secondsLeft);

  countdownInterval = setInterval(() => {
    secondsLeft -= 1;
    const el = document.getElementById("bt-countdown");
    if (el) el.textContent = `Next in ${formatTime(secondsLeft)}`;
    if (secondsLeft <= 0) transitionToRedirect(overlay);
  }, 1000);
}

function transitionToRedirect(overlay) {
  clearCountdown();
  const nextIndex = currentIndex + 1;

  if (nextIndex >= PLAYLIST.length) {
    currentState = STATE.END;
    renderEnd(overlay);
    showYouTubeMetadata();
    return;
  }

  currentIndex = nextIndex;
  const nextTrack = PLAYLIST[currentIndex];
  window.location.href = `https://www.youtube.com/watch?v=${nextTrack.youtubeId}`;
}

function transitionToListening(overlay) {
  clearCountdown();
  hideYouTubeMetadata();
  currentState = STATE.LISTENING;

  const track = PLAYLIST[currentIndex];
  let secondsLeft = GUESS_DURATION;
  renderListening(overlay, track, currentIndex, secondsLeft);

  seekVideo(track.startAt);

  countdownInterval = setInterval(() => {
    secondsLeft -= 1;
    const el = document.getElementById("bt-countdown");
    if (el) el.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) transitionToReveal(overlay);
  }, 1000);
}

// ── Video seeking ─────────────────────────────────────────────────────────────

function seekVideo(startAt) {
  waitForElement("video")
    .then((videoEl) => {
      const doSeek = () => {
        videoEl.currentTime = startAt;
        videoEl
          .play()
          .catch((e) => console.warn("[BT] play() blocked:", e.message));
        console.log(`[BT] seeked to ${startAt}s`);
      };
      if (videoEl.readyState >= 1) {
        doSeek();
      } else {
        videoEl.addEventListener("loadedmetadata", doSeek, { once: true });
      }
    })
    .catch((e) => console.error(e));
}

// ── Keyboard handler ──────────────────────────────────────────────────────────

function onKeyDown(e) {
  if (e.key === "r" || e.key === "R") {
    const overlay = document.getElementById("bt-overlay");
    if (overlay && currentState === STATE.LISTENING) {
      transitionToReveal(overlay);
    }
  }
}

// ── Main init ─────────────────────────────────────────────────────────────────

async function init() {
  // Determine which track we're on based on current URL
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");
  const idx = PLAYLIST.findIndex((t) => t.youtubeId === videoId);

  // Not a blindtest URL — do nothing
  if (idx === -1) return;
  currentIndex = idx;

  // Claim the init slot synchronously before any await (prevents TOCTOU race)
  if (isInitialised) return;
  isInitialised = true;

  try {
    const player = await waitForElement("#movie_player");
    const overlay = getOrCreateOverlay();
    player.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown); // browser deduplicates identical listeners
    transitionToListening(overlay);
    console.log(
      `[BT] initialised on track ${currentIndex + 1}/${PLAYLIST.length}`,
    );
  } catch (e) {
    isInitialised = false; // allow retry if player not found
    console.error(e);
  }
}

// ── SPA navigation ────────────────────────────────────────────────────────────

document.addEventListener("yt-navigate-finish", () => {
  console.log("[BT] yt-navigate-finish — re-initialising");
  isInitialised = false; // reset so next init() can proceed
  clearCountdown();
  showYouTubeMetadata();
  currentState = STATE.LISTENING;
  init();
});

init();
