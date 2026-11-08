// ==UserScript==
// @name         WhatsApp Web - Clean UI
// @description  Fix & debloat WhatsApp Web's interface
// @author       Gamba
// @version      2.6.2
// @license      MIT
// @namespace    http://tampermonkey.net/
// @match        https://web.whatsapp.com/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://web.whatsapp.com/&size=256
// @grant        none
// @run-at       document-body
// @downloadURL https://update.greasyfork.org/scripts/535092/WhatsApp%20Web%20-%20Clean%20UI.user.js
// @updateURL https://update.greasyfork.org/scripts/535092/WhatsApp%20Web%20-%20Clean%20UI.meta.js
// ==/UserScript==

"use strict";

// Shortcuts
const mainRoot = "#app > div > div > div:nth-last-child(2) > div";
const altRoot = `${mainRoot} > div:nth-child(3)`;
const sidePane = "#side > #pane-side";
const altSidePane = `${altRoot} > div:first-child > div > span > div > span > div > div > div`;
const sidebarRoot = `${mainRoot} > header > div`;

const homePageTitleScreen = `${mainRoot} > div:nth-child(5) > section`;
const altTitleScreen = `${altRoot} > div:last-child > div > span > div > section`;
const sidebarTop = `${sidebarRoot} > div:first-child > div`;
const sidebarBottom = `${sidebarRoot} > div:last-child > div`;
const tabSubSelector = "span > div";
const mainHeader = `${mainRoot} > div:nth-child(4) > header > header > div`;
const altHeader = `${altSidePane} > header > div`;
const chats = `${sidePane} > div:nth-child(2) > div > div`;
const chatSelector = `${chats} > div > div > div`;
const archivedChats = `${altSidePane} > div[tabindex="-1"]`;
const archivedChatSelector = `${archivedChats} > div[tabindex="-1"] > div > div > div`;
const searchResults = `${sidePane} > div:first-child > div > div`;
const searchResultSelector = `${searchResults} > div > div > div[tabindex]`;
const messageRoot = '#main > div:nth-child(3) > div > div > div:last-child > div[tabindex="0"] > div > div';
const messageProfilePicture = `${messageRoot}:first-child > div > div > div[data-testid="group-chat-profile-picture"]`;
const messageContent = `${messageRoot} > div > div > div > div > div > div:nth-child(2) > div:first-of-type > div`;
const expressionsPanel = "#expressions-panel-container > span > div > ul > div";
const settings = `${altSidePane} > div[role="listbox"] > div > div`;
const callControls = `${mainRoot} > div:nth-child(7) > div > div > div:last-child > div > div`;
const contextMenu = "#app > div > div > div:last-child";
const searchBarSelector = '[dir="ltr"] > div > div';

const body = document.body;

// Mutation Observer
let mutationCallbacks = [];

new MutationObserver(onMutation).observe(body,
{
    childList: true,
    subtree: true
});

function onMutation()
{
   for (const callback of mutationCallbacks)
   {
       callback();
   }
}

// Add original dark theme
{
    const themeKey = "theme";
    const darkThemeValue = '"dark"';
    const lightThemeValue = '"light"';
    const systemKey = "system-theme-mode";
    const originalKey = "original-theme";
    const originalLabel = " (2024)";

    // Apply theme
    initOriginalTheme();

    function initOriginalTheme()
    {
        const system = localStorage.getItem(systemKey) == "true";
        const theme = localStorage.getItem(themeKey);
        const original = localStorage.getItem(originalKey) == "true";

        if (system)
        {
            localStorage.setItem(systemKey, false);
            localStorage.setItem(themeKey, darkThemeValue);
            localStorage.setItem(originalKey, true);

            location.reload();
        }

        if (theme == darkThemeValue && original) applyOriginalTheme();
    }

    function applyOriginalTheme()
    {
        const targetClass = "original dark";

        if (body.className != targetClass)
        {
            body.className = targetClass;
        }
    }

    // Apply changes in settings
    mutationCallbacks.push(updateThemePreview);
    mutationCallbacks.push(updateOptionsDialog);

    // Replace theme preview label
    let previewActive = false;

    function updateThemePreview()
    {
        const preview = document.querySelector(`${altRoot} > div:first-child > div > span > div > span > div > span > div > div > div > div > div > div > div:first-child > button:nth-child(2) > div > div > div:first-child > div:last-child > div > span > span > span`);
        const previewExists = preview != null;

        if (previewExists != previewActive)
        {
            previewActive = previewExists;

            if (previewExists)
            {
                const original = localStorage.getItem(originalKey) == "true";

                if (original) preview.innerHTML += originalLabel;
            }
        }
    }

    // Replace system theme option with original dark
    let dialogActive = false;

    function updateOptionsDialog()
    {
        const dialog = document.querySelector("#app > div > div > span:nth-child(3) > div > div > div > div > div > div");
        const dialogExists = dialog != null;

        if (dialogExists != dialogActive)
        {
            dialogActive = dialogExists;

            if (dialogExists)
            {
                const darkOption = getOption(1);
                const darkLabel = getLabel(darkOption);
                const systemOption = getOption(2);

                setLabel(systemOption, darkLabel + originalLabel);

                const original = localStorage.getItem(originalKey) == "true";

                if (original) systemOption.click();

                const okButton = dialog.children[2].firstElementChild.children[1];
                okButton.addEventListener("click", onConfirm, true);

                function onConfirm()
                {
                    const darkSelected = isSelected(darkOption);
                    const systemSelected = isSelected(systemOption);

                    localStorage.setItem(systemKey, false);
                    localStorage.setItem(originalKey, systemSelected);
                    localStorage.setItem(themeKey, (darkSelected || systemSelected) ? darkThemeValue : lightThemeValue);

                    location.reload();
                }
            }
        }

        function getOption(index)
        {
            return dialog.children[1].firstElementChild.firstElementChild.firstElementChild.children[index].children[1];
        }

        function getLabel(option)
        {
            const label = option.innerHTML;
            const child = option.firstElementChild.outerHTML;

            return label.replace(child, "");
        }

        function setLabel(option, text)
        {
            const child = option.firstElementChild.outerHTML;

            option.innerHTML = text + child;
        }

        function isSelected(option)
        {
            const radio = option.previousElementSibling.firstElementChild.children[1];

            return radio.ariaChecked == "true";
        }
    }
}

