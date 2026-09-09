import { UserSettings } from "./libs/usersettings";
import { SteamIntegration } from "./integrations/steam";
import { NexusIntegration } from "./integrations/nexus";
import { ZohoIntegration } from "./integrations/zoho";
import { GlobalIntegration } from "./integrations/global";

"use strict";

function main() {
    if(!UserSettings.General.IntegrationEnabled) return;

    const integrations = [new GlobalIntegration(), new SteamIntegration(), new NexusIntegration(), new ZohoIntegration()];
    integrations.forEach(x => {
        if(!x.shouldActivate()) return;
        x.execute();
    });
}

main();