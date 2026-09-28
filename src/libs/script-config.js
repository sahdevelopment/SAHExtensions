import { TamperMonkey as TM } from "./tampermonkey";
import { FontAwesome as FA } from "./font-awesome";
import SettingsCSS from "../css/settings.css";
import SettingsHTML from "../html/settings.html";
import GeneralSettingsHTML from "../html/settings/general.html";
import HOASettingsHTML from "../html/settings/hoa.html";
import KCCSettingsHTML from "../html/settings/kcc.html";
import ImportExportSettingsHTML from "../html/settings/import-export.html";
import ResetSettingsHTML from "../html/settings/reset.html";

export class ScriptConfig {
    Defaults = {};
    UserSettings = {};
    Config;

    constructor() {
        GM_registerMenuCommand("Open Settings", this.OpenSettings.bind(this), "s");
        this.CreateConfig();
    }

    CreateConfig() {
        this.Config = document.getElementById("sah-extensions-config");
        if(this.Config) return;
        TM.AddStyle(SettingsCSS);
        FA.Enable();
        document.body.insertAdjacentHTML("afterbegin", SettingsHTML);
        this.Config = document.getElementById("sah-extensions-config");
        const closeButton = this.Config.querySelector(".sah-config-close");
        const categories = this.Config.querySelectorAll(".sah-config-category");
        const settingsContent = this.Config.querySelector(".sah-config-settings-content");

        const categoryContent = {
            "general": GeneralSettingsHTML,
            "hoa": HOASettingsHTML,
            "kcc": KCCSettingsHTML,
            "import": ImportExportSettingsHTML,
            "reset": ResetSettingsHTML
        };

        const closeFunc = this.CloseSettings.bind(this);
        closeButton.addEventListener("click", closeFunc);
        closeButton.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                closeFunc();
            }
        });

        const settingsBindFunc = this.BindSettings.bind(this);

        categories.forEach((category) => {
            category.addEventListener("click", () => {
                if (category.classList.contains("active")) {
                    return;
                }

                categories.forEach((item) => {
                    item.classList.remove("active");
                });

                category.classList.add("active");
                settingsContent.classList.remove("changed");
                settingsContent.classList.add("changing");

                setTimeout(() => {
                    const categoryName = category.dataset.category;

                    settingsContent.innerHTML = categoryContent[categoryName];

                    const settings = settingsContent.querySelectorAll(".sah-config-setting");
                    settingsBindFunc(settings);

                    const jsonBox = settingsContent.querySelector(".sah-config-json-box");
                    if(jsonBox) {
                        jsonBox.value = JSON.stringify(this.UserSettings, null, "\t");
                        jsonBox.addEventListener("change", (() => {
                            try {
                                const settingsJson = JSON.parse(jsonBox.value);
                                if(settingsJson) {
                                    this.UserSettings = settingsJson;
                                }
                            } catch (error) {
                                console.error("Invalid JSON:", error);
                            }
                        }).bind(this));
                    }

                    const resetBtn = settingsContent.querySelector(".sah-config-reset-button");
                    if(resetBtn) {
                        resetBtn.addEventListener("click", (() => {
                            this.ApplyDefaults();
                            this.Save();
                            resetBtn.innerHTML = "Instellingen zijn gereset!";
                        }).bind(this));
                    }

                    settingsContent.classList.remove("changing");
                    settingsContent.classList.add("changed");

                    setTimeout(() => {
                        settingsContent.classList.remove("changed");
                    }, 200);
                }, 120);
            });
        });

        const primaryCategory = categories[0];
        if(primaryCategory) primaryCategory.click();
    }

    BindSettings(settings) {
        for(let i = 0; i < settings.length; i++) 
        {
            const setting = settings[i];
            const binding = setting.getAttribute("binding");
            const bindingType = setting.getAttribute("binding-type");
            const control = setting.querySelector(".sah-config-setting-control");
            switch(bindingType) {
                case "bool": this.BindBoolSetting(control, binding); break;
                case "short-text": this.BindShortTextSetting(control, binding); break;
                case "long-text": this.BindLongTextSetting(control, binding); break;
                case "dropdown": this.BindDropdownSetting(control, binding); break;
            }
        }
    }

    BindBoolSetting(control, binding) {
        const input = control.querySelector("input");
        input.checked = this.Get(binding);
        input.addEventListener("change", () => {
            this.Set(binding, input.checked);
        });
    }

    BindShortTextSetting(control, binding) {
        const input = control.querySelector("input");
        input.value = this.Get(binding);
        input.addEventListener("change", () => {
            this.Set(binding, input.value);
        });
    }

    BindLongTextSetting(control, binding) {
        const input = control.querySelector("textarea");
        input.value = this.Get(binding);
        input.addEventListener("change", () => {
            this.Set(binding, input.value);
        });
    }

    BindDropdownSetting(control, binding) {
        console.error("not implemented");
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
        this.Config.classList.add("open");
    }

    CloseSettings() {
        this.Config.classList.remove("open");
    }

    ApplyDefaults() {
        for (const [key, defaultValue] of Object.entries(this.Defaults)) {
            this.UserSettings[key] = defaultValue;
        }
        this.Save();
    }

    ApplyDefaultsToUndefined() {
        for (const [key, defaultValue] of Object.entries(this.Defaults)) {
            if(this.UserSettings[key] !== undefined) continue;
            this.UserSettings[key] = defaultValue;
        }
        this.Save();
    }

    Register(key, defaultValue) {
        this.Defaults[key] = defaultValue;
    }

    Get(key) {
        const userValue = this.UserSettings[key];
        if(userValue === undefined) return this.Defaults[key];
        return userValue;
    }

    Set(key, value) {
        this.UserSettings[key] = value;
        this.Save();
    }
}