import { Integration } from "../libs/integration";

export class SteamIntegration extends Integration {
    urlRegex = /https:\/\/studentaanhuis\.steam\.eu\.com\/.*/;

    Execute() {
        console.log("Steam integration active!");
    }
}