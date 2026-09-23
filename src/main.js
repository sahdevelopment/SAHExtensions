import { SteamIntegration } from "./integrations/steam";
import { NexusIntegration } from "./integrations/nexus";
import { ZohoIntegration } from "./integrations/zoho";
import { GlobalIntegration } from "./integrations/global";
import { Config } from "./libs/global-values";
import { ConfigDefaults } from "./libs/config-defaults";

"use strict";

function main() {
    ConfigDefaults.RegisterAll();
    Config.Load();

    if(!Config.Get("general.enabled")) return;

    const integrations = [new GlobalIntegration(), new SteamIntegration(), new NexusIntegration(), new ZohoIntegration()];
    integrations.forEach(x => {
        if(!x.ShouldActivate()) return;
        x.Execute();
    });
}

main();