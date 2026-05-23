/**
 * background.js — Service Worker
 * Listens for the "lookup_book" keyboard command, captures the selected text
 * from the active tab, and forwards it to the content script for processing.
 */

// Handle messages from content scripts (e.g., open options page)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
  }
  return false;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "lookup_book") return;

  // Get the currently active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Skip chrome:// and other non-injectable pages
  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("edge://")) {
    console.warn("[Goodreads Lookup] Cannot run on this page type:", tab.url);
    return;
  }

  let selectedText = null;

  try {
    // Inject a small script to capture the current text selection
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        const text = selection.toString().trim();
        return text.length > 0 ? text : null;
      },
    });

    if (results && results[0] && results[0].result) {
      selectedText = results[0].result;
    }
  } catch (err) {
    console.error("[Goodreads Lookup] Failed to execute script:", err);
    return;
  }

  if (!selectedText) {
    // Nothing selected — send a signal to the content script to show a "no selection" notice
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "SHOW_NO_SELECTION_ERROR",
      });
    } catch (e) {
      // Content script may not be ready; silently ignore
    }
    return;
  }

  // Enforce a reasonable title length guard
  if (selectedText.length > 200) {
    selectedText = selectedText.substring(0, 200);
  }

  // Send the captured title to the content script
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: "LOOKUP_BOOK",
      title: selectedText,
    });
  } catch (err) {
    console.error("[Goodreads Lookup] Failed to send message to content script:", err);
  }
});
