// ==UserScript==
// @name         Show Password on Hover
// @namespace    MickyFoley
// @description  Reveals a password field immediately while hovering over it
// @version      1.5
// @author       adish08
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMwZjE3MmEiLz48cGF0aCBkPSJNOCAzMnM5LTE0IDI0LTE0IDI0IDE0IDI0IDE0LTkgMTQtMjQgMTRTOCAzMiA4IDMyeiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSI3IiBmaWxsPSIjZmZmIi8+PC9zdmc+
// @license      free
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const shown = new Set();
  const inputFrom = (e) => {
    const el = e.composedPath ? e.composedPath()[0] : e.target;
    return el instanceof HTMLInputElement ? el : null;
  };

  document.addEventListener('pointerover', (e) => {
    const el = inputFrom(e);
    if (!el || el.type !== 'password' || el.disabled || el.readOnly) return;
    el.type = 'text';
    shown.add(el);
  }, true);

  document.addEventListener('pointerout', (e) => {
    const el = inputFrom(e);
    if (!el || !shown.delete(el)) return;
    el.type = 'password';
  }, true);

  const hideAll = () => {
    for (const el of shown) el.type = 'password';
    shown.clear();
  };

  addEventListener('visibilitychange', () => document.hidden && hideAll());
  addEventListener('pagehide', hideAll);
})();