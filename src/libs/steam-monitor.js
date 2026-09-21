import { SAHEvent } from "../libs/sah-event";
import { MethodPatcher } from "./method-patcher";

export class SteamMonitor {

    patcher;
    onRecordActivated = new SAHEvent("OnRecordActivated");
    onRecordDeactivated = new SAHEvent("OnRecordDeactivated");

    constructor() {
        this.patcher = new MethodPatcher(Record.prototype);
        const monitor = this;
        this.patcher.AddPostfix("activate", () => {
            monitor.onRecordActivated.Invoke(this);
        });
        this.patcher.AddPostfix("deactivate", () => {
            monitor.onRecordDeactivated.Invoke(this);
        });
    }

    Enable() {
        this.patcher.Patch();
    }

    Disable() {
        this.patcher.Unpatch();
    }
}