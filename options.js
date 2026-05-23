/**
 * options.js — Options Page Logic
 * Handles saving, loading, and clearing the Serper.dev API key.
 */

const apiKeyInput = document.getElementById("api-key");
const btnSave     = document.getElementById("btn-save");
const btnClear    = document.getElementById("btn-clear");
const statusToast = document.getElementById("status-toast");

let toastTimeout = null;

function showToast(type, message) {
  clearTimeout(toastTimeout);
  statusToast.className = type;
  statusToast.textContent = type === "success" ? "✓  " + message : "✗  " + message;
  toastTimeout = setTimeout(() => {
    statusToast.className = "";
    statusToast.textContent = "";
  }, 3500);
}

// Load saved key on page open
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const stored = await chrome.storage.local.get(["SERPER_API_KEY"]);
    if (stored.SERPER_API_KEY) apiKeyInput.value = stored.SERPER_API_KEY;
  } catch (err) {
    console.error("[Goodreads Options] Failed to load key:", err);
  }
});

// Save key
btnSave.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showToast("error", "Please enter your Serper API key.");
    return;
  }

  if (apiKey.length < 20) {
    showToast("error", "That key looks too short — please double-check it.");
    return;
  }

  try {
    await chrome.storage.local.set({ SERPER_API_KEY: apiKey });
    showToast("success", "API key saved! You're ready to look up books.");
  } catch (err) {
    console.error("[Goodreads Options] Failed to save key:", err);
    showToast("error", "Failed to save. Check extension permissions.");
  }
});

// Clear key
btnClear.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to remove your saved API key?")) return;

  try {
    await chrome.storage.local.remove(["SERPER_API_KEY"]);
    apiKeyInput.value = "";
    showToast("success", "API key cleared.");
  } catch (err) {
    console.error("[Goodreads Options] Failed to clear key:", err);
    showToast("error", "Failed to clear key.");
  }
});

// Enter key to save
apiKeyInput.addEventListener("keydown", (e) => { if (e.key === "Enter") btnSave.click(); });
