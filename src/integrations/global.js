import { Integration } from "../libs/integration";

export class GlobalIntegration extends Integration {
    shouldActivate() { return true; }
    execute() {
        console.log("Global integration active!");
    }
}