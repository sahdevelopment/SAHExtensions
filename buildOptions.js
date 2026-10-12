import fs from "node:fs/promises";

function GetVersion() {
    const date = new Date();

    const pad = n => String(n).padStart(2, "0");
    
    return `v${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
            `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

const VERSION_PLACEHOLDER = "<%CURRENTVERSION%>";

const automaticVersioning = {
    name: "version-number",

    setup(build) {
        build.onEnd(async result => {
            if (result.errors.length > 0) return;

            const outfile = build.initialOptions.outfile;
            const version = GetVersion();

            const code = await fs.readFile(outfile, "utf8");
            await fs.writeFile(outfile, code.replace(VERSION_PLACEHOLDER, version));

            console.log(`Build version: ${version}`);
        });
    }
};

const header = `// ==UserScript==
// @name         SAH Extensions
// @namespace    http://tampermonkey.net/
// @version      <%CURRENTVERSION%>
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
// @grant GM_registerMenuCommand
//
// ==/UserScript==
`;

export const buildOptions = {
    entryPoints: ["src/main.js"],
    bundle: true,
    format: "iife",
    outfile: "dist/sah-extensions.user.js",
    sourcemap: false,
    plugins: [
        automaticVersioning
    ],
    banner: {
        js: header
    },
    loader: {
        ".html": "text",
        ".css": "text"
    }
};