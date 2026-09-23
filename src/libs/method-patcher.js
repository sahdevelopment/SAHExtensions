export class MethodPatcher {
    prototype;
    originals;
    prefixes;
    postfixes;
    patched;

    constructor(prototype) {
        this.prototype = prototype;
        this.originals = new Map();

        this.prefixes = new Map();
        this.postfixes = new Map();
        
        this.patched = false;
    }

    AddPrefix(methodName, prefix) {
        this.ensureMethod(methodName);

        if (!this.prefixes.has(methodName)) {
            this.prefixes.set(methodName, []);
        }

        this.prefixes.get(methodName).push(prefix);

        return this;
    }

    RemovePrefix(methodName, prefix) {
        const prefixes = this.prefixes.get(methodName);

        if (!prefixes) {
            return this;
        }

        const index = prefixes.indexOf(prefix);

        if (index !== -1) {
            prefixes.splice(index, 1);
        }

        return this;
    }

    AddPostfix(methodName, postfix) {
        this.ensureMethod(methodName);

        if (!this.postfixes.has(methodName)) {
            this.postfixes.set(methodName, []);
        }

        this.postfixes.get(methodName).push(postfix);

        return this;
    }

    RemovePostfix(methodName, postfix) {
        const postfixes = this.postfixes.get(methodName);

        if (!postfixes) {
            return this;
        }

        const index = postfixes.indexOf(postfix);

        if (index !== -1) {
            postfixes.splice(index, 1);
        }

        return this;
    }

    Patch() {
        if (this.patched) {
            return this;
        }

        this.patched = true;

        const methods = new Set([
            ...this.prefixes.keys(),
            ...this.postfixes.keys()
        ]);

        for (const methodName of methods) {
            this.apply(methodName);
        }

        return this;
    }

    Unpatch() {
        if (!this.patched) {
            return this;
        }

        for (const [methodName, original] of this.originals) {
            this.prototype[methodName] = original;
        }

        this.patched = false;

        return this;
    }

    apply(methodName) {
        const original = this.originals.get(methodName);

        if (!original) {
            return;
        }

        const prefixes = this.prefixes.get(methodName) ?? [];
        const postfixes = this.postfixes.get(methodName) ?? [];

        this.prototype[methodName] = function (...args) {
            for (const prefix of prefixes) {
                prefix.apply(this, args);
            }

            const result = original.apply(this, args);

            for (const postfix of postfixes) {
                postfix.apply(this, args);
            }

            return result;
        };
    }

    ensureMethod(methodName) {
        if (typeof this.prototype[methodName] !== "function") {
            throw new TypeError(
                `${methodName} is not a function`
            );
        }

        if (!this.originals.has(methodName)) {
            this.originals.set(
                methodName,
                this.prototype[methodName]
            );
        }
    }
}