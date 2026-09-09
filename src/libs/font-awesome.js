import { TamperMonkey as TM } from "./tampermonkey";

export const FontAwesome = {
    IsAdded: false,
    Enable() {
        if(this.IsAdded) return;
        this.IsAdded = true;
        TM.AddElement("link", {
            rel: "stylesheet",
            href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        });
    }
};