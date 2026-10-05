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
        this.listeners.delete(func);
    }

    Invoke(...params) {
        for (const listener of this.listeners) {
            listener(...params);
        }
    }
}