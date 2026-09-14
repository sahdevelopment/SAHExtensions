import { Session } from "./session";

export class MainTabMonitor {
    LockKey = "unknown-main-tab";
    PromotionHandler = () => {};

    Channel = null;
    IsMainTab = false;

    constructor(lockKey) {
        this.LockKey = lockKey;
        this.Channel = new BroadcastChannel(this.LockKey);
    }

    OnPromote(onBecomeMainTab) {
        this.PromotionHandler = onBecomeMainTab;
    }

    Monitor() {
        navigator.locks.request(
            this.LockKey,
            {
                mode: "exclusive"
            },
            async () => {
                this.Promote();
                await new Promise(() => {});
            }
        );
    }

    Promote() {
        if (this.IsMainTab) {
            return;
        }

        this.IsMainTab = true;

        this.PromotionHandler();

        this.Channel.postMessage({
            type: "main",
            owner: Session.InstanceID
        });
    }

    Destroy() {
        this.Channel.close();
    }
}