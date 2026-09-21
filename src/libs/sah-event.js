export class SAHEvent {
    name;
    listeners = new Set();

    constructor(name) {
        this.name = name;
    }

    AddListener(func) {
        this.listeners.add(func);
    }

    RemoveListener(func) {
        this.listeners.removeListener(func);
    }

    Invoke(...params) {
        for(let i = 0; i < this.listeners.size; i++) {
            this.listeners[i](...params);
        }
    }
}