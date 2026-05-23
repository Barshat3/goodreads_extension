# 📚 Goodreads Book Lookup

A Chrome extension that lets you instantly look up any book's Goodreads rating without leaving the page. Just highlight a book title, press `Ctrl+B`, and a popup appears with the rating and details — powered by the Serper API.

---

## ✨ Features

- **Highlight & lookup** — select any book title on any webpage and press `Ctrl+B` (or `Cmd+B` on Mac)
- **Instant popup** — displays Goodreads rating and book info in a clean overlay
- **Toolbar popup** — click the extension icon for a manual search interface
- **Configurable API key** — set your Serper API key via the Options page
- **Works everywhere** — content script runs on all URLs

---

## 🚀 Installation

Since this extension isn't on the Chrome Web Store, load it manually:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Barshat3/goodreads_extension.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the cloned folder

5. The extension icon will appear in your toolbar

---

## ⚙️ Setup

This extension uses the [Serper API](https://serper.dev) to fetch Goodreads data.

1. Get a free API key at [serper.dev](https://serper.dev)
2. Click the extension icon → **Options** (or right-click → *Options*)
3. Enter your Serper API key and save

---

## 🖱️ Usage

**Method 1 — Keyboard shortcut (recommended):**
1. Highlight any book title on a webpage
2. Press `Ctrl+B` (`Cmd+B` on Mac)
3. A popup appears with the book's Goodreads rating

**Method 2 — Toolbar popup:**
1. Click the extension icon in the Chrome toolbar
2. Type a book title and search manually

---

## 🗂️ Project Structure

```
goodreads_extension/
├── manifest.json      # Extension config (Manifest V3)
├── background.js      # Service worker — handles keyboard commands & API calls
├── content.js         # Content script — captures selected text, renders popup
├── popup.html         # Toolbar popup UI
├── popup.js           # Toolbar popup logic
├── options.html       # Settings page UI
├── options.js         # Settings page logic (saves API key)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔑 Permissions

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab to inject the popup |
| `scripting` | Run content scripts dynamically |
| `storage` | Save the Serper API key locally |
| `host_permissions: google.serper.dev` | Make API requests to Serper |

---

## 🛠️ Tech Stack

- **Manifest V3** Chrome Extension API
- **Vanilla JavaScript** (no frameworks)
- **Serper API** for Google Search results (Goodreads listings)
- **Chrome Storage API** for persisting settings

