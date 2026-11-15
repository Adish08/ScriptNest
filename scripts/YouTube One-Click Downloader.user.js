// ==UserScript==
// @name         YouTube One-Click Downloader
// @namespace    https://github.com/adish08
// @version      8.6.0
// @description  ReVanced-style in-player download button (placed before the autoplay toggle, native-style icon) + zero-UI triggers (native Download chip, long-press Share, or double-tap video title). Works in fullscreen on mobile.
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

(() => {
  'use strict';

  // Prevent duplicate execution. The flag lives on the DOM (shared by every script
  // sandbox/copy), because window.* flags are NOT shared between userscript sandboxes.
  const rootEl = document.documentElement;
  if (rootEl.hasAttribute('data-ydh-init')) return;
  rootEl.setAttribute('data-ydh-init', '1');

  const SERVICES = {
    cnvmp3: { name: 'CnvMP3', host: 'cnvmp3.com', home: 'https://cnvmp3.com/' },
    downr:  { name: 'Downr', host: 'downr.org', home: 'https://downr.org/' }
  };
  const KEY_SERVICE = 'ydh_service_v2';
  const KEY_JOB = 'ydh_job';
  const KEY_CLAIM = 'ydh_claimed_ts';
  const LAUNCH_ATTR = 'data-ydh-launch';
  const DEFAULT_SERVICE = 'cnvmp3';
  const JOB_MAX_AGE_MS = 120000;
  const host = location.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    initYouTube();
  } else {
    const service = Object.keys(SERVICES).find(id => SERVICES[id].host === host);
    if (service) initService(service);
  }

  function getService() {
    try {
      const id = GM_getValue(KEY_SERVICE, DEFAULT_SERVICE);
      return SERVICES[id] ? id : DEFAULT_SERVICE;
    } catch (_) {
      return DEFAULT_SERVICE;
    }
  }

  function cycleService() {
    const ids = Object.keys(SERVICES);
    const next = ids[(ids.indexOf(getService()) + 1) % ids.length];
    try { GM_setValue(KEY_SERVICE, next); } catch (_) { /* ignore */ }
    return next;
  }

  function currentVideoUrl() {
    const u = new URL(location.href);
    const id = (u.pathname === '/watch' || u.pathname === '/watch/') ? u.searchParams.get('v') : null;
    if (id) return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
    const short = u.pathname.match(/^\/shorts\/([\w-]{6,})/);
    return short ? `https://www.youtube.com/shorts/${short[1]}` : null;
  }

  function initYouTube() {
    // Set to true to hide YouTube's autoplay toggle (the download button then takes its place)
    const HIDE_AUTOPLAY_TOGGLE = false;

    const MENU_ID = 'ydh-menu';
    const BACKDROP_ID = 'ydh-backdrop';
    const PLAYER_BTN_ID = 'ydh-player-btn';
    const MOBILE = host === 'm.youtube.com' || /Android|Mobile/i.test(navigator.userAgent);
    const ICON = {
      download: 'M17 18v1H6v-1h11zm-.5-6.6-.7-.7-3.8 3.7V4h-1v10.4l-3.8-3.8-.7.7 5 5 5-5z',
      // Stroke-based version (matches YouTube's outline player icons)
      downloadThick: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14',
      audio: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
      video: 'M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z',
      switch: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z'
    };

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ydh-pop { from { opacity:0; transform:translateY(var(--ydh-dy,-6px)) scale(.96) } to { opacity:1; transform:none } }
      #${BACKDROP_ID} { position:fixed; inset:0; z-index:2147483646; background:rgba(0,0,0,.25);
        touch-action:none; -webkit-tap-highlight-color:transparent; }
      #${MENU_ID} { position:fixed; z-index:2147483647; box-sizing:border-box; width:215px; padding:6px 0;
        border-radius:16px; background:var(--yt-spec-menu-background,#282828); color:var(--yt-spec-text-primary,#fff);
        box-shadow:0 6px 32px rgba(0,0,0,.6); font:500 15px/20px Roboto,Arial,sans-serif; overflow:hidden;
        pointer-events:auto; isolation:isolate; animation:ydh-pop .15s ease-out both;
        -webkit-tap-highlight-color:transparent; user-select:none; }
      #${MENU_ID} .ydh-row { appearance:none; display:flex; width:calc(100% - 12px); height:46px; margin:2px 6px;
        padding:0 12px; align-items:center; gap:12px; border:0; border-radius:12px; background:transparent;
        color:inherit; text-align:left; font:inherit; cursor:pointer; touch-action:manipulation; }
      #${MENU_ID} .ydh-row:hover, #${MENU_ID} .ydh-row:active, #${MENU_ID} .ydh-row:focus-visible {
        background:var(--yt-spec-10-percent-layer,rgba(255,255,255,.15)); outline:none; }
      #${MENU_ID} .ydh-foot { display:flex; align-items:center; justify-content:space-between; gap:6px;
        margin-top:4px; padding:8px 14px 4px;
        border-top:1px solid var(--yt-spec-10-percent-layer,rgba(255,255,255,.12));
        color:var(--yt-spec-text-secondary,#aaa); font-size:12px; }
      #${MENU_ID} .ydh-swap { appearance:none; display:inline-flex; align-items:center; justify-content:center;
        width:32px; height:32px; padding:0; border:0; border-radius:50%; background:rgba(255,255,255,.08);
        color:inherit; cursor:pointer; touch-action:manipulation; }
      #${MENU_ID} .ydh-swap:hover, #${MENU_ID} .ydh-swap:active { background:rgba(255,255,255,.22); outline:none; }

      /* In-player button: same 48px touch size as YouTube's own controls, no shadow */
      #${PLAYER_BTN_ID} { appearance:none; background:transparent !important; border:0; color:#fff;
        box-sizing:border-box; width:48px !important; height:48px !important; padding:12px !important;
        margin:0 !important; border-radius:50%; display:inline-flex; align-items:center;
        justify-content:center; align-self:center; flex:none; position:relative; order:-1;
        cursor:pointer; pointer-events:auto; touch-action:manipulation;
        -webkit-tap-highlight-color:transparent; opacity:1 !important; filter:none !important; }
      #${PLAYER_BTN_ID}:active { background:rgba(255,255,255,.2) !important; }
      #${PLAYER_BTN_ID}.ydh-in-bottom { position:absolute; right:52px; bottom:6px; z-index:40; order:0; }

      #ydh-toast { position:fixed; left:50%; bottom:calc(28px + env(safe-area-inset-bottom, 0px));
        transform:translateX(-50%); z-index:2147483647; padding:10px 16px; border-radius:10px;
        max-width:88vw; background:#222; color:#fff; box-shadow:0 4px 16px rgba(0,0,0,.5);
        font:14px/20px Roboto,Arial,sans-serif; opacity:0; transition:opacity .2s;
        pointer-events:none; text-align:center; }
      @media (prefers-reduced-motion:reduce) { #${MENU_ID} { animation:none } }
    `;
    (document.head || document.documentElement).appendChild(style);

    // stroke > 0 draws a rounded outline icon; stroke = 0 draws a filled icon
    const svg = (path, size = 24, stroke = 0) => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      s.setAttribute('width', size);
      s.setAttribute('height', size);
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = stroke
        ? `fill:none;stroke:currentColor;stroke-width:${stroke};stroke-linecap:round;stroke-linejoin:round;display:block;pointer-events:none;flex:none`
        : 'fill:currentColor;display:block;pointer-events:none;flex:none';
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', path);
      s.appendChild(p);
      return s;
    };

    // In fullscreen only the fullscreen element's subtree is rendered, so UI must live inside it
    const uiRoot = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      return (fs && fs.tagName !== 'VIDEO') ? fs : document.body;
    };

    let toastTimer;
    function toast(message) {
      let el = document.getElementById('ydh-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ydh-toast';
      }
      const root = uiRoot();
      if (el.parentElement !== root) root.appendChild(el);
      el.textContent = message;
      el.style.opacity = '1';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 250);
      }, 3200);
    }

    let lastLaunchTs = 0;
    function launch(kind) {
      const now = Date.now();

      // Lock 1: per-instance. Lock 2: on the DOM, shared by every copy/sandbox of this script,
      // so two injected copies can never both open a tab for the same click.
      const stamp = Number(document.documentElement.getAttribute(LAUNCH_ATTR)) || 0;
      if (now - stamp < 2000 || now - lastLaunchTs < 2000) return;
      document.documentElement.setAttribute(LAUNCH_ATTR, String(now));
      lastLaunchTs = now;
      console.debug('[One-Click Downloader] launch', kind);

      const url = currentVideoUrl();
      if (!url) {
        toast('Open a video or Short first.');
        return;
      }
      const id = getService();
      const jobPayload = { id, url, kind, ts: now };
      try { GM_setValue(KEY_JOB, jobPayload); } catch (_) { /* fallback below */ }

      try {
        if (typeof GM_setClipboard === 'function') GM_setClipboard(url, 'text');
        else navigator.clipboard?.writeText(url);
      } catch (_) { /* ignore */ }

      const encodedJob = encodeURIComponent(JSON.stringify(jobPayload));
      const targetUrl = `${SERVICES[id].home}#ydh=${encodedJob}`;

      // Open exactly ONE tab:
      // - On Mobile: use a single synchronous anchor click inside the user gesture (avoids popup blocker & null return bug)
      // - On Desktop: use GM_openInTab if available, otherwise a single anchor click
      if (!MOBILE && typeof GM_openInTab === 'function') {
        try {
          GM_openInTab(targetUrl, { active: true, insert: true });
          toast(`Opening ${SERVICES[id].name}; link copied as backup.`);
          return;
        } catch (_) { /* fall through to anchor click if GM_openInTab throws */ }
      }

      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 100);

      toast(`Opening ${SERVICES[id].name}; link copied as backup.`);
    }

    let menuAbort = null;
    function closeMenu() {
      document.getElementById(MENU_ID)?.remove();
      document.getElementById(BACKDROP_ID)?.remove();
      if (menuAbort) {
        menuAbort.abort();
        menuAbort = null;
      }
    }

    function openMenu(anchor) {
      closeMenu();

      if (MOBILE) {
        const backdrop = document.createElement('div');
        backdrop.id = BACKDROP_ID;
        backdrop.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        });
        uiRoot().appendChild(backdrop);
      }

      const menu = document.createElement('div');
      menu.id = MENU_ID;
      menu.setAttribute('role', 'menu');

      const addAction = (label, path, fn) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ydh-row';
        button.setAttribute('role', 'menuitem');
        button.append(svg(path), document.createTextNode(label));
        button.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          fn();
        });
        menu.appendChild(button);
      };

      addAction('Audio (MP3)', ICON.audio, () => launch('audio'));
      addAction('Video (MP4)', ICON.video, () => launch('video'));

      const foot = document.createElement('div');
      foot.className = 'ydh-foot';
      const serviceName = document.createElement('span');
      const refresh = () => { serviceName.textContent = `Using ${SERVICES[getService()].name}`; };
      refresh();

      const swap = document.createElement('button');
      swap.type = 'button';
      swap.className = 'ydh-swap';
      swap.setAttribute('aria-label', 'Switch download service');
      swap.title = 'Switch service';
      swap.appendChild(svg(ICON.switch, 18));
      swap.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        cycleService();
        refresh();
      });

      foot.append(serviceName, swap);
      menu.appendChild(foot);
      uiRoot().appendChild(menu);

      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = document.documentElement.clientHeight || window.innerHeight;
      const r = (anchor && anchor.getBoundingClientRect)
        ? anchor.getBoundingClientRect()
        : { top: vh / 3, bottom: vh / 3, left: vw / 2, width: 0 };
      const w = Math.min(Math.max(Math.round(r.width) || 0, 215), 250);
      menu.style.width = `${w}px`;
      const h = menu.offsetHeight;

      let top = r.bottom + 8;
      if (top + h > vh - 12) {
        top = Math.max(12, r.top - h - 8);
        menu.style.setProperty('--ydh-dy', '6px');
      }
      menu.style.top = `${top}px`;
      menu.style.left = `${Math.max(10, Math.min(r.left + r.width / 2 - w / 2, vw - w - 10))}px`;

      const ac = new AbortController();
      menuAbort = ac;
      const openedAt = performance.now();

      document.addEventListener('pointerdown', e => {
        if (performance.now() - openedAt < 180) return;
        const path = e.composedPath();
        if (!path.includes(menu) && (!anchor || !path.includes(anchor))) closeMenu();
      }, { capture: true, signal: ac.signal });

      const dismissEvents = MOBILE
        ? [[window, 'popstate'], [window, 'yt-navigate-start'], [document, 'fullscreenchange']]
        : [[window, 'scroll'], [window, 'wheel'], [window, 'resize'], [window, 'popstate'], [window, 'yt-navigate-start'], [document, 'fullscreenchange']];

      const dismissAfterOpening = () => {
        if (performance.now() - openedAt > 300) closeMenu();
      };
      for (const [target, type] of dismissEvents) {
        target.addEventListener(type, dismissAfterOpening, { capture: true, passive: true, signal: ac.signal });
      }
    }

    // 1. ReVanced-style In-Player Control Button (Mobile)
    if (MOBILE) {
      // Finds the autoplay toggle as a direct child of the top bar (class "autonav" or an "autoplay" label)
      const findAutoplayToggle = bar => {
        const el = bar.querySelector('[class*="autonav"], [aria-label*="utoplay" i]');
        if (!el) return null;
        let c = el;
        while (c.parentElement && c.parentElement !== bar) c = c.parentElement;
        return c.parentElement === bar ? c : null;
      };

      const syncPlayerButton = () => {
        if (!currentVideoUrl()) {
          document.getElementById(PLAYER_BTN_ID)?.remove();
          return;
        }
        const topControls = document.querySelector('#player-control-overlay .player-controls-top');
        const bottomControls = document.querySelector('#player-control-overlay .player-controls-bottom');
        const hostBar = topControls || bottomControls;
        if (!hostBar) return;

        let btn = document.getElementById(PLAYER_BTN_ID);
        if (!btn) {
          btn = document.createElement('button');
          btn.id = PLAYER_BTN_ID;
          btn.type = 'button';
          btn.className = 'icon-button';
          btn.setAttribute('aria-label', 'Download video or audio');
          btn.appendChild(svg(ICON.downloadThick, 24, 2));

          // Stop propagation so the player overlay doesn't hide itself on touch
          for (const evt of ['touchstart', 'pointerdown']) {
            btn.addEventListener(evt, e => e.stopPropagation(), { passive: true });
          }
          btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            if (document.getElementById(MENU_ID)) closeMenu();
            else openMenu(btn);
          });
        }

        const inTop = hostBar === topControls;
        btn.classList.toggle('ydh-in-bottom', !inTop);

        if (inTop) {
          const toggle = findAutoplayToggle(topControls);
          if (toggle && HIDE_AUTOPLAY_TOGGLE) toggle.style.display = 'none';
          // Sit directly before the autoplay toggle (or first in the bar if it isn't found)
          const ref = toggle || [...topControls.children].find(c => c !== btn) || null;
          // Only move when the position is wrong, so we never loop with the observer
          if (btn.parentElement !== topControls || btn.nextElementSibling !== ref) {
            topControls.insertBefore(btn, ref);
          }
        } else if (btn.parentElement !== bottomControls) {
          bottomControls.appendChild(btn);
        }
      };

      // Coalesce bursts of DOM mutations into at most one sync per animation frame
      let syncQueued = false;
      const scheduleSync = () => {
        if (syncQueued) return;
        syncQueued = true;
        requestAnimationFrame(() => {
          syncQueued = false;
          syncPlayerButton();
        });
      };

      const obs = new MutationObserver(scheduleSync);
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }

    // 2. Intercept Native Download Button (Watch page action bar, Overflow menu, Desktop)
    document.addEventListener('click', e => {
      if (!currentVideoUrl()) return;
      const target = e.composedPath()[0];
      if (!(target instanceof Element) || target.closest(`#${MENU_ID}, #${PLAYER_BTN_ID}, #${BACKDROP_ID}`)) return;

      const desktopSelector = 'ytd-download-button-renderer, ytd-menu-service-item-download-renderer';
      let native = target.closest(desktopSelector);

      if (!native) {
        const control = target.closest(
          'button, [role="button"], [role="menuitem"], ytm-button-renderer, ytm-menu-item, ' +
          'ytm-slim-metadata-button-renderer, ytd-menu-service-item-renderer, yt-list-item-view-model'
        );
        if (control) {
          const label = (
            control.getAttribute('aria-label') ||
            control.querySelector('[aria-label]')?.getAttribute('aria-label') ||
            control.textContent || ''
          ).trim();
          const inActionZone = control.closest(
            'ytd-watch-metadata, ytd-popup-container, ytm-slim-video-action-bar-renderer, ' +
            'ytm-bottom-sheet-renderer, .slim-video-action-bar-actions, menu-content, ytm-custom-action-renderer'
          );
          if (inActionZone && /^download$/i.test(label)) {
            native = control;
          }
        }
      }

      if (!native) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      if (native.closest('ytd-popup-container')) {
        document.querySelectorAll('ytd-popup-container tp-yt-iron-dropdown').forEach(d => {
          try { d.close?.(); } catch (_) { /* best effort */ }
        });
      }

      try {
        openMenu(native);
      } catch (err) {
        closeMenu();
        console.warn('[One-Click Downloader] Could not open menu:', err);
      }
    }, true);

    // 3. Zero-UI Trigger A: Long-Press (550ms) on the native "Share" button
    let pressTimer = null;
    let longPressFired = false;
    document.addEventListener('pointerdown', e => {
      if (!currentVideoUrl() || e.button > 0) return;
      const target = e.composedPath()[0];
      if (!(target instanceof Element)) return;
      const btn = target.closest('button, [role="button"], ytm-button-renderer, reel-player-overlay-actions');
      if (!btn) return;
      const label = (
        btn.getAttribute('aria-label') ||
        btn.querySelector('[aria-label]')?.getAttribute('aria-label') ||
        btn.textContent || ''
      ).trim();
      if (!/^share/i.test(label)) return;

      longPressFired = false;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        longPressFired = true;
        try { navigator.vibrate?.(35); } catch (_) { /* ignore */ }
        openMenu(btn);
      }, 550);
    }, { capture: true, passive: true });

    for (const endEvt of ['pointerup', 'pointercancel', 'pointermove']) {
      document.addEventListener(endEvt, () => clearTimeout(pressTimer), { capture: true, passive: true });
    }
    document.addEventListener('click', e => {
      if (longPressFired) {
        longPressFired = false;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);

    // 4. Zero-UI Trigger B: Double-tap the video title below the player on mobile
    let lastTitleTap = 0;
    document.addEventListener('click', e => {
      if (!MOBILE || !currentVideoUrl()) return;
      const target = e.composedPath()[0];
      if (!(target instanceof Element)) return;
      const titleEl = target.closest(
        'ytm-slim-video-metadata-section-renderer .slim-video-information-title, ' +
        '.slim-video-metadata-header, h2.slim-video-information-title'
      );
      if (!titleEl) return;
      const now = Date.now();
      if (now - lastTitleTap < 350) {
        e.preventDefault();
        e.stopPropagation();
        openMenu(titleEl);
        lastTitleTap = 0;
      } else {
        lastTitleTap = now;
      }
    }, true);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
      if (e.altKey && e.shiftKey && e.code === 'KeyD' && currentVideoUrl()) openMenu(null);
    }, true);

    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Download: audio (MP3)', () => launch('audio'));
      GM_registerMenuCommand('Download: video (MP4)', () => launch('video'));
      GM_registerMenuCommand('Switch download service', () => toast(`Service: ${SERVICES[cycleService()].name}`));
    }
  }

  function initService(serviceId) {
    let job = null;
    try { job = GM_getValue(KEY_JOB, null); } catch (_) { /* ignore */ }

    if (!job && location.hash.startsWith('#ydh=')) {
      try {
        job = JSON.parse(decodeURIComponent(location.hash.slice(5)));
      } catch (_) { /* ignore */ }
    }
    if (location.hash.startsWith('#ydh=')) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { /* ignore */ }
    }

    if (!job || job.id !== serviceId || !job.url || !['audio', 'video'].includes(job.kind) || Date.now() - job.ts > JOB_MAX_AGE_MS) {
      return;
    }

    // One-time claim: if another tab (duplicate) already took this job, do nothing here.
    let claimed = null;
    try { claimed = GM_getValue(KEY_CLAIM, null); } catch (_) { /* ignore */ }
    if (claimed === job.ts) return;
    try { GM_setValue(KEY_CLAIM, job.ts); } catch (_) { /* ignore */ }

    try { GM_setValue(KEY_JOB, null); } catch (_) { /* one-shot */ }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const visible = el => !!el && el.isConnected && (typeof el.checkVisibility === 'function'
      ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      : el.offsetParent !== null || el.getClientRects().length > 0);

    const waitFor = (fn, timeout) => new Promise(resolve => {
      const start = Date.now();
      const timer = setInterval(() => {
        let result = null;
        try { result = fn(); } catch (_) { /* wait for hydration */ }
        if (result || Date.now() - start >= timeout) {
          clearInterval(timer);
          resolve(result || null);
        }
      }, 250);
    });

    const ownText = el => [...el.childNodes]
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.nodeValue)
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    function findByText(re, root = document.body) {
      const out = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      for (let el = walker.nextNode(); el; el = walker.nextNode()) {
        if (/^(SCRIPT|STYLE|OPTION)$/.test(el.tagName)) continue;
        const text = ownText(el);
        if (text && re.test(text) && visible(el)) out.push(el);
      }
      return out;
    }

    function setNativeValue(el, value) {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, value);
      else el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function clickLikeUser(el) {
      try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (_) { /* ignore */ }
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      el.click();
    }

    async function chooseDropdown(toggleRe, wantedRe, highestIfMissing = false) {
      for (const select of document.querySelectorAll('select')) {
        const options = [...select.options];
        const exact = options.find(o => wantedRe.test(`${o.textContent} ${o.value}`));
        const candidate = exact || (highestIfMissing
          ? options.filter(o => /\d/.test(o.textContent)).sort((a, b) => parseInt(b.textContent, 10) - parseInt(a.textContent, 10))[0]
          : null);
        if (candidate) {
          select.value = candidate.value;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      const toggle = await waitFor(() => findByText(toggleRe)[0], 5000);
      if (!toggle || wantedRe.test(ownText(toggle))) return !!toggle;
      clickLikeUser(toggle);
      await sleep(300);
      let options = findByText(toggleRe).filter(el => el !== toggle);
      if (!options.length) {
        clickLikeUser(toggle);
        await sleep(300);
        options = findByText(toggleRe).filter(el => el !== toggle);
      }
      const pick = options.find(el => wantedRe.test(ownText(el))) || (highestIfMissing
        ? options.sort((a, b) => parseInt(ownText(b), 10) - parseInt(ownText(a), 10))[0]
        : null);
      if (!pick) return false;
      clickLikeUser(pick);
      await sleep(300);
      return true;
    }

    function findInput() {
      const fields = [...document.querySelectorAll('input[type="text"],input[type="url"],input[type="search"],input:not([type]),textarea')]
        .filter(el => visible(el) && !el.disabled && !el.readOnly);
      return fields.find(el => /url|link|youtube|paste|http/i.test(`${el.placeholder} ${el.name} ${el.id}`)) || fields[0] || null;
    }

    function findSubmit(input) {
      const form = input.closest('form');
      const scope = form || input.parentElement || document.body;
      const exact = findByText(/^convert$/i, scope)[0] || findByText(/^convert$/i)[0];
      if (exact) return exact.closest('button,[role="button"],a,input[type="submit"]') || exact;
      for (let root = scope, i = 0; root && i < 5; root = root.parentElement, i++) {
        const buttons = [...root.querySelectorAll('button,input[type="submit"],[role="button"]')]
          .filter(b => visible(b) && !b.disabled);
        const match = buttons.find(b => /download|convert|start|go|search|get|submit|fetch/i.test(`${b.textContent} ${b.value || ''} ${b.getAttribute('aria-label') || ''}`));
        if (match) return match;
      }
      return null;
    }

    (async () => {
      const input = await waitFor(findInput, 20000);
      if (!input) {
        console.warn('[One-Click Downloader] No URL field found; link remains on clipboard.');
        return;
      }
      await sleep(400);
      try {
        if (serviceId === 'cnvmp3') {
          await chooseDropdown(/^(mp3|mp4)$/i, job.kind === 'audio' ? /^mp3$/i : /^mp4$/i);
          await sleep(250);
          if (job.kind === 'audio') await chooseDropdown(/^\d+\s*kb\/s$/i, /^320\s*kb\/s$/i, true);
          else await chooseDropdown(/^\d{3,4}p$/i, /^1080p$/i, true);
        } else {
          const kind = job.kind === 'audio' ? /^(mp3|audio)$/i : /^(mp4|video)$/i;
          const select = [...document.querySelectorAll('select')].find(s =>
            [...s.options].some(o => kind.test(o.textContent.trim()) || kind.test(o.value.trim()))
          );
          if (select) {
            const option = [...select.options].find(o => kind.test(o.textContent.trim()) || kind.test(o.value.trim()));
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            const el = [...document.querySelectorAll('button,label,a,[role="tab"],[role="radio"],[role="button"],li,span,div')]
              .find(e => visible(e) && e.children.length <= 1 && kind.test((e.textContent || '').trim()));
            if (el) clickLikeUser(el);
          }
        }
      } catch (err) {
        console.warn('[One-Click Downloader] Format selection failed:', err);
      }
      await sleep(300);
      const target = findInput() || input;
      setNativeValue(target, job.url);
      await sleep(400);
      const submit = await waitFor(() => findSubmit(target), 5000);
      if (submit && !submit.disabled) clickLikeUser(submit);
    })();
  }
})();
