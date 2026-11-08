// ==UserScript==
// @name         Hide YouTube Music Mini-Player
// @namespace    http://tampermonkey.net
// @version      1.0
// @description  Permanently hides the mini-player tray on YouTube Music desktop
// @author       AI Assistant
// @match        https://music.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const style = document.createElement('style');
    style.textContent = `
        ytmusic-player[player-ui-state="MINIPLAYER"],
        ytmusic-player-bar[player-ui-state="MINIPLAYER"] {
            display: none !important;
            height: 0px !important;
            visibility: hidden !important;
        }
    `;
    document.documentElement.appendChild(style);
})();
// ==UserScript==
// @name         New Userscript S5LH-1
// @namespace    https://docs.scriptcat.org/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
})();
