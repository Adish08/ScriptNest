// ==UserScript==
// @name         YouTube Intent Gate
// @namespace    yt-intent-gate
// @version      2.2.1
// @author       adish08
// @updateURL    https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/YouTube%20Intent%20Gate.user.js
// @downloadURL  https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/YouTube%20Intent%20Gate.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiNmMDMiLz48cGF0aCBkPSJNMzIgMTBhMjIgMjIgMCAxIDAgMCA0NCAyMiAyMiAwIDEgMCAwLTQ0em0wIDUuNWExNi41IDE2LjUgMCAxIDEgMCAzMyAxNi41IDE2LjUgMCAxIDEgMC0zM3oiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjMyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzIgMTBBMjIgMjIgMCAxIDEgMTAgMzJMMTUuNSAzMkExNi41IDE2LjUgMCAxIDAgMzIgMTUuNVoiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjEyLjc1IiByPSIyLjc1IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMTIuNzUiIGN5PSIzMiIgcj0iMi43NSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yNy41IDI0LjVMNDAuNSAzMiAyNy41IDM5LjVaIiBmaWxsPSIjZmZmIi8+PC9zdmc+
// @description  Removes Shorts (nav, shelves, redirects) and hides the homepage feed behind a 21s "What did you come here to do?" gate. Unhook-style: CSS-only hide/reveal, DOM is never torn down.
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==


