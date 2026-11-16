// ==UserScript==
// @name         YouTube Speed Button (Mobile: Shorts + Videos)
// @namespace    adish.shorts.speed
// @version      3.9.4
// @description  Speed button for m.youtube.com Shorts and video pages: single tap = cycle speeds, double tap = toggle 2x, hold = reset to 1x
// @icon         data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23ff1e1e'/%3E%3Cstop offset='100%25' stop-color='%23b80000'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='16' fill='%23121212'/%3E%3Crect x='2' y='2' width='60' height='60' rx='14' fill='none' stroke='%232e2e2e' stroke-width='2'/%3E%3Cpath d='M 15.03 48.97 A 24 24 0 1 1 48.97 48.97' fill='none' stroke='%23333333' stroke-width='5' stroke-linecap='round'/%3E%3Cpath d='M 15.03 48.97 A 24 24 0 1 1 48.97 48.97' fill='none' stroke='url(%23g)' stroke-width='5' stroke-linecap='round' stroke-dasharray='113' stroke-dashoffset='24'/%3E%3Cpath d='M 16 32 H 20 M 32 14 V 18 M 44 32 H 48' stroke='%23888888' stroke-width='2.5' stroke-linecap='round'/%3E%3Cpath d='M 32 34 L 44 21' stroke='%23ffffff' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='32' cy='34' r='4.5' fill='%23ff2a2a' stroke='%23121212' stroke-width='1.5'/%3E%3Ctext x='32' y='54' text-anchor='middle' font-family='Roboto,Arial,sans-serif' font-weight='800' font-size='12' fill='%23ffffff' letter-spacing='-0.3'%3E2x%3C/text%3E%3C/svg%3E
// @match        https://m.youtube.com/*
// @author       adish08
// @updateURL    https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/YouTube%20Speed%20Button%20%28Mobile%20-%20Shorts%20%2B%20Videos%29.user.js
// @downloadURL  https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/YouTube%20Speed%20Button%20%28Mobile%20-%20Shorts%20%2B%20Videos%29.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const LISTS = {
    shorts: [1, 1.5, 1.75, 2],
    watch: [1, 1.5, 1.75, 2, 2.25, 2.5]
  };
  const KEYS = { shorts: 'ytspd_speed_shorts', watch: 'ytspd_speed_watch' };
  const OLD_KEY = 'ytspd_speed';
  const LONG_PRESS_MS = 400;
  const DOUBLE_TAP_MS = 250;
  const FLOAT_AFTER_MS = 2500;

  // ---------- Remember speed (per player) ----------
  function load(mode) {
    const list = LISTS[mode];
    try {
      const v = parseFloat(localStorage.getItem(KEYS[mode]));
      if (list.includes(v)) return v;
      const o = parseFloat(localStorage.getItem(OLD_KEY));
      if (list.includes(o)) return o;
    } catch (e) {}
    return 1;
  }
  const speeds = { shorts: load('shorts'), watch: load('watch') };
  const lastSpeeds = { shorts: 1, watch: 1 };

  const pageMode = () => {
    const p = location.pathname;
    if (p.startsWith('/shorts')) return 'shorts';
    if (p.startsWith('/watch')) return 'watch';
    return null;
  };
  const curSpeed = () => { const m = pageMode(); return m ? speeds[m] : 1; };
  const log = (err) => { try { console.warn('[ytspd]', err); } catch (e) {} };

  // ---------- Selection guard ----------
  let guardUntil = 0;
  document.addEventListener('selectionchange', () => {
    if (Date.now() < guardUntil) {
      const s = window.getSelection && window.getSelection();
      if (s && s.rangeCount) s.removeAllRanges();
    }
  });

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.textContent = `
    .ytspd-btn{
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;
      -webkit-tap-highlight-color:transparent;pointer-events:auto;color:#fff;
      transition:transform 0.12s ease, opacity 0.12s ease;
    }
    .ytspd-btn, .ytspd-btn *{
      -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;
    }
    .ytspd-btn *{pointer-events:none}
    .ytspd-btn ::selection{background:transparent}
    .ytspd-val::after{content:attr(data-v)}

    .ytspd-btn.is-pressing{
      transform: scale(0.88);
      opacity: 0.75;
    }
    .ytspd-btn.is-reset{
      transform: scale(1.15);
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.85)) !important;
    }

    .ytspd-needle {
      transform-origin: 12px 13px;
      transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .ytspd-arc {
      transition: stroke-dashoffset 0.24s ease;
    }

    .ytspd-btn[data-mode="shorts"]{
      flex-direction:column;min-width:48px;margin:0 auto 14px auto;color:#fff;
    }
    .ytspd-btn[data-mode="shorts"] svg{
      width:26px;height:26px;display:block;
      filter:drop-shadow(0 1px 3px rgba(0,0,0,.55));
    }
    .ytspd-btn[data-mode="shorts"] .ytspd-val{
      font:600 12px/16px Roboto,Arial,sans-serif;margin-top:3px;
      text-shadow:0 0 4px rgba(0,0,0,.6);
    }

    .ytspd-btn[data-mode="watch"]{
      position:relative;flex:0 0 auto;width:48px;height:48px;margin:0 2px;
      color:#fff;
    }
    .ytspd-btn[data-mode="watch"] svg{width:36px;height:36px;display:block}
    .ytspd-btn[data-mode="watch"] .ytspd-val{
      position:absolute;top:0;right:0;bottom:0;left:0;
      display:flex;align-items:center;justify-content:center;
      font:700 11px/1 Roboto,Arial,sans-serif;letter-spacing:-.2px;
    }

    .ytspd-btn[data-float="1"]{position:fixed;z-index:2147483000;margin:0}
    .ytspd-btn[data-float="1"][data-mode="shorts"]{right:12px;bottom:300px}
    .ytspd-btn[data-float="1"][data-mode="watch"]{
      right:8px;top:150px;background:rgba(0,0,0,.65);border-radius:24px;color:#fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // ---------- Apply speed (with ratechange loop guard) ----------
  let settingRate = false;
  function applySpeed() {
    if (settingRate || !pageMode()) return;
    const s = curSpeed();
    settingRate = true;
    try {
      document.querySelectorAll('video').forEach(v => {
        if (Math.abs(v.playbackRate - s) > 0.01) {
          try { v.playbackRate = s; } catch (_) {}
        }
      });
    } finally {
      settingRate = false;
    }
  }
  ['loadstart', 'loadedmetadata', 'loadeddata', 'durationchange', 'play', 'playing', 'ratechange']
    .forEach(evt => document.addEventListener(evt, applySpeed, true));
  setInterval(applySpeed, 400);

  // ---------- Labels & Dynamic SVG Gauge ----------
  function updateGaugeVisuals(btn, mode, speed) {
    const list = LISTS[mode];
    const min = list[0];
    const max = list[list.length - 1];
    const ratio = Math.max(0, Math.min(1, (speed - min) / (max - min)));

    const needle = btn.querySelector('.ytspd-needle');
    if (needle) {
      const deg = -115 + ratio * 230;
      needle.style.transform = `rotate(${deg}deg)`;
    }

    const arc = btn.querySelector('.ytspd-arc');
    if (arc) {
      const totalLen = parseFloat(arc.dataset.len || '42');
      const fillRatio = 0.18 + ratio * 0.82;
      arc.style.strokeDashoffset = (totalLen * (1 - fillRatio)).toFixed(2);
      arc.style.stroke = '#ffffff';
    }
  }

  function paintLabel(el) {
    const btn = el.closest('.ytspd-btn');
    const mode = btn ? btn.dataset.mode : pageMode();
    const current = speeds[mode] || 1;
    const txt = current + 'x';
    el.dataset.v = txt;

    if (btn) {
      if (mode === 'watch') {
        const n = txt.length;
        el.style.fontSize = n <= 2 ? '13px' : (n === 4 ? '11px' : '9.5px');
      }
      updateGaugeVisuals(btn, mode, current);
    }
  }

  function updateLabels() {
    document.querySelectorAll('.ytspd-val').forEach(paintLabel);
  }

  // ---------- Speed changes ----------
  function setSpeed(mode, v) {
    if (speeds[mode] !== 2) {
      lastSpeeds[mode] = speeds[mode];
    }
    speeds[mode] = v;
    try { localStorage.setItem(KEYS[mode], String(v)); } catch (e) {}
    applySpeed();
    updateLabels();
  }

  function tap(mode) {
    const l = LISTS[mode];
    setSpeed(mode, l[(l.indexOf(speeds[mode]) + 1) % l.length]);
  }

  function toggleDoubleTap(mode) {
    if (speeds[mode] === 2) {
      setSpeed(mode, lastSpeeds[mode] || 1);
    } else {
      setSpeed(mode, 2);
    }
    if (navigator.vibrate) {
      try { navigator.vibrate([15, 30, 15]); } catch (_) {}
    }
  }

  function reset(mode) { setSpeed(mode, 1); }

  // ---------- DOM & Custom SVG Builder ----------
  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function buildCustomIcon(mode) {
    const svg = svgEl('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true'
    });

    if (mode === 'shorts') {
      const trackPath = 'M 5.64 19.36 A 9 9 0 1 1 18.36 19.36';
      const arcLength = '42.41';

      svg.appendChild(svgEl('path', {
        d: trackPath,
        stroke: '#ffffff',
        'stroke-opacity': '0.28',
        'stroke-width': '2.2'
      }));

      svg.appendChild(svgEl('path', {
        class: 'ytspd-arc',
        d: trackPath,
        stroke: '#ffffff',
        'stroke-width': '2.2',
        'stroke-dasharray': arcLength,
        'stroke-dashoffset': '34',
        'data-len': arcLength
      }));

      svg.appendChild(svgEl('path', {
        d: 'M 6.2 13 H 7.6 M 12 6.8 V 8.2 M 16.4 13 H 17.8',
        stroke: '#ffffff',
        'stroke-opacity': '0.6',
        'stroke-width': '1.4'
      }));

      const needleGroup = svgEl('g', { class: 'ytspd-needle' });
      needleGroup.appendChild(svgEl('path', {
        d: 'M 12 13 L 12 7.2',
        stroke: '#ffffff',
        'stroke-width': '2.1'
      }));
      svg.appendChild(needleGroup);

      svg.appendChild(svgEl('circle', {
        cx: '12',
        cy: '13',
        r: '1.8',
        fill: '#ffffff'
      }));
    } else {
      const trackPath = 'M 4.93 19.07 A 10 10 0 1 1 19.07 19.07';
      const arcLength = '47.12';

      svg.appendChild(svgEl('path', {
        d: trackPath,
        stroke: '#ffffff',
        'stroke-opacity': '0.24',
        'stroke-width': '1.75'
      }));

      svg.appendChild(svgEl('path', {
        class: 'ytspd-arc',
        d: trackPath,
        stroke: '#ffffff',
        'stroke-width': '1.85',
        'stroke-dasharray': arcLength,
        'stroke-dashoffset': '38',
        'data-len': arcLength
      }));

      svg.appendChild(svgEl('path', {
        d: 'M 12 2.2 V 3.4 M 2.2 12 H 3.4 M 20.6 12 H 21.8',
        stroke: '#ffffff',
        'stroke-opacity': '0.45',
        'stroke-width': '1.2'
      }));
    }

    return svg;
  }

  // ---------- Build button ----------
  function makeButton(mode, floating) {
    const wrap = document.createElement('div');
    wrap.className = 'ytspd-btn';
    wrap.dataset.mode = mode;
    if (floating) wrap.dataset.float = '1';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', 'Playback speed (Tap cycle, 2x tap toggle, hold reset)');

    const svg = buildCustomIcon(mode);
    const val = document.createElement('div');
    val.className = 'ytspd-val';

    wrap.appendChild(svg);
    wrap.appendChild(val);
    paintLabel(val);

    let holdTimer = null, tapTimer = null;
    let pressed = false, longFired = false;
    let lastTapTime = 0;

    const clearHold = () => {
      clearTimeout(holdTimer);
      holdTimer = null;
      wrap.classList.remove('is-pressing');
    };

    const wipeSelection = () => {
      const s = window.getSelection && window.getSelection();
      if (s && s.rangeCount) s.removeAllRanges();
    };

    wrap.addEventListener('pointerdown', e => {
      e.stopPropagation();
      // Bounded timeout instead of Infinity so detached DOM nodes never lock selection permanently
      guardUntil = Date.now() + LONG_PRESS_MS + 1200;
      wipeSelection();
      pressed = true;
      longFired = false;
      wrap.classList.add('is-pressing');
      clearTimeout(holdTimer);

      holdTimer = setTimeout(() => {
        longFired = true;
        clearTimeout(tapTimer);
        tapTimer = null;
        lastTapTime = 0;

        wrap.classList.remove('is-pressing');
        wrap.classList.add('is-reset');
        setTimeout(() => wrap.classList.remove('is-reset'), 250);

        wipeSelection();
        reset(mode);

        if (navigator.vibrate) {
          try { navigator.vibrate([25, 40, 25]); } catch (_) {}
        }
      }, LONG_PRESS_MS);
    }, { passive: false });

    wrap.addEventListener('pointerup', e => {
      e.stopPropagation();
      guardUntil = Date.now() + 800;
      clearHold();

      if (pressed && !longFired) {
        const now = Date.now();
        if (now - lastTapTime < DOUBLE_TAP_MS) {
          clearTimeout(tapTimer);
          tapTimer = null;
          lastTapTime = 0;
          toggleDoubleTap(mode);
        } else {
          lastTapTime = now;
          clearTimeout(tapTimer);
          tapTimer = setTimeout(() => {
            tap(mode);
            tapTimer = null;
            lastTapTime = 0;
          }, DOUBLE_TAP_MS);
        }
      }

      pressed = false;
      wipeSelection();
    }, { passive: false });

    ['pointercancel', 'pointerleave'].forEach(evt =>
      wrap.addEventListener(evt, () => {
        guardUntil = Date.now() + 800;
        clearHold();
        pressed = false;
      })
    );

    ['click', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(evt =>
      wrap.addEventListener(evt, e => {
        e.stopPropagation();
        if (evt === 'click' || evt === 'touchstart') e.preventDefault();
      }, { passive: false })
    );
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('selectstart', e => e.preventDefault());
    wrap.addEventListener('dragstart', e => e.preventDefault());

    return wrap;
  }

  // ---------- Anchor Button Discovery ----------
  const EXCLUDE =
    'ytm-backstage-post-renderer, ytm-post-renderer, ytm-comment-thread-renderer, ' +
    'ytm-comment-renderer, ytm-engagement-panel, ytm-reel-player-header-renderer';
  const CANDIDATES =
    'like-button-view-model button, like-button-view-model [role="button"],' +
    'ytm-like-button-renderer button, button[aria-label], [role="button"][aria-label]';

  function findButtons(test) {
    const out = new Set();
    document.querySelectorAll(CANDIDATES).forEach(b => {
      if (b.closest(EXCLUDE) || b.closest('.ytspd-btn')) return;
      const label = (b.getAttribute('aria-label') || '').trim();
      if (test(b, label)) out.add(b);
    });
    return [...out];
  }

  const isLike = (b, l) => {
    if (/dislike/i.test(l) || b.closest('dislike-button-view-model')) return false;
    const tag = b.closest('like-button-view-model, ytm-like-button-renderer');
    return /^(like|liked|unlike|heart)\b/i.test(l) || !!tag;
  };
  const isComment = (b, l) => /comment/i.test(l);

  function countActionButtons(container) {
    // Count distinct top-level children that contain a native button or role="button" (excluding our own button)
    let count = 0;
    for (const ch of container.children) {
      if (ch.classList.contains('ytspd-btn')) continue;
      if (
        ch.matches('button, [role="button"]') ||
        ch.querySelector('button, [role="button"]:not(.ytspd-btn)')
      ) {
        count++;
      }
    }
    return count;
  }

  function findColumn(btn, mode) {
    let child = btn;
    while (child.parentElement) {
      const p = child.parentElement;

      // Stop before climbing into global headers or reel root containers
      if (p.querySelector('ytm-mobile-topbar-renderer, header')) return null;
      if (
        p.tagName === 'YTM-REEL-WATCH-SEQUENCE-RENDERER' ||
        p.tagName === 'YTM-REEL-VIDEO-RENDERER' ||
        p.tagName === 'YTM-REEL-PLAYER-OVERLAY-RENDERER' ||
        p.id === 'shorts-container'
      ) {
        return null;
      }

      // On Shorts, never climb into the outer overlay row that also holds the channel header / Subscribe button
      if (
        mode === 'shorts' &&
        p.querySelector('ytm-reel-player-header-renderer, .reel-player-header-renderer, subscribe-button-view-model')
      ) {
        return null;
      }

      if (countActionButtons(p) >= 3) {
        return { column: p, child };
      }
      child = p;
    }
    return null;
  }

  function getScopeRoot(el, mode) {
    if (mode === 'shorts') {
      return (
        el.closest('ytm-reel-video-renderer, ytm-reel-player-overlay-renderer') ||
        document.body
      );
    }
    return (
      el.closest('ytm-slim-video-metadata-section-renderer, ytm-SingleColumnWatchNextResultsRenderer') ||
      document.body
    );
  }

  function anchor(mode) {
    let anchors = findButtons(isLike);
    if (!anchors.length && mode === 'shorts') anchors = findButtons(isComment);
    let injected = false;
    const handledScopes = new Set();

    anchors.forEach(btn => {
      const scope = getScopeRoot(btn, mode);
      if (handledScopes.has(scope)) return;

      const hit = findColumn(btn, mode);
      if (!hit) return;
      const { column, child } = hit;

      handledScopes.add(scope);

      // Remove any stale/misplaced buttons inside the same Short/Watch scope that are not direct children of this column
      scope.querySelectorAll(`.ytspd-btn[data-mode="${mode}"]:not([data-float="1"])`).forEach(oldBtn => {
        if (oldBtn.parentElement !== column) oldBtn.remove();
      });

      const existing = column.querySelector(':scope > .ytspd-btn');
      if (existing) {
        injected = true;
        return;
      }

      column.insertBefore(makeButton(mode, false), child);
      injected = true;
    });
    return injected;
  }

  // ---------- Shorts fallback: fixed button synced with native action bar ----------
  let shortsBtn = null, anchorEl = null, lastFind = 0;

  function ensureShortsButton() {
    if (shortsBtn && shortsBtn.isConnected) return;
    if (!document.body) return;
    shortsBtn = makeButton('shorts', true);
    shortsBtn.style.visibility = 'hidden';
    document.body.appendChild(shortsBtn);
  }

  function getEffectiveOpacity(el) {
    let cur = el;
    let op = 1;
    let depth = 0;
    while (cur && cur !== document.body && depth < 7) {
      const st = window.getComputedStyle(cur);
      if (st.display === 'none' || st.visibility === 'hidden') return 0;
      op *= parseFloat(st.opacity ?? '1');
      if (op < 0.05) return 0;
      cur = cur.parentElement;
      depth++;
    }
    return op;
  }

  function usableRect(el) {
    if (!el || !el.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 16 || r.height < 16) return null;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cy < innerHeight * 0.25 || cy > innerHeight * 0.85) return null;
    if (cx < innerWidth * 0.6 || cx > innerWidth) return null;
    const op = getEffectiveOpacity(el);
    if (op < 0.1) return null;
    return { r, op };
  }

  function hasVisibleAnchoredShortsBtn() {
    const btns = document.querySelectorAll('.ytspd-btn[data-mode="shorts"]:not([data-float="1"])');
    for (const b of btns) {
      const r = b.getBoundingClientRect();
      if (r.width > 10 && r.height > 10 && r.bottom > 0 && r.top < innerHeight) {
        return true;
      }
    }
    return false;
  }

  function trackShorts() {
    if (pageMode() === 'shorts') {
      if (hasVisibleAnchoredShortsBtn()) {
        if (shortsBtn && shortsBtn.isConnected) shortsBtn.remove();
        shortsBtn = null;
      } else if (shortsBtn && shortsBtn.isConnected) {
        const now = Date.now();
        let hit = usableRect(anchorEl);
        if (!hit && now - lastFind > 120) {
          lastFind = now;
          anchorEl = null;
          let cands = findButtons(isLike);
          if (!cands.length) cands = findButtons(isComment);
          for (const c of cands) {
            const hh = usableRect(c);
            if (hh) { anchorEl = c; hit = hh; break; }
          }
        }
        const s = shortsBtn.style;
        if (hit) {
          const { r, op } = hit;
          s.right = 'auto'; s.bottom = 'auto';
          s.left = Math.round(r.left + r.width / 2 - 24) + 'px';
          s.top = Math.max(0, Math.round(r.top - 64)) + 'px';
          s.opacity = String(op);
          s.visibility = 'visible';
        } else {
          s.visibility = 'hidden';
          s.opacity = '0';
        }
      }
    }
    requestAnimationFrame(trackShorts);
  }
  requestAnimationFrame(trackShorts);

  // ---------- Injection Logic ----------
  let missingSince = 0;

  function inject() {
    const mode = pageMode();
    document.querySelectorAll('.ytspd-btn').forEach(b => {
      if (b.dataset.mode !== mode) b.remove();
    });
    if (!mode) { missingSince = 0; return; }

    try { anchor(mode); } catch (err) { log(err); }

    const anchored = mode === 'shorts'
      ? hasVisibleAnchoredShortsBtn()
      : !!document.querySelector(`.ytspd-btn[data-mode="${mode}"]:not([data-float="1"])`);
    const floating = document.querySelector(`.ytspd-btn[data-mode="${mode}"][data-float="1"]`);

    if (anchored) {
      if (floating) floating.remove();
      missingSince = 0;
      return;
    }

    if (mode === 'shorts') {
      ensureShortsButton();
      return;
    }

    if (!missingSince) missingSince = Date.now();
    if (!floating && Date.now() - missingSince > FLOAT_AFTER_MS && document.body) {
      try { document.body.appendChild(makeButton(mode, true)); } catch (err) { log(err); }
    }
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; inject(); });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  document.addEventListener('yt-navigate-finish', schedule, true);
  setInterval(schedule, 1500);
  schedule();
})();