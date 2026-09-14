export class TokenCollector {
    featureFlags = undefined; //featureFlags
    zcsrfToken = undefined; //X-ZCSRF-TOKEN
    murphySession = undefined; //x-murphy-session-id
    murphyTrace = undefined; //x-murphy-trace-id
    murphyTab = undefined; //x-murphy-tab-id
    murphySpan = undefined; //x-murphy-span-id

    CollectToken(onTokenCollected) {
        const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        const tokenCollector = this;
        XMLHttpRequest.prototype.setRequestHeader = function(name, value) 
        {
            switch (name) {
                case "featureFlags": if(tokenCollector.featureFlags === undefined) tokenCollector.featureFlags = value; break;
                case "X-ZCSRF-TOKEN": if(tokenCollector.zcsrfToken === undefined) tokenCollector.zcsrfToken = value; break;
                case "x-murphy-session-id": if(tokenCollector.murphySession === undefined) tokenCollector.murphySession = value; break;
                case "x-murphy-trace-id": if(tokenCollector.murphyTrace === undefined) tokenCollector.murphyTrace = value; break;
                case "x-murphy-tab-id": if(tokenCollector.murphyTab === undefined) tokenCollector.murphyTab = value; break;
                case "x-murphy-span-id": if(tokenCollector.murphySpan === undefined) tokenCollector.murphySpan = value; break;
            }

            if((tokenCollector.AllHeadersCaptured.bind(tokenCollector))()) {
                XMLHttpRequest.prototype.setRequestHeader = originalSetRequestHeader;
                onTokenCollected({
                    featureFlags: tokenCollector.featureFlags,
                    zcsrfToken: tokenCollector.zcsrfToken,
                    murphySession: tokenCollector.murphySession,
                    murphyTrace: tokenCollector.murphyTrace,
                    murphyTab: tokenCollector.murphyTab,
                    murphySpan: tokenCollector.murphySpan
                });
            }
            return originalSetRequestHeader.call(this, name, value);
        };
    }

    AllHeadersCaptured() {
        if(!this.featureFlags) return false;
        if(!this.zcsrfToken) return false;
        if(!this.murphySession) return false;
        if(!this.murphyTrace) return false;
        if(!this.murphyTab) return false;
        if(!this.murphySpan) return false;
        return true;
    }
}