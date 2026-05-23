/**
 * popup.js — Toolbar Popup Logic
 * Checks if the Serper API key is configured and shows status.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const statusRow   = document.getElementById("status-row");
  const statusText  = document.getElementById("status-text");
  const optionsLink = document.getElementById("options-link");

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  try {
    const stored = await chrome.storage.local.get(["SERPER_API_KEY"]);
    const hasKey = stored.SERPER_API_KEY && stored.SERPER_API_KEY.trim().length > 0;

    if (hasKey) {
      statusRow.className = "status-row ok";
      statusText.textContent = "API key configured — ready to use!";
    } else {
      statusRow.className = "status-row warn";
      statusText.textContent = "API key missing — open Settings to add it.";
    }
  } catch (err) {
    statusRow.className = "status-row warn";
    statusText.textContent = "Could not read storage.";
  }
});
