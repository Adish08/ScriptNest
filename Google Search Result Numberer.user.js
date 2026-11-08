// ==UserScript==
// @name         Google Search Result Numberer
// @namespace    https://github.com/adish
// @version      1.1.0
// @description  Numbers organic Google search results (1, 2, 3...) with a lightweight, self-correcting script.
// @author       adish08
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFhNzNlOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzE1NTdiMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgcng9IjE0IiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iMTYiIHk9IjE4IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjgwMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPjE8L3RleHQ+PHJlY3QgeD0iMjYiIHk9IjE1IiB3aWR0aD0iMjQiIGhlaWdodD0iNiIgcng9IjMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45Ii8+PHRleHQgeD0iMTYiIHk9IjMyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjgwMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPjI8L3RleHQ+PHJlY3QgeD0iMjYiIHk9IjI5IiB3aWR0aD0iMjQiIGhlaWdodD0iNiIgcng9IjMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45Ii8+PHRleHQgeD0iMTYiIHk9IjQ2IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjgwMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPjM8L3RleHQ+PHJlY3QgeD0iMjYiIHk9IjQzIiB3aWR0aD0iMTgiIGhlaWdodD0iNiIgcng9IjMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45Ii8+PC9zdmc+
// @include      /^https?:\/\/(www\.)?google\.[a-z.]+\/search/
// @run-at       document-idle
// @noframes
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ATTR = 'data-gsrn';
  const HEADINGS = '#rso h3, #search h3';
  const EXCLUDED = '#tads, #tadsb, #bottomads, .related-question-pair, g-section-with-header';

  // The number is drawn by a CSS pseudo-element: no extra DOM nodes,
  // and it is not copied along with the title text.
  const style = document.createElement('style');
  style.textContent = `
    h3[${ATTR}]::before {
      content: attr(${ATTR}) ". ";
      color: #1a73e8;
      font-weight: bold;
      margin-right: 2px;
    }
    @media (prefers-color-scheme: dark) {
      h3[${ATTR}]::before { color: #8ab4f8; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  function getStartIndex() {
    const start = parseInt(new URLSearchParams(location.search).get('start'), 10);
    return (Number.isNaN(start) ? 0 : start) + 1;
  }

  function isOrganic(h3) {
    if (h3.closest(EXCLUDED)) return false;
    const a = h3.closest('a');
    if (!a || !a.href) return false;
    let url;
    try { url = new URL(a.href, location.href); } catch (_) { return false; }
    // Skip links that stay inside this Google site (related searches, images, maps...).
    // "/url" is Google's redirect path used for some real results.
    return url.hostname !== location.hostname || url.pathname === '/url';
  }

  // Idempotent: walks headings in document order and sets the right number every time,
  // so late-loading or re-rendered results never get a wrong number.
  function numberResults() {
    let n = getStartIndex();
    document.querySelectorAll(HEADINGS).forEach((h3) => {
      if (!isOrganic(h3)) {
        if (h3.hasAttribute(ATTR)) h3.removeAttribute(ATTR);
        return;
      }
      const value = String(n++);
      if (h3.getAttribute(ATTR) !== value) h3.setAttribute(ATTR, value);
    });
  }

  // At most one run per animation frame. Our own changes are attribute-only,
  // so they do not re-trigger this childList observer.
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      numberResults();
    });
  };

  numberResults();
  new MutationObserver(schedule).observe(
    document.querySelector('#rcnt') || document.body,
    { childList: true, subtree: true }
  );
})();