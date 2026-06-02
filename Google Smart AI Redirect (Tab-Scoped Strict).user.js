// ==UserScript==
// @name         Google Smart AI Redirect (Tab-Scoped Strict)
// @namespace    http://tampermonkey.net
// @version      2026.4.2
// @description  Robust redirect to AI Mode utilizing isolated sessionStorage to permit manual tab toggling.
// @author       adish08
// @match        *://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const query = params.get('q');
    const udm = params.get('udm');
    const tbm = params.get('tbm');

    // Configuration
    const MIN_QUERY_LENGTH = 20;
    const KEY_MODE = 'sa_active_mode';
    const KEY_QUERY = 'sa_last_query';

    if (!query) return;

    const lastMode = sessionStorage.getItem(KEY_MODE);
    const lastQuery = sessionStorage.getItem(KEY_QUERY);

    // 1. Manual Tab Toggle Validation
    // If the query is identical to the one in memory, you clicked a UI tab. 
    // We register the mode change and abort the redirect.
    if (query === lastQuery) {
        if (udm === '50') sessionStorage.setItem(KEY_MODE, 'ai');
        else if (tbm || udm) sessionStorage.setItem(KEY_MODE, 'other');
        else sessionStorage.setItem(KEY_MODE, 'standard');
        return;
    }

    // 2. Memory Update for New Queries
    sessionStorage.setItem(KEY_QUERY, query);

    // 3. Explicit Parameter Enforcement
    // If Google's form natively passed the parameter, update state and exit.
    if (udm === '50') {
        sessionStorage.setItem(KEY_MODE, 'ai');
        return;
    } else if (tbm || udm) {
        sessionStorage.setItem(KEY_MODE, 'other');
        return;
    }

    // 4. State Inheritance for Sequential Searches
    // If you type a new query from the standard/images page, stay in that ecosystem.
    if (lastMode === 'standard' || lastMode === 'other') {
        sessionStorage.setItem(KEY_MODE, 'standard');
        return;
    }

    // 5. Trigger Logic for Fresh Tabs
    // Executes ONLY if tab memory is blank (new tab) OR if you were already in AI mode.
    if ((!lastMode || lastMode === 'ai') && query.length >= MIN_QUERY_LENGTH) {
        params.set('udm', '50');
        sessionStorage.setItem(KEY_MODE, 'ai');
        window.location.replace(url.toString());
    } else {
        // Fallback for sub-threshold queries
        sessionStorage.setItem(KEY_MODE, 'standard');
    }
})();
