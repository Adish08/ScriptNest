// ==UserScript==
// @name         YouTube Mobile Auto Unmute (Videos + Shorts only)
// @namespace    https://tampermonkey.net/
// @version      1.2
// @description  Keeps feed previews muted; unmutes only when a video or Short is opened on m.youtube.com
// @author       adish08
// @icon         data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%3E%3Crect%20width%3D%22512%22%20height%3D%22512%22%20rx%3D%22108%22%20fill%3D%22%23FF0000%22%2F%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M%20118%20208%20L%20118%20304%20L%20168%20304%20L%20248%20376%20L%20248%20136%20L%20168%20208%20Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2226%22%20stroke-linecap%3D%22round%22%20d%3D%22M%20292%20196%20A%2078%2078%200%200%201%20292%20316%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2226%22%20stroke-linecap%3D%22round%22%20d%3D%22M%20338%20158%20A%20132%20132%200%200%201%20338%20354%22%2F%3E%3C%2Fsvg%3E
// @match        https://m.youtube.com/*
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const TARGET_VOLUME = 1.0; // 100% volume (0.0 - 1.0)

    let currentVideo = null;

    function log(...args) {
        console.log('[YT Auto-Unmute]', ...args);
    }

    // Only watch pages and Shorts get unmuted; feed previews are left alone
    function isPlaybackPage() {
        const p = location.pathname;
        return p.startsWith('/watch') || p.startsWith('/shorts/');
    }

    function getVideo() {
        return document.querySelector('video');
    }

    function clickUnmuteButton() {
        let btn = document.querySelector('button[aria-label="Unmute"]');
        if (!btn) {
            const all = document.querySelectorAll('button[aria-label*="mute" i]');
            for (const b of all) {
                if (/unmute/i.test(b.getAttribute('aria-label') || '')) {
                    btn = b;
                    break;
                }
            }
        }
        if (btn) {
            try {
                btn.click();
                log('Clicked Unmute button');
                return true;
            } catch (e) {
                log('Click failed', e);
            }
        }
        return false;
    }

    function forceUnmute(video) {
        if (!video) return;
        try {
            video.defaultMuted = false;
            video.muted = false;
            video.volume = TARGET_VOLUME;
            video.removeAttribute('muted');
            if (video.paused && video.readyState >= 2) {
                const p = video.play();
                if (p && p.catch) p.catch(() => {});
            }
        } catch (e) {
            log('forceUnmute error', e);
        }
    }

    function tryUnmute() {
        if (!isPlaybackPage()) return false; // feed previews stay muted

        const video = getVideo();
        if (!video) return false;

        if (video !== currentVideo) {
            bindVideo(video);
            currentVideo = video;
        }

        if (!video.muted && video.volume >= 0.99) return true;

        forceUnmute(video);

        if (video.muted) {
            clickUnmuteButton();
        }
        return !video.muted;
    }

    function bindVideo(video) {
        log('Binding video element');
        const events = ['loadedmetadata', 'canplay', 'play', 'playing', 'volumechange'];
        events.forEach(ev => {
            video.addEventListener(ev, () => {
                if (!isPlaybackPage()) return;
                setTimeout(() => {
                    if (isPlaybackPage()) forceUnmute(video);
                }, 50);
                setTimeout(() => {
                    if (isPlaybackPage() && video.muted) clickUnmuteButton();
                }, 300);
            });
        });
        if (isPlaybackPage()) forceUnmute(video);
    }

    // Watch for the <video> element appearing / being replaced (YouTube is a SPA)
    const observer = new MutationObserver(() => {
        tryUnmute();
    });

    try {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body) observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Retry burst: runs for ~15 seconds after every page/URL change
    let retryTimer = null;
    function startBurst() {
        clearInterval(retryTimer);
        let retries = 0;
        retryTimer = setInterval(() => {
            retries++;
            tryUnmute();
            if (retries > 30) clearInterval(retryTimer);
        }, 500);
    }

    // YouTube SPA navigation events
    const onNav = () => {
        setTimeout(tryUnmute, 300);
        startBurst();
    };
    window.addEventListener('yt-navigate-finish', onNav);
    window.addEventListener('yt-page-data-updated', onNav);
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);

    // Backup: poll the URL, since m.youtube.com does not always fire the events above
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            onNav();
        }
    }, 300);

    // Fallback: if the browser blocks unmute without a user gesture,
    // unmute on the first tap (only takes effect on watch/Shorts pages)
    const gestureUnmute = () => tryUnmute();
    document.addEventListener('touchstart', gestureUnmute, { passive: true });
    document.addEventListener('pointerdown', gestureUnmute, { passive: true });
    document.addEventListener('click', gestureUnmute, { passive: true });

    // Initial attempt
    startBurst();
    tryUnmute();
    log('Script loaded on', location.href);
})();
