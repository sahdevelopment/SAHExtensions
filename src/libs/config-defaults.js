import { Config } from "./global-values";

export const ConfigDefaults = {
    RegisterAll() {
        Config.Register("general.enabled", true);
        Config.Register("general.zohonewtab", true);
        Config.Register("hoa.template.note", "Afspraak\n{problem}\n{description}\n{note}\nWerkbon\n\n{postcode}\n{pin}\nTeamviewer\n\n");
        Config.Register("hoa.template.desc", "");
        Config.Register("hoa.template.exec", "");
        Config.Register("hoa.template.advice", "");
    }
};