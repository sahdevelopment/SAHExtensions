import { SAHEvent } from "../libs/sah-event";
import { MethodPatcher } from "./method-patcher";

export class SteamMonitor {
    patcher;
    Enabled = false;
    OnRecordActivated = new SAHEvent("OnRecordActivated");
    OnRecordDeactivated = new SAHEvent("OnRecordDeactivated");

    async Enable() {
        if(this.Enabled) return;
        while(!unsafeWindow.Record?.prototype) await new Promise(resolve => setTimeout(resolve, 100));
        this.patcher = new MethodPatcher(unsafeWindow.Record.prototype);
        this.Enabled = true;
        const monitor = this;
        this.patcher.AddPostfix("activate", function (putOtherRecordsOnHold) {
            monitor.OnRecordActivated.Invoke(this);
        });
        this.patcher.AddPostfix("deactivate", function () {
            monitor.OnRecordDeactivated.Invoke(this);
        });
        this.patcher.Patch();
    }

    Disable() {
        if(!this.Enabled) return;
        this.patcher.Unpatch();
        this.patcher = null;
        this.Enabled = false;
    }
}