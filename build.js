import esbuild from "esbuild";

const userscriptHeader = `// ==UserScript==
// @name         SAH Advanced Integration
// @namespace    http://tampermonkey.net/
// @version      2026-08-31
// @description  SAH Advanced Integration voor Nexus, Zoho en Steam
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

const buildOptions = {
    entryPoints: ["src/main.js"],
    bundle: true,
    format: "iife",
    outfile: "dist/integration-main.user.js",
    sourcemap: true,
    banner: {
        js: userscriptHeader
    },
    loader: {
        ".html": "text",
        ".css": "text"
    }
};

async function build() {
    await esbuild.build(buildOptions);

    console.log("Initial build complete.");

    const ctx = await esbuild.context(buildOptions);

    await ctx.watch();

    console.log("Watching for changes...");
}

build().catch((error) => {
    console.error(error);
    process.exit(1);
});