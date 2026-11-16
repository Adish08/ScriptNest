// ==UserScript==
// @name         Google Search Result Numberer
// @namespace    https://github.com/adish08
// @version      1.2.0
// @description  Numbers organic Google search results (1, 2, 3...) on both Desktop and Mobile.
// @author       adish08
// @updateURL    https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/Google%20Search%20Result%20Numberer.user.js
// @downloadURL  https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/Google%20Search%20Result%20Numberer.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyNTYzZWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTRhZGIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0idGFiIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMC45NSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgcng9IjE1IiBmaWxsPSJ1cmwoI2JnKSIvPjxyZWN0IHg9IjE5IiB5PSIxNC41IiB3aWR0aD0iMjUiIGhlaWdodD0iMy41IiByeD0iMS43NSIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjE5IiB5PSIyMC41IiB3aWR0aD0iMTgiIGhlaWdodD0iMi41IiByeD0iMS4yNSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41NSIvPjxyZWN0IHg9IjE5IiB5PSIyOS41IiB3aWR0aD0iMjQiIGhlaWdodD0iMy41IiByeD0iMS43NSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC44NSIvPjxyZWN0IHg9IjE5IiB5PSIzNS41IiB3aWR0aD0iMTYiIGhlaWdodD0iMi41IiByeD0iMS4yNSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC40NSIvPjxyZWN0IHg9IjE5IiB5PSI0NC41IiB3aWR0aD0iMjEiIGhlaWdodD0iMy41IiByeD0iMS43NSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC42Ii8+PHJlY3QgeD0iMTkiIHk9IjUwLjUiIHdpZHRoPSIxNCIgaGVpZ2h0PSIyLjUiIHJ4PSIxLjI1IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjMiLz48ZyBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9Ijg0MCIgZm9udC1zaXplPSIxMy41IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj48dGV4dCB4PSIxMiIgeT0iMjMiPjE8L3RleHQ+PHRleHQgeD0iMTIiIHk9IjM4IiBvcGFjaXR5PSIwLjgiPjI8L3RleHQ+PHRleHQgeD0iMTIiIHk9IjUzIiBvcGFjaXR5PSIwLjU1Ij4zPC90ZXh0PjwvZz48cGF0aCBkPSJNNDUgMEg1NHYxNC41YTQgNCAwIDAgMS00IDRoLTFhNCA0IDAgMCAxLTQtNFYweiIgZmlsbD0idXJsKCN0YWIpIi8+PHRleHQgeD0iNDkuNSIgeT0iMTMiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iOTAwIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMWU0YWRiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4jPC90ZXh0PjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ4LjUsIDM5KSI+PGxpbmUgeDE9IjYuNSIgeTE9IjYuNSIgeDI9IjEzLjUiIHkyPSIxMy41IiBzdHJva2U9IiM5M2M1ZmQiIHN0cm9rZS13aWR0aD0iMy42IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iOS41IiBmaWxsPSIjMWU0YWRiIi8+PHBhdGggZD0iTTAgLTkuNUE5LjUgOS41IDAgMCAxIDYuNzIgLTYuNzJMNC4zOCAtNC4zOEE2LjIgNi4yIDAgMCAwIDAgLTYuMloiIGZpbGw9IiNlYTQzMzUiLz48cGF0aCBkPSJNLTMuMjUgLTguOTNBOS41IDkuNSAwIDAgMSAwIC05LjVWLTYuMkE2LjIgNi4yIDAgMCAwIC0yLjEyIC01LjgzWiIgZmlsbD0iI2VhNDMzNSIvPjxwYXRoIGQ9Ik0tOC45MyAtMy4yNUE5LjUgOS41IDAgMCAxIC0zLjI1IC04LjkzTC0yLjEyIC01LjgzQTYuMiA2LjIgMCAwIDAgLTUuODMgLTIuMTJaIiBmaWxsPSIjZWE0MzM1Ii8+PHBhdGggZD0iTS0zLjI1IDguOTNBOS41IDkuNSAwIDAgMSAtOC45MyAtMy4yNUwtNS44MyAtMi4xMkE2LjIgNi4yIDAgMCAwIC0yLjEyIDUuODNaIiBmaWxsPSIjZmJiYzA1Ii8+PHBhdGggZD0iTTguMjMgNC43NUE5LjUgOS41IDAgMCAxIC0zLjI1IDguOTNMLTIuMTIgNS44M0E2LjIgNi4yIDAgMCAwIDUuMzcgMy4xWiIgZmlsbD0iIzM0YTg1MyIvPjxwYXRoIGQ9Ik0wIC0xLjZIOS4zN0E5LjUgOS41IDAgMCAxIDguMjMgNC43NUw1LjM3IDMuMUE2LjIgNi4yIDAgMCAwIDYuMTIgMS41SDBaIiBmaWxsPSIjNDI4NWY0Ii8+PC9nPjwvc3ZnPg==
// @include      /^https?:\/\/(www\.|m\.)?google\.[a-z.]+\/search/
// @run-at       document-idle
// @noframes
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ATTR = 'data-gsrn';

  // Desktop uses <h3>; Mobile uses [role="heading"][aria-level="3"] inside #rso, #search, or #main
  const HEADINGS = [
    '#rso h3',
    '#search h3',
    '#rso [role="heading"][aria-level="3"]',
    '#search [role="heading"][aria-level="3"]',
    '#main [role="heading"][aria-level="3"]'
  ].join(', ');

  // Exclude ads, People Also Ask, carousels, top stories, and knowledge panels
  const EXCLUDED = [
    '#tads',
    '#tadsb',
    '#bottomads',
    '#taw',
    '[data-text-ad]',
    '.related-question-pair',
    'g-section-with-header',
    'g-scrolling-carousel',
    '[data-initq]',
    'kp-wholepage'
  ].join(', ');

  const style = document.createElement('style');
  style.textContent = `
    [${ATTR}]::before {
      content: attr(${ATTR}) ". ";
      color: #1a73e8;
      font-weight: bold;
      margin-right: 4px;
    }
    @media (prefers-color-scheme: dark) {
      [${ATTR}]::before { color: #8ab4f8; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  function getStartIndex() {
    const start = parseInt(new URLSearchParams(location.search).get('start'), 10);
    return (Number.isNaN(start) ? 0 : start) + 1;
  }

  function isOrganic(heading, seenAnchors) {
    if (heading.closest(EXCLUDED)) return false;

    // Ignore headings that contain another heading inside them (occasionally happens on desktop/mobile wrappers)
    if (heading.querySelector('h3, [role="heading"][aria-level="3"]')) return false;

    const a = heading.closest('a');
    if (!a || !a.href || seenAnchors.has(a)) return false;

    // Skip video thumbnail overlays or image cards that contain duration/badge text alongside headings
    if (!heading.textContent || !heading.textContent.trim()) return false;

    let url;
    try {
      url = new URL(a.href, location.href);
    } catch (_) {
      return false;
    }

    // Allow external links or Google's "/url" redirect path
    const isExternal = url.hostname !== location.hostname || url.pathname === '/url';
    if (!isExternal) return false;

    seenAnchors.add(a);
    return true;
  }

  function getDisplayTarget(heading) {
    // On mobile, the [role="heading"] div is sometimes a flex/webkit-box container wrapping an inner <div> or <span>.
    // Attaching data-gsrn to the single text-bearing child prevents flex layout breaks.
    if (
      heading.tagName !== 'H3' &&
      heading.children.length === 1 &&
      heading.firstElementChild.textContent.trim() === heading.textContent.trim()
    ) {
      return heading.firstElementChild;
    }
    return heading;
  }

  function numberResults() {
    let n = getStartIndex();
    const seenAnchors = new Set();
    const validTargets = new Set();

    document.querySelectorAll(HEADINGS).forEach((heading) => {
      if (!isOrganic(heading, seenAnchors)) return;

      const target = getDisplayTarget(heading);
      validTargets.add(target);

      const value = String(n++);
      if (target.getAttribute(ATTR) !== value) {
        target.setAttribute(ATTR, value);
      }
    });

    // Clean up stale attributes on re-rendered or disqualified nodes
    document.querySelectorAll(`[${ATTR}]`).forEach((el) => {
      if (!validTargets.has(el)) el.removeAttribute(ATTR);
    });
  }

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
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
