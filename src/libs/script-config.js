import { TamperMonkey as TM } from "./tampermonkey";
import SettingsCSS from "../css/settings.css";
import SettingsHTML from "../html/settings.html";

export class ScriptConfig {
    Defaults;
    UserSettings;

    constructor() {
        GM_registerMenuCommand("Open Settings", this.OpenSettings, "s");
        TM.AddStyle(SettingsCSS);
    }

    async Load() {
        const config = await TM.GetValue("user.settings");
        if(config) this.UserSettings = config;
        else this.UserSettings = {};
        this.ApplyDefaultsToUndefined();
    }

    async Save() {
        await TM.SetValue("user.settings", this.UserSettings);
    }

    OpenSettings() {
        const config = document.getElementById("sah-extensions-config");
        if(config) return;
        document.body.insertAdjacentHTML("afterbegin", SettingsHTML);
    }

    CloseSettings() {
        const config = document.getElementById("sah-extensions-config");
        if(config) config.remove();
    }

    ApplyDefaults() {
        for (const [key, defaultValue] of Object.entries(this.Defaults)) {
            this.UserSettings[key] = defaultValue;
        }
        this.Save();
    }

    ApplyDefaultsToUndefined() {
        for (const [key, defaultValue] of Object.entries(this.Defaults)) {
            if(this.UserSettings[key]) continue;
            this.UserSettings[key] = defaultValue;
        }
        this.Save();
    }

    Register(key, defaultValue) {
        this.Defaults[key] = defaultValue;
    }

    Get(key) {
        const userValue = this.UserSettings[key];
        if(!userValue) return this.Defaults[key];
        return userValue;
    }

    Set(key, value) {
        this.UserSettings[key] = value;
        this.Save();
    }
}