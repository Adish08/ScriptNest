// ==UserScript==
// @name         Hide YouTube Music Mini-Player
// @namespace    http://tampermonkey.net
// @version      1.3
// @description  Hides the floating mini-player box while keeping the bottom playback bar visible
// @author       adish08
// @match        https://music.youtube.com/*
// @icon         data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23FF0000"/><circle cx="12" cy="12" r="6" fill="none" stroke="%23FFFFFF" stroke-width="1.5"/><polygon points="10,9 15.5,12 10,15" fill="%23FFFFFF"/><line x1="4" y1="20" x2="20" y2="4" stroke="%23FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const style = document.createElement('style');
    style.textContent = `
        ytmusic-player[player-ui-state="MINIPLAYER"] {
            display: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
})();
