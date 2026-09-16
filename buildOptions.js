const header = `// ==UserScript==
// @name         SAH Extensions
// @namespace    http://tampermonkey.net/
// @version      2026-08-31
// @description  SAH Extension Integration voor Nexus, Zoho en Steam
// @author       Wessel + HOA Team
// @match        *://desk.zoho.eu/agent/*
// @match        *://studentaanhuis.steam.eu.com/*
// @match        *://app.studentaanhuis.nl/*
// @icon         https://www.google.com/s2/favicons?sz=256&domain=studentaanhuis.nl
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_addValueChangeListener
// @grant GM_addStyle
// @grant GM_addElement
// @grant GM_xmlhttpRequest
//
// ==/UserScript==
`;

export const buildOptions = {
    entryPoints: ["src/main.js"],
    bundle: true,
    format: "iife",
    outfile: "dist/sah-extensions.user.js",
    sourcemap: false,
    banner: {
        js: header
    },
    loader: {
        ".html": "text",
        ".css": "text"
    }
};
