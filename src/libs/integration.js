export class Integration {
    name = "Unknown Integration";
    urlRegex = /.^/;

    constructor() {
        if (new.target === Integration) {
            throw new Error("Integration is abstract and cannot be instantiated");
        }
    }

    ShouldActivate() {
        return this.urlRegex.test(window.location.href);
    }

    Execute() {

    }
}