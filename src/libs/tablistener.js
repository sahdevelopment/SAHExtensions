import { TamperMonkey as TM }  from "./tampermonkey";

const TabRequestKey = "SAH-Intertab-Request";

export class TabListener 
{
    host = "unknown";
    handlers = {};
    timeoutMs = 500;
    onSendFailedHandlers = [];
    receivedMessages = new Set();

    constructor(host) {
        this.host = host;
    }

    StartListen() {
        TM.AddValueChangeListener(TabRequestKey, this.OnRequestKeyChanged.bind(this));
    }

    StopListen() {
        TM.RemoveValueChangeListener(TabRequestKey, this.OnRequestKeyChanged.bind(this));
    }

    Map(path, handler) {
        this.handlers[path.toLowerCase()] = handler;
    }

    SendRequestReceived(req) {
        TM.SetValue(TabRequestKey, { toHost: this.host, fromHost: req.fromHost, receivedID: req.id });
    }

    SendTabRequest(toHost, path, payload) {
        const id = crypto.randomUUID(); 
        TM.SetValue(TabRequestKey, {
            toHost: toHost,
            request: {
                id: id,
                fromHost: this.host,
                path: path,
                data: payload
            }
        });
        setTimeout(() => {
            if(!this.receivedMessages.has(id)) this.OnSendFailed(toHost, path, payload);
            else this.receivedMessages.delete(id);
        }, this.timeoutMs);
    }

    
    OnSendFailed(toHost, path, payload) {
        for(let i = 0; i < this.onSendFailedHandlers.length; i++) this.onSendFailedHandlers[i](toHost, path, payload);
    }

    AddOnSendFailedHandler(handler) {
        this.onSendFailedHandlers.push(handler);
    }

    RemoveOnSendFailedHandler(handler) {
        this.onSendFailedHandlers = this.onSendFailedHandlers.filter(x => x !== handler);
    }

    OnRequestKeyChanged(name, oldValue, newValue) {
        if(oldValue === newValue) return;
        if(newValue.receivedID) {
            if(newValue.fromHost === this.host) this.receivedMessages.add(newValue.receivedID);
            return;
        }
        if(!newValue || !newValue.toHost) return;
        if(newValue.toHost !== this.host) return;
        if(!newValue.request) return;
        const req = newValue.request;
        if(!req.id) return;
        if(!req.path) return;
        if(!req.fromHost) return;
        if(!req.data) req.data = {};
        this.HandleRequest(req);
    }

    HandleRequest(req) {
        const handler = this.handlers[req.path.toLowerCase().trim()];
        this.SendRequestReceived(req);
        if(handler) handler(req);
        else console.error(`Unhandled request at path ${req.path} for host ${this.host}`);        
    }
}