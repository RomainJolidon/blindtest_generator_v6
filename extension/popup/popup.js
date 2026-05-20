// First YouTube ID must match PLAYLIST[0].youtubeId in overlay.js
const FIRST_TRACK_ID = "cscuCIzItZQ";

document.getElementById("btn-start").addEventListener("click", () => {
  const url = `https://www.youtube.com/watch?v=${FIRST_TRACK_ID}`;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && tab.url.startsWith("https://www.youtube.com/")) {
      // Already on YouTube — navigate the current tab
      chrome.tabs.update(tab.id, { url });
    } else {
      // Open a new tab
      chrome.tabs.create({ url });
    }
    window.close();
  });
});
