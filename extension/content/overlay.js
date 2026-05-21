console.log("[BT] content script loaded");

// ── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 5000;

// ── Default playlist (fallback when no session is active) ────────────────────

const DEFAULT_GUESS_DURATION = 30; // seconds
const DEFAULT_ANSWER_DURATION = 10; // seconds

// YouTube IDs: best-effort from training knowledge — verify manually in Chrome.
// Track 1: xSMC6F_xH9I — "Coconut Mall" MKWii OST (low confidence)
// Track 2: NMEGBpEXENA — "One Summer's Day" Spirited Away (low confidence)
// Track 3: _dxNQIfGZss — Clair Obscur: Expedition 33 Main Theme (very low confidence)
const DEFAULT_PLAYLIST = [
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

// ── Active session (set by loadSession, used throughout) ─────────────────────

let PLAYLIST = DEFAULT_PLAYLIST;
let GUESS_DURATION = DEFAULT_GUESS_DURATION;
let ANSWER_DURATION = DEFAULT_ANSWER_DURATION;

// ── Session loading ───────────────────────────────────────────────────────────

function loadSession() {
  // Check if the URL hash carries a new session payload
  const hash = window.location.hash;
  if (hash.startsWith('#blindtest=')) {
    try {
      const encoded = hash.slice('#blindtest='.length);
      const json = decodeURIComponent(escape(atob(encoded)));
      const session = JSON.parse(json);
      sessionStorage.setItem('bt_session', JSON.stringify(session));
      // Remove the hash so it doesn't re-trigger on refresh
      history.replaceState(null, '', window.location.pathname + window.location.search);
      console.log('[BT] session loaded from URL hash, tracks:', session.tracks.length);
    } catch (e) {
      console.error('[BT] failed to decode session from hash:', e);
    }
  }

  // Try to read session from storage
  const stored = sessionStorage.getItem('bt_session');
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);
    if (!Array.isArray(session.tracks) || session.tracks.length === 0) return null;
    // Map website payload shape → internal shape (sourceTitle → source)
    const tracks = session.tracks.map((t) => ({
      name: t.name,
      source: t.sourceTitle,
      youtubeId: t.youtubeId,
      startAt: t.startAt,
    }));
    return {
      tracks,
      guessDuration: typeof session.guessDuration === 'number' ? session.guessDuration : DEFAULT_GUESS_DURATION,
      answerDuration: typeof session.answerDuration === 'number' ? session.answerDuration : DEFAULT_ANSWER_DURATION,
    };
  } catch (e) {
    console.error('[BT] failed to parse stored session:', e);
    return null;
  }
}

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

function hideYouTubeMetadata() {
  document.documentElement.classList.add("bt-active");
}

function showYouTubeMetadata() {
  document.documentElement.classList.remove("bt-active");
}

// ── Full cleanup (stop session) ───────────────────────────────────────────────

function cleanupBlindtest() {
  clearCountdown();
  showYouTubeMetadata();
  document.documentElement.classList.remove("bt-loading");
  const overlay = document.getElementById("bt-overlay");
  if (overlay) overlay.remove();
  isInitialised = false;
  currentState = STATE.LISTENING;
  currentIndex = 0;
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
  overlay.className = 'bt-end';
  overlay.innerHTML = `
    <div class="bt-end-emoji">🎉</div>
    <div class="bt-end-title">Session complete</div>
    <div class="bt-end-subtitle">${PLAYLIST.length} tracks played</div>
    <div class="bt-end-actions">
      <button class="bt-btn-secondary" id="bt-btn-close">Close</button>
      <button class="bt-btn-primary" id="bt-btn-restart">▶ Play Again</button>
    </div>
  `;
  // Buttons need pointer events despite overlay having none
  overlay.querySelector('#bt-btn-close').addEventListener('click', () => cleanupBlindtest());
  overlay.querySelector('#bt-btn-restart').addEventListener('click', () => {
    cleanupBlindtest();
    window.location.href = `https://www.youtube.com/watch?v=${PLAYLIST[0].youtubeId}&t=${PLAYLIST[0].startAt}`;
  });
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
  window.location.href = `https://www.youtube.com/watch?v=${nextTrack.youtubeId}&t=${nextTrack.startAt}`;
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
  // Load session from hash or sessionStorage, falling back to defaults
  const session = loadSession();
  if (session) {
    PLAYLIST = session.tracks;
    GUESS_DURATION = session.guessDuration;
    ANSWER_DURATION = session.answerDuration;
  } else {
    PLAYLIST = DEFAULT_PLAYLIST;
    GUESS_DURATION = DEFAULT_GUESS_DURATION;
    ANSWER_DURATION = DEFAULT_ANSWER_DURATION;
  }

  // Determine which track we're on based on current URL
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  const idx = PLAYLIST.findIndex((t) => t.youtubeId === videoId);

  // Not a blindtest URL — do nothing
  if (idx === -1) return;
  currentIndex = idx;

  // Hide player immediately to prevent video flickering before overlay is ready
  document.documentElement.classList.add('bt-loading');

  // Claim the init slot synchronously before any await (prevents TOCTOU race)
  if (isInitialised) return;
  isInitialised = true;

  try {
    const player = await waitForElement('#movie_player');
    document.documentElement.classList.remove('bt-loading');
    const overlay = getOrCreateOverlay();
    player.appendChild(overlay);
    document.addEventListener('keydown', onKeyDown); // browser deduplicates identical listeners
    transitionToListening(overlay);
    console.log(
      `[BT] initialised on track ${currentIndex + 1}/${PLAYLIST.length}`,
    );
  } catch (e) {
    document.documentElement.classList.remove('bt-loading');
    isInitialised = false; // allow retry if player not found
    console.error(e);
  }
}

// ── SPA navigation ────────────────────────────────────────────────────────────

document.addEventListener('yt-navigate-finish', () => {
  console.log('[BT] yt-navigate-finish — re-initialising');

  // Reload session (hash may have changed on navigation)
  const session = loadSession();
  if (session) {
    PLAYLIST = session.tracks;
    GUESS_DURATION = session.guessDuration;
    ANSWER_DURATION = session.answerDuration;
  } else {
    PLAYLIST = DEFAULT_PLAYLIST;
    GUESS_DURATION = DEFAULT_GUESS_DURATION;
    ANSWER_DURATION = DEFAULT_ANSWER_DURATION;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  const idx = PLAYLIST.findIndex((t) => t.youtubeId === videoId);

  if (idx === -1) {
    // Navigated away from blindtest — clean up everything
    cleanupBlindtest();
    return;
  }

  isInitialised = false; // reset so next init() can proceed
  clearCountdown();
  showYouTubeMetadata();
  currentState = STATE.LISTENING;
  init();
});

// ── Extension message handler (from popup) ────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'BT_STOP') cleanupBlindtest();
});

init();
