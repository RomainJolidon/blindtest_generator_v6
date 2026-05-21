// Must match PLAYLIST[0] in overlay.js
const FIRST_TRACK_ID = "cscuCIzItZQ";
const FIRST_TRACK_START = 0;

document.getElementById("btn-start").addEventListener("click", () => {
  const url = `https://www.youtube.com/watch?v=${FIRST_TRACK_ID}&t=${FIRST_TRACK_START}`;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && tab.url.startsWith("https://www.youtube.com/")) {
      chrome.tabs.update(tab.id, { url });
    } else {
      chrome.tabs.create({ url });
    }
    window.close();
  });
});

document.getElementById("btn-stop").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) chrome.tabs.sendMessage(tab.id, { type: "BT_STOP" });
    window.close();
  });
});