(() => {
  'use strict';

  if (window.__ytIntentGateLoaded) return;
  window.__ytIntentGateLoaded = true;

  /* ------------------------------------------------------------------ *
   * CONFIG
   * ------------------------------------------------------------------ */
  const CONFIG = {
    COUNTDOWN_SECONDS: 21,
    // After unlocking, the feed stays open for this many minutes (per tab).
    // 0 = stays unlocked for the whole tab session.
    UNLOCK_TTL_MINUTES: 30,
    KEEP_MOBILE_BOTTOM_NAV: true, // keep bottom bar (Subscriptions etc.) usable on mobile
    PAUSE_WHEN_TAB_HIDDEN: true,  // countdown only runs while the tab is visible
    REDIRECT_SHORTS: false,       // false = keep Shorts opening normally as Shorts!
    // Shorts handling: keep Shorts visible, but gate scrolling after N scrolls.
    HIDE_SHORTS_NAV: false,       // set true to also hide the Shorts nav entry
    HIDE_SHORTS_CONTENT: false,   // set true to hide Shorts shelves/results
    LIMIT_SHORTS: true,           // enable the scroll limiter
    SHORTS_MAX_SCROLLS: 3,        // allow this many scrolls before the warning
    SHORTS_COOLDOWN_SECONDS: 30,  // timer shown after the limit is hit
  };

  const ATTR = 'yt-gate-active';
  const ROOT_ID = 'yt-gate-root';
  const STYLE_ID = 'yt-gate-style';
  const STORE_KEY = 'yt-gate:unlockedAt';
  const IS_MOBILE = location.hostname === 'm.youtube.com';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const RING_R = 54;
  const RING_C = 2 * Math.PI * RING_R;

  /* ------------------------------------------------------------------ *
   * CSS  (each selector is its own rule so one unsupported selector
   * can never invalidate the others)
   * ------------------------------------------------------------------ */
  const hideRules = (list) => list.map((s) => `${s}{display:none!important}`).join('\n');

  const SHORTS_NAV = [
    'ytd-guide-entry-renderer:has(a[href^="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href^="/shorts"])',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
    'ytm-pivot-bar-item-renderer:has(.pivot-shorts)',
    'ytm-pivot-bar-item-renderer:has(a[href^="/shorts"])',
    'ytm-pivot-bar-item-renderer:has([aria-label="Shorts"])',
  ];

  const SHORTS_CONTENT = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
    'ytd-rich-section-renderer:has(ytd-reel-shelf-renderer)',
    'ytd-video-renderer:has(a[href^="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
    'ytd-compact-video-renderer:has(a[href^="/shorts/"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
    'yt-lockup-view-model:has(a[href^="/shorts/"])',
    'ytm-reel-shelf-renderer',
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2',
    'ytm-item-section-renderer:has(ytm-reel-shelf-renderer)',
    'ytm-video-with-context-renderer:has(a[href^="/shorts/"])',
    'ytm-rich-item-renderer:has(a[href^="/shorts/"])',
    'yt-tab-shape[tab-title="Shorts"]',
  ];

  // Feed hiding: attached to an <html> attribute, never touches the DOM tree.
  const GATE_HIDE = [
    `html[${ATTR}] ytd-browse[page-subtype="home"]`,
    `html[${ATTR}] ytd-browse:not([page-subtype])`,
    `html[${ATTR}] ytm-browse`,
    `html[${ATTR}] ytd-mini-guide-renderer`,
  ];

  const GATE_CSS = `
#${ROOT_ID}{
  position:fixed;left:0;right:0;
  top:var(--yt-gate-top,56px);
  bottom:var(--yt-gate-bottom,0px);
  z-index:2010;display:none;align-items:center;justify-content:center;
  overflow:auto;box-sizing:border-box;padding:24px 16px;
  background:var(--yt-spec-base-background,#fff);
  color:var(--yt-spec-text-primary,#0f0f0f);
  font-family:"Roboto","Arial",sans-serif;
  -webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;
}
@media (prefers-color-scheme:dark){
  #${ROOT_ID}{
    background:var(--yt-spec-base-background,#0f0f0f);
    color:var(--yt-spec-text-primary,#f1f1f1);
  }
}
html[${ATTR}] #${ROOT_ID}{display:flex}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} .yt-gate-card{
  display:flex;flex-direction:column;align-items:center;text-align:center;
  gap:14px;width:100%;max-width:480px;margin:auto;
}
#${ROOT_ID} .yt-gate-mascot{width:124px;height:auto;animation:yt-gate-bob 3.2s ease-in-out infinite}
#${ROOT_ID} .yt-gate-eye{transform-box:fill-box;transform-origin:center;animation:yt-gate-blink 4s infinite}
#${ROOT_ID} .yt-gate-title{margin:0;font-size:28px;line-height:36px;font-weight:700}
#${ROOT_ID} .yt-gate-copy{
  margin:0;font-size:14px;line-height:21px;max-width:400px;
  color:var(--yt-spec-text-secondary,#606060);
}
#${ROOT_ID} .yt-gate-ring-wrap{position:relative;width:156px;height:156px;margin:6px 0}
#${ROOT_ID} .yt-gate-ring{width:100%;height:100%;display:block}
#${ROOT_ID} .yt-gate-ring-bg{stroke:var(--yt-spec-10-percent-layer,rgba(128,128,128,.28))}
#${ROOT_ID} .yt-gate-ring-fg{
  stroke:var(--yt-spec-brand-button-background,#cc0000);
  transition:stroke-dashoffset .12s linear,stroke .3s ease;
}
#${ROOT_ID}.yt-gate-done .yt-gate-ring-fg{stroke:#2ba640}
#${ROOT_ID} .yt-gate-count{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
#${ROOT_ID} .yt-gate-num{font-size:46px;line-height:48px;font-weight:500;font-variant-numeric:tabular-nums}
#${ROOT_ID} .yt-gate-unit{font-size:12px;color:var(--yt-spec-text-secondary,#606060)}
#${ROOT_ID} .yt-gate-status{margin:0;min-height:20px;font-size:14px;font-weight:500}
#${ROOT_ID} .yt-gate-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:4px}
#${ROOT_ID} .yt-gate-btn{
  appearance:none;-webkit-appearance:none;border:0;cursor:pointer;
  height:36px;padding:0 16px;border-radius:18px;
  font:500 14px/36px "Roboto","Arial",sans-serif;
  background:var(--yt-spec-badge-chip-background,rgba(128,128,128,.18));
  color:inherit;
}
#${ROOT_ID} .yt-gate-btn:hover{background:var(--yt-spec-button-chip-background-hover,rgba(128,128,128,.3))}
#${ROOT_ID} .yt-gate-btn-primary{
  background:var(--yt-spec-text-primary,#0f0f0f);
  color:var(--yt-spec-text-primary-inverse,#fff);
}
#${ROOT_ID} .yt-gate-btn-primary:hover{background:var(--yt-spec-text-primary,#0f0f0f);opacity:.85}
#${ROOT_ID} .yt-gate-btn:disabled{opacity:.35;cursor:not-allowed}
@keyframes yt-gate-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes yt-gate-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}
@media (max-width:600px){
  #${ROOT_ID}{padding:16px 12px}
  #${ROOT_ID} .yt-gate-title{font-size:22px;line-height:28px}
  #${ROOT_ID} .yt-gate-mascot{width:96px}
  #${ROOT_ID} .yt-gate-ring-wrap{width:132px;height:132px}
  #${ROOT_ID} .yt-gate-num{font-size:38px;line-height:40px}
}
@media (prefers-reduced-motion:reduce){
  #${ROOT_ID} .yt-gate-mascot,#${ROOT_ID} .yt-gate-eye{animation:none}
  #${ROOT_ID} .yt-gate-ring-fg{transition:none}
}
`;

  // Shorts scroll-limit overlay CSS
  const SHORTS_LIMIT_CSS = `
html[yt-shorts-limited],
html[yt-shorts-limited] #shorts-container,
html[yt-shorts-limited] ytd-shorts,
html[yt-shorts-limited] ytm-reel-shelf-renderer{
  overflow:hidden!important;
  touch-action:none!important;
}
#yt-shorts-limit-root{
  position:fixed;inset:0;z-index:2147483647;
  display:none;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);
  padding:24px;box-sizing:border-box;
  font-family:"Roboto","Arial",sans-serif;
}
html[yt-shorts-limited] #yt-shorts-limit-root{display:flex}
#yt-shorts-limit-root *{box-sizing:border-box}
#yt-shorts-limit-root .yt-gate-card{
  background:var(--yt-spec-base-background,#fff);
  color:var(--yt-spec-text-primary,#0f0f0f);
  border-radius:16px;padding:26px 22px;
  max-width:440px;width:100%;
  display:flex;flex-direction:column;align-items:center;text-align:center;
  box-shadow:0 8px 32px rgba(0,0,0,0.35);
}
@media (prefers-color-scheme:dark){
  #yt-shorts-limit-root .yt-gate-card{
    background:var(--yt-spec-base-background,#0f0f0f);
    color:var(--yt-spec-text-primary,#f1f1f1);
  }
}
#yt-shorts-limit-root .yt-gate-mascot{width:88px;height:auto;margin-bottom:8px;animation:yt-gate-bob 3.2s ease-in-out infinite}
#yt-shorts-limit-root .yt-gate-eye{transform-box:fill-box;transform-origin:center;animation:yt-gate-blink 4s infinite}
#yt-shorts-limit-root .yt-gate-title{margin:0 0 8px;font-size:22px;line-height:28px;font-weight:700}
#yt-shorts-limit-root .yt-gate-copy{
  margin:0 0 12px;font-size:14px;line-height:21px;
  color:var(--yt-spec-text-secondary,#606060);
}
#yt-shorts-limit-root .yt-gate-ring-wrap{position:relative;width:124px;height:124px;margin:8px 0 12px}
#yt-shorts-limit-root .yt-gate-ring{width:100%;height:100%;display:block}
#yt-shorts-limit-root .yt-gate-ring-bg{stroke:var(--yt-spec-10-percent-layer,rgba(128,128,128,.28))}
#yt-shorts-limit-root .yt-gate-ring-fg{
  stroke:var(--yt-spec-brand-button-background,#cc0000);
  transition:stroke-dashoffset .12s linear,stroke .3s ease;
}
#yt-shorts-limit-root.yt-gate-done .yt-gate-ring-fg{stroke:#2ba640}
#yt-shorts-limit-root .yt-gate-count{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
#yt-shorts-limit-root .yt-gate-num{font-size:38px;line-height:40px;font-weight:500;font-variant-numeric:tabular-nums}
#yt-shorts-limit-root .yt-gate-unit{font-size:12px;color:var(--yt-spec-text-secondary,#606060)}
#yt-shorts-limit-root .yt-gate-status{margin:0 0 14px;font-size:14px;font-weight:500;min-height:20px}
#yt-shorts-limit-root .yt-gate-actions{display:flex;gap:8px;justify-content:center;margin-top:4px;flex-wrap:wrap}
#yt-shorts-limit-root .yt-gate-btn{
  appearance:none;border:0;cursor:pointer;height:36px;padding:0 16px;border-radius:18px;
  font:500 14px/36px "Roboto","Arial",sans-serif;
  background:var(--yt-spec-badge-chip-background,rgba(128,128,128,.18));
  color:inherit;
}
#yt-shorts-limit-root .yt-gate-btn:hover{background:var(--yt-spec-button-chip-background-hover,rgba(128,128,128,.3))}
#yt-shorts-limit-root .yt-gate-btn-primary{
  background:var(--yt-spec-text-primary,#0f0f0f);
  color:var(--yt-spec-text-primary-inverse,#fff);
}
#yt-shorts-limit-root .yt-gate-btn-primary:hover{opacity:.85}
#yt-shorts-limit-root .yt-gate-btn:disabled{opacity:.35;cursor:not-allowed}
@media (max-width:600px){
  #yt-shorts-limit-root .yt-gate-title{font-size:18px;line-height:24px}
  #yt-shorts-limit-root .yt-gate-ring-wrap{width:104px;height:104px}
  #yt-shorts-limit-root .yt-gate-num{font-size:32px}
}
`;

  function buildCSS() {
    return [
      CONFIG.HIDE_SHORTS_NAV ? hideRules(SHORTS_NAV) : '',
      CONFIG.HIDE_SHORTS_CONTENT ? hideRules(SHORTS_CONTENT) : '',
      hideRules(GATE_HIDE),
      GATE_CSS,
      SHORTS_LIMIT_CSS,
    ].join('\n');
  }

  /* ------------------------------------------------------------------ *
   * Storage (sessionStorage with in-memory fallback)
   * ------------------------------------------------------------------ */
  let memUnlockedAt = 0;
  function readUnlockedAt() {
    try {
      const v = Number(sessionStorage.getItem(STORE_KEY));
      return v || memUnlockedAt;
    } catch (_) { return memUnlockedAt; }
  }
  function writeUnlockedAt(ts) {
    memUnlockedAt = ts;
    try { sessionStorage.setItem(STORE_KEY, String(ts)); } catch (_) { /* ignore */ }
  }
  function isUnlocked() {
    const t = readUnlockedAt();
    if (!t) return false;
    if (CONFIG.UNLOCK_TTL_MINUTES === 0) return true;
    return Date.now() - t < CONFIG.UNLOCK_TTL_MINUTES * 60000;
  }

  /* ------------------------------------------------------------------ *
   * Safe DOM builders (no innerHTML -> Trusted Types safe)
   * ------------------------------------------------------------------ */
  function h(tag, opts = {}, kids = []) {
    const el = document.createElement(tag);
    if (opts.cls) el.className = opts.cls;
    if (opts.text != null) el.textContent = opts.text;
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) el.setAttribute(k, v);
    if (opts.on) for (const [k, v] of Object.entries(opts.on)) el.addEventListener(k, v);
    for (const k of kids) el.appendChild(k);
    return el;
  }
  function s(tag, attrs = {}, kids = []) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    for (const k of kids) el.appendChild(k);
    return el;
  }

  /* ------------------------------------------------------------------ *
   * Mascot (redesigned: cohesive character owl on a branch with glasses)
   * ------------------------------------------------------------------ */
  function buildMascot() {
    return s('svg', { class: 'yt-gate-mascot', viewBox: '0 0 120 120', 'aria-hidden': 'true' }, [
      // Soft drop shadow
      s('ellipse', { cx: 60, cy: 112, rx: 34, ry: 4, fill: 'rgba(0,0,0,0.18)' }),

      // Perch branch + leaves
      s('rect', { x: 18, y: 97, width: 84, height: 7, rx: 3.5, fill: '#6d4c41' }),
      s('path', { d: 'M18 100.5 H102', stroke: '#4e342e', 'stroke-width': 1.5 }),
      s('path', { d: 'M24 97 C16 91 15 82 24 85 C29 87 28 94 24 97 Z', fill: '#43a047' }),
      s('path', { d: 'M96 97 C104 91 105 82 96 85 C91 87 92 94 96 97 Z', fill: '#66bb6a' }),

      // Left & right ear tufts
      s('path', { d: 'M30 34 L20 15 L44 24 Z', fill: '#3949ab' }),
      s('path', { d: 'M90 34 L100 15 L76 24 Z', fill: '#3949ab' }),

      // Main unified owl body
      s('rect', { x: 24, y: 20, width: 72, height: 78, rx: 34, fill: '#3949ab' }),

      // Forehead crown shading
      s('path', { d: 'M46 20 H74 L60 33 Z', fill: '#283593' }),

      // Cream belly patch + feather chevrons
      s('ellipse', { cx: 60, cy: 74, rx: 24, ry: 21, fill: '#eef2ff' }),
      s('path', {
        d: 'M51 67 L55 71 L59 67 M61 67 L65 71 L69 67 M47 76 L51 80 L55 76 M56 77 L60 81 L64 77 M65 76 L69 80 L73 76 M53 86 L57 90 L61 86 M61 86 L65 90 L69 86',
        fill: 'none', stroke: '#9fa8da', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }),

      // Tucked side wings
      s('path', { d: 'M25 46 C14 58 16 82 31 90 C31 74 30 58 25 46 Z', fill: '#283593' }),
      s('path', { d: 'M95 46 C106 58 104 82 89 90 C89 74 90 58 95 46 Z', fill: '#283593' }),

      // Dual-circle facial disc
      s('circle', { cx: 45, cy: 46, r: 16, fill: '#eef2ff' }),
      s('circle', { cx: 75, cy: 46, r: 16, fill: '#eef2ff' }),

      // Blinking eyes group (sclera + iris + pupil + catchlights blink together)
      s('g', { class: 'yt-gate-eye' }, [
        s('circle', { cx: 45, cy: 46, r: 11.5, fill: '#ffffff' }),
        s('circle', { cx: 75, cy: 46, r: 11.5, fill: '#ffffff' }),
        s('circle', { cx: 45, cy: 46, r: 8.5, fill: '#ffb300' }),
        s('circle', { cx: 75, cy: 46, r: 8.5, fill: '#ffb300' }),
        s('circle', { cx: 45, cy: 46, r: 5, fill: '#1a237e' }),
        s('circle', { cx: 75, cy: 46, r: 5, fill: '#1a237e' }),
        s('circle', { cx: 48, cy: 43, r: 2.3, fill: '#ffffff' }),
        s('circle', { cx: 78, cy: 43, r: 2.3, fill: '#ffffff' }),
        s('circle', { cx: 42.5, cy: 48.5, r: 1.1, fill: '#ffffff' }),
        s('circle', { cx: 72.5, cy: 48.5, r: 1.1, fill: '#ffffff' }),
      ]),

      // Wise glasses frames + bridge
      s('circle', { cx: 45, cy: 46, r: 14, fill: 'none', stroke: '#ff7043', 'stroke-width': 2.5 }),
      s('circle', { cx: 75, cy: 46, r: 14, fill: 'none', stroke: '#ff7043', 'stroke-width': 2.5 }),
      s('path', { d: 'M59 45 Q60 43 61 45', fill: 'none', stroke: '#ff7043', 'stroke-width': 2.5, 'stroke-linecap': 'round' }),

      // Focused brow lines
      s('path', { d: 'M32 32 Q45 36 55 34', fill: 'none', stroke: '#1a237e', 'stroke-width': 3, 'stroke-linecap': 'round' }),
      s('path', { d: 'M88 32 Q75 36 65 34', fill: 'none', stroke: '#1a237e', 'stroke-width': 3, 'stroke-linecap': 'round' }),

      // Diamond beak
      s('path', { d: 'M55 52 L60 48 L65 52 L60 61 Z', fill: '#ffa000' }),
      s('path', { d: 'M55 52 L60 48 L60 61 Z', fill: '#ffb300' }),

      // Talons gripping the branch
      s('g', { fill: '#ffa000' }, [
        s('rect', { x: 40, y: 93, width: 3.5, height: 8, rx: 1.75 }),
        s('rect', { x: 44.5, y: 92, width: 3.5, height: 9, rx: 1.75 }),
        s('rect', { x: 49, y: 93, width: 3.5, height: 8, rx: 1.75 }),
        s('rect', { x: 67.5, y: 93, width: 3.5, height: 8, rx: 1.75 }),
        s('rect', { x: 72, y: 92, width: 3.5, height: 9, rx: 1.75 }),
        s('rect', { x: 76.5, y: 93, width: 3.5, height: 8, rx: 1.75 }),
      ]),
    ]);
  }

  /* ------------------------------------------------------------------ *
   * Gate UI (homepage intent gate)
   * ------------------------------------------------------------------ */
  const ui = { root: null, num: null, fg: null, status: null, unlockBtn: null, unit: null };
  const state = { engaged: false, running: false, done: false, remainingMs: 0, last: 0, timer: 0, lastShown: -1 };

  function ensureUI() {
    if (ui.root && ui.root.isConnected) return true;
    if (!document.body) return false;

    const num = h('div', { cls: 'yt-gate-num', text: String(CONFIG.COUNTDOWN_SECONDS) });
    const unit = h('div', { cls: 'yt-gate-unit', text: 'seconds' });
    const fg = s('circle', {
      class: 'yt-gate-ring-fg', cx: 60, cy: 60, r: RING_R, fill: 'none',
      'stroke-width': 8, 'stroke-linecap': 'round',
      'stroke-dasharray': RING_C.toFixed(2), 'stroke-dashoffset': '0',
      transform: 'rotate(-90 60 60)',
    });
    const ring = s('svg', { class: 'yt-gate-ring', viewBox: '0 0 120 120', 'aria-hidden': 'true' }, [
      s('circle', { class: 'yt-gate-ring-bg', cx: 60, cy: 60, r: RING_R, fill: 'none', 'stroke-width': 8 }),
      fg,
    ]);
    const ringWrap = h('div', { cls: 'yt-gate-ring-wrap' }, [
      ring,
      h('div', { cls: 'yt-gate-count' }, [num, unit]),
    ]);

    const status = h('p', {
      cls: 'yt-gate-status',
      text: 'Breathe. The feed unlocks when the timer ends.',
      attrs: { 'aria-live': 'polite' },
    });

    const unlockBtn = h('button', {
      cls: 'yt-gate-btn yt-gate-btn-primary',
      text: 'Open my feed',
      attrs: { type: 'button', disabled: '' },
      on: { click: unlock },
    });

    const actions = h('div', { cls: 'yt-gate-actions' }, [
      h('button', { cls: 'yt-gate-btn', text: 'Search', attrs: { type: 'button' }, on: { click: focusSearch } }),
      h('button', {
        cls: 'yt-gate-btn', text: 'Subscriptions', attrs: { type: 'button' },
        on: { click: () => goTo('/feed/subscriptions') },
      }),
      unlockBtn,
    ]);

    const card = h('div', { cls: 'yt-gate-card' }, [
      buildMascot(),
      h('h1', { cls: 'yt-gate-title', text: 'What did you come here to do?' }),
      h('p', {
        cls: 'yt-gate-copy',
        text: 'Have one specific thing in mind: a video, a topic, a person to catch up with. ' +
              'If you cannot name it, the feed is not what you need right now.',
      }),
      ringWrap,
      status,
      actions,
    ]);

    const root = h('div', { attrs: { id: ROOT_ID, role: 'region', 'aria-label': 'Intent gate' } }, [card]);
    document.body.appendChild(root);

    Object.assign(ui, { root, num, fg, status, unlockBtn, unit });
    return true;
  }

  function resetUI() {
    if (!ui.root) return;
    ui.root.classList.remove('yt-gate-done');
    ui.unlockBtn.setAttribute('disabled', '');
    ui.status.textContent = 'Breathe. The feed unlocks when the timer ends.';
    ui.unit.textContent = 'seconds';
    ui.fg.setAttribute('stroke-dashoffset', '0');
    ui.num.textContent = String(CONFIG.COUNTDOWN_SECONDS);
    state.lastShown = -1;
  }

  function render() {
    if (!ui.root) return;
    const total = CONFIG.COUNTDOWN_SECONDS * 1000;
    const secs = Math.max(0, Math.ceil(state.remainingMs / 1000));
    if (secs !== state.lastShown) {
      ui.num.textContent = String(secs);
      state.lastShown = secs;
    }
    const elapsedFrac = 1 - Math.max(0, state.remainingMs) / total;
    ui.fg.setAttribute('stroke-dashoffset', (RING_C * elapsedFrac).toFixed(2));
  }

  /* ------------------------------------------------------------------ *
   * Countdown (homepage intent gate)
   * ------------------------------------------------------------------ */
  function startCountdown() {
    stopCountdown();
    resetUI();
    state.remainingMs = CONFIG.COUNTDOWN_SECONDS * 1000;
    state.last = performance.now();
    state.running = true;
    state.done = false;
    render();
    state.timer = setInterval(tick, 100);
  }

  function stopCountdown() {
    if (state.timer) clearInterval(state.timer);
    state.timer = 0;
    state.running = false;
  }

  function tick() {
    const now = performance.now();
    const dt = Math.min(now - state.last, 500);
    state.last = now;
    if (CONFIG.PAUSE_WHEN_TAB_HIDDEN && document.hidden) return;
    state.remainingMs -= dt;
    if (state.remainingMs <= 0) complete();
    else render();
  }

  function complete() {
    stopCountdown();
    state.done = true;
    state.remainingMs = 0;
    render();
    if (!ui.root) return;
    ui.root.classList.add('yt-gate-done');
    ui.num.textContent = '0';
    ui.unit.textContent = 'ready';
    ui.status.textContent = 'Time is up. Still have a clear goal? Then go for it.';
    ui.unlockBtn.removeAttribute('disabled');
  }

  /* ------------------------------------------------------------------ *
   * Gate engage / disengage
   * ------------------------------------------------------------------ */
  function engage() {
    document.documentElement.setAttribute(ATTR, '');
    if (!state.engaged) { state.engaged = true; state.done = false; }
    if (!ensureUI()) return;
    layout();
    if (!state.running && !state.done) startCountdown();
  }

  function disengage() {
    state.engaged = false;
    state.done = false;
    stopCountdown();
    document.documentElement.removeAttribute(ATTR);
  }

  function unlock() {
    if (!state.done) return;
    writeUnlockedAt(Date.now());
    disengage();
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
    });
  }

  /* ------------------------------------------------------------------ *
   * Helpers: layout, search, navigation
   * ------------------------------------------------------------------ */
  function layout() {
    if (!ui.root) return;
    const hdr = document.querySelector('ytd-masthead, ytm-mobile-topbar-renderer');
    if (hdr) {
      const bottom = Math.round(hdr.getBoundingClientRect().bottom);
      if (bottom > 0 && bottom < 140) ui.root.style.setProperty('--yt-gate-top', bottom + 'px');
    }
    let bottomPx = 0;
    if (IS_MOBILE && CONFIG.KEEP_MOBILE_BOTTOM_NAV) {
      const nav = document.querySelector('ytm-pivot-bar-renderer');
      if (nav) {
        const r = nav.getBoundingClientRect();
        const gap = Math.round(window.innerHeight - r.top);
        if (gap > 0 && gap < 140) bottomPx = gap;
      }
    }
    ui.root.style.setProperty('--yt-gate-bottom', bottomPx + 'px');
  }

  function focusSearch() {
    const input = document.querySelector(
      'input.ytSearchboxComponentInput, input#search, input[name="search_query"]'
    );
    if (input) { input.focus(); return; }
    const btn = document.querySelector(
      'button[aria-label="Search YouTube"], button[aria-label="Search"], ytm-search-box button'
    );
    if (btn) btn.click();
  }

  function goTo(path) {
    if (shortsState.limited) dismissShortsLimit();
    const a = document.querySelector(`a[href="${path}"]`);
    if (a) {
      a.click();
      setTimeout(() => { if (location.pathname !== path) location.assign(path); }, 500);
    } else {
      location.assign(path);
    }
  }

  /* ------------------------------------------------------------------ *
   * Shorts scroll limiter (tracks actual Short-to-Short navigation)
   * ------------------------------------------------------------------ */
  const shortsState = {
    scrolls: 0,
    limited: false,
    done: false,
    timer: 0,
    remainingMs: 0,
    running: false,
    last: 0,
    lastShortId: null,
    lastStepAt: 0,
  };
  const sui = { root: null, num: null, unit: null, fg: null, status: null, okBtn: null };

  function getActiveShortId() {
    const m = location.pathname.match(/^\/shorts\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  function isShortsPage() {
    return location.pathname.startsWith('/shorts/');
  }

  function pauseActiveShortsVideo() {
    const videos = document.querySelectorAll('ytd-reel-video-renderer video, ytd-shorts video, video.html5-main-video');
    for (const v of videos) {
      try { if (!v.paused) v.pause(); } catch (_) {}
    }
  }

  // Called whenever the user advances to a new Short
  function recordShortAdvance(newId) {
    if (!CONFIG.LIMIT_SHORTS) return;
    if (!isShortsPage()) return;

    // First Short opened when entering /shorts/: initialize baseline, don't count as a scroll yet
    if (!shortsState.lastShortId) {
      shortsState.lastShortId = newId || '__initial__';
      return;
    }

    if (newId && newId === shortsState.lastShortId) return;

    const now = performance.now();
    if (now - shortsState.lastStepAt < 350) return; // debounce rapid events
    shortsState.lastStepAt = now;
    if (newId) shortsState.lastShortId = newId;

    if (shortsState.limited) {
      pauseActiveShortsVideo();
      return;
    }

    shortsState.scrolls++;
    if (shortsState.scrolls >= CONFIG.SHORTS_MAX_SCROLLS) {
      engageShortsLimit();
    }
  }

  // Block scrolling/keys while the Shorts limit modal is active
  function blockWhenLimited(e) {
    if (!shortsState.limited || !isShortsPage()) return;
    if (e.target && sui.root && sui.root.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function onShortsKeyDown(e) {
    if (!isShortsPage()) return;
    if (shortsState.limited) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'j', 'k'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
  }

  function ensureShortsLimitUI() {
    if (sui.root && sui.root.isConnected) return true;
    if (!document.body) return false;

    const num = h('div', { cls: 'yt-gate-num', text: String(CONFIG.SHORTS_COOLDOWN_SECONDS) });
    const unit = h('div', { cls: 'yt-gate-unit', text: 'seconds' });
    const fg = s('circle', {
      class: 'yt-gate-ring-fg', cx: 60, cy: 60, r: RING_R, fill: 'none',
      'stroke-width': 8, 'stroke-linecap': 'round',
      'stroke-dasharray': RING_C.toFixed(2), 'stroke-dashoffset': '0',
      transform: 'rotate(-90 60 60)',
    });
    const ring = s('svg', { class: 'yt-gate-ring', viewBox: '0 0 120 120', 'aria-hidden': 'true' }, [
      s('circle', { class: 'yt-gate-ring-bg', cx: 60, cy: 60, r: RING_R, fill: 'none', 'stroke-width': 8 }),
      fg,
    ]);
    const ringWrap = h('div', { cls: 'yt-gate-ring-wrap' }, [
      ring,
      h('div', { cls: 'yt-gate-count' }, [num, unit]),
    ]);

    const status = h('p', {
      cls: 'yt-gate-status',
      text: `Wait ${CONFIG.SHORTS_COOLDOWN_SECONDS}s before scrolling more Shorts.`,
      attrs: { 'aria-live': 'polite' },
    });

    const okBtn = h('button', {
      cls: 'yt-gate-btn yt-gate-btn-primary',
      text: 'Continue watching (3 more)',
      attrs: { type: 'button', disabled: '' },
      on: { click: dismissShortsLimit },
    });

    const leaveBtn = h('button', {
      cls: 'yt-gate-btn',
      text: 'Leave Shorts',
      attrs: { type: 'button' },
      on: { click: () => goTo('/feed/subscriptions') },
    });

    const card = h('div', { cls: 'yt-gate-card' }, [
      buildMascot(),
      h('h2', { cls: 'yt-gate-title', text: `You've scrolled ${CONFIG.SHORTS_MAX_SCROLLS} Shorts` }),
      h('p', {
        cls: 'yt-gate-copy',
        text: 'Shorts are designed to keep you swiping endlessly. Take a quick breather and decide if you really want to keep scrolling.',
      }),
      ringWrap,
      status,
      h('div', { cls: 'yt-gate-actions' }, [leaveBtn, okBtn]),
    ]);

    const root = h('div', { attrs: { id: 'yt-shorts-limit-root', role: 'dialog', 'aria-label': 'Shorts limit' } }, [card]);
    document.body.appendChild(root);
    Object.assign(sui, { root, num, unit, fg, status, okBtn });
    return true;
  }

  function renderShortsLimit() {
    if (!sui.root) return;
    const total = CONFIG.SHORTS_COOLDOWN_SECONDS * 1000;
    const secs = Math.max(0, Math.ceil(shortsState.remainingMs / 1000));
    if (sui.num) sui.num.textContent = String(secs);
    if (sui.fg) {
      const frac = 1 - Math.max(0, shortsState.remainingMs) / total;
      sui.fg.setAttribute('stroke-dashoffset', (RING_C * frac).toFixed(2));
    }
    if (sui.status && !shortsState.done) {
      sui.status.textContent = `Wait ${secs}s before scrolling more Shorts.`;
    }
  }

  function startShortsCountdown() {
    if (shortsState.timer) clearInterval(shortsState.timer);
    shortsState.remainingMs = CONFIG.SHORTS_COOLDOWN_SECONDS * 1000;
    shortsState.last = performance.now();
    shortsState.running = true;
    shortsState.done = false;
    if (sui.root) sui.root.classList.remove('yt-gate-done');
    if (sui.unit) sui.unit.textContent = 'seconds';
    if (sui.okBtn) sui.okBtn.setAttribute('disabled', '');
    renderShortsLimit();
    shortsState.timer = setInterval(tickShortsLimit, 100);
  }

  function tickShortsLimit() {
    const now = performance.now();
    const dt = Math.min(now - shortsState.last, 500);
    shortsState.last = now;
    if (CONFIG.PAUSE_WHEN_TAB_HIDDEN && document.hidden) return;
    shortsState.remainingMs -= dt;
    pauseActiveShortsVideo();
    if (shortsState.remainingMs <= 0) finishShortsCooldown();
    else renderShortsLimit();
  }

  function finishShortsCooldown() {
    clearInterval(shortsState.timer);
    shortsState.timer = 0;
    shortsState.running = false;
    shortsState.done = true;
    shortsState.remainingMs = 0;
    renderShortsLimit();
    if (!sui.root) return;
    sui.root.classList.add('yt-gate-done');
    sui.num.textContent = '0';
    sui.unit.textContent = 'ready';
    sui.status.textContent = 'Cooldown complete. Scroll with intention!';
    sui.okBtn.removeAttribute('disabled');
  }

  function engageShortsLimit() {
    shortsState.limited = true;
    shortsState.scrolls = 0;
    document.documentElement.setAttribute('yt-shorts-limited', '');
    pauseActiveShortsVideo();
    if (!ensureShortsLimitUI()) return;
    startShortsCountdown();
  }

  function dismissShortsLimit() {
    if (!shortsState.done && shortsState.running) return;
    shortsState.running = false;
    shortsState.limited = false;
    shortsState.done = false;
    shortsState.scrolls = 0;
    clearInterval(shortsState.timer);
    shortsState.timer = 0;
    document.documentElement.removeAttribute('yt-shorts-limited');
  }

  /* ------------------------------------------------------------------ *
   * Routing
   * ------------------------------------------------------------------ */
  function isGateRoute(path) { return path === '/'; }

  function evaluate() {
    try {
      const path = location.pathname;

      // Optional redirect (disabled by default so Shorts open as Shorts)
      if (CONFIG.REDIRECT_SHORTS && /^\/shorts\/[^/]+/.test(path)) {
        const id = path.split('/')[2];
        location.replace('/watch?v=' + encodeURIComponent(id));
        return;
      }

      // Track Shorts navigation when inside /shorts/
      if (isShortsPage()) {
        const currentId = getActiveShortId();
        if (currentId) recordShortAdvance(currentId);
      } else {
        // Reset current Short baseline when leaving the Shorts player
        shortsState.lastShortId = null;
        if (shortsState.limited) {
          clearInterval(shortsState.timer);
          shortsState.timer = 0;
          shortsState.running = false;
          shortsState.limited = false;
          document.documentElement.removeAttribute('yt-shorts-limited');
        }
      }

      if (isGateRoute(path) && !isUnlocked()) engage();
      else disengage();
    } catch (e) {
      console.warn('[yt-gate] evaluate failed', e);
    }
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return true;
    const root = document.documentElement;
    if (!root) return false;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = buildCSS();
    root.appendChild(st);
    return true;
  }

  // 1) Zero-flicker: style + attribute are applied synchronously at document-start.
  if (!injectStyle()) {
    const mo = new MutationObserver(() => { if (injectStyle()) { mo.disconnect(); evaluate(); } });
    mo.observe(document, { childList: true });
  }
  evaluate();

  // 2) SPA route detection: patched History API + YouTube events + fallback poll.
  for (const k of ['pushState', 'replaceState']) {
    const orig = history[k];
    history[k] = function () {
      const r = orig.apply(this, arguments);
      evaluate();
      return r;
    };
  }
  for (const ev of ['yt-navigate-finish', 'yt-page-data-updated', 'state-navigatefinish', 'popstate', 'pageshow']) {
    window.addEventListener(ev, evaluate, true);
    document.addEventListener(ev, evaluate, true);
  }
  window.addEventListener('resize', layout, { passive: true });
  document.addEventListener('DOMContentLoaded', evaluate);

  // 3) Lock wheel/touch/keys while the Shorts cooldown overlay is up
  window.addEventListener('wheel', blockWhenLimited, { passive: false, capture: true });
  window.addEventListener('touchmove', blockWhenLimited, { passive: false, capture: true });
  window.addEventListener('keydown', onShortsKeyDown, true);

  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) { lastHref = location.href; evaluate(); }
    injectStyle();
    if (state.engaged) {
      if (!ui.root || !ui.root.isConnected) ensureUI();
      if (state.engaged && !state.running && !state.done && ui.root) startCountdown();
      layout();
    }
    if (shortsState.limited && isShortsPage()) {
      if (!sui.root || !sui.root.isConnected) ensureShortsLimitUI();
      pauseActiveShortsVideo();
    }
  }, 500);
})();
