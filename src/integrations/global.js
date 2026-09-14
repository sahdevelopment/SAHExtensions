import { Integration } from "../libs/integration";

export class GlobalIntegration extends Integration {
    ShouldActivate() { return true; }
    Execute() {
        console.log("Global integration active!");
    }
}