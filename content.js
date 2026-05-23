/**
 * content.js — Content Script
 * Renders a beautiful floating popup card with Goodreads data
 * when triggered by the background service worker.
 */

(function () {
  "use strict";

  const POPUP_ID = "goodreads-lookup-popup";
  const STYLE_ID = "goodreads-lookup-styles";

  // ─── CSS ────────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

      #${POPUP_ID} {
        all: initial;
        position: fixed;
        top: 24px;
        right: 24px;
        width: 340px;
        max-width: calc(100vw - 48px);
        background: #FAFAF8;
        border-radius: 16px;
        box-shadow:
          0 4px 6px -1px rgba(0,0,0,0.07),
          0 10px 30px -5px rgba(0,0,0,0.12),
          0 0 0 1px rgba(0,0,0,0.05);
        z-index: 2147483647;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        color: #1a1a1a;
        overflow: hidden;
        transform: translateY(-8px);
        opacity: 0;
        animation: gr-popup-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes gr-popup-enter {
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      #${POPUP_ID}.gr-closing {
        animation: gr-popup-exit 0.2s ease-in forwards;
      }

      @keyframes gr-popup-exit {
        to {
          transform: translateY(-10px);
          opacity: 0;
        }
      }

      #${POPUP_ID} * {
        box-sizing: border-box;
      }

      .gr-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 12px;
        border-bottom: 1px solid #EDECE8;
        background: #F5F3EE;
      }

      .gr-logo-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .gr-logo-icon {
        width: 22px;
        height: 22px;
        background: #382110;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .gr-logo-icon svg {
        width: 14px;
        height: 14px;
        fill: #F4F1EA;
      }

      .gr-logo-text {
        font-family: 'Lora', Georgia, serif;
        font-size: 12px;
        font-weight: 600;
        color: #382110;
        letter-spacing: 0.02em;
      }

      .gr-close-btn {
        all: unset;
        cursor: pointer;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        color: #888;
        font-size: 16px;
        line-height: 1;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }

      .gr-close-btn:hover {
        background: #E8E5DE;
        color: #333;
      }

      .gr-body {
        padding: 18px 18px 16px;
      }

      /* ── Loading State ── */
      .gr-loading-title {
        font-family: 'Lora', Georgia, serif;
        font-size: 13px;
        font-style: italic;
        color: #555;
        margin: 0 0 14px;
        line-height: 1.5;
        word-break: break-word;
      }

      .gr-loading-title strong {
        font-style: normal;
        font-weight: 600;
        color: #1a1a1a;
      }

      .gr-spinner-row {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #888;
        font-size: 12.5px;
      }

      .gr-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #E0DDD6;
        border-top-color: #382110;
        border-radius: 50%;
        animation: gr-spin 0.7s linear infinite;
        flex-shrink: 0;
      }

      @keyframes gr-spin {
        to { transform: rotate(360deg); }
      }

      /* ── Success State ── */
      .gr-book-title {
        font-family: 'Lora', Georgia, serif;
        font-size: 15px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 4px;
        line-height: 1.45;
        word-break: break-word;
      }

      .gr-book-author {
        font-size: 12px;
        color: #777;
        margin: 0 0 14px;
        font-style: italic;
      }

      .gr-rating-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #F0EDE5;
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 12px;
        border: 1px solid #E5E1D8;
      }

      .gr-stars-display {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
      }

      .gr-star {
        font-size: 14px;
        line-height: 1;
      }

      .gr-star.filled { color: #E8871A; }
      .gr-star.half { color: #E8871A; opacity: 0.6; }
      .gr-star.empty { color: #C8C3B8; }

      .gr-rating-info {
        flex: 1;
        min-width: 0;
      }

      .gr-rating-number {
        font-family: 'Lora', Georgia, serif;
        font-size: 22px;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1;
        margin-bottom: 2px;
      }

      .gr-rating-number span {
        font-size: 13px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 400;
        color: #888;
      }

      .gr-votes {
        font-size: 11.5px;
        color: #999;
        letter-spacing: 0.01em;
      }

      .gr-snippet {
        font-size: 12.5px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 14px;
        padding: 10px 12px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #EDECE8;
        word-break: break-word;
      }

      .gr-view-btn {
        all: unset;
        cursor: pointer;
        display: block;
        width: 100%;
        text-align: center;
        background: #1A4A7A;
        color: #fff;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        padding: 10px 16px;
        border-radius: 9px;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: 0.01em;
        box-shadow: 0 2px 6px rgba(26,74,122,0.25);
        margin-top: 2px;
        text-decoration: none;
      }

      .gr-view-btn:hover {
        background: #153D69;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(26,74,122,0.3);
      }

      .gr-view-btn:active {
        transform: translateY(0);
      }

      /* ── Error / Warning States ── */
      .gr-error-icon {
        font-size: 28px;
        margin-bottom: 10px;
        display: block;
        text-align: center;
      }

      .gr-error-title {
        font-family: 'Lora', Georgia, serif;
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
        text-align: center;
        margin: 0 0 6px;
      }

      .gr-error-message {
        font-size: 12.5px;
        color: #666;
        text-align: center;
        line-height: 1.6;
        margin: 0 0 14px;
      }

      .gr-error-message code {
        font-family: 'SF Mono', 'Fira Code', monospace;
        background: #EDECE8;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 11px;
        color: #382110;
      }

      .gr-options-btn {
        all: unset;
        cursor: pointer;
        display: block;
        width: 100%;
        text-align: center;
        background: #382110;
        color: #F4F1EA;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        padding: 10px 16px;
        border-radius: 9px;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: 0.01em;
      }

      .gr-options-btn:hover {
        background: #2a1a0e;
        transform: translateY(-1px);
      }

      .gr-divider {
        height: 1px;
        background: #EDECE8;
        margin: 14px 0;
      }

      .gr-no-result-query {
        font-weight: 600;
        color: #382110;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  function removeExistingPopup() {
    const existing = document.getElementById(POPUP_ID);
    if (existing) existing.remove();
  }

  function closePopupWithAnimation() {
    const popup = document.getElementById(POPUP_ID);
    if (!popup) return;
    popup.classList.add("gr-closing");
    popup.addEventListener("animationend", () => popup.remove(), { once: true });
    // Fallback
    setTimeout(() => { if (popup.parentNode) popup.remove(); }, 400);
  }

  function buildBasePopup() {
    const popup = document.createElement("div");
    popup.id = POPUP_ID;

    // Header
    const header = document.createElement("div");
    header.className = "gr-header";

    const logoRow = document.createElement("div");
    logoRow.className = "gr-logo-row";

    const logoIcon = document.createElement("div");
    logoIcon.className = "gr-logo-icon";
    logoIcon.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a4 4 0 110 8 4 4 0 010-8zm0 14.5a7.5 7.5 0 01-6.373-3.55C7.19 14.44 9.51 13.5 12 13.5c2.49 0 4.81.94 6.373 2.45A7.5 7.5 0 0112 19.5z"/>
    </svg>`;

    const logoText = document.createElement("span");
    logoText.className = "gr-logo-text";
    logoText.textContent = "Goodreads Lookup";

    logoRow.appendChild(logoIcon);
    logoRow.appendChild(logoText);

    const closeBtn = document.createElement("button");
    closeBtn.className = "gr-close-btn";
    closeBtn.innerHTML = "&#x2715;";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", closePopupWithAnimation);

    header.appendChild(logoRow);
    header.appendChild(closeBtn);
    popup.appendChild(header);

    return popup;
  }

  // Build star display from a numeric rating (0-5)
  function buildStarDisplay(rating) {
    const container = document.createElement("div");
    container.className = "gr-stars-display";
    const numericRating = parseFloat(rating) || 0;

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.className = "gr-star";
      if (i <= Math.floor(numericRating)) {
        star.classList.add("filled");
        star.textContent = "★";
      } else if (i === Math.ceil(numericRating) && numericRating % 1 >= 0.25) {
        star.classList.add("half");
        star.textContent = "★";
      } else {
        star.classList.add("empty");
        star.textContent = "★";
      }
      container.appendChild(star);
    }
    return container;
  }

  // Truncate text cleanly at word boundaries
  function truncateText(text, maxChars) {
    if (!text || text.length <= maxChars) return text;
    return text.substring(0, maxChars).replace(/\s+\S*$/, "") + "…";
  }

  // Parse a clean book title from the Google result title
  // Typical format: "Book Title by Author Name | Goodreads"
  function parseBookTitle(rawTitle) {
    if (!rawTitle) return { title: "Unknown Title", author: null };

    let cleaned = rawTitle.replace(/\s*\|\s*goodreads$/i, "").trim();
    cleaned = cleaned.replace(/\s*-\s*goodreads$/i, "").trim();

    // Extract "by Author" if present
    const byMatch = cleaned.match(/^(.+?)\s+by\s+(.+)$/i);
    if (byMatch) {
      return { title: byMatch[1].trim(), author: byMatch[2].trim() };
    }

    return { title: cleaned, author: null };
  }

  // ─── POPUP RENDER STATES ─────────────────────────────────────────────────────

  function showLoadingState(bookTitle) {
    removeExistingPopup();
    injectStyles();

    const popup = buildBasePopup();
    const body = document.createElement("div");
    body.className = "gr-body";

    const loadingTitle = document.createElement("p");
    loadingTitle.className = "gr-loading-title";
    loadingTitle.innerHTML = `Searching for <strong>${escapeHtml(bookTitle)}</strong> on Goodreads…`;

    const spinnerRow = document.createElement("div");
    spinnerRow.className = "gr-spinner-row";

    const spinner = document.createElement("div");
    spinner.className = "gr-spinner";

    const spinnerText = document.createElement("span");
    spinnerText.textContent = "Fetching rating via Google…";

    spinnerRow.appendChild(spinner);
    spinnerRow.appendChild(spinnerText);
    body.appendChild(loadingTitle);
    body.appendChild(spinnerRow);
    popup.appendChild(body);

    document.body.appendChild(popup);
    return popup;
  }

  function showSuccessState(popup, data) {
    // data: { bookTitle, bookAuthor, rating, votes, snippet, goodreadsUrl }
    const body = popup.querySelector(".gr-body");
    body.innerHTML = "";

    const titleEl = document.createElement("h3");
    titleEl.className = "gr-book-title";
    titleEl.textContent = data.bookTitle;
    body.appendChild(titleEl);

    if (data.bookAuthor) {
      const authorEl = document.createElement("p");
      authorEl.className = "gr-book-author";
      authorEl.textContent = "by " + data.bookAuthor;
      body.appendChild(authorEl);
    }

    // Rating badge
    const ratingBadge = document.createElement("div");
    ratingBadge.className = "gr-rating-badge";

    const starsEl = buildStarDisplay(data.rating);
    ratingBadge.appendChild(starsEl);

    const ratingInfo = document.createElement("div");
    ratingInfo.className = "gr-rating-info";

    const ratingNumber = document.createElement("div");
    ratingNumber.className = "gr-rating-number";
    ratingNumber.innerHTML = `${escapeHtml(data.rating)}<span> / 5 ★</span>`;
    ratingInfo.appendChild(ratingNumber);

    if (data.votes) {
      const votes = document.createElement("div");
      votes.className = "gr-votes";
      votes.textContent = `${data.votes} ratings`;
      ratingInfo.appendChild(votes);
    }

    ratingBadge.appendChild(ratingInfo);
    body.appendChild(ratingBadge);

    // Snippet
    if (data.snippet) {
      const snippetEl = document.createElement("p");
      snippetEl.className = "gr-snippet";
      snippetEl.textContent = truncateText(data.snippet, 160);
      body.appendChild(snippetEl);
    }

    // View button
    const viewBtn = document.createElement("a");
    viewBtn.className = "gr-view-btn";
    viewBtn.href = data.goodreadsUrl;
    viewBtn.target = "_blank";
    viewBtn.rel = "noopener noreferrer";
    viewBtn.textContent = "View full book details on Goodreads";
    body.appendChild(viewBtn);
  }

  function showApiKeysMissingState(popup) {
    const body = popup.querySelector(".gr-body");
    body.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "gr-error-icon";
    icon.textContent = "🔑";
    body.appendChild(icon);

    const title = document.createElement("p");
    title.className = "gr-error-title";
    title.textContent = "API Keys Required";
    body.appendChild(title);

    const message = document.createElement("p");
    message.className = "gr-error-message";
    message.innerHTML = `To look up books, you need a free Serper.dev API key.<br><br>
      Open the extension options and enter your <code>SERPER_API_KEY</code>. Sign up free at <strong>serper.dev</strong> — no credit card needed.`;
    body.appendChild(message);

    const optionsBtn = document.createElement("button");
    optionsBtn.className = "gr-options-btn";
    optionsBtn.textContent = "⚙ Open Extension Options";
    optionsBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS" });
    });
    body.appendChild(optionsBtn);
  }

  function showNoSelectionState(popup) {
    const body = popup.querySelector(".gr-body");
    body.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "gr-error-icon";
    icon.textContent = "✍️";
    body.appendChild(icon);

    const title = document.createElement("p");
    title.className = "gr-error-title";
    title.textContent = "No Text Selected";
    body.appendChild(title);

    const message = document.createElement("p");
    message.className = "gr-error-message";
    message.textContent = "Please highlight a book title on the page, then press Ctrl+B (or Cmd+B on Mac) again.";
    body.appendChild(message);
  }

  function showNotFoundState(popup, bookTitle) {
    const body = popup.querySelector(".gr-body");
    body.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "gr-error-icon";
    icon.textContent = "🔍";
    body.appendChild(icon);

    const title = document.createElement("p");
    title.className = "gr-error-title";
    title.textContent = "No Results Found";
    body.appendChild(title);

    const message = document.createElement("p");
    message.className = "gr-error-message";
    message.innerHTML = `Couldn't find <span class="gr-no-result-query">"${escapeHtml(bookTitle)}"</span> on Goodreads.<br><br>Try selecting a more precise title.`;
    body.appendChild(message);
  }

  function showErrorState(popup, errorMessage) {
    const body = popup.querySelector(".gr-body");
    body.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "gr-error-icon";
    icon.textContent = "⚠️";
    body.appendChild(icon);

    const title = document.createElement("p");
    title.className = "gr-error-title";
    title.textContent = "Something Went Wrong";
    body.appendChild(title);

    const message = document.createElement("p");
    message.className = "gr-error-message";
    message.textContent = errorMessage || "An unexpected error occurred. Please try again.";
    body.appendChild(message);

    const divider = document.createElement("div");
    divider.className = "gr-divider";
    body.appendChild(divider);

    const hint = document.createElement("p");
    hint.className = "gr-error-message";
    hint.style.fontSize = "11.5px";
    hint.style.color = "#999";
    hint.textContent = "If you've hit the monthly search limit (2,500 on free plan), you can upgrade at serper.dev or wait until next month.";
    body.appendChild(hint);
  }

  // ─── HTML ESCAPE ─────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ─── MAIN FETCH LOGIC ─────────────────────────────────────────────────────────

  async function createBookPopup(bookTitle) {
    // Show loading state immediately
    const popup = showLoadingState(bookTitle);

    // ── Step 1: Check for Serper API key in storage ───────────────────────────
    let apiKey;
    try {
      const stored = await chrome.storage.local.get(["SERPER_API_KEY"]);
      apiKey = stored.SERPER_API_KEY ? stored.SERPER_API_KEY.trim() : null;
    } catch (err) {
      showErrorState(popup, "Could not access extension storage. Try reloading the extension.");
      return;
    }

    if (!apiKey) {
      showApiKeysMissingState(popup);
      return;
    }

    // ── Step 2: Fetch from Serper.dev Search API ───────────────────────────────
    const searchQuery = `site:goodreads.com ${bookTitle}`;

    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: searchQuery, num: 5 }),
      });

      if (!response.ok) {
        let errorDetail = `API request failed (HTTP ${response.status})`;

        try {
          const errJson = await response.json();
          if (errJson && errJson.message) {
            errorDetail = errJson.message;
          }
        } catch (_) { /* ignore JSON parse failure on error */ }

        if (response.status === 429) {
          showErrorState(popup, "Daily search limit reached (2,500/month on free plan). Try again later.");
        } else if (response.status === 401 || response.status === 403) {
          showErrorState(popup, "Invalid API key. Please check your Serper API key in Options.");
        } else if (response.status === 400) {
          showErrorState(popup, `Bad request. Details: ${errorDetail}`);
        } else {
          showErrorState(popup, errorDetail);
        }
        return;
      }

      const data = await response.json();

      // ── Step 3: Parse Serper.dev response ────────────────────────────────────
      // Serper returns: { organic: [ { title, link, snippet, ... } ] }
      const results = data.organic || [];

      if (results.length === 0) {
        showNotFoundState(popup, bookTitle);
        return;
      }

      // Find the best Goodreads book result (prefer /book/show/ URLs)
      let bestItem = results[0];
      for (const item of results) {
        if (item.link && item.link.includes("goodreads.com/book/show/")) {
          bestItem = item;
          break;
        }
      }

      const rawTitle = bestItem.title || "";
      const snippet  = bestItem.snippet || "";
      const goodreadsUrl = bestItem.link || "";

      // Parse clean title and author
      const { title: cleanTitle, author: cleanAuthor } = parseBookTitle(rawTitle);

      // ── Extract rating + votes — 4-layer strategy ────────────────────────────
      let rating = null;
      let votes  = null;

      // ── Layer 1: Serper structured fields ────────────────────────────────────
      // Serper can return rating data in several structured locations:
      //   bestItem.richSnippet.product.ratingValue / ratingCount
      //   bestItem.richSnippet.review.ratingValue
      //   bestItem.attributes["Rating"] / bestItem.attributes["Reviews"]
      //   bestItem.rating  (top-level shorthand some responses include)
      try {
        const rs = bestItem.richSnippet || {};

        // richSnippet.product
        if (!rating && rs.product) {
          if (rs.product.ratingValue) rating = String(rs.product.ratingValue);
          if (rs.product.ratingCount) votes  = String(rs.product.ratingCount);
          if (rs.product.reviewCount && !votes) votes = String(rs.product.reviewCount);
        }

        // richSnippet.review / metatags
        if (!rating && rs.review) {
          if (rs.review.ratingValue) rating = String(rs.review.ratingValue);
          if (rs.review.reviewCount) votes  = String(rs.review.reviewCount);
        }

        // richSnippet top-level ratingValue (some Serper versions)
        if (!rating && rs.ratingValue) rating = String(rs.ratingValue);
        if (!votes  && rs.ratingCount) votes  = String(rs.ratingCount);

        // bestItem.attributes object  e.g. { "Rating": "3.8", "Reviews": "3,954,247" }
        const attrs = bestItem.attributes || {};
        if (!rating && attrs["Rating"])  rating = String(attrs["Rating"]).replace(/[^\d.]/g, "");
        if (!votes  && attrs["Reviews"]) votes  = String(attrs["Reviews"]);
        if (!votes  && attrs["Ratings"]) votes  = String(attrs["Ratings"]);

        // Top-level bestItem.rating shorthand
        if (!rating && bestItem.rating != null) rating = String(bestItem.rating);
        if (!votes  && bestItem.ratingCount != null) votes = String(bestItem.ratingCount);
      } catch (_) { /* structured parsing failed; fall through to text */ }

      // ── Layer 2: sitelinks snippet text (Serper sometimes puts it there) ─────
      const sitelinkSnippets = (bestItem.sitelinks || []).map(s => s.snippet || "").join(" ");
      const allText = snippet + " " + sitelinkSnippets;

      // ── Layer 3: Regex against all available text ─────────────────────────────
      if (!rating) {
        const patterns = [
          // "Rating: 4.28 · 2,019,444 ratings"
          /Rating[:\s]+(\d+\.\d+)\s*[·•\-–]\s*([\d,]+)\s*ratings?/i,
          // "Rating: 4.3 - 120,430 votes"
          /Rating[:\s]+(\d+\.\d+)\s*[·•\-–]\s*([\d,]+)\s*votes?/i,
          // "4.28 avg rating — 2,019,444 ratings"
          /(\d+\.\d+)\s*avg\s*rating[s]?\s*[—\-–·]\s*([\d,]+)/i,
          // "3.8 out of 5" or "3.8/5"
          /(\d\.\d{1,2})\s*(?:out\s*of\s*5|\/\s*5)/i,
          // bare "3.8 (3,954,247)" — parenthesised count right after rating
          /(\d\.\d{1,2})\s*\(\s*([\d,]+)\s*\)/,
          // fallback: any "digit.digit(s) · large-number"
          /(\d\.\d{1,2})\s*[·•\-–]\s*([\d,]{4,})/,
        ];

        for (const pat of patterns) {
          const m = allText.match(pat);
          if (m) {
            rating = m[1];
            if (m[2]) votes = m[2];
            break;
          }
        }
      }

      // ── Layer 4: Last-resort — any X.XX number in the snippet ─────────────────
      if (!rating) {
        const m = allText.match(/\b([1-4]\.\d{1,2})\b/);
        if (m) rating = m[1];
      }

      // ── Clean up the snippet text ─────────────────────────────────────────────
      let cleanSnippet = snippet
        .replace(/Rating[:\s]+\d+\.\d+\s*[·•\-–]\s*[\d,]+\s*(ratings?|votes?)[^.]*\.?/gi, "")
        .replace(/\d+\.\d+\s*avg\s*rating[s]?\s*[—\-–·]\s*[\d,]+[^.]*\.?/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();

      showSuccessState(popup, {
        bookTitle: cleanTitle,
        bookAuthor: cleanAuthor,
        rating: rating || "N/A",
        votes: votes || null,
        snippet: cleanSnippet || snippet,
        goodreadsUrl,
      });

    } catch (err) {
      console.error("[Goodreads Lookup] Fetch error:", err);

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        showErrorState(popup, "Network error: Could not reach the Serper API. Check your internet connection.");
      } else {
        showErrorState(popup, err.message || "An unexpected error occurred.");
      }
    }
  }

  // ─── MESSAGE LISTENER ────────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "LOOKUP_BOOK" && message.title) {
      createBookPopup(message.title.trim());
      sendResponse({ ok: true });
    } else if (message.action === "SHOW_NO_SELECTION_ERROR") {
      injectStyles();
      removeExistingPopup();
      const popup = buildBasePopup();
      const body = document.createElement("div");
      body.className = "gr-body";
      popup.appendChild(body);
      document.body.appendChild(popup);
      showNoSelectionState(popup);
      sendResponse({ ok: true });
    }
    return false; // synchronous response
  });

})();