// Prevent unwanted focus
{
    let lastInput;

    document.addEventListener("mousedown", () => lastInput = "Mouse", true);
    document.addEventListener("keydown", () => lastInput = "Keyboard", true);

    document.addEventListener("focus", onFocus, true);

    function onFocus(event)
    {
        const element = event.target;

        const match = element instanceof HTMLButtonElement;
        const text = element.style.userSelect == "text";
        const mouse = lastInput == "Mouse";

        if (match || (!text && !mouse))
        {
            element.blur();
        }
    }
}

// Exit chat on select tab
{
    document.addEventListener("click", onClick, true);

    function onClick(event)
    {
        const button = event.target.closest("button");
        const header = button?.closest("header");

        if (header?.parentElement.hasAttribute("tabindex"))
        {
            const keyEvent = new KeyboardEvent("keydown", { key: "Escape" });

            document.dispatchEvent(keyEvent);
        }
    }
}

// Fix chat inconsistent highlights
{
    mutationCallbacks.push(updateHighlights);

    function updateHighlights()
    {
        const main = document.getElementById("main");
        const chat = document.querySelector(getSelector('[aria-selected="true"]'));

        if (main == null && chat != null) chat.ariaSelected = "false";
        else if (main != null && chat == null) trySelectChat(main);
    }

    function getSelector(condition)
    {
        const selectors = [chatSelector, archivedChatSelector, searchResultSelector];

        return selectors.map(selector => selector + condition).join();
    }

    function trySelectChat(main)
    {
        const mainTitle = main.querySelector(":scope > header > div:first-child > div:last-child span");

        if (mainTitle != null)
        {
            const chatTitles = document.querySelectorAll(getSelector(" > div > div:last-child > div:first-child > div:first-child span"));

            for (const chatTitle of chatTitles)
            {
                if (chatTitle.textContent == mainTitle.textContent)
                {
                    const chat = chatTitle.closest("[aria-selected]");

                    chat.ariaSelected = "true";

                    return;
                }
            }
        }
    }
}

// <path> type default profile pictures
{
    mutationCallbacks.push(updateProfilePictures);

    function updateProfilePictures()
    {
        setPictures(1, 1, `${archivedChatSelector} > div > div:first-child > div > div > div > span > svg`);
        setPictures(1, 1.75, `${mainRoot} > header > div > div:last-child > div > div:last-child > span > div > button > div > div > span > svg`);
        setPictures(3, 1.125, `${settings} > div:first-child > div > div:last-child > div > div > div > span > svg`);
        setPictures(1, 1, `${messageContent} > div:first-of-type > div > div:first-child > div:last-child > div:last-child > div:first-child > div > span > svg`);
        setPictures(1, 1.2, `${altSidePane} > div > div:first-child > button > div:first-child > div > div > div:first-child > div > span > svg`);
        setPictures(1, 1.2, "#app > div > div > span:nth-child(4) > div > div > div > span:last-child > div > div > div > div > div:nth-child(2) > div:first-child div > span > svg");
        setPictures(1, 1, `${callControls} > div > div > div:first-child div > span > svg`);
    }

    function setPictures(svgOffset, circleOffset, selector)
    {
        for (const svg of document.querySelectorAll(selector))
        {
            if (svg != null)
            {
                svg.style = `outline-width: ${svgOffset}px; outline-offset: -${svgOffset}px;`;

                const type = "circle";
                let circle = svg.firstElementChild;

                if (circle.nodeName.toLowerCase() != type)
                {
                    circle = document.createElementNS("http://www.w3.org/2000/svg", type);

                    circle.setAttribute("cx", "50%");
                    circle.setAttribute("cy", "50%");
                    circle.setAttribute("r", `calc(50% - ${circleOffset}px)`);
                    circle.setAttribute("fill", "var(--WDS-surface-emphasized)");

                    svg.prepend(circle);
                }
            }
        }
    }
}

