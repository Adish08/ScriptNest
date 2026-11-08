// ==UserScript==
// @name         YouTube One-Click Downloader OG
// @namespace    https://github.com/adish08/youtube-oneclick-download
// @version      8.1.0
// @description  Click YouTube's own Download button and pick Audio (MP3, 320kb/s) or Video (MP4, 1080p) via CnvMP3, with a one-tap switch to Downr. Fills in the link and submits. No terminal.
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
  // PART 1: on YouTube.
  //
  // Desktop: no extra button. YouTube's own Download (action row or the "..." overflow menu)
  // opens our Audio/Video menu instead. Fallbacks for videos with no Download control:
  // Alt+Shift+D, or the userscript manager's menu.
  // Mobile (m.youtube.com): a small round button, hidden in fullscreen.
  // ==================================================================
  function initYouTube() {
    const MENU_ID = 'ydh-menu';
    const FAB_ID = 'ydh-fab';
    const NS = 'http://www.w3.org/2000/svg';
    const IS_MOBILE = host === 'm.youtube.com';

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

    // Canonical URL of the current video/short, or null.
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
      toastTimer = setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => { if (el.style.opacity === '0') el.remove(); }, 250);
      }, 3500);
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
      @keyframes ydh-pop { from { opacity: 0; transform: translateY(var(--ydh-dy, -6px)) scale(.94); } to { opacity: 1; transform: none; } }
      #${MENU_ID} {
        position: fixed; z-index: 2147483647; box-sizing: border-box; padding: 4px 0;
        border-radius: 18px; background: var(--yt-spec-menu-background, #282828);
        color: var(--yt-spec-text-primary, #fff); box-shadow: 0 4px 32px rgba(0,0,0,.45);
        font: 400 14px/20px Roboto, Arial, sans-serif; overflow: hidden;
        transform-origin: var(--ydh-origin, top center);
        animation: ydh-pop .22s cubic-bezier(.05, 0, 0, 1) both;
      }
      #${MENU_ID} .ydh-row {
        display: flex; align-items: center; gap: 10px; height: 36px;
        margin: 0 4px; padding: 0 8px; white-space: nowrap;
        border-radius: 18px; cursor: pointer; box-sizing: border-box;
        transition: background-color .15s ease;
      }
      #${MENU_ID} .ydh-row:hover { background: var(--yt-spec-10-percent-layer, rgba(255,255,255,.1)); }
      #${MENU_ID}.ydh-mobile .ydh-row { height: 44px; }
      #${MENU_ID} .ydh-foot {
        display: flex; align-items: center; gap: 4px;
        margin: 4px 0 0; padding: 6px 12px 2px; white-space: nowrap;
        border-top: 1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,.1));
        font: 400 10px/14px Roboto, Arial, sans-serif; color: var(--yt-spec-text-secondary, #aaa);
      }
      #${MENU_ID} .ydh-swap { display: flex; padding: 3px; border-radius: 50%; cursor: pointer; transition: background-color .15s ease; }
      #${MENU_ID} .ydh-swap:hover { background: var(--yt-spec-10-percent-layer, rgba(255,255,255,.15)); }
      #${MENU_ID} .ydh-swap svg { transition: transform .4s cubic-bezier(.2, 0, 0, 1); }
      @media (prefers-reduced-motion: reduce) {
        #${MENU_ID} { animation: none; }
        #${MENU_ID} .ydh-swap svg { transition: none; }
      }
      #${FAB_ID} {
        position: fixed; right: 14px; bottom: 80px; z-index: 2147483000;
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

    // ---- icon ----
    function buildIcon(path, size = 24) {
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

    // ---- popup menu ----
    let menuCleanup = null;

    function closeMenu() {
      const m = document.getElementById(MENU_ID);
      if (m) m.remove();
      if (menuCleanup) { menuCleanup(); menuCleanup = null; }
    }

    // anchor: the element to hang the menu under (null = centred near the top of the window).
    function openMenu(anchor) {
      closeMenu();
      const menu = document.createElement('div');
      menu.id = MENU_ID;
      if (IS_MOBILE) menu.classList.add('ydh-mobile');

      const addRow = (iconPath, label, onClick) => {
        const row = document.createElement('div');
        row.className = 'ydh-row';
        row.append(buildIcon(iconPath), document.createTextNode(label));
        row.addEventListener('click', onClick);
        menu.appendChild(row);
      };
      addRow(AUDIO_PATH, 'Audio', () => { closeMenu(); launch('audio'); });
      addRow(VIDEO_PATH, 'Video', () => { closeMenu(); launch('video'); });

      // Footer: "using CnvMP3 [switch]"
      const foot = document.createElement('div');
      foot.className = 'ydh-foot';
      const label = document.createElement('span');
      const refreshLabel = () => { label.textContent = `using ${SERVICES[getService()].name}`; };
      refreshLabel();
      const swap = document.createElement('span');
      swap.className = 'ydh-swap';
      swap.setAttribute('role', 'button');
      swap.setAttribute('aria-label', 'Switch download service');
      swap.title = 'Switch service';
      const swapIcon = buildIcon(SYNC_PATH, 14);
      let turns = 0;
      swap.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleService();
        refreshLabel();
        turns += 180;
        swapIcon.style.transform = `rotate(${turns}deg)`;
      });
      swap.appendChild(swapIcon);
      foot.append(label, swap);
      menu.appendChild(foot);

      document.body.appendChild(menu);

      // Centred under the anchor, flipped upwards if there is no room, kept inside the window.
      const r = anchor ? anchor.getBoundingClientRect() : { top: 80, bottom: 80, left: innerWidth / 2, width: 0 };
      const w = Math.min(Math.max(Math.round(r.width) || 0, 170), 240);
      menu.style.width = `${w}px`;
      const h = menu.offsetHeight;
      let top = r.bottom + 8;
      if (top + h > innerHeight - 8) {
        top = Math.max(8, r.top - h - 8);
        menu.style.setProperty('--ydh-origin', 'bottom center');
        menu.style.setProperty('--ydh-dy', '6px');
      }
      menu.style.top = `${top}px`;
      menu.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8))}px`;

      // The menu is pinned to where the anchor was, so close it as soon as the page moves.
      const openedAt = performance.now();
      const dismiss = () => { if (performance.now() - openedAt > 150) closeMenu(); };
      const ac = new AbortController();
      for (const [t, ev] of [
        [window, 'scroll'], [window, 'wheel'], [window, 'touchmove'], [window, 'resize'],
        [window, 'blur'], [window, 'popstate'], [window, 'yt-navigate-start'], [document, 'fullscreenchange']
      ]) t.addEventListener(ev, dismiss, { capture: true, passive: true, signal: ac.signal });
      menuCleanup = () => ac.abort();
    }

    document.addEventListener('click', (e) => {
      if (!(e.target instanceof Element) || !e.target.closest(`#${MENU_ID}, #${FAB_ID}`)) closeMenu();
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
      if (e.altKey && e.shiftKey && e.code === 'KeyD' && cleanUrl()) openMenu(null);
    }, true);

    // ---- desktop: take over YouTube's own Download (row button or overflow-menu item) ----
    const NATIVE_SELECTOR = 'ytd-download-button-renderer, ytd-menu-service-item-download-renderer';

    function findNativeDownload(target) {
      const direct = target.closest(NATIVE_SELECTOR);
      if (direct) return direct;
      const control = target.closest(
        'button, [role="button"], [role="menuitem"], ytd-menu-service-item-renderer, yt-list-item-view-model'
      );
      if (!control || !control.closest('ytd-watch-metadata, ytd-popup-container')) return null;
      const label = (control.getAttribute('aria-label') || control.textContent || '').trim();
      return /^download$/i.test(label) ? control : null; // localized fallback, English only
    }

    if (!IS_MOBILE) {
      document.addEventListener('click', (e) => {
        if (!cleanUrl()) return;
        const t = e.composedPath()[0];
        if (!(t instanceof Element) || t.closest(`#${MENU_ID}`)) return;
        const native = findNativeDownload(t);
        if (!native) return;
        try {
          openMenu(native); // measures the anchor right now, before any popup is closed
        } catch (err) {
          closeMenu();
          console.warn('[YouTube One-Click Download] menu failed:', err);
          return; // let YouTube handle its own click
        }
        e.preventDefault();
        e.stopImmediatePropagation();

        // Clicked from the "..." overflow: close YouTube's popup so it doesn't linger behind our menu.
        if (native.closest('ytd-popup-container')) {
          for (const d of document.querySelectorAll('ytd-popup-container tp-yt-iron-dropdown')) {
            try { if (typeof d.close === 'function') d.close(); } catch (_) { /* best effort */ }
          }
        }
        const active = document.activeElement;
        if (active && active !== document.body && typeof active.blur === 'function') active.blur();
      }, true);
    }

    // ---- mobile: one round button, shown only on a video page and never in fullscreen ----
    if (IS_MOBILE) {
      const syncFab = () => {
        let fab = document.getElementById(FAB_ID);
        const wanted = cleanUrl() && !document.fullscreenElement;
        if (!wanted) { if (fab) fab.remove(); return; }
        if (fab) return;
        fab = document.createElement('button');
        fab.id = FAB_ID;
        fab.type = 'button';
        fab.setAttribute('aria-label', 'Download video or audio');
        fab.appendChild(buildIcon(DOWNLOAD_PATH));
        fab.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (document.getElementById(MENU_ID)) closeMenu(); else openMenu(fab);
        });
        document.body.appendChild(fab);
      };
      syncFab();
      setInterval(syncFab, 1000); // simple and robust against m.youtube's SPA navigation
    }

    // ---- userscript manager menu ----
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
  // (Unchanged from v7.0.1.)
  // ==================================================================
  function initService(serviceId) {
    const job = GM_getValue(KEY_JOB, null);
    if (!job || job.id !== serviceId || !job.url || Date.now() - job.ts > JOB_MAX_AGE_MS) return;
    GM_setValue(KEY_JOB, null); // one-shot: a refresh must not submit the same link again

    const CNV_BITRATE = /^320\s*kb\/s$/i; // audio: 320kb/s (falls back to the highest offered)
    const CNV_QUALITY = /^1080p$/i;       // video: 1080p   (falls back to the highest offered)

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const isVisible = (el) => {
      if (!el || !el.isConnected) return false;
      if (typeof el.checkVisibility === 'function') {
        return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
      }
      return el.offsetParent !== null || el.getClientRects().length > 0;
    };

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

    const ownText = (el) =>
      [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').replace(/\s+/g, ' ').trim();

    function clickable(el) {
      if (!el || !el.isConnected) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      if (typeof el.checkVisibility === 'function') {
        if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
      } else {
        let n = el;
        for (let i = 0; n && n !== document.body && i < 8; i++, n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        }
      }
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return true;
      const hit = document.elementFromPoint(cx, cy);
      return !!hit && (hit === el || el.contains(hit));
    }

    let textCache = { root: null, key: '', at: 0, out: null };
    const clearTextCache = () => { textCache = { root: null, key: '', at: 0, out: null }; };
    function findAllByText(re, root = document.body) {
      const key = `${re.source}/${re.flags}`;
      const now = performance.now();
      if (textCache.out && textCache.root === root && textCache.key === key && now - textCache.at < 100) {
        return textCache.out;
      }
      const out = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'OPTION') continue;
        const t = ownText(n);
        if (t && re.test(t) && clickable(n)) out.push(n);
      }
      textCache = { root, key, at: now, out };
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

    async function pickFromDropdown(toggleRe, targetRe, fallbackMax) {
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

      const toggle = await waitFor(() => findAllByText(toggleRe)[0], 4000);
      if (!toggle) return false;
      if (targetRe.test(ownText(toggle))) return true;

      let options = [];
      for (const open of [() => toggle.click(), () => realClick(toggle)]) {
        open();
        clearTextCache();
        options = (await waitFor(() => {
          const o = findAllByText(toggleRe).filter((e) => e !== toggle);
          return o.length ? o : null;
        }, 1500)) || [];
        if (options.length) break;
      }
      if (!options.length) return false;

      const best = Math.max(...options.map((o) => lcaDepth(o, toggle)));
      const near = options.filter((o) => lcaDepth(o, toggle) === best);
      let pick = near.find((o) => targetRe.test(ownText(o)));
      if (!pick && fallbackMax) {
        pick = [...near].sort((x, y) => parseInt(ownText(y), 10) - parseInt(ownText(x), 10))[0];
      }
      if (!pick) { toggle.click(); return false; }

      pick.click();
      await sleep(400);
      if (clickable(pick)) { realClick(pick); await sleep(300); }
      return true;
    }

    async function setupCnvmp3(kind) {
      await pickFromDropdown(/^(mp3|mp4)$/i, kind === 'audio' ? /^mp3$/i : /^mp4$/i, false);
      await sleep(400);
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

    function setValue(el, value) {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

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
      const form = input.closest('form');
      const searchRoot = form || document.body;
      let exact = findAllByText(/^convert$/i, searchRoot)[0];
      if (!exact && searchRoot !== document.body) exact = findAllByText(/^convert$/i)[0];
      if (exact) {
        const b = exact.closest('button, [role="button"], a, input[type="submit"]') || exact;
        return b.disabled ? null : b;
      }
      const pattern = /download|convert|start|go|search|get|submit|fetch/i;
      let scope = form || input.parentElement;
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
      await sleep(500);
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
    })();
  }
})();