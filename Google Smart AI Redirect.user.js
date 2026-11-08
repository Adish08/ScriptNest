// ==UserScript==
// @name         Google Smart AI Redirect
// @namespace    http://tampermonkey.net
// @version      2026.5.0
// @description  Sends long, natural-language Google searches to AI Mode. Respects manual switches to All/Images/etc. and per-tab choices.
// @author       adish08
// @icon         data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✨</text></svg>
// @include      /^https?:\/\/(www\.)?google\.[a-z.]+\/search/
// @run-at       document-start
// @noframes
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ---- Settings ----
  const MIN_CHARS = 30;                        // queries at least this long go to AI Mode
  const STAY_IN_STANDARD_AFTER_SWITCH = true;  // after you manually leave AI Mode, stay out for new searches in this tab
  const SKIP_OPERATOR_QUERIES = true;          // keep site:, filetype:, "quotes", OR, -word searches in classic results
  const AI_MODE = '50';                        // Google's udm value for AI Mode
  const KEY = 'sa_ai_redirect_state';          // per-tab memory (sessionStorage)

  const url = new URL(location.href);
  const params = url.searchParams;
  const q = (params.get('q') || '').trim();
  if (!q) return;

  const load = () => {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (_) { return {}; }
  };
  const save = (state) => {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* storage unavailable */ }
  };

  const prev = load();
  const udm = params.get('udm');
  const mode = udm === AI_MODE ? 'ai' : (udm || params.get('tbm')) ? 'other' : 'standard';

  // optOut = the user manually left AI Mode in this tab; cleared when they are back in AI Mode.
  const optOut = !!prev.optOut;

  // 1) AI Mode page: remember it and stop.
  if (mode === 'ai') {
    save({ q, mode, optOut: false });
    return;
  }

  // 2) Images, News, Web filter, etc.: never touch.
  if (mode === 'other') {
    save({ q, mode, optOut });
    return;
  }

  // 3) Standard results page, same query as the last page:
  //    a tab switch, reload, paging, or our own redirect bouncing back. Respect it.
  if (prev.q === q) {
    save({ q, mode, optOut: optOut || prev.mode === 'ai' });
    return;
  }

  // 4) Fresh query in standard mode: decide whether to redirect.
  const OPERATORS = /(^|\s)(site|inurl|intitle|intext|allintitle|filetype|ext|related|cache|before|after|define):|"|\s-\S/i;
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const isBackForward = !!nav && nav.type === 'back_forward';
  const isPaged = Number(params.get('start')) > 0 || params.has('tbs');

  const stayStandard =
    q.length < MIN_CHARS ||
    (SKIP_OPERATOR_QUERIES && (OPERATORS.test(q) || /\sOR\s/.test(q))) ||
    isBackForward ||
    isPaged ||
    (STAY_IN_STANDARD_AFTER_SWITCH && optOut);

  if (stayStandard) {
    save({ q, mode, optOut });
    return;
  }

  // Save first, so a failed redirect (Google bouncing back to standard) cannot loop.
  save({ q, mode: 'standard', optOut: false });
  params.set('udm', AI_MODE);
  location.replace(url.href);
})();