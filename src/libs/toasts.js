import { TamperMonkey as TM } from "./tampermonkey";
import { FontAwesome as FA } from "./font-awesome";
import ToastsCSS from "../css/toasts-default.css";
import ToastContainerHTML from "../html/toast-container.html";
import ToastHTML from "../html/toast.html";

export class ToastManager {

    toastContainer;
    toastDuration = 3000;

    constructor() {
    }

    Initialize() {
        this.toastContainer = document.getElementById("toast-container");
        if(this.toastContainer) return;

        TM.AddStyle(ToastsCSS);
        FA.Enable();
        document.body.insertAdjacentHTML("afterbegin", ToastContainerHTML);
        this.toastContainer = document.getElementById("toast-container");
    }

    CreateTemplateToast() {
        this.toastContainer.insertAdjacentHTML("beforeend", ToastHTML);
        const toast = this.toastContainer.lastElementChild;
        const closeBtn = toast.querySelector("toast-close-button");
        if(closeBtn) closeBtn.addEventListener("click", _ => this.CloseToast(toast));
        setTimeout(() => this.CloseToast(toast), this.toastDuration);
        return toast;
    }

    CloseToast(toast) {
        if(!toast) return;
        if(toast.classList.contains("toast-removed")) return;
        toast.classList.add("toast-hiding");
        toast.classList.add("toast-removed");
        toast.addEventListener("animationend", () => {
            toast.remove();
        }, { once: true });
    }

    CreateToast(type, icon, text) {
        const toast = this.CreateTemplateToast();
        if(!toast) return;
        toast.classList.add(type);
        const content = toast.querySelector(".toast-content");
        const iconElement = toast.querySelector(".toast-icon i");
        if(content) content.innerText = text;
        if(iconElement) iconElement.classList.add(icon);
    }

    Info(text) {
        this.CreateToast("toast-info", "fa-info", text);
    }

    Warning(text) {
        this.CreateToast("toast-warning", "fa-triangle-exclamation", text);
    }

    Error(text) {
        this.CreateToast("toast-error", "fa-xmark", text);
    }

    Success(text) {
        this.CreateToast("toast-success", "fa-check", text);
    }
}