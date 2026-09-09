export class HtmlIntegration 
{
    id = "extra-integration";
    observer;
    postinjection = [];

    constructor(html, id, docksToSelector, insertAtEnd) {
        this.id = id;
        this.observer = new MutationObserver(() => {
            const integrations = document.getElementById(this.id);
            if(integrations) return;
            const dock = docksToSelector();
            if(!dock) return;
            dock.insertAdjacentHTML(insertAtEnd ? "beforeend" : "afterbegin", `<div id="${this.id}"></div>`);
            const mount = document.getElementById(this.id);
            if(!mount) return;
            mount.insertAdjacentHTML("afterbegin", html);
            for(let i = 0; i < this.postinjection.length; i++) this.postinjection[i]();
        });
    }

    Enable() {
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    Disable() {
        this.observer.disconnect();
    }

    OnClick(id, handler) {
        this.postinjection.push(() => {
            const elem = document.getElementById(id);
            if(!elem) return;
            elem.addEventListener("click", _ => {
                handler();
            });
        });
    }
}