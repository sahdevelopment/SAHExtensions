export class Template {
    
    template;
    
    constructor(template) {
        this.template = template;
    }

    Execute(values) {
        if(!this.template) return undefined;
        let text = this.template;
        for(const [key, value] of Object.entries(values)) {
            if(value) text = text.replace(`{${key}}`, `${value}`);
            else text = text.replace(`{${key}}`, "");
        }
        return text;
    }
}