// ==UserScript==
// @name         YouTube One-Click Downloader
// @namespace    https://github.com/adish08/youtube-oneclick-download
// @version      7.0
// @description  One click on YouTube (desktop or mobile): Audio (MP3, 320kb/s) or Video (MP4, 1080p) via CnvMP3, with a one-tap switch to Downr. Fills in the link and submits. No terminal.
// @author       adish08
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiNmZjAwMzMiLz48cGF0aCBkPSJNMzIgMTR2MjJNMjMgMjdsOSA5IDktOU0xNiA0NHY0YTQgNCAwIDAwNCA0aDI0YTQgNCAwIDAwNC00di00IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+
// @match        *://www.youtube.com/*
// @match        *://m.youtube.com/*
// @match        *://cnvmp3.com/*
// @match        *://www.cnvmp3.com/*
// @match        *://downr.org/*
// @match        *://www.downr.org/*
// @run-at       document-idle
// @noframes
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Services. To add one: add an entry here AND matching @match lines above.
  // ------------------------------------------------------------------
  const SERVICES = {
    cnvmp3: { name: 'CnvMP3', host: 'cnvmp3.com', home: 'https://cnvmp3.com/' },
    downr:  { name: 'Downr',  host: 'downr.org',  home: 'https://downr.org/' }
  };

  // Remembered service choice (default CnvMP3). New key, so an older saved choice can't override the default.
  const KEY_SERVICE = 'ydh_service_v2';
  const DEFAULT_SERVICE = 'cnvmp3';

  const KEY_JOB = 'ydh_job';
  const JOB_MAX_AGE_MS = 120000;

  const host = location.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    initYouTube();
  } else {
    const entry = Object.entries(SERVICES).find(([, s]) => s.host === host);
    if (entry) initService(entry[0]);
  }

  // ==================================================================
  // PART 1: on YouTube. Button, menu, and launching the service.
  // ==================================================================
  function initYouTube() {
    const BTN_ID = 'ydh-btn';
    const MENU_ID = 'ydh-menu';
    const NS = 'http://www.w3.org/2000/svg';
    const IS_MOBILE = host === 'm.youtube.com' || matchMedia('(pointer: coarse)').matches;
    // What to do with YouTube's own Download button (desktop):
    //  'takeover' = keep it, and make clicking it open our MP3/MP4 menu. Our own button
    //               appears only on videos where YouTube shows no Download button. (recommended)
    //  'hide'     = hide YouTube's button and show ours in exactly its place.
    const NATIVE_MODE = 'takeover';
    const INTERCEPT_NATIVE_DOWNLOAD = true; // desktop only

    // Icon paths (Material style, 24x24 viewBox).
    const DOWNLOAD_PATH = 'M17 18v1H6v-1h11zm-.5-6.6-.7-.7-3.8 3.7V4h-1v10.4l-3.8-3.8-.7.7 5 5 5-5z';
    const AUDIO_PATH = 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z';
    const VIDEO_PATH = 'M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z';
    const SYNC_PATH = 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z';

    const getService = () => {
      const id = GM_getValue(KEY_SERVICE, DEFAULT_SERVICE);
      return SERVICES[id] ? id : DEFAULT_SERVICE;
    };
    const cycleService = () => {
      const ids = Object.keys(SERVICES);
      const next = ids[(ids.indexOf(getService()) + 1) % ids.length];
      GM_setValue(KEY_SERVICE, next);
      return next;
    };

    // Canonical URL of the current video/short/live replay, or null.
    function cleanUrl() {
      const u = new URL(location.href);
      const v = u.searchParams.get('v');
      if (u.pathname === '/watch' && v) return `https://www.youtube.com/watch?v=${v}`;
      const m = u.pathname.match(/^\/shorts\/([\w-]{6,})/);
      return m ? `https://www.youtube.com/shorts/${m[1]}` : null;
    }

    // ---- toast ----
    let toastTimer = 0;
    function toast(text) {
      let el = document.getElementById('ydh-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ydh-toast';
        document.body.appendChild(el);
      }
      el.textContent = text;
      el.style.opacity = '1';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 3500);
    }

    // ---- launch: hand the job to the service tab ----
    function launch(kind) {
      const url = cleanUrl();
      if (!url) return toast('Open a video first.');
      const id = getService();
      const service = SERVICES[id];
      GM_setValue(KEY_JOB, { id, url, kind, ts: Date.now() });
      try { GM_setClipboard(url, 'text'); } catch (_) { /* backup only */ }
      if (typeof GM_openInTab === 'function') GM_openInTab(service.home, { active: true });
      else window.open(service.home, '_blank');
      toast(`Opening ${service.name}. Link copied as backup.`);
    }

    // ---- styles ----
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ydh-fade { from { opacity: 0; } to { opacity: 1; } }
      /* Menu: grows out of the button with YouTube's "emphasized decelerate" easing; rows follow one after another. */
      @keyframes ydh-pop { from { opacity: 0; transform: translateY(var(--ydh-dy, -6px)) scale(.94); } to { opacity: 1; transform: none; } }
      @keyframes ydh-row { from { opacity: 0; transform: translateY(var(--ydh-dy, -6px)); } to { opacity: 1; transform: none; } }
      #${MENU_ID} { transform-origin: var(--ydh-origin, top center); animation: ydh-pop .22s cubic-bezier(.05, 0, 0, 1) both; }
      #${MENU_ID} > div { animation: ydh-row .28s cubic-bezier(.05, 0, 0, 1) both; }
      #${MENU_ID} > div:nth-child(1) { animation-delay: .03s; }
      #${MENU_ID} > div:nth-child(2) { animation-delay: .06s; }
      #${MENU_ID} > div:nth-child(3) { animation-delay: .09s; }
      @media (prefers-reduced-motion: reduce) {
        #${MENU_ID}, #${MENU_ID} > div { animation: none; }
      }
      #${BTN_ID} { animation: ydh-fade .25s ease-out; }
      /* Self-contained copy of YouTube's tonal "icon + text" pill (does not rely on YT's own classes). */
      #${BTN_ID}.ydh-pill {
        display: inline-flex; align-items: center; justify-content: center; flex: none; align-self: center; vertical-align: middle;
        box-sizing: border-box; height: 36px; margin: 0 0 0 8px; padding: 0 16px;
        border: 0; border-radius: 18px; cursor: pointer; white-space: nowrap;
        background: var(--yt-spec-badge-chip-background, rgba(255,255,255,.1));
        color: var(--yt-spec-text-primary, #f1f1f1);
        font: 500 14px/36px Roboto, Arial, sans-serif; text-transform: none; letter-spacing: normal;
      }
      #${BTN_ID}.ydh-pill:hover { background: var(--yt-spec-button-chip-background-hover, rgba(255,255,255,.2)); }
      #${BTN_ID}.ydh-pill svg { margin: 0 6px 0 -6px; flex: none; }
      #${BTN_ID}.ydh-floating { position: fixed; right: 16px; bottom: 16px; z-index: 2147483000; margin: 0; box-shadow: 0 2px 10px rgba(0,0,0,.45); }
      #${BTN_ID}.ydh-fab {
        position: fixed; right: 14px; bottom: 80px; z-index: 2147483000; margin: 0;
        width: 48px; height: 48px; border: 0; border-radius: 50%; padding: 0;
        display: flex; align-items: center; justify-content: center;
        background: rgba(33,33,33,.94); color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.45);
      }
      #ydh-toast {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        z-index: 2147483647; padding: 10px 16px; border-radius: 8px; max-width: 90vw;
        background: #323232; color: #fff; font: 400 14px/20px Roboto, Arial, sans-serif;
        opacity: 0; transition: opacity .2s; pointer-events: none; text-align: center;
      }
    `;
    document.head.appendChild(style);

    // ---- popup menu ----
    let menuCleanup = null; // removes the "close on scroll/resize" listeners of the open menu

    function closeMenu() {
      const m = document.getElementById(MENU_ID);
      if (m) m.remove();
      if (menuCleanup) { menuCleanup(); menuCleanup = null; }
    }

    // Rect of the whole visible button: the clicked element can be smaller than the pill,
    // so grow the rect through button-sized ancestors (stop at wide containers like the action row).
    function anchorRect(el) {
      const r0 = el.getBoundingClientRect();
      let { top, bottom, left, right } = r0;
      let n = el.parentElement;
      for (let i = 0; i < 4 && n; i++, n = n.parentElement) {
        const q = n.getBoundingClientRect();
        if (q.height > 64 || q.width > 360 || q.width === 0) break;
        top = Math.min(top, q.top); bottom = Math.max(bottom, q.bottom);
        left = Math.min(left, q.left); right = Math.max(right, q.right);
      }
      return { top, bottom, left, right, width: right - left };
    }

    // Exact rect of the visible pill: the anchor can be a wrapper or an inner icon, so pick the
    // narrowest button-sized box on the element itself and among its button descendants.
    function pillRect(el) {
      const fits = (r) => r.width >= 80 && r.width <= 320 && r.height >= 28 && r.height <= 64;
      let best = null;
      const consider = (node) => {
        const r = node.getBoundingClientRect();
        if (fits(r) && (!best || r.width < best.width)) {
          best = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width };
        }
      };
      consider(el);
      for (const c of el.querySelectorAll('button, [role="button"], yt-button-shape, yt-button-view-model, .yt-spec-button-shape-next')) {
        consider(c);
      }
      if (best) return best;
      return anchorRect(el);
    }

    function openMenu(anchor) {
      closeMenu();
      const menu = document.createElement('div');
      menu.id = MENU_ID;
      Object.assign(menu.style, {
        position: 'fixed', zIndex: '2147483647', boxSizing: 'border-box', padding: '4px 0',
        borderRadius: '18px', background: 'var(--yt-spec-menu-background, #282828)',
        color: 'var(--yt-spec-text-primary, #fff)', boxShadow: '0 4px 32px rgba(0,0,0,.45)',
        font: '400 14px/20px Roboto, Arial, sans-serif', overflow: 'hidden'
      });

      // Rows are inset from the menu edge with their own rounded hover (concentric with the menu's corners).
      const addRow = (iconPath, label, onClick) => {
        const row = document.createElement('div');
        Object.assign(row.style, {
          display: 'flex', alignItems: 'center', gap: '10px',
          height: IS_MOBILE ? '44px' : '34px', margin: '0 4px', padding: '0 8px', whiteSpace: 'nowrap',
          borderRadius: '18px', cursor: 'pointer', boxSizing: 'border-box', transition: 'background-color .15s ease'
        });
        row.append(buildIcon(iconPath, 24), document.createTextNode(label));
        row.addEventListener('mouseenter', () => { row.style.background = 'var(--yt-spec-10-percent-layer, rgba(255,255,255,.1))'; });
        row.addEventListener('mouseleave', () => { row.style.background = ''; });
        row.addEventListener('click', onClick);
        menu.appendChild(row);
      };

      addRow(AUDIO_PATH, 'Audio', () => { closeMenu(); launch('audio'); });
      addRow(VIDEO_PATH, 'Video', () => { closeMenu(); launch('video'); });

      // Small footer: [icon] using CnvMP3 [switch icon]
      const foot = document.createElement('div');
      Object.assign(foot.style, {
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '4px', margin: '4px 0 0', whiteSpace: 'nowrap',
        padding: IS_MOBILE ? '8px 8px 4px 8px' : '6px 8px 2px 8px',
        borderTop: '1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,.1))',
        font: '400 10px/14px Roboto, Arial, sans-serif', color: 'var(--yt-spec-text-secondary, #aaa)'
      });
      const label = document.createElement('span');
      const refreshLabel = () => { label.textContent = `using ${SERVICES[getService()].name}`; };
      refreshLabel();
      const swap = document.createElement('span');
      swap.setAttribute('role', 'button');
      swap.setAttribute('aria-label', 'Switch download service');
      swap.title = 'Switch service';
      Object.assign(swap.style, { display: 'flex', padding: '3px', borderRadius: '50%', cursor: 'pointer' });
      Object.assign(swap.style, { transition: 'background-color .15s ease' });
      swap.addEventListener('mouseenter', () => { swap.style.background = 'var(--yt-spec-10-percent-layer, rgba(255,255,255,.15))'; });
      swap.addEventListener('mouseleave', () => { swap.style.background = ''; });
      const swapIcon = buildIcon(SYNC_PATH, 14);
      swapIcon.style.transition = 'transform .4s cubic-bezier(.2, 0, 0, 1)';
      let turns = 0;
      swap.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleService();
        refreshLabel();
        turns += 180;
        swapIcon.style.transform = `rotate(${turns}deg)`; // half-turn per switch
      });
      swap.appendChild(swapIcon);
      foot.append(label, swap);
      menu.appendChild(foot);

      document.body.appendChild(menu);
      const r = anchor ? pillRect(anchor) : { top: 80, bottom: 80, left: 20, width: 0 };
      // Match the visible button's width exactly (skip the tiny mobile FAB / keyboard shortcut).
      const menuW = r.width >= 80 ? Math.round(r.width) : 0;
      menu.style.width = menuW ? `${menuW}px` : 'max-content';
      const h = menu.offsetHeight, w = menu.offsetWidth;
      let top = r.bottom + 14;
      if (top + h > innerHeight - 8) {
        top = Math.max(8, r.top - h - 14); // open upwards if no room
        menu.style.setProperty('--ydh-origin', 'bottom center');
        menu.style.setProperty('--ydh-dy', '6px');
      }
      menu.style.top = `${top}px`;
      // Centre the menu under the button (kept inside the window).
      const centred = r.left + r.width / 2 - w / 2;
      menu.style.left = `${Math.max(8, Math.min(centred, innerWidth - w - 8))}px`;

      // The menu is anchored to where the button was when it opened, so close it as soon as the
      // page moves: scroll (any scroller), mouse wheel, touch drag, resize, tab/window switch, navigation.
      const openedAt = performance.now();
      const dismiss = () => { if (performance.now() - openedAt > 150) closeMenu(); }; // ignore layout noise right at open
      const events = [
        [window, 'scroll', true], [window, 'wheel', true], [window, 'touchmove', true],
        [window, 'resize', false], [window, 'blur', false], [window, 'popstate', false],
        [window, 'yt-navigate-start', true]
      ];
      for (const [t, ev, cap] of events) t.addEventListener(ev, dismiss, { capture: cap, passive: true });
      menuCleanup = () => { for (const [t, ev, cap] of events) t.removeEventListener(ev, dismiss, { capture: cap }); };
    }

    document.addEventListener('click', (e) => {
      if (!(e.target instanceof Element) || !e.target.closest(`#${MENU_ID}, #${BTN_ID}`)) closeMenu();
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
      if (e.altKey && e.shiftKey && e.code === 'KeyD' && cleanUrl()) openMenu(document.getElementById(BTN_ID));
    }, true);

    // ---- the button ----
    function buildIcon(path = DOWNLOAD_PATH, size = 24) {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', String(size));
      svg.setAttribute('height', String(size));
      svg.setAttribute('focusable', 'false');
      svg.style.cssText = 'fill:currentColor;display:block;pointer-events:none;';
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', path);
      svg.appendChild(p);
      return svg;
    }

    function buildButton() {
      const btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Download video or audio');

      if (IS_MOBILE) {
        btn.className = 'ydh-fab';
        btn.appendChild(buildIcon());
      } else {
        btn.className = 'ydh-pill';
        btn.append(buildIcon(), document.createTextNode('Download'));
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (document.getElementById(MENU_ID)) closeMenu(); else openMenu(btn);
      });
      return btn;
    }

    // Candidate containers for the action row, newest layout first.
    // FIX: old code took the first selector that merely EXISTED; in the new layout
    // #top-level-buttons-computed can exist but be empty/hidden, so the button was
    // injected invisibly. Now we only accept a container that is actually on screen.
    const BAR_SELECTORS = [
      'ytd-watch-metadata yt-flexible-actions-view-model',
      'ytd-watch-metadata #flexible-item-buttons',
      'ytd-watch-metadata #top-level-buttons-computed',
      'ytd-watch-metadata #actions-inner #menu',
      'ytd-watch-metadata #actions'
    ];

    const isShown = (el) => {
      if (!el || !el.isConnected) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.right <= innerWidth + 1 && r.left >= -1;
    };

    function findBar() {
      for (const sel of BAR_SELECTORS) {
        for (const el of document.querySelectorAll(sel)) {
          if (isShown(el)) return el;
        }
      }
      return null;
    }

    let forceFloating = false; // set if inline placement ever turns out invisible
    let navStart = Date.now(); // when the current page started loading
    let readySince = 0;        // when the action row first looked fully rendered
    let settleTimer = 0;
    const SETTLE_MS = 900;     // after the row renders, wait so YouTube's own Download button can appear first
    const GIVE_UP_MS = 6000;   // only after this long do we allow the floating fallback

    function resetState() {
      forceFloating = false;
      navStart = Date.now();
      readySince = 0;
      setTimeout(ensureButton, GIVE_UP_MS + 100); // re-check once the grace period is over
    }

    // YouTube's own Download button (desktop watch page), or null.
    function findNativeBtn() {
      const scope = document.querySelector('ytd-watch-metadata') || document;
      for (const el of scope.querySelectorAll('ytd-download-button-renderer, button[aria-label], [role="button"][aria-label]')) {
        if (el.closest(`#${BTN_ID}, #${MENU_ID}`)) continue;
        if (el.matches('ytd-download-button-renderer') || /^download$/i.test((el.getAttribute('aria-label') || '').trim())) {
          return el.closest('ytd-download-button-renderer, yt-button-view-model, button-view-model') || el;
        }
      }
      return null;
    }

    // YouTube leaves a wider gap before its Download button than between the other pills.
    // Measure the gaps and trim the excess margin so they match (only ever shrinks, a few tries at most).
    function tidyNativeSpacing(native) {
      try {
        const tries = Number(native.dataset.ydhAdj || 0);
        if (tries >= 6) return;
        const nr = anchorRect(native);
        if (!nr.width) return;
        const scope = native.closest('ytd-watch-metadata') || document;
        const midY = (nr.top + nr.bottom) / 2;
        let prevRight = -Infinity, nextLeft = null;
        for (const b of scope.querySelectorAll('button, [role="button"]')) {
          if (native.contains(b) || b.closest(`#${BTN_ID}, #${MENU_ID}`) || !isShown(b)) continue;
          const r = anchorRect(b);
          if (Math.abs((r.top + r.bottom) / 2 - midY) > 20) continue; // same row only
          if (r.right <= nr.left + 1) prevRight = Math.max(prevRight, r.right);
          else if (r.left >= nr.right - 1) nextLeft = nextLeft === null ? r.left : Math.min(nextLeft, r.left);
        }
        if (prevRight === -Infinity) return;
        const gapBefore = nr.left - prevRight;
        const gapAfter = nextLeft === null ? 8 : nextLeft - nr.right;
        const target = gapAfter > 0 && gapAfter < 24 ? gapAfter : 8;
        const excess = gapBefore - target;
        if (excess < 1.5) return;
        const cur = parseFloat(getComputedStyle(native).marginLeft) || 0;
        native.style.setProperty('margin-left', `${cur - excess}px`, 'important');
        native.dataset.ydhAdj = String(tries + 1);
      } catch (_) { /* cosmetic only */ }
    }

    function ensureButton() {
      let btn = document.getElementById(BTN_ID);
      if (!cleanUrl()) {
        if (btn) btn.remove();
        closeMenu();
        return;
      }

      if (IS_MOBILE) {
        if (!btn) btn = buildButton();
        if (!btn.isConnected) document.body.appendChild(btn);
        return;
      }

      const native = findNativeBtn();
      let anchor = null;

      if (native && NATIVE_MODE === 'takeover') {
        // YouTube's button is shown and already hijacked (see click handler below): no second button.
        if (isShown(native)) {
          if (btn) btn.remove();
          tidyNativeSpacing(native);
          return;
        }
      } else if (native && NATIVE_MODE === 'hide') {
        native.style.setProperty('display', 'none', 'important');
        anchor = native;
      }

      // Is the action row (Like / Share / ...) actually rendered yet?
      const bar = anchor ? null : findBar();
      const rowReady = !!anchor || (!!bar &&
        [...bar.querySelectorAll('button, [role="button"]')].some((b) => b.id !== BTN_ID && isShown(b)));

      if (!rowReady) {
        readySince = 0;
        // Mid re-render with our button already in the row: leave it alone (no flicker).
        if (btn && btn.isConnected && !btn.classList.contains('ydh-floating')) return;
        // Still loading: show nothing at all.
        if (Date.now() - navStart < GIVE_UP_MS) { if (btn) btn.remove(); return; }
      } else if (!anchor && !(btn && btn.isConnected)) {
        // Row just rendered. Give YouTube's own Download button a moment to show up
        // before deciding we need our own, so ours never pops in and then vanishes.
        if (!readySince) readySince = Date.now();
        const wait = SETTLE_MS - (Date.now() - readySince);
        if (wait > 0) {
          clearTimeout(settleTimer);
          settleTimer = setTimeout(ensureButton, wait + 30);
          return;
        }
      }

      if (!btn) btn = buildButton();

      if (!forceFloating) {
        if (anchor && anchor.parentElement) {
          // Sit exactly where the native button was.
          if (btn.previousElementSibling !== anchor) {
            btn.classList.remove('ydh-floating');
            anchor.insertAdjacentElement('afterend', btn);
          }
          if (isShown(btn)) return;
          forceFloating = true;
        } else if (bar) {
          if (btn.parentElement !== bar) {
            btn.classList.remove('ydh-floating');
            bar.appendChild(btn);
          }
          if (isShown(btn)) return;
          forceFloating = true; // inline spot is clipped/hidden: stop retrying it
        }
      }

      // Last resort (page still has no usable action row after the grace period): floating button.
      btn.classList.add('ydh-floating');
      if (btn.parentElement !== document.body) document.body.appendChild(btn);
    }

    // ---- take over YouTube's own Download button (desktop) ----
    const NATIVE_SELECTOR = 'ytd-download-button-renderer, ytd-menu-service-item-download-renderer';

    function findNativeDownload(target) {
      const direct = target.closest(NATIVE_SELECTOR);
      if (direct) return direct;
      const control = target.closest(
        'button, [role="button"], [role="menuitem"], ytd-menu-service-item-renderer, yt-list-item-view-model'
      );
      if (!control || !control.closest('ytd-watch-metadata, ytd-popup-container')) return null;
      const label = (control.getAttribute('aria-label') || control.textContent || '').trim();
      return /^download$/i.test(label) ? control : null;
    }

    if (!IS_MOBILE) {
      document.addEventListener('click', (e) => {
        if (!INTERCEPT_NATIVE_DOWNLOAD || !cleanUrl()) return;
        const t = e.composedPath()[0];
        if (!(t instanceof Element) || t.closest(`#${BTN_ID}, #${MENU_ID}`)) return;
        const native = findNativeDownload(t);
        if (!native) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        // Drop the white focus ring that would otherwise stay on YouTube's button (best effort).
        const active = document.activeElement;
        if (active && active !== document.body && typeof active.blur === 'function') active.blur();
        openMenu(native);
      }, true);
    }

    // ---- keep the button alive through YouTube's SPA navigation ----
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      setTimeout(() => { queued = false; ensureButton(); }, 300);
    };
    window.addEventListener('yt-navigate-finish', schedule, true);
    window.addEventListener('yt-navigate-start', () => {
      resetState();
      const b = document.getElementById(BTN_ID);
      if (b && b.classList.contains('ydh-floating')) b.remove(); // never leave a corner button over a loading page
    }, true);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    ensureButton();
    resetState();

    // ---- userscript manager menu (guarded: some managers lack this API) ----
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Download: audio (MP3)', () => launch('audio'));
      GM_registerMenuCommand('Download: video (MP4)', () => launch('video'));
      GM_registerMenuCommand('Switch download service', () => {
        toast(`Service: ${SERVICES[cycleService()].name}`);
      });
    }
  }

  // ==================================================================
  // PART 2: on the download service. Fill the link, pick format, submit.
  // Only runs when a fresh job was handed over from YouTube.
  // ==================================================================
  function initService(serviceId) {
    const job = GM_getValue(KEY_JOB, null);
    if (!job || job.id !== serviceId || !job.url || Date.now() - job.ts > JOB_MAX_AGE_MS) return;

    // CnvMP3 choices (edit these to change what gets selected).
    const CNV_BITRATE = /^320\s*kb\/s$/i; // audio: 320kb/s (falls back to the highest offered)
    const CNV_QUALITY = /^1080p$/i;       // video: 1080p   (falls back to the highest offered)

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const isVisible = (el) => el.offsetParent !== null || el.getClientRects().length > 0;

    function waitFor(fn, timeoutMs) {
      return new Promise((resolve) => {
        const started = Date.now();
        const timer = setInterval(() => {
          const result = fn();
          if (result || Date.now() - started > timeoutMs) {
            clearInterval(timer);
            resolve(result || null);
          }
        }, 250);
      });
    }

    // ---- small DOM helpers (the site's dropdowns are custom, not <select>) ----
    const ownText = (el) =>
      [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').replace(/\s+/g, ' ').trim();

    // Really on screen: sized, not hidden/transparent, and not covered by something else.
    function clickable(el) {
      if (!el || !el.isConnected) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let n = el;
      for (let i = 0; n && n !== document.body && i < 8; i++, n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
      }
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return true; // off-screen: cannot hit-test
      const hit = document.elementFromPoint(cx, cy);
      return !!hit && (hit === el || el.contains(hit));
    }

    // Visible elements whose own text matches, in document order.
    function findAllByText(re) {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'OPTION') continue;
        const t = ownText(n);
        if (t && re.test(t) && clickable(n)) out.push(n);
      }
      return out;
    }

    function realClick(el) {
      const o = { bubbles: true, cancelable: true, view: window, button: 0 };
      for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        const ev = t.startsWith('pointer') && typeof PointerEvent === 'function' ? new PointerEvent(t, o) : new MouseEvent(t, o);
        el.dispatchEvent(ev);
      }
    }

    const depthOf = (n) => { let d = 0; while (n.parentElement) { n = n.parentElement; d++; } return d; };
    function lcaDepth(a, b) {
      const seen = new Set();
      for (let n = a; n; n = n.parentElement) seen.add(n);
      for (let n = b; n; n = n.parentElement) if (seen.has(n)) return depthOf(n);
      return 0;
    }

    // Open the dropdown whose closed state shows a value matching toggleRe, then pick the option matching targetRe.
    // If that option does not exist and fallbackMax is set, pick the highest numeric option instead.
    async function pickFromDropdown(toggleRe, targetRe, fallbackMax) {
      // A real, visible <select> (in case the site ever switches to one).
      for (const sel of document.querySelectorAll('select')) {
        if (!clickable(sel)) continue;
        const opt = [...sel.options].find((o) => targetRe.test(o.textContent.trim()) || targetRe.test(o.value.trim()));
        if (opt) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }

      // Custom dropdown: while closed, only the current value is visible.
      const toggle = await waitFor(() => findAllByText(toggleRe)[0], 4000);
      if (!toggle) return false;
      if (targetRe.test(ownText(toggle))) return true; // already selected

      let options = [];
      for (const open of [() => toggle.click(), () => realClick(toggle)]) {
        open();
        options = (await waitFor(() => {
          const o = findAllByText(toggleRe).filter((e) => e !== toggle);
          return o.length ? o : null;
        }, 1500)) || [];
        if (options.length) break;
      }
      if (!options.length) return false;

      // Keep only the options that live next to this toggle (same dropdown).
      const best = Math.max(...options.map((o) => lcaDepth(o, toggle)));
      const near = options.filter((o) => lcaDepth(o, toggle) === best);
      let pick = near.find((o) => targetRe.test(ownText(o)));
      if (!pick && fallbackMax) {
        pick = [...near].sort((x, y) => parseInt(ownText(y), 10) - parseInt(ownText(x), 10))[0];
      }
      if (!pick) { toggle.click(); return false; } // nothing suitable: close it again

      pick.click();
      await sleep(400);
      if (clickable(pick)) { realClick(pick); await sleep(300); } // list still open: try a fuller click
      return true;
    }

    async function setupCnvmp3(kind) {
      // 1) MP3 / MP4
      await pickFromDropdown(/^(mp3|mp4)$/i, kind === 'audio' ? /^mp3$/i : /^mp4$/i, false);
      await sleep(400); // the Bitrate / Quality box swaps in after the format changes
      // 2) Bitrate (audio) or Quality (video)
      if (kind === 'audio') await pickFromDropdown(/^\d+\s*kb\/s$/i, CNV_BITRATE, true);
      else await pickFromDropdown(/^\d{3,4}p$/i, CNV_QUALITY, true);
    }

    function findInput() {
      const candidates = [...document.querySelectorAll('input[type="text"], input[type="url"], input:not([type]), textarea')]
        .filter((el) => isVisible(el) && !el.disabled && !el.readOnly);
      return (
        candidates.find((el) => /url|link|youtube|paste|http/i.test(`${el.placeholder} ${el.name} ${el.id}`)) ||
        candidates[0] || null
      );
    }

    // Sets the value in a way that frameworks (React, Vue...) notice.
    function setValue(el, value) {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Generic best effort for other services: click an exact "MP3"/"MP4" (or Audio/Video) toggle if there is one.
    function chooseKind(kind) {
      const want = kind === 'audio' ? /^(mp3|audio)$/i : /^(mp4|video)$/i;

      for (const sel of document.querySelectorAll('select')) {
        const opt = [...sel.options].find((o) => want.test(o.textContent.trim()) || want.test(o.value.trim()));
        if (opt) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      const el = [...document.querySelectorAll('button, label, a, [role="tab"], [role="radio"], [role="button"], li, span, div')]
        .find((e) => isVisible(e) && e.children.length <= 1 && want.test((e.textContent || '').trim()));
      if (el) { el.click(); return true; }
      return false;
    }

    function findSubmit(input) {
      // Exact "CONVERT" button first (CnvMP3). Disabled -> not ready yet.
      const exact = findAllByText(/^convert$/i)[0];
      if (exact) {
        const b = exact.closest('button, [role="button"], a, input[type="submit"]') || exact;
        return b.disabled ? null : b;
      }
      const pattern = /download|convert|start|go|search|get|submit|fetch/i;
      let scope = input.closest('form') || input.parentElement;
      for (let i = 0; i < 4 && scope; i++, scope = scope.parentElement) {
        const buttons = [...scope.querySelectorAll('button, input[type="submit"], [role="button"]')]
          .filter((b) => isVisible(b) && !b.disabled);
        if (buttons.length) {
          return buttons.find((b) => pattern.test(`${b.textContent} ${b.value || ''} ${b.getAttribute('aria-label') || ''}`)) || buttons[0];
        }
      }
      return null;
    }

    (async () => {
      const input = await waitFor(findInput, 15000);
      if (!input) return; // page layout unknown: the link is already on your clipboard
      await sleep(500);   // let the page finish wiring up its widgets
      try {
        if (serviceId === 'cnvmp3') await setupCnvmp3(job.kind);
        else chooseKind(job.kind);
      } catch (err) {
        console.warn('[YouTube One-Click Download] format selection failed:', err);
      }
      await sleep(300);
      const target = findInput() || input;
      setValue(target, job.url);
      await sleep(500);
      const submit = await waitFor(() => findSubmit(target), 4000);
      if (submit) submit.click();
      GM_setValue(KEY_JOB, null); // job done, never refill on reload
    })();
  }
})();