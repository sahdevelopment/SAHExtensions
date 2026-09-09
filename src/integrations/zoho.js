import { Integration } from "../libs/integration";
import { TabListener } from "../libs/tablistener";

export class ZohoIntegration extends Integration {
    urlRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl.*/;

    execute() {
        console.log("Zoho integration active!");
        const listener = new TabListener("zoho");
        listener.AddOnSendFailedHandler((toHost, path, payload) => alert(`Failed to communicate with ${toHost} at path ${path}`));
        listener.Map("ping", req => console.log("Pong!"));
        listener.StartListen();
        listener.SendTabRequest("nexus", "ping", {});
    }
}