// Apply CSS
{
    const css =
    `
    /*Bloat screen*/
    ${homePageTitleScreen} > *,
    ${altTitleScreen} > *
    {
        display: none;
    }

    /*Desktop app advertisement*/
    #side > div:last-child[tabindex]:not([id])
    {
        display: none;
    }

    /*Bloated tabs*/
    ${sidebarTop} > :not(:nth-child(1), :nth-child(4))
    {
        display: none;
    }

    /*Status notification*/
    ${sidebarTop} > div:nth-child(4) > ${tabSubSelector} > div:last-child
    {
        display: none;
    }

    /*Media button*/
    ${sidebarBottom} > div:first-child
    {
        display: none;
    }

    /*Header buttons*/
    ${mainHeader},
    ${altHeader}
    {
        > span button
        {
            --WDS-accent: transparent !important;

            > div > div > div > span
            {
                color: var(--WDS-content-disabled) !important;
            }
        }
    }

    /*Chat lists*/
    #side > [role="tablist"]
    {
        display: none;
    }

    /*Chats info*/
    ${sidePane} > div:last-child
    {
        display: none;
    }

    /*Archived chats info*/
    ${archivedChats} > div:nth-child(-n + 2)
    {
        display: none;
    }

    /*Chat inconsistent highlights*/
    ${chatSelector}, ${archivedChatSelector}, ${searchResultSelector}
    {
        &[aria-selected="true"] > div:not(:hover)
        {
            background-color: var(--WDS-surface-highlight);
        }

        &[aria-selected="false"] > div:not(:hover)
        {
            background-color: transparent;
        }
    }

    /*Chat dropdown arrows*/
    ${chatSelector} > div:not(:hover) > div:last-child > div:last-child > div:last-child > span:last-child
    {
        display: none;
    }

    /*Chat context menu*/
    ${contextMenu} [hidden]
    {
        display: block;
    }

    /*Meta AI context menu*/
    ${contextMenu} [aria-label*="Meta AI"]
    {
        display: none;
    }

    /*Media Gallery*/
    [data-testid="media-gallery"] > [role="listitem"]::after
    {
        background-color: rgba(255, 255, 255, 0.1) !important;
    }

    /*Expressions search bar*/
    ${expressionsPanel} ${searchBarSelector}
    {
        background-color: var(--WDS-surface-elevated-emphasized) !important;
    }

    /*GIFs rounded corners*/
    ${expressionsPanel} > div:first-child > div:last-child > div > div:last-child > div > div > div > button
    {
        border-radius: 10px !important;
    }

    /*Sticker dropdown arrow*/
    ${messageContent}:has([data-testid="sticker-container"]) > span:last-of-type > div
    {
        left: 100%;
    }

    /*<g> type default profile pictures*/
    ${chatSelector} > div > div:first-child > div > div > div > div > div,
    #main > header > div:first-child > div:first-child > div > div > div,
    ${mainRoot} > div:nth-child(7) > span > div > span > div > div > div:last-child > div > section > div:first-child > div:first-child > div > div > div > div
    {
        svg > g > g
        {
            fill: var(--WDS-surface-emphasized);
            stroke-width: 2px;
            paint-order: stroke fill;

            circle
            {
                r: calc(50% - 1px);
            }

            &:has(+ foreignObject[width="120"])
            {
                stroke-width: 6px;

                circle
                {
                    r: calc(50% - 3px);
                }
            }
        }
    }

    /*<div> type default profile pictures*/
    ${messageProfilePicture} > div
    {
        background-color: var(--WDS-surface-emphasized);
    }

    /*Settings*/
    ${settings}
    {
        > div:first-child > div
        {
            margin-bottom: 0;
        }

        > div:last-child > div
        {
            > button > div > div
            {
                &:hover
                {
                    background-color: var(--WDS-surface-highlight);
                }

                &:not(:hover)
                {
                    background-color: transparent;
                }
            }

            > div:last-child
            {
                display: none;
            }
        }
    }

    /*Call controls*/
    ${callControls}
    {
        background-color: var(--WDS-surface-default);

        > div:first-child > div > div:last-child
        {
            background-color: var(--WDS-surface-default);

            > div > div:first-child > div:last-child > div > div > div
            {
                background-color: var(--WDS-surface-emphasized);
            }
        }
    }

    /*Small unnecessary borders*/
    ${mainRoot}
    {
        > div:nth-child(3) > div:first-child,
        body:not(.dark:not(.original)) & > div:nth-child(3) > div:last-child,
        > div:nth-child(4) > div,
        > div:nth-child(6),
        > div:nth-child(7)
        {
            border-left: 0;
            padding-left: 0;
        }

        > div:nth-child(5)
        {
            border-left-color: var(--conversation-header-border);
        }
    }

    /*Tooltips*/
    [role="tooltip"]
    {
        display: none;
    }

    /*Input focus*/
    ${searchBarSelector}:has(input:focus)
    {
        background-color: var(--WDS-surface-emphasized);
    }

    /*Outlines*/
    div:not(:focus)
    {
        outline: none !important;
    }

    /*Scrollbar*/
    *
    {
        scrollbar-width: unset !important;
        scrollbar-color: unset !important;
    }

    div
    {
        ::-webkit-scrollbar
        {
            width: 14px !important;
        }

        ::-webkit-scrollbar-button
        {
            display: none !important;
        }

        ::-webkit-scrollbar-track,
        ::-webkit-scrollbar-track-piece
        {
            background-color: transparent !important;
        }

        ::-webkit-scrollbar-thumb
        {
            height: 50px !important;

            border: 3px solid transparent !important;
            border-radius: 100px;
            background-clip: padding-box !important;

            background-color: rgba(var(--black-rgb), 20%) !important;
        }
    }

    .dark div ::-webkit-scrollbar-thumb
    {
        background-color: rgba(var(--white-rgb), 16%) !important;
    }

    /*Caret color*/
    *
    {
        caret-color: var(--WDS-accent);
    }

    /*Selections*/
    *
    {
        user-select: none !important;

        [data-testid~="selectable-text"] *
        {
            user-select: text !important;
        }
    }

    /*Selection color*/
    ::selection
    {
        background-color: rgba(var(--WDS-accent-RGB), 0.4) !important;
    }

    /*Dark theme*/
    .dark:not(.original) *
    {
        --WDS-background-elevated-wash-inset: #161717 !important;

        --WDS-surface-emphasized: #202222 !important;
        --WDS-surface-highlight: #202222 !important;

        --WDS-content-deemphasized: #959595 !important;
        --WDS-content-action-default: #959595 !important;
        --WDS-content-disabled: #565959 !important;
    }

    /*Dark theme 2024*/
    .dark.original *
    {
        --background-default: #111b21 !important;
        --search-container-background: #111b21 !important;
        --drawer-background-deep: #111b21 !important;
        --panel-background-deeper: #111b21 !important;

        --compose-input-background: #202c33 !important;
        --compose-input-border: #202c33 !important;

        --conversation-header-border: #222e35 !important;
        --conversation-panel-border: #222e35 !important;

        --dropdown-background: #222e35 !important;
        --intro-background: #202c33 !important;
        --reactions-panel-background-color: #222e35 !important;
        --system-message-background: #202c33 !important;

        --WDS-background-wash-inset: #202c33 !important;
        --WDS-background-wash-inset-RGB: 32, 44, 51 !important;
        --WDS-background-wash-plain: #111b21 !important;
        --WDS-background-wash-plain-RGB: 17, 27, 33 !important;
        --WDS-background-elevated-wash-inset: #202c33 !important;

        --WDS-surface-default: #111b21 !important;
        --WDS-surface-emphasized: #202c33 !important;
        --WDS-surface-highlight: #202c33 !important;
        --WDS-surface-elevated-default: #202c33 !important;
        --WDS-surface-elevated-emphasized: #2a3942 !important;

        --WDS-content-deemphasized: #85959f !important;
        --WDS-content-action-default: #85959f !important;
        --WDS-content-disabled: #617079 !important;

        --WDS-systems-chat-background-wallpaper: #111b21 !important;
        --WDS-systems-chat-background-wallpaper-RGB: 17, 27, 33 !important;
        --WDS-systems-chat-surface-composer: #202c33 !important;
        --WDS-systems-chat-surface-tray: #111b21 !important;

        --WDS-systems-bubble-surface-system: #202c33 !important;
        --WDS-systems-bubble-surface-incoming: #202c33 !important;
        --WDS-systems-bubble-surface-incoming-RGB: 32, 44, 51 !important;
        --WDS-systems-bubble-surface-outgoing-RGB: 0, 92, 75 !important;
        --WDS-systems-bubble-surface-outgoing: #005c4b !important;
    }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}