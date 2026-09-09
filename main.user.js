// ==UserScript==
// @name         SAH Integratie
// @namespace    http://tampermonkey.net/
// @version      2026-08-24
// @description  SAH Integratie voor Nexus, Zoho en Steam
// @author       Wessel
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
// @connect raw.githubusercontent.com
// ==/UserScript==

//Contributors
/*
-> Wessel
-> Hedde
*/

(function() {
    "use strict";

    const UserSettings = 
    {
        General: {
            IntegrationEnabled: true,
            DetectIncomingCalls: true, //Automatically detects calls (will auto lookup phone numbers and fill fields in the future)
            ZohoOpensInNewTab: true, //Open zoho in new tab instead of redirecting the main tab
            SourceURL: "https://raw.githubusercontent.com/streepje8/TempTestRepo/main",
        },
        KCC: {
            
        },
        HOA: {
            SteamNotitieTemplate: "{problem}\n{description}\n{note}\nWerkbon\n\n{postcode}\n{pin}",
            SteamOmschrijvingTemplate: undefined,
            SteamVerrichtTemplate: undefined,
            SteamAdviesTemplate: undefined,
        },
        EXPERIMENTAL: {

        }
    };
    
    if(!UserSettings.General.IntegrationEnabled) return;

    GM_addElement("script", {
        textContent: "window.Integration = {};\nconst Integration = window.Integration;"
    });

    const ZohoURLRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl.*/;
    const SteamURLRegex = /https:\/\/studentaanhuis\.steam\.eu\.com\/.*/;
    const NexusURLRegex = /https:\/\/app\.studentaanhuis\.nl.*/;

    Integration.CurrentIntegrationTarget = "UNKNOWN";
    if(window.location.href.match(ZohoURLRegex)) Integration.CurrentIntegrationTarget = "ZOHO";
    if(window.location.href.match(SteamURLRegex)) Integration.CurrentIntegrationTarget = "STEAM";
    if(window.location.href.match(NexusURLRegex)) Integration.CurrentIntegrationTarget = "NEXUS";

    console.log(`Integration target: ${Integration.CurrentIntegrationTarget}`);

    if(Integration.CurrentIntegrationTarget === "UNKNOWN") { //We don't want to touch this site, restore all state and exit
        window.Integration = undefined;
        return;
    }

    Integration.UserSettings = UserSettings;

    Integration.TM = { //Tamper Monkey
        SetValue(name, value) {
            GM_setValue(name, value);
        },
        GetValue(name) {
            return GM_getValue(name);
        },
        DeleteValue(name) {
            GM_deleteValue(name);
        },
        //Listener format: (name, oldValue, newValue) => {}
        AddValueChangeListener(name, listener) {
            GM_addValueChangeListener(name, listener);
        },
        AddStyle(css) {
            GM_addStyle(css);
        }
    };

    Integration.Loader = {
        LoadText(url, onLoad) {
            GM_xmlhttpRequest({
                method : "GET",
                url : url,
                onload : (ev) =>
                    {
                        if(!ev.responseText) return;
                        if(ev.responseText.length < 1) return;
                        onLoad(ev.responseText);
                    }
                }
            );
        },
        LoadScript(path) {
            if(!path) return;
            const url = `${Integration.UserSettings.General.SourceURL}/${path}`;
            this.LoadText(url, (script) => {
                GM_addElement("script", {
                    textContent: script
                });
            });
        },
        LoadInjectHtml(path, parent) {
            if(!path) return;
            if(!parent) return;
            const url = `${Integration.UserSettings.General.SourceURL}/${path}`;
            this.LoadText(url, html => parent.insertAdjacentHTML("beforeend", html));
        },
        LoadHtml(path) {
            if(!path) return;
            if(!parent) return;
            const url = `${Integration.UserSettings.General.SourceURL}/${path}`;
            let html = undefined;
            this.LoadText(url, res => html = res);
            return element => {
                if(html) element.insertAdjacentHTML("beforeend", html);
            };
        },
        LoadCSS(path) {
            if(!path) return;
            const url = `${Integration.UserSettings.General.SourceURL}/${path}`;
            this.LoadText(url, css => Integration.TM.AddStyle(css));
        }
    };

    Integration.Loader.LoadScript("src/shared/main.js");
    switch(Integration.CurrentIntegrationTarget) {
        case "ZOHO": Integration.Loader.LoadScript("src/zoho/main.js"); break;
        case "NEXUS": Integration.Loader.LoadScript("src/nexus/main.js"); break;
        case "STEAM": Integration.Loader.LoadScript("src/steam/main.js"); break;
        default: console.log("No additional integrations available for this site"); break;
    }
})();