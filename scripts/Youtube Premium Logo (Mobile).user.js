// ==UserScript==
// @name         Youtube Premium Logo (Mobile)
// @namespace    https://github.com/adish08
// @description  Premium wordmark for m.youtube.com: patched in place, icon-only left untouched
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @license      MIT
// @match        *://m.youtube.com/*
// @version      3.0
// @run-at       document-start
// @author       adish08
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const ICON_PREFIX = 'M14.4848 20';
  const PLAY_PREFIX = 'M19 10';
  const RATIO = 101 / 20;
  const VIEWBOX = '0 0 101 20';
  const KEY = 'ytpl-signed-in';
  const root = document.documentElement;

  const RED_D = 'M14.4848 20C14.4848 20 23.5695 20 25.8229 19.4C27.0917 19.06 28.0459 18.08 28.3808 16.87C29 14.65 29 9.98 29 9.98C29 9.98 29 5.34 28.3808 3.14C28.0459 1.9 27.0917 0.94 25.8229 0.61C23.5695 0 14.4848 0 14.4848 0C14.4848 0 5.42037 0 3.17711 0.61C1.9286 0.94 0.954148 1.9 0.59888 3.14C0 5.34 0 9.98 0 9.98C0 9.98 0 14.65 0.59888 16.87C0.954148 18.08 1.9286 19.06 3.17711 19.4C5.42037 20 14.4848 20 14.4848 20Z';
  const PLAY_D = 'M19 10L11.5 5.75V14.25L19 10Z';
  const TEXT_D = [
    'M32.1819 2.10016V18.9002H34.7619V12.9102H35.4519C38.8019 12.9102 40.5619 11.1102 40.5619 7.57016V6.88016C40.5619 3.31016 39.0019 2.10016 35.7219 2.10016H32.1819ZM37.8619 7.63016C37.8619 10.0002 37.1419 11.0802 35.4019 11.0802H34.7619V3.95016H35.4519C37.4219 3.95016 37.8619 4.76016 37.8619 7.13016V7.63016Z',
    'M41.982 18.9002H44.532V10.0902C44.952 9.37016 45.992 9.05016 47.302 9.32016L47.462 6.33016C47.292 6.31016 47.142 6.29016 47.002 6.29016C45.802 6.29016 44.832 7.20016 44.342 8.86016H44.162L43.952 6.54016H41.982V18.9002Z',
    'M55.7461 11.5002C55.7461 8.52016 55.4461 6.31016 52.0161 6.31016C48.7861 6.31016 48.0661 8.46016 48.0661 11.6202V13.7902C48.0661 16.8702 48.7261 19.1102 51.9361 19.1102C54.4761 19.1102 55.7861 17.8402 55.6361 15.3802L53.3861 15.2602C53.3561 16.7802 53.0061 17.4002 51.9961 17.4002C50.7261 17.4002 50.6661 16.1902 50.6661 14.3902V13.5502H55.7461V11.5002ZM51.9561 7.97016C53.1761 7.97016 53.2661 9.12016 53.2661 11.0702V12.0802H50.6661V11.0702C50.6661 9.14016 50.7461 7.97016 51.9561 7.97016Z',
    'M60.1945 18.9002V8.92016C60.5745 8.39016 61.1945 8.07016 61.7945 8.07016C62.5645 8.07016 62.8445 8.61016 62.8445 9.69016V18.9002H65.5045L65.4845 8.93016C65.8545 8.37016 66.4845 8.04016 67.1045 8.04016C67.7745 8.04016 68.1445 8.61016 68.1445 9.69016V18.9002H70.8045V9.49016C70.8045 7.28016 70.0145 6.27016 68.3445 6.27016C67.1845 6.27016 66.1945 6.69016 65.2845 7.67016C64.9045 6.76016 64.1545 6.27016 63.0845 6.27016C61.8745 6.27016 60.7345 6.79016 59.9345 7.76016H59.7845L59.5945 6.54016H57.5445V18.9002H60.1945Z',
    'M74.0858 4.97016C74.9858 4.97016 75.4058 4.67016 75.4058 3.43016C75.4058 2.27016 74.9558 1.91016 74.0858 1.91016C73.2058 1.91016 72.7758 2.23016 72.7758 3.43016C72.7758 4.67016 73.1858 4.97016 74.0858 4.97016ZM72.8658 18.9002H75.3958V6.54016H72.8658V18.9002Z',
    'M79.9516 19.0902C81.4116 19.0902 82.3216 18.4802 83.0716 17.3802H83.1816L83.2916 18.9002H85.2816V6.54016H82.6416V16.4702C82.3616 16.9602 81.7116 17.3202 81.1016 17.3202C80.3316 17.3202 80.0916 16.7102 80.0916 15.6902V6.54016H77.4616V15.8102C77.4616 17.8202 78.0416 19.0902 79.9516 19.0902Z',
    'M90.0031 18.9002V8.92016C90.3831 8.39016 91.0031 8.07016 91.6031 8.07016C92.3731 8.07016 92.6531 8.61016 92.6531 9.69016V18.9002H95.3131L95.2931 8.93016C95.6631 8.37016 96.2931 8.04016 96.9131 8.04016C97.5831 8.04016 97.9531 8.61016 97.9531 9.69016V18.9002H100.613V9.49016C100.613 7.28016 99.8231 6.27016 98.1531 6.27016C96.9931 6.27016 96.0031 6.69016 95.0931 7.67016C94.7131 6.76016 93.9631 6.27016 92.8931 6.27016C91.6831 6.27016 90.5431 6.79016 89.7431 7.76016H89.5931L89.4031 6.54016H87.3531V18.9002H90.0031Z'
  ];

  const HOSTS = [
    'ytm-home-logo',
    'ytm-topbar-logo-renderer',
    'ytm-mobile-topbar-renderer .mobile-topbar-logo',
    'ytm-mobile-topbar-renderer ytm-logo'
  ];

  // ---------- Signed-in gate ----------
  let cached = null;
  try { cached = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
  let signedIn = cached === '0' ? false : null; // null = unknown, treated as signed in
  let confirmed = false;
  if (signedIn !== false) root.classList.add('ytpl-on');

  // ---------- Boot CSS: hides un-patched logos on first load only ----------
  // visibility:hidden keeps the layout box, so nothing shifts. A timer removes it
  // (failsafe), so a bug can never leave the logo invisible.
  function addStyle(text) {
    const s = document.createElement('style');
    s.textContent = text;
    (document.head || root).appendChild(s);
  }
  addStyle('html.ytpl-boot.ytpl-on ' +
    HOSTS.map((h) => h + ' svg:not([data-ytpl])').join(',html.ytpl-boot.ytpl-on ') +
    '{visibility:hidden!important}');
  addStyle('html.ytpl-boot.ytpl-on svg:has(path[d^="' + ICON_PREFIX + '"]):not([data-ytpl]){visibility:hidden!important}');
  root.classList.add('ytpl-boot');
  function endBoot() { root.classList.remove('ytpl-boot'); }
  setTimeout(endBoot, 2500);

  // ---------- Helpers ----------
  const originals = new WeakMap(); // svg -> YouTube's own contents, for restore

  function setSize(svg, h) {
    const w = h * RATIO;
    [['height', h], ['min-height', h], ['max-height', h],
     ['width', w], ['min-width', w], ['max-width', w]]
      .forEach(([k, v]) => svg.style.setProperty(k, v + 'px', 'important'));
  }

  function makePath(d, cls, fill) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    if (cls) p.setAttribute('class', cls);
    if (fill) p.style.setProperty('fill', fill, 'important');
    return p;
  }

  function applyText(svg, color) {
    svg.querySelectorAll('.ytpl-t').forEach((p) => p.style.setProperty('fill', color, 'important'));
  }

  // Icon-only logo: small viewBox, or only the icon + triangle paths
  function isCompact(svg) {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width && vb.height) return vb.width / vb.height < 2.2;
    const paths = svg.querySelectorAll('path');
    if (!paths.length) return false;
    return Array.prototype.every.call(paths, (p) => {
      const d = p.getAttribute('d') || '';
      return d.indexOf(ICON_PREFIX) === 0 || d.indexOf(PLAY_PREFIX) === 0;
    });
  }

  function isPatched(svg) {
    return svg.dataset.ytpl === '1' &&
      svg.getAttribute('viewBox') === VIEWBOX &&
      !!svg.querySelector('.ytpl-t');
  }

  function inShorts(el) {
    return location.pathname.indexOf('/shorts') === 0 ||
      !!el.closest('[class*="shorts"],[class*="reel"]');
  }

  function isDark() {
    if (root.hasAttribute('dark') || (document.body && document.body.hasAttribute('dark'))) return true;
    const els = [document.body, root];
    for (let i = 0; i < els.length; i++) {
      if (!els[i]) continue;
      const m = getComputedStyle(els[i]).backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0.5)) {
        return 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2] < 128;
      }
    }
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Undo colour-altering filters on parents (the Shorts "white logo" trick)
  function neutralise(svg) {
    let el = svg.parentElement;
    for (let i = 0; i < 2 && el; i++, el = el.parentElement) {
      const f = getComputedStyle(el).filter;
      if (f && f !== 'none' && /brightness|invert|grayscale|saturate|contrast/.test(f)) {
        el.style.setProperty('filter', 'none', 'important');
      }
    }
  }

  // ---------- Patch / restore, always on YouTube's own element ----------
  function patch(svg) {
    // Remember YouTube's own contents once (only while they are still YouTube's)
    if (!svg.querySelector('.ytpl-t')) {
      originals.set(svg, {
        vb: svg.getAttribute('viewBox'),
        kids: Array.prototype.slice.call(svg.childNodes),
        style: svg.getAttribute('style'),
        w: svg.getAttribute('width'),
        h: svg.getAttribute('height')
      });
      const r = svg.getBoundingClientRect().height; // measure while it is still YouTube's
      svg.dataset.ytplH = r >= 14 && r <= 28 ? String(r) : '20';
    }
    const h = parseFloat(svg.dataset.ytplH) || 20;

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', VIEWBOX);
    svg.setAttribute('height', String(h));
    svg.setAttribute('width', String(h * RATIO));
    setSize(svg, h);
    svg.style.setProperty('overflow', 'visible', 'important');

    const icon = document.createElementNS(NS, 'g');
    icon.appendChild(makePath(RED_D, '', '#FF0033'));
    icon.appendChild(makePath(PLAY_D, '', '#FFFFFF'));
    const text = document.createElementNS(NS, 'g');
    TEXT_D.forEach((d) => text.appendChild(makePath(d, 'ytpl-t', '#FFFFFF')));
    svg.appendChild(icon);
    svg.appendChild(text);

    svg.dataset.ytpl = '1';
    neutralise(svg);
  }

  function restoreAll() {
    document.querySelectorAll('svg[data-ytpl="1"]').forEach((svg) => {
      const o = originals.get(svg);
      if (o) {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        o.kids.forEach((k) => svg.appendChild(k));
        const put = (n, v) => (v === null ? svg.removeAttribute(n) : svg.setAttribute(n, v));
        put('viewBox', o.vb); put('style', o.style); put('width', o.w); put('height', o.h);
      }
      delete svg.dataset.ytpl;
    });
    endBoot();
  }

  function resolveLogin() {
    if (confirmed) return;
    let v;
    let fromCfg = false;
    try {
      if (window.ytcfg && typeof window.ytcfg.get === 'function') {
        const x = window.ytcfg.get('LOGGED_IN');
        if (typeof x === 'boolean') { v = x; fromCfg = true; }
      }
    } catch (e) { /* ignore */ }
    if (v === undefined && document.querySelector('ytm-mobile-topbar-renderer a[href*="ServiceLogin"]')) {
      v = false;
    }
    if (v === undefined) return;
    confirmed = true;
    signedIn = v;
    if (fromCfg) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* ignore */ } }
    root.classList.toggle('ytpl-on', v);
    if (!v) restoreAll();
  }

  // ---------- Core: idempotent ----------
  function sync() {
    resolveLogin();
    if (signedIn === false) return;

    const found = new Set();
    document.querySelectorAll('path[d^="' + ICON_PREFIX + '"]').forEach((p) => {
      const s = p.closest('svg');
      if (s) found.add(s);
    });
    document.querySelectorAll(HOSTS.map((h) => h + ' svg').join(',')).forEach((s) => found.add(s));
    if (!found.size) return;

    const dark = isDark();

    found.forEach((svg) => {
      if (isPatched(svg)) {
        applyText(svg, inShorts(svg) || dark ? '#FFFFFF' : '#0F0F0F');
        return;
      }
      if (isCompact(svg)) {            // icon-only: leave YouTube's own logo alone
        svg.dataset.ytpl = 'skip';
        return;
      }
      patch(svg);                      // wordmark: patch in place
      applyText(svg, inShorts(svg) || dark ? '#FFFFFF' : '#0F0F0F');
    });

    endBoot();
  }

  // Microtask, not requestAnimationFrame: runs before the browser paints
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      sync();
    });
  }

  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener('state-navigatefinish', schedule);
  window.addEventListener('yt-navigate-finish', schedule);
  window.addEventListener('popstate', schedule);

  sync();
})();
