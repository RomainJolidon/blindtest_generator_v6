console.log("[BT] content script loaded");

const POLL_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 5000;

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

function createOverlay() {
  const div = document.createElement("div");
  div.id = "bt-overlay";
  div.textContent = "Blindtest overlay injected ✓";
  return div;
}

async function init() {
  try {
    const player = await waitForElement("#movie_player");
    const overlay = createOverlay();
    player.appendChild(overlay);
    console.log("[BT] overlay injected into #movie_player");
  } catch (e) {
    console.error(e);
  }
}

init();
