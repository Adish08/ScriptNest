// ==UserScript==
// @name         reCAPTCHA Auto-Checkbox & Buster Helper
// @namespace    https://github.com/adish08
// @version      1.3.1
// @author       adish08
// @updateURL    https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/reCAPTCHA%20Auto-Checkbox%20%26%20Buster%20Helper.user.js
// @downloadURL  https://raw.githubusercontent.com/Adish08/ScriptNest/main/scripts/reCAPTCHA%20Auto-Checkbox%20%26%20Buster%20Helper.user.js
// @description  Clicks the reCAPTCHA checkbox / triggers Buster only when the widget is actually on screen.
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACkklEQVR42u1bO1LDMBCVdtxRQ4VnSMMNUqXMFTzkDFyBA+Quyah1SUmVG6SBmVBBnRoKRowjLMe72lUkmW0Sf6TkvX37kcfSCmGvh48vlYHN6hs99l5dCmgqGRoD/u72OgvQb++fo0nQJQGnEKGHwOcKfIgIlwQoHbyLxVU3nBtQIgm9BFhmSgTvktBVAZRQ6ihmMUPp0j8XCqAmbloq9pfrI3ns89NVtNKoJZNfCAnSZFgCkg+B5frIQqTPKqk/zWn7tlV1+/P98PLAOjekDt61erFNUwFSwPdt6yWBQw2Qg9cl1QApg+/zPjcJk2+EIGfvc6igugT4bnOzXB//HFPzASUpVjHl1tfVuefscd3SfwdDBsTyPralpXizXmzR4VBdwutYEribnyAFXKrmJ1kFYq3kuPv/KARwL2OlSIApy19MAVIPMSRUMPlWuOL2bG5hgiLAGHP2nsd7pYxRqmma5B+GiDVCEuDH5AAKQVVJ8Zz8YojD5pt+de1WJp0QMMawhoEPtO8eDBmQq8e5xogRMKZiSIDHjhVVQAgJIeAxc0ApsqfOJU6AMQalBE7wY+ZEE9A0DSnDc+SEMYYth4AFH1MNVPAYEoLeD+ACY4kNkX8faHe+7j0s7wdI9fwS4LN/HuCTdQh4FgJiqAAT29gwAs4YjuH57rF7jZJD2EKAWh5jr/7Ec0AICT5QQ9l8rPd9c4skQawaQstpSPkUrQKcYeEDGdo6a6Xivinu83aXqCFQu5VR803z+0kJLdsEzeobHZ2A2IuivtjvEgB9F1JufLjAn+QAzD67XEg4N9ZiBvdESiqgkuAb05X+SRK0lsOmKWpj5Ns5Nvltc/8bJ4cmmOzW2SEScrOgzdO5koEp69+h4WiuKAGyDgAAAABJRU5ErkJggg==
// @match        *://*.google.com/recaptcha/*
// @match        *://*.recaptcha.net/recaptcha/*
// @run-at       document-end
// @grant        none
// ==/UserScript==


(function () {
  'use strict';

  const url = window.location.href;
  const isAnchor = /\/recaptcha\/(api2|enterprise)\/anchor/.test(url);
  const isBframe = /\/recaptcha\/(api2|enterprise)\/bframe/.test(url);
  if (!isAnchor && !isBframe) return;

  function whenVisible(el, cb, { ratio = 0.9, dwell = 500 } = {}) {
    let inView = false, timer = null, done = false;
    const evaluate = () => {
      const ok = inView && document.visibilityState === 'visible';
      if (ok && !timer && !done) {
        timer = setTimeout(() => {
          timer = null;
          if (done) return;
          done = true;
          io.disconnect();
          cb();
        }, dwell + Math.random() * 400);
      } else if (!ok && timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const io = new IntersectionObserver(entries => {
      const e = entries[entries.length - 1];
      inView = e.isIntersecting && e.intersectionRatio >= ratio;
      evaluate();
    }, { threshold: [0, 0.5, ratio, 1] });
    document.addEventListener('visibilitychange', evaluate);
    io.observe(el);
  }

  // 1. Checkbox iframe
  if (isAnchor) {
    const target = document.querySelector('.recaptcha-checkbox-border');
    if (target && !document.querySelector('.recaptcha-checkbox-checked')) {
      whenVisible(target, () => {
        if (!document.querySelector('.recaptcha-checkbox-checked')) target.click();
      });
    }
    return;
  }

  // 2. Challenge popup iframe
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_MS = 15000;
  let attempts = 0, armed = false, lastClick = 0;

  const findButton = () =>
    document.querySelector('#solver-button, .help-button-holder') ||
    document.querySelector('#recaptcha-audio-button');

  const arm = () => {
    if (armed || attempts >= MAX_ATTEMPTS) return;
    if (Date.now() - lastClick < COOLDOWN_MS) return;
    if (!findButton()) return;
    armed = true;
    // The challenge iframe sits off-screen while closed, so this waits for it to open.
    whenVisible(document.body, () => {
      armed = false;
      const btn = findButton();
      if (btn) {
        attempts++;
        lastClick = Date.now();
        btn.click();
      }
    }, { dwell: 800 });
  };

  new MutationObserver(arm).observe(document.body, { childList: true, subtree: true });
  arm();
})();
