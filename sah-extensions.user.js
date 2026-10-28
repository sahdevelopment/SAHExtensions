// ==UserScript==
// @name         SAH Extensions
// @namespace    http://tampermonkey.net/
// @version      v2026-10-28_14-20-08
// @description  SAH Extension Integration voor Nexus, Zoho en Steam
// @author       Wessel + HOA Team
// @match        *://desk.zoho.eu/agent/*
// @match        *://studentaanhuis.steam.eu.com/*
// @match        *://app.studentaanhuis.nl/*
// @icon         https://www.google.com/s2/favicons?sz=256&domain=studentaanhuis.nl
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_addValueChangeListener
// @grant GM_addStyle
// @grant GM_addElement
// @grant GM_xmlhttpRequest
// @grant GM_registerMenuCommand
//
// ==/UserScript==

(() => {
  // src/libs/tampermonkey.js
  var TamperMonkey = {
    SetValue(name, value) {
      GM_setValue(name, value);
    },
    GetValue(name) {
      return GM_getValue(name);
    },
    DeleteValue(name) {
      GM_deleteValue(name);
    },
    //Listener format: (name, oldValue, newValue) => {}
    AddValueChangeListener(name, listener) {
      GM_addValueChangeListener(name, listener);
    },
    RemoveValueChangeListener(name, listener) {
      GM_removeValueChangeListener(name, listener);
    },
    AddStyle(css) {
      GM_addStyle(css);
    },
    AddElement(type, properties) {
      GM_addElement(type, properties);
    }
  };

  // src/libs/font-awesome.js
  var FontAwesome = {
    IsAdded: false,
    Enable() {
      if (this.IsAdded) return;
      this.IsAdded = true;
      TamperMonkey.AddElement("link", {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
      });
    }
  };

  // src/css/toasts-default.css
  var toasts_default_default = '#toast-container {\n    position: absolute;\n    inset: 0;\n\n    width: 24em;\n    padding: 1.25rem;\n\n    z-index: 9999 !important;\n\n    display: flex;\n    flex-direction: column;\n    gap: 0.75rem;\n\n    pointer-events: none;\n\n    font-family:\n        Inter,\n        ui-sans-serif,\n        system-ui,\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        sans-serif;\n}\n\n.toast {\n    --toast-accent: #3b82f6;\n    --toast-background: #ffffff;\n    --toast-color: #334155;\n\n    display: flex;\n    align-items: center;\n\n    min-height: 3.5rem;\n\n    border: 1px solid #e2e8f0;\n    border-left: 4px solid var(--toast-accent);\n    border-radius: 0.625rem;\n\n    background: var(--toast-background);\n    color: var(--toast-color);\n\n    box-shadow:\n        0 4px 6px -1px rgba(15, 23, 42, 0.08),\n        0 2px 4px -2px rgba(15, 23, 42, 0.08);\n\n    overflow: hidden;\n    pointer-events: all;\n\n    opacity: 0;\n    transform: translateX(20px);\n\n    animation: toast-in 0.25s ease-out forwards;\n\n    transition:\n        transform 0.15s ease,\n        box-shadow 0.15s ease;\n}\n\n.toast:hover {\n    transform: translateY(-1px);\n\n    box-shadow:\n        0 10px 15px -3px rgba(15, 23, 42, 0.10),\n        0 4px 6px -4px rgba(15, 23, 42, 0.10);\n}\n\n.toast.toast-hiding {\n    animation: toast-out 0.2s ease-in forwards;\n    pointer-events: none;\n}\n\n.toast-icon {\n    width: 2.75rem;\n    min-width: 2.75rem;\n    height: 2.75rem;\n\n    margin: 0.5rem 0.75rem;\n\n    display: flex;\n    align-items: center;\n    justify-content: center;\n\n    border-radius: 0.5rem;\n\n    background: color-mix(\n        in srgb,\n        var(--toast-accent) 12%,\n        transparent\n    );\n\n    color: var(--toast-accent);\n\n    font-size: 0.95rem;\n    font-weight: 700;\n}\n\n.toast-icon i {\n    line-height: 1;\n}\n\n\n.toast-content {\n    flex: 1;\n    min-width: 0;\n\n    padding: 0.875rem 0;\n\n    line-height: 1.4;\n\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n.toast-close-button {\n    width: 2rem;\n    height: 2rem;\n    min-width: 2rem;\n\n    margin: 0 0.625rem;\n\n    display: flex;\n    align-items: center;\n    justify-content: center;\n\n    border: none;\n    border-radius: 0.375rem;\n\n    background: transparent;\n    color: #94a3b8;\n\n    font-size: 1rem;\n    line-height: 1;\n\n    cursor: pointer;\n\n    transition:\n        color 0.15s ease,\n        background-color 0.15s ease;\n}\n\n.toast-close-button:hover {\n    background: #f1f5f9;\n    color: #475569;\n}\n\n.toast-info {\n    --toast-accent: #2563eb;\n    --toast-color: #334155;\n    --toast-background: #f8fbff;\n}\n\n.toast-warning {\n    --toast-accent: #d97706;\n    --toast-color: #44403c;\n    --toast-background: #fffdf7;\n}\n\n.toast-error {\n    --toast-accent: #dc2626;\n    --toast-color: #44403c;\n    --toast-background: #fffafa;\n}\n\n.toast-success {\n    --toast-accent: #16a34a;\n    --toast-color: #334155;\n    --toast-background: #f8fffa;\n}\n\n@keyframes toast-in {\n    from {\n        opacity: 0;\n        transform: translateX(20px);\n    }\n\n    to {\n        opacity: 1;\n        transform: translateX(0);\n    }\n}\n\n@keyframes toast-out {\n    from {\n        opacity: 1;\n        transform: translateX(0);\n    }\n\n    to {\n        opacity: 0;\n        transform: translateX(20px);\n    }\n}';

  // src/html/toast-container.html
  var toast_container_default = '<div id="toast-container">\n    \n</div>';

  // src/html/toast.html
  var toast_default = '<div class="toast">\n    <div class="toast-icon"><i class="fa-solid"></i></div>\n    <div class="toast-content"></div>\n    <div class="toast-close-button"><i class="fa-solid fa-xmark"></i></div>\n</div>';

  // src/libs/toasts.js
  var ToastManager = class {
    toastContainer;
    toastDuration = 3e3;
    constructor() {
    }
    Initialize() {
      this.toastContainer = document.getElementById("toast-container");
      if (this.toastContainer) return;
      TamperMonkey.AddStyle(toasts_default_default);
      FontAwesome.Enable();
      document.body.insertAdjacentHTML("afterbegin", toast_container_default);
      this.toastContainer = document.getElementById("toast-container");
    }
    CreateTemplateToast() {
      this.toastContainer.insertAdjacentHTML("beforeend", toast_default);
      const toast = this.toastContainer.lastElementChild;
      const closeBtn = toast.querySelector("toast-close-button");
      if (closeBtn) closeBtn.addEventListener("click", (_) => this.CloseToast(toast));
      setTimeout(() => this.CloseToast(toast), this.toastDuration);
      return toast;
    }
    CloseToast(toast) {
      if (!toast) return;
      if (toast.classList.contains("toast-removed")) return;
      toast.classList.add("toast-hiding");
      toast.classList.add("toast-removed");
      toast.addEventListener("animationend", () => {
        toast.remove();
      }, { once: true });
    }
    CreateToast(type, icon, text) {
      const toast = this.CreateTemplateToast();
      if (!toast) return;
      toast.classList.add(type);
      const content = toast.querySelector(".toast-content");
      const iconElement = toast.querySelector(".toast-icon i");
      if (content) content.innerText = text;
      if (iconElement) iconElement.classList.add(icon);
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
  };

  // src/libs/tab-networking.js
  var TabRequestKey = "SAH-Intertab-Request";
  var TabClient = class {
    host = "unknown";
    timeoutMs = 500;
    onSendFailedHandlers = [];
    receivedMessages = /* @__PURE__ */ new Set();
    constructor(host) {
      this.host = host;
    }
    Start() {
      TamperMonkey.AddValueChangeListener(TabRequestKey, this.OnRequestKeyChanged.bind(this));
    }
    Stop() {
      TamperMonkey.RemoveValueChangeListener(TabRequestKey, this.OnRequestKeyChanged.bind(this));
    }
    SendTabRequest(toHost, path, payload) {
      const id = crypto.randomUUID();
      TamperMonkey.SetValue(TabRequestKey, {
        toHost,
        request: {
          id,
          fromHost: this.host,
          path,
          data: payload
        }
      });
      setTimeout(() => {
        if (!this.receivedMessages.has(id)) this.OnSendFailed(toHost, path, payload);
        else this.receivedMessages.delete(id);
      }, this.timeoutMs);
    }
    OnSendFailed(toHost, path, payload) {
      for (let i = 0; i < this.onSendFailedHandlers.length; i++) this.onSendFailedHandlers[i](toHost, path, payload);
    }
    AddOnSendFailedHandler(handler) {
      this.onSendFailedHandlers.push(handler);
    }
    RemoveOnSendFailedHandler(handler) {
      this.onSendFailedHandlers = this.onSendFailedHandlers.filter((x) => x !== handler);
    }
    OnRequestKeyChanged(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (newValue.receivedID) {
        if (newValue.fromHost === this.host) this.receivedMessages.add(newValue.receivedID);
        return;
      }
    }
  };
  var TabServer = class {
    host = "unknown";
    handlers = {};
    constructor(host) {
      this.host = host;
    }
    StartListen() {
      TamperMonkey.AddValueChangeListener(TabRequestKey, this.OnRequestKeyChanged.bind(this));
    }
    StopListen() {
      TamperMonkey.RemoveValueChangeListener(TabRequestKey, this.OnRequestKeyChanged.bind(this));
    }
    Map(path, handler) {
      this.handlers[path.toLowerCase()] = handler;
    }
    OnRequestKeyChanged(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (!newValue || !newValue.toHost) return;
      if (newValue.toHost !== this.host) return;
      if (!newValue.request) return;
      const req = newValue.request;
      if (!req.id) return;
      if (!req.path) return;
      if (!req.fromHost) return;
      if (!req.data) req.data = {};
      this.HandleRequest(req);
    }
    SendRequestReceived(req) {
      TamperMonkey.SetValue(TabRequestKey, { toHost: this.host, fromHost: req.fromHost, receivedID: req.id });
    }
    HandleRequest(req) {
      const handler = this.handlers[req.path.toLowerCase().trim()];
      this.SendRequestReceived(req);
      if (handler) handler(req);
      else console.error(`Unhandled request at path ${req.path} for host ${this.host}`);
    }
  };

  // src/libs/template.js
  var Template = class {
    template;
    constructor(template) {
      this.template = template;
    }
    Execute(values) {
      if (!this.template) return void 0;
      if (this.template.length < 1) return void 0;
      let text = this.template;
      for (const [key, value] of Object.entries(values)) {
        if (value) text = text.replace(`{${key}}`, `${value}`);
        else text = text.replace(`{${key}}`, "");
      }
      return text;
    }
  };

  // src/libs/steam.js
  var Steam = {
    SetBox(PID, content) {
      if (!content) return false;
      const box = document.getElementById(`boxPID_${PID}`);
      if (!box) {
        console.error(`Box with PID ${PID} could not be found!`);
        return false;
      }
      if (box.value && box.value.length > 0) return;
      box.value += content;
      box.dispatchEvent(new Event("input", { bubbles: true }));
      box.dispatchEvent(new Event("change", { bubbles: true }));
    },
    SetDropdowns(values) {
      const dropdowns = this.GetDropdowns();
      if (!dropdowns) return;
      for (let i = 0; i < dropdowns.length; i++) {
        const dropdown = dropdowns[i];
        if (!dropdown) continue;
        const label = this.GetDropdownLabel(dropdown);
        if (!label) continue;
        const value = values[label];
        if (value) {
          this.SetDropdownValue(dropdown, value);
          continue;
        }
      }
    },
    SetTextAreas(values) {
      const textAreas = this.GetTextAreas();
      if (!textAreas) return;
      for (let i = 0; i < textAreas.length; i++) {
        const textArea = textAreas[i];
        if (!textArea) continue;
        const label = this.GetTextAreaLabel(textArea);
        if (!label) continue;
        const value = values[label];
        if (value && value.length > 0) {
          this.SetTextArea(textArea, value);
          continue;
        }
      }
    },
    GetDropdowns() {
      return document.querySelectorAll("select.boxSelectlist");
    },
    GetDropdownLabel(dropdown) {
      if (!dropdown) return;
      const caption = dropdown.parentElement.querySelector(".boxCaption");
      if (!caption) return;
      return caption.innerText;
    },
    SetDropdownValue(dropdown, value) {
      if (!dropdown) return;
      dropdown.value = value;
      dropdown.dispatchEvent(new Event("input", { bubbles: true }));
      dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    },
    GetTextAreas() {
      return document.querySelectorAll(".boxInput.boxTextarea");
    },
    GetTextAreaLabel(textArea) {
      if (!textArea) return;
      const caption = textArea.parentElement.querySelector(".boxCaption");
      if (!caption) return;
      return caption.innerText;
    },
    SetTextArea(textArea, value) {
      if (!textArea) return;
      if (textArea.value && textArea.value.length > 0) return;
      textArea.value = value;
      textArea.dispatchEvent(new Event("input", { bubbles: true }));
      textArea.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  // src/libs/integration.js
  var Integration = class _Integration {
    name = "Unknown Integration";
    urlRegex = /.^/;
    constructor() {
      if (new.target === _Integration) {
        throw new Error("Integration is abstract and cannot be instantiated");
      }
    }
    ShouldActivate() {
      return this.urlRegex.test(window.location.href);
    }
    Execute() {
    }
  };

  // src/css/settings.css
  var settings_default = '#sah-extensions-config {\n    all: initial;\n    isolation: isolate !important;\n    position: fixed !important;\n    inset: 0 !important;\n    z-index: 200000 !important;\n\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n\n    padding: 3% 10% !important;\n    box-sizing: border-box !important;\n\n    font-family:\n        Inter,\n        ui-sans-serif,\n        system-ui,\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        sans-serif !important;\n\n    pointer-events: none !important;\n\n    /* Closed state */\n    visibility: hidden !important;\n    opacity: 0 !important;\n\n    transition:\n        opacity 0.2s ease,\n        visibility 0s linear 0.25s !important;\n}\n\n#sah-extensions-config *,\n#sah-extensions-config *::before,\n#sah-extensions-config *::after {\n    box-sizing: border-box !important;\n}\n\n#sah-extensions-config.open {\n    visibility: visible !important;\n    opacity: 1 !important;\n\n    pointer-events: auto !important;\n\n    transition:\n        opacity 0.2s ease,\n        visibility 0s linear 0s !important;\n}\n\n#sah-extensions-config .sah-config-dialog {\n    width: 100% !important;\n    height: 100% !important;\n    min-height: 0 !important;\n\n    display: flex !important;\n    flex-direction: column !important;\n\n    overflow: hidden !important;\n\n    border-radius: 5px !important;\n    background-color: rgb(66, 66, 66) !important;\n\n    filter: drop-shadow(10px 10px 4px #00000033) !important;\n\n    transform: scale(0.96) translateY(8px) !important;\n    opacity: 0 !important;\n\n    transition:\n        transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),\n        opacity 0.2s ease !important;\n}\n\n#sah-extensions-config.open .sah-config-dialog {\n    transform: scale(1) translateY(0) !important;\n    opacity: 1 !important;\n}\n\n/* -------------------------------------------------------\n   Header\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-top-bar {\n    display: flex !important;\n    align-items: center !important;\n\n    flex: 0 0 auto !important;\n\n    padding: 0.5em 1em !important;\n}\n\n#sah-extensions-config .sah-config-header {\n    flex: 1 1 auto !important;\n\n    font-size: 1.2em !important;\n    font-weight: 700 !important;\n    color: #fff !important;\n}\n\n#sah-extensions-config .sah-config-close {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n\n    width: 20px !important;\n    height: 20px !important;\n    padding: 15px !important;\n\n    border: none !important;\n    border-radius: 5px !important;\n\n    background-color: rgb(66, 66, 66) !important;\n    color: #fff !important;\n\n    cursor: pointer !important;\n\n    transition:\n        background-color 0.15s ease,\n        transform 0.15s ease !important;\n}\n\n#sah-extensions-config .sah-config-close:hover {\n    background-color: rgb(44, 44, 44) !important;\n}\n\n#sah-extensions-config .sah-config-close:active {\n    transform: scale(0.9) !important;\n}\n\n/* -------------------------------------------------------\n   Main layout\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-dialog-body {\n    display: flex !important;\n    flex-direction: row !important;\n    align-items: stretch !important;\n\n    flex: 1 1 auto !important;\n    min-width: 0 !important;\n    min-height: 0 !important;\n\n    overflow: hidden !important;\n}\n\n/* -------------------------------------------------------\n   Categories\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-categories {\n    flex: 0 0 15em !important;\n\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: stretch !important;\n\n    min-width: 15em !important;\n    min-height: 0 !important;\n\n    padding: 0.5em !important;\n\n    overflow-y: auto !important;\n    box-sizing: border-box !important;\n}\n\n#sah-extensions-config .sah-config-category {\n    position: relative !important;\n\n    padding: 0.75em 1em !important;\n\n    border: none !important;\n    border-radius: 5px !important;\n    background: transparent !important;\n\n    color: #ddd !important;\n    text-align: left !important;\n\n    cursor: pointer !important;\n\n    transition:\n        background-color 0.15s ease,\n        color 0.15s ease,\n        transform 0.15s ease !important;\n}\n\n#sah-extensions-config .sah-config-category:hover {\n    background-color: rgb(55, 55, 55) !important;\n    color: #fff !important;\n    transform: translateX(3px) !important;\n}\n\n#sah-extensions-config .sah-config-category.active {\n    background-color: rgb(55, 55, 55) !important;\n    color: #fff !important;\n}\n\n#sah-extensions-config .sah-config-category.active::before {\n    content: "" !important;\n\n    position: absolute !important;\n    left: 0.25em !important;\n    top: 20% !important;\n    bottom: 20% !important;\n\n    width: 3px !important;\n\n    border-radius: 999px !important;\n\n    background-color: #fff !important;\n\n    animation: sah-category-indicator-in 0.2s ease !important;\n}\n\n/* -------------------------------------------------------\n   Settings\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-settings {\n    flex: 1 1 auto !important;\n\n    min-width: 0 !important;\n    min-height: 0 !important;\n\n    display: flex !important;\n\n    padding-right: 1em !important;\n    padding-bottom: 1em !important;\n\n    box-sizing: border-box !important;\n\n    overflow: hidden !important;\n}\n\n#sah-extensions-config .sah-config-settings-content {\n    flex: 1 1 auto !important;\n\n    height: 100% !important;\n    min-width: 0 !important;\n    min-height: 0 !important;\n\n    display: flex !important;\n    flex-direction: column !important;\n\n    padding: 1em !important;\n\n    border-radius: 5px !important;\n\n    background-color: rgb(55, 55, 55) !important;\n    color: #fff !important;\n\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n\n    box-sizing: border-box !important;\n\n    opacity: 1 !important;\n    transform: translateX(0) !important;\n}\n\n\n#sah-extensions-config .sah-config-settings-content.changing {\n    opacity: 0 !important;\n    transform: translateX(12px) !important;\n\n    transition:\n        opacity 0.12s ease,\n        transform 0.12s ease !important;\n}\n\n/*\n * Applied after the new category has been inserted.\n */\n#sah-extensions-config .sah-config-settings-content.changed {\n    animation: sah-category-content-in 0.2s ease forwards !important;\n}\n\n/* -------------------------------------------------------\n   Category title\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-category-header {\n    flex: 0 0 auto !important;\n\n    margin-bottom: 1em !important;\n\n    font-size: 1.2em !important;\n    font-weight: 700 !important;\n    color: #fff !important;\n}\n\n/* -------------------------------------------------------\n   Settings\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-setting {\n    display: flex !important;\n    align-items: center !important;\n    gap: 1em !important;\n\n    min-height: 52px !important;\n    flex-shrink: 0 !important;\n\n    padding: 0.75em 0 !important;\n\n    border-bottom: 1px solid rgb(75, 75, 75) !important;\n}\n\n#sah-extensions-config .sah-config-setting-label {\n    flex: 1 1 auto !important;\n    color: #fff !important;\n}\n\n#sah-extensions-config .sah-config-setting-control {\n    flex: 0 0 auto !important;\n}\n\n/* -------------------------------------------------------\n   Toggle\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-toggle {\n    position: relative !important;\n\n    width: 46px !important;\n    height: 24px !important;\n\n    appearance: none !important;\n    -webkit-appearance: none !important;\n\n    border: 0 !important;\n    border-radius: 999px !important;\n\n    background-color: rgb(90, 90, 90) !important;\n\n    cursor: pointer !important;\n\n    transition:\n        background-color 0.2s ease,\n        box-shadow 0.2s ease !important;\n}\n\n#sah-extensions-config .sah-config-toggle::before {\n    content: "" !important;\n\n    position: absolute !important;\n    top: 3px !important;\n    left: 3px !important;\n\n    width: 18px !important;\n    height: 18px !important;\n\n    border-radius: 50% !important;\n\n    background-color: #fff !important;\n\n    box-shadow: 0 1px 3px #0005 !important;\n\n    transition:\n        transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) !important;\n}\n\n#sah-extensions-config .sah-config-toggle:checked {\n    background-color: #4caf50 !important;\n}\n\n#sah-extensions-config .sah-config-toggle:checked::before {\n    transform: translateX(22px) !important;\n}\n\n#sah-extensions-config .sah-config-toggle:hover {\n    box-shadow: 0 0 0 3px #ffffff12 !important;\n}\n\n#sah-extensions-config .sah-config-toggle:focus-visible {\n    outline: 2px solid #fff !important;\n    outline-offset: 2px !important;\n}\n\n/* -------------------------------------------------------\n   Inputs\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-input,\n#sah-extensions-config .sah-config-textarea,\n#sah-extensions-config .sah-config-select {\n    width: 30em !important;\n\n    box-sizing: border-box !important;\n\n    padding: 0.6em 0.75em !important;\n\n    border: 1px solid rgb(90, 90, 90) !important;\n    border-radius: 5px !important;\n\n    background-color: rgb(44, 44, 44) !important;\n    color: #fff !important;\n\n    font: inherit !important;\n\n    outline: none !important;\n\n    transition:\n        border-color 0.15s ease,\n        background-color 0.15s ease,\n        box-shadow 0.15s ease !important;\n}\n\n#sah-extensions-config .sah-config-input:hover,\n#sah-extensions-config .sah-config-textarea:hover,\n#sah-extensions-config .sah-config-select:hover {\n    border-color: rgb(110, 110, 110) !important;\n}\n\n#sah-extensions-config .sah-config-input:focus,\n#sah-extensions-config .sah-config-textarea:focus,\n#sah-extensions-config .sah-config-select:focus {\n    border-color: rgb(150, 150, 150) !important;\n\n    background-color: rgb(48, 48, 48) !important;\n\n    box-shadow: 0 0 0 3px #ffffff0d !important;\n}\n\n#sah-extensions-config .sah-config-input::placeholder,\n#sah-extensions-config .sah-config-textarea::placeholder {\n    color: rgb(150, 150, 150) !important;\n}\n\n#sah-extensions-config .sah-config-textarea {\n    min-height: 100px !important;\n\n    resize: vertical !important;\n\n    line-height: 1.45 !important;\n}\n\n/* -------------------------------------------------------\n   Dropdown\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-select {\n    appearance: none !important;\n    -webkit-appearance: none !important;\n\n    padding-right: 2.25em !important;\n\n    cursor: pointer !important;\n\n    background-image:\n        linear-gradient(45deg, transparent 50%, #bbb 50%),\n        linear-gradient(135deg, #bbb 50%, transparent 50%) !important;\n\n    background-position:\n        calc(100% - 14px) 50%,\n        calc(100% - 9px) 50% !important;\n\n    background-size:\n        5px 5px,\n        5px 5px !important;\n\n    background-repeat: no-repeat !important;\n}\n\n#sah-extensions-config .sah-config-select option {\n    background-color: rgb(44, 44, 44) !important;\n    color: #fff !important;\n}\n\n/* -------------------------------------------------------\n   Animations\n------------------------------------------------------- */\n\n@keyframes sah-category-indicator-in {\n    from {\n        opacity: 0 !important;\n        transform: scaleY(0) !important;\n    }\n\n    to {\n        opacity: 1 !important;\n        transform: scaleY(1) !important;\n    }\n}\n\n@keyframes sah-category-content-in {\n    from {\n        opacity: 0 !important;\n        transform: translateX(-12px) !important;\n    }\n\n    to {\n        opacity: 1 !important;\n        transform: translateX(0) !important;\n    }\n}\n\n/* -------------------------------------------------------\n   Footer\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-dialog-footer {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: flex-end !important;\n\n    flex: 0 0 auto !important;\n\n    padding: 0em 1em 0.75em 1em !important;\n\n    background-color: rgb(66, 66, 66) !important;\n\n    box-sizing: border-box !important;\n}\n\n#sah-extensions-config .sah-config-save {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: flex-end !important;\n}\n\n#sah-extensions-config .sah-config-save-button {\n    display: inline-flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n\n    min-width: 96px !important;\n    min-height: 32px !important;\n\n    padding: 0 16px !important;\n\n    box-sizing: border-box !important;\n\n    border: 1px solid #0067c5 !important;\n    border-radius: 4px !important;\n\n    background-color: #0078d4 !important;\n    color: #fff !important;\n\n    font-size: 14px !important;\n    font-weight: 600 !important;\n    line-height: 1 !important;\n\n    cursor: pointer !important;\n    user-select: none !important;\n\n    box-shadow:\n        0 1px 2px #00000026 !important;\n\n    transition:\n        background-color 0.1s ease,\n        border-color 0.1s ease,\n        box-shadow 0.1s ease,\n        transform 0.05s ease !important;\n}\n\n/* Hover \u2014 Fluent / Edge style */\n#sah-extensions-config .sah-config-save-button:hover {\n    background-color: #106ebe !important;\n    border-color: #005a9e !important;\n\n    box-shadow:\n        0 2px 4px #00000030 !important;\n}\n\n/* Pressed */\n#sah-extensions-config .sah-config-save-button:active {\n    background-color: #005a9e !important;\n    border-color: #004578 !important;\n\n    box-shadow: none !important;\n\n    transform: translateY(1px) !important;\n}\n\n/* Keyboard focus */\n#sah-extensions-config .sah-config-save-button:focus-visible {\n    outline: 2px solid #fff !important;\n    outline-offset: 2px !important;\n\n    box-shadow:\n        0 0 0 4px #0078d466 !important;\n}\n\n/* -------------------------------------------------------\n   Template options\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-template-info {\n    flex: 0 0 auto !important;\n\n    margin-bottom: 1em !important;\n    padding: 0.75em !important;\n\n    border: 1px solid rgb(75, 75, 75) !important;\n    border-radius: 5px !important;\n\n    background-color: rgb(48, 48, 48) !important;\n    box-sizing: border-box !important;\n}\n\n#sah-extensions-config .sah-config-template-info-header {\n    display: block !important;\n\n    margin-bottom: 0.65em !important;\n\n    color: #fff !important;\n\n    font-size: 0.9em !important;\n    font-weight: 600 !important;\n}\n\n#sah-extensions-config .sah-config-template-option {\n    display: flex !important;\n    align-items: center !important;\n    gap: 0.75em !important;\n\n    min-height: 32px !important;\n\n    padding: 0.35em 0.5em !important;\n\n    border-radius: 4px !important;\n\n    transition:\n        background-color 0.1s ease !important;\n}\n\n#sah-extensions-config .sah-config-template-option:hover {\n    background-color: rgb(58, 58, 58) !important;\n}\n\n#sah-extensions-config .sah-config-template-option-name {\n    flex: 0 0 auto !important;\n\n    padding: 0.2em 0.45em !important;\n\n    border: 1px solid #4a9eff !important;\n    border-radius: 3px !important;\n\n    background-color: #12395c !important;\n    color: #8bc4ff !important;\n\n    font-family:\n        "Cascadia Code",\n        "Consolas",\n        monospace !important;\n\n    font-size: 0.85em !important;\n    font-weight: 500 !important;\n\n    white-space: nowrap !important;\n\n    user-select: all !important;\n}\n\n#sah-extensions-config .sah-config-template-option-description {\n    flex: 1 1 auto !important;\n\n    color: #c8c8c8 !important;\n\n    font-size: 0.85em !important;\n    line-height: 1.4 !important;\n}\n\n/* Subtle divider between options */\n#sah-extensions-config .sah-config-template-option + .sah-config-template-option {\n    border-top: 1px solid rgb(62, 62, 62) !important;\n}\n\n/* Keyboard accessibility */\n#sah-extensions-config .sah-config-template-option:focus-within {\n    background-color: rgb(58, 58, 58) !important;\n}\n\n#sah-extensions-config .sah-config-template-option-name:focus-visible {\n    outline: 2px solid #fff !important;\n    outline-offset: 2px !important;\n}\n\n/* -------------------------------------------------------\n   Reset\n------------------------------------------------------- */\n\n#sah-extensions-config .sah-config-reset {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: space-between !important;\n    gap: 1.5em !important;\n\n    margin-top: 1.5em !important;\n    padding: 1em !important;\n\n    border: 1px solid #8f1f24 !important;\n    border-radius: 5px !important;\n\n    background-color: rgb(48, 48, 48) !important;\n\n    box-sizing: border-box !important;\n}\n\n#sah-extensions-config .sah-config-reset-warning {\n    flex: 1 1 auto !important;\n\n    color: #d8d8d8 !important;\n\n    font-size: 0.875em !important;\n    line-height: 1.45 !important;\n}\n\n#sah-extensions-config .sah-config-reset-button {\n    display: inline-flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n\n    flex: 0 0 auto !important;\n\n    min-width: 150px !important;\n    min-height: 32px !important;\n\n    padding: 0 14px !important;\n\n    border: 1px solid #b02a2e !important;\n    border-radius: 4px !important;\n\n    font-size: 14px !important;\n    font-weight: 600 !important;\n    line-height: 1 !important;\n\n    cursor: pointer !important;\n    user-select: none !important;\n\n    background-color: #d13438 !important;\n    color: #fff !important;\n\n    box-shadow:\n        0 1px 2px #00000026 !important;\n\n    transition:\n        background-color 0.1s ease,\n        border-color 0.1s ease,\n        box-shadow 0.1s ease,\n        transform 0.05s ease !important;\n}\n\n#sah-extensions-config .sah-config-reset-button:hover {\n    background-color: #e43b40 !important;\n    border-color: #c43136 !important;\n\n    box-shadow:\n        0 2px 4px #00000030 !important;\n}\n\n#sah-extensions-config .sah-config-reset-button:active {\n    background-color: #b02a2e !important;\n    border-color: #8f1f24 !important;\n\n    box-shadow: none !important;\n\n    transform: translateY(1px) !important;\n}\n\n#sah-extensions-config .sah-config-reset-button:focus-visible {\n    outline: 2px solid #fff !important;\n    outline-offset: 2px !important;\n\n    box-shadow:\n        0 0 0 4px #d1343866 !important;\n}\n\n/* -------------------------------------------------------\n   Reduced motion\n------------------------------------------------------- */\n\n@media (prefers-reduced-motion: reduce) {\n    #sah-extensions-config,\n    #sah-extensions-config .sah-config-dialog,\n    #sah-extensions-config .sah-config-settings-content,\n    #sah-extensions-config .sah-config-category.active::before {\n        transition: none !important;\n        animation: none !important;\n    }\n\n    #sah-extensions-config .sah-config-close,\n    #sah-extensions-config .sah-config-category,\n    #sah-extensions-config .sah-config-toggle,\n    #sah-extensions-config .sah-config-toggle::before,\n    #sah-extensions-config .sah-config-input,\n    #sah-extensions-config .sah-config-textarea,\n    #sah-extensions-config .sah-config-select,\n    #sah-extensions-config .sah-config-save-button,\n    #sah-extensions-config .sah-config-template-option,\n    #sah-extensions-config .sah-config-reset-button {\n        transition: none !important;\n    }\n}';

  // src/html/settings.html
  var settings_default2 = '<div id="sah-extensions-config">\n    <div class="sah-config-dialog">\n        <div class="sah-config-top-bar">\n            <span class="sah-config-header">SAH Extensions - Instellingen</span>\n            <div class="sah-config-close" role="button" tabindex="0" aria-label="Sluiten">\n                <i class="fa-solid fa-xmark"></i>\n            </div>\n        </div>\n\n        <div class="sah-config-dialog-body">\n            <div class="sah-config-categories">\n                <span class="sah-config-category" data-category="general">Algemeen</span>\n                <span class="sah-config-category" data-category="hoa">HOA</span>\n                <span class="sah-config-category" data-category="kcc">KCC</span>\n                <span class="sah-config-category" data-category="import">Importeren Exporteren</span>\n                <span class="sah-config-category" data-category="reset">Instellingen Resetten</span>\n            </div>\n\n            <div class="sah-config-settings">\n                <div class="sah-config-settings-content">\n                </div>\n            </div>\n        </div>\n    </div>\n</div>';

  // src/html/settings/general.html
  var general_default = '<span class="sah-config-category-header">Algemeen</span>\n\n<div class="sah-config-setting" binding="general.enabled" binding-type="bool">\n    <span class="sah-config-setting-label">Enable SAH Extensions</span>\n    <div class="sah-config-setting-control">\n        <input class="sah-config-toggle" type="checkbox">\n    </div>\n</div>\n\n<div class="sah-config-setting" binding="general.zohonewtab" binding-type="bool">\n    <span class="sah-config-setting-label">Zoho opent in nieuw tabblad</span>\n    <div class="sah-config-setting-control">\n        <input class="sah-config-toggle" type="checkbox">\n    </div>\n</div>\n\n<!--\n<div class="sah-config-setting">\n    <span class="sah-config-setting-label">Text field</span>\n    <div class="sah-config-setting-control">\n        <input class="sah-config-input" type="text" placeholder="Enter a value...">\n    </div>\n</div>\n\n\n<div class="sah-config-setting">\n    <span class="sah-config-setting-label">Dropdown</span>\n    <div class="sah-config-setting-control">\n        <select class="sah-config-select">\n            <option value="a">OptieA</option>\n            <option value="b">OptieB</option>\n            <option value="c">OptieC</option>\n        </select>\n    </div>\n</div>\n-->';

  // src/html/settings/hoa.html
  var hoa_default = '<span class="sah-config-category-header">HOA</span>\n<div class="sah-config-setting" binding="hoa.template.note" binding-type="long-text">\n    <span class="sah-config-setting-label">HOA Notitie Template</span>\n    <div class="sah-config-setting-control">\n        <textarea class="sah-config-textarea" placeholder="Enter a template..."></textarea>\n    </div>\n</div>\n\n<div class="sah-config-setting" binding="hoa.template.desc" binding-type="long-text">\n    <span class="sah-config-setting-label">HOA Omschrijving Template</span>\n    <div class="sah-config-setting-control">\n        <textarea class="sah-config-textarea" placeholder="Enter a template..."></textarea>\n    </div>\n</div>\n\n<div class="sah-config-setting" binding="hoa.template.exec" binding-type="long-text">\n    <span class="sah-config-setting-label">HOA Verricht Template</span>\n    <div class="sah-config-setting-control">\n        <textarea class="sah-config-textarea" placeholder="Enter a template..."></textarea>\n    </div>\n</div>\n\n<div class="sah-config-setting" binding="hoa.template.advice" binding-type="long-text">\n    <span class="sah-config-setting-label">HOA Advies Template</span>\n    <div class="sah-config-setting-control">\n        <textarea class="sah-config-textarea" placeholder="Enter a template..."></textarea>\n    </div>\n</div>\n\n<div class="sah-config-template-info">\n    <span class="sah-config-template-info-header">Template opties</span>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{problem}</span>\n        <span class="sah-config-template-option-description">Het probleem van de afspraak</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{description}</span>\n        <span class="sah-config-template-option-description">De bescrijving van de afspraak</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{note}</span>\n        <span class="sah-config-template-option-description">De notitie van de afspraak</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{postcode}</span>\n        <span class="sah-config-template-option-description">De postcodecijfers van de klant</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{pin}</span>\n        <span class="sah-config-template-option-description">De werkbon pin</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{email}</span>\n        <span class="sah-config-template-option-description">De email van de klant</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{date}</span>\n        <span class="sah-config-template-option-description">De huidige datum</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{time}</span>\n        <span class="sah-config-template-option-description">De huidige tijd</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{startTime}</span>\n        <span class="sah-config-template-option-description">De geplande starttijd</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{endTime}</span>\n        <span class="sah-config-template-option-description">De geplande eindtijd</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{firstName}</span>\n        <span class="sah-config-template-option-description">De voornaam van de klant</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{lastName}</span>\n        <span class="sah-config-template-option-description">De achternaam van de klant</span>\n    </div>\n    <div class="sah-config-template-option">\n        <span class="sah-config-template-option-name">{address}</span>\n        <span class="sah-config-template-option-description">Het adres van de klant</span>\n    </div>\n</div>';

  // src/html/settings/kcc.html
  var kcc_default = '<span class="sah-config-category-header">KCC</span>';

  // src/html/settings/import-export.html
  var import_export_default = '<span class="sah-config-category-header">Importeren Exporteren</span>\n<span class="sah-config-setting-label" style="flex: 0 1 auto; padding-bottom: 10px;">Settings JSON</span>\n<div class="sah-config-setting-control" style="flex: 1 1 auto;">\n    <textarea class="sah-config-textarea sah-config-json-box" style="width: 100%; height: 100%;" placeholder="Klik op export om je instellingen te exporteren, of plak je instellingen hier en klik op importeren..."></textarea>\n</div>';

  // src/html/settings/reset.html
  var reset_default = '<span class="sah-config-category-header">Instellingen Resetten</span>\n\n<div class="sah-config-reset">\n    <span class="sah-config-reset-warning">Weet je zeker dat je alle instellingen wilt resetten? Dit kan niet ongedaan gemaakt worden.</span>\n    <span class="sah-config-reset-button">Ja ik weet het zeker</span>\n</div>';

  // src/libs/script-config.js
  var ScriptConfig = class {
    Defaults = {};
    UserSettings = {};
    Config;
    constructor() {
      GM_registerMenuCommand("Open Settings", this.OpenSettings.bind(this), "s");
      this.CreateConfig();
    }
    CreateConfig() {
      this.Config = document.getElementById("sah-extensions-config");
      if (this.Config) return;
      TamperMonkey.AddStyle(settings_default);
      FontAwesome.Enable();
      document.body.insertAdjacentHTML("afterbegin", settings_default2);
      this.Config = document.getElementById("sah-extensions-config");
      const closeButton = this.Config.querySelector(".sah-config-close");
      const categories = this.Config.querySelectorAll(".sah-config-category");
      const settingsContent = this.Config.querySelector(".sah-config-settings-content");
      const categoryContent = {
        "general": general_default,
        "hoa": hoa_default,
        "kcc": kcc_default,
        "import": import_export_default,
        "reset": reset_default
      };
      const closeFunc = this.CloseSettings.bind(this);
      closeButton.addEventListener("click", closeFunc);
      closeButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          closeFunc();
        }
      });
      const settingsBindFunc = this.BindSettings.bind(this);
      categories.forEach((category) => {
        category.addEventListener("click", () => {
          if (category.classList.contains("active")) {
            return;
          }
          categories.forEach((item) => {
            item.classList.remove("active");
          });
          category.classList.add("active");
          settingsContent.classList.remove("changed");
          settingsContent.classList.add("changing");
          setTimeout(() => {
            const categoryName = category.dataset.category;
            settingsContent.innerHTML = categoryContent[categoryName];
            const settings = settingsContent.querySelectorAll(".sah-config-setting");
            settingsBindFunc(settings);
            const jsonBox = settingsContent.querySelector(".sah-config-json-box");
            if (jsonBox) {
              jsonBox.value = JSON.stringify(this.UserSettings, null, "	");
              jsonBox.addEventListener("change", (() => {
                try {
                  const settingsJson = JSON.parse(jsonBox.value);
                  if (settingsJson) {
                    this.UserSettings = settingsJson;
                  }
                } catch (error) {
                  console.error("Invalid JSON:", error);
                }
              }).bind(this));
            }
            const resetBtn = settingsContent.querySelector(".sah-config-reset-button");
            if (resetBtn) {
              resetBtn.addEventListener("click", (() => {
                this.ApplyDefaults();
                this.Save();
                resetBtn.innerHTML = "Instellingen zijn gereset!";
              }).bind(this));
            }
            settingsContent.classList.remove("changing");
            settingsContent.classList.add("changed");
            setTimeout(() => {
              settingsContent.classList.remove("changed");
            }, 200);
          }, 120);
        });
      });
      const primaryCategory = categories[0];
      if (primaryCategory) primaryCategory.click();
    }
    BindSettings(settings) {
      for (let i = 0; i < settings.length; i++) {
        const setting = settings[i];
        const binding = setting.getAttribute("binding");
        const bindingType = setting.getAttribute("binding-type");
        const control = setting.querySelector(".sah-config-setting-control");
        switch (bindingType) {
          case "bool":
            this.BindBoolSetting(control, binding);
            break;
          case "short-text":
            this.BindShortTextSetting(control, binding);
            break;
          case "long-text":
            this.BindLongTextSetting(control, binding);
            break;
          case "dropdown":
            this.BindDropdownSetting(control, binding);
            break;
        }
      }
    }
    BindBoolSetting(control, binding) {
      const input = control.querySelector("input");
      input.checked = this.Get(binding);
      input.addEventListener("change", () => {
        this.Set(binding, input.checked);
      });
    }
    BindShortTextSetting(control, binding) {
      const input = control.querySelector("input");
      input.value = this.Get(binding);
      input.addEventListener("change", () => {
        this.Set(binding, input.value);
      });
    }
    BindLongTextSetting(control, binding) {
      const input = control.querySelector("textarea");
      input.value = this.Get(binding);
      input.addEventListener("change", () => {
        this.Set(binding, input.value);
      });
    }
    BindDropdownSetting(control, binding) {
      console.error("not implemented");
    }
    async Load() {
      const config = await TamperMonkey.GetValue("user.settings");
      if (config) this.UserSettings = config;
      else this.UserSettings = {};
      this.ApplyDefaultsToUndefined();
    }
    async Save() {
      await TamperMonkey.SetValue("user.settings", this.UserSettings);
    }
    OpenSettings() {
      this.Config.classList.add("open");
    }
    CloseSettings() {
      this.Config.classList.remove("open");
    }
    ApplyDefaults() {
      for (const [key, defaultValue] of Object.entries(this.Defaults)) {
        this.UserSettings[key] = defaultValue;
      }
      this.Save();
    }
    ApplyDefaultsToUndefined() {
      for (const [key, defaultValue] of Object.entries(this.Defaults)) {
        if (this.UserSettings[key] !== void 0) continue;
        this.UserSettings[key] = defaultValue;
      }
      this.Save();
    }
    Register(key, defaultValue) {
      this.Defaults[key] = defaultValue;
    }
    Get(key) {
      const userValue = this.UserSettings[key];
      if (userValue === void 0) return this.Defaults[key];
      return userValue;
    }
    Set(key, value) {
      this.UserSettings[key] = value;
      this.Save();
    }
  };

  // src/libs/global-values.js
  var Config = new ScriptConfig();

  // src/integrations/steam.js
  var SteamIntegration = class extends Integration {
    urlRegex = /https:\/\/studentaanhuis\.steam\.eu\.com\/tm\/.*/;
    abonnementRegex = /Standaard abonnement \| Actief \| [0-9]+\-[0-9]+\-[0-9]+/;
    monitor;
    toasts;
    client;
    server;
    templates;
    Execute() {
      console.log("Steam integration active!");
      this.templates = {
        HOA: {
          Note: new Template(Config.Get("hoa.template.note")),
          Description: new Template(Config.Get("hoa.template.desc")),
          Executed: new Template(Config.Get("hoa.template.exec")),
          Advice: new Template(Config.Get("hoa.template.advice"))
        }
      };
      this.toasts = new ToastManager();
      this.toasts.Initialize();
      const host = "steam";
      this.client = new TabClient(host);
      this.client.AddOnSendFailedHandler((toHost, path, payload) => this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));
      this.server = new TabServer(host);
      this.server.Map("fillForm", this.FillForm.bind(this));
      this.server.StartListen();
      this.client.Start();
    }
    // OnRecordOpened(record) {
    //     console.log(record);
    // }
    FillForm(req) {
      if (!req || !req.data) return;
      if (!req.data.formType || !req.data.formData) {
        this.toasts.Error("Invalid fillform request");
        return;
      }
      switch (req.data.formType) {
        case "HOA":
          this.FillHoaForm(req.data.formData);
          break;
        case "General":
          this.FillGeneralDetails(req.data.formData);
          break;
        default:
          this.toasts.Error(`Deze versie van SAHExtensions ondersteunt fill form aanvragen voor '${req.data.formType}' niet!`);
      }
    }
    CheckForAbonnement(customer) {
      const abonnement = customer.customFields["Chargebee abonnementinformatie"];
      let hasAbonnement = false;
      if (abonnement && abonnement.match(this.abonnementRegex)) {
        hasAbonnement = true;
      }
      return hasAbonnement;
    }
    FillGeneralDetails(formData) {
      if (!formData) return;
      const customer = formData.customerData;
      if (!customer) return;
      const hasAbonnement = this.CheckForAbonnement(customer);
      Steam.SetBox(9745, customer.phone);
      Steam.SetBox(9546, customer.cf.cf_customer_number);
      Steam.SetDropdowns({
        "Klant heeft abonnement": hasAbonnement ? 26 : void 0
      });
    }
    FillHoaForm(formData) {
      if (!formData) return;
      const appointment = formData.appointmentData;
      const customer = formData.customerData;
      if (!customer || !appointment) return;
      const hasAbonnement = this.CheckForAbonnement(customer);
      const now = new Date(Date.now());
      const templateData = {
        problem: appointment.appointment.problem,
        description: appointment.appointment.description,
        note: appointment.appointment.note,
        postcode: customer.zip.replace(/[^0-9]*/g, ""),
        pin: appointment.werkbonPin,
        email: customer.email,
        date: now.toLocaleDateString("nl-nl", { day: "numeric", month: "long" }),
        time: now.toLocaleTimeString("nl-nl", { hour: "numeric", minute: "numeric" }),
        startTime: appointment.appointment.startTime,
        endTime: appointment.appointment.endTime,
        firstName: customer.firstName,
        lastName: customer.lastName,
        address: `${customer.street}, ${customer.zip} ${customer.city}`
      };
      Steam.SetBox(9745, customer.phone);
      Steam.SetBox(9546, customer.cf.cf_customer_number);
      Steam.SetBox(14136, appointment.student.studentNumber);
      Steam.SetDropdowns({
        "Werkzaam via": 1402,
        "Type Afspraak": 1404,
        "Klant heeft abonnement": hasAbonnement ? 26 : void 0
      });
      Steam.SetTextAreas({
        "Notitie voor jezelf": this.templates.HOA.Note.Execute(templateData),
        "Omschrijving probleem": this.templates.HOA.Description.Execute(templateData),
        "Verrichte werkzaamheden": this.templates.HOA.Executed.Execute(templateData),
        "(Vrijblijvend) advies/oplossing:": this.templates.HOA.Advice.Execute(templateData)
      });
    }
  };

  // src/libs/htmlintegration.js
  var HtmlIntegration = class {
    id = "extra-integration";
    observer;
    postinjection = [];
    constructor(html, id, docksToSelector, insertAtEnd) {
      this.id = id;
      this.observer = new MutationObserver(() => {
        const integrations = document.getElementById(this.id);
        if (integrations) return;
        const dock = docksToSelector();
        if (!dock) return;
        dock.insertAdjacentHTML(insertAtEnd ? "beforeend" : "afterbegin", `<div id="${this.id}"></div>`);
        const mount = document.getElementById(this.id);
        if (!mount) return;
        mount.insertAdjacentHTML("afterbegin", html);
        for (let i = 0; i < this.postinjection.length; i++) this.postinjection[i]();
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
        if (!elem) return;
        elem.addEventListener("click", (_) => {
          handler();
        });
      });
    }
  };

  // src/libs/nexus.js
  var Nexus = {
    GetDialog() {
      let dialog = document.querySelector('[data-role="dialog"]');
      if (!dialog) return void 0;
      let title = dialog.querySelector("h2");
      if (!title || title.innerHTML !== "Hulp Op Afstand") return void 0;
      return dialog;
    },
    GetPostalCode(dialog) {
      if (!dialog) return void 0;
      const address = dialog.innerHTML.match(/<span>([^<]+)<\/span><\/div><a[^>]+>Routebeschrijving/);
      if (!address) return void 0;
      const postalCodeNums = address[1].match(/(\d{4}) ?[a-zA-Z]{2}/);
      if (!postalCodeNums) return void 0;
      return postalCodeNums[0];
    },
    GetPostalCodeNums(dialog) {
      if (!dialog) return void 0;
      const address = dialog.innerHTML.match(/<span>([^<]+)<\/span><\/div><a[^>]+>Routebeschrijving/);
      if (!address) return void 0;
      const postalCodeNums = address[1].match(/(\d{4}) ?[a-zA-Z]{2}/);
      if (!postalCodeNums) return void 0;
      return postalCodeNums[1];
    },
    GetPin(dialog) {
      if (!dialog) return void 0;
      const werkbonBtn = dialog.querySelector("footer");
      if (!werkbonBtn) return void 0;
      return werkbonBtn.innerHTML.match(/\((.+)\)/)[1];
    },
    GetContainer(dialog) {
      if (!dialog) return void 0;
      return dialog.querySelector("section");
    },
    GetSections(dialog) {
      if (!dialog) return void 0;
      return [].slice.call(dialog.querySelectorAll("section"), 1);
    },
    GetCustomerInfo(sections) {
      if (!sections) return void 0;
      const klantInfoSection = sections[sections.length - 2];
      if (!klantInfoSection) return void 0;
      const klantInfos = klantInfoSection.querySelectorAll("a");
      if (!klantInfos) return void 0;
      if (klantInfos.length < 3) return void 0;
      const email = klantInfos[0].innerHTML;
      const phone = klantInfos[1].innerHTML;
      const route = klantInfos[2].href;
      return {
        email,
        phone,
        route
      };
    },
    GetAppointmentInfo(sections) {
      if (!sections) return void 0;
      const afspraakInfoSection = sections[1];
      if (!afspraakInfoSection) return void 0;
      const probChild = afspraakInfoSection.children[0];
      let probInfo = probChild.children && probChild.children[1] && probChild.children[1].innerText.trim();
      probInfo = probInfo && probInfo.length > 1 ? probInfo : null;
      const descChild = afspraakInfoSection.children[1];
      let descInfo = descChild.children && descChild.children[1] && descChild.children[1].innerText.trim();
      descInfo = descInfo && descInfo.length > 1 ? descInfo : null;
      const noteChild = afspraakInfoSection.children[2];
      let noteInfo = noteChild.children && noteChild.children[1] && noteChild.children[1].innerText.trim();
      noteInfo = noteInfo && noteInfo.length > 1 ? noteInfo : null;
      const timesSection = sections[0];
      if (!timesSection) return void 0;
      const startTime = /\| ([^\s]+)/gm.exec(timesSection.innerHTML)[1].trim();
      const endTime = /- ([^\s]+)/gm.exec(timesSection.innerHTML)[1].trim();
      return {
        problem: probInfo,
        description: descInfo,
        note: noteInfo,
        startTime,
        endTime
      };
    },
    async GetStudent() {
      return await (await fetch("https://app.studentaanhuis.nl/api/auth/me")).json();
    },
    async GetStudentDetails(nexusStudentID) {
      const response = await fetch("https://app.studentaanhuis.nl/api/graphql", {
        "headers": {
          "accept": "*/*",
          "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
          "content-type": "application/json",
          "priority": "u=1, i",
          "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin"
        },
        "referrer": window.location.href,
        "body": `[{"query":"query GetStudentHeader($id: String) {\\n  students(id: $id) {\\n    data {\\n      ...StudentHeaderFragment\\n    }\\n  }\\n}\\n\\nfragment StudentHeaderFragment on Student {\\n  studentNumber\\n  firstName\\n  lastName\\n  active\\n  phoneNumber\\n}","variables":{"id":"${nexusStudentID}"}}]`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      });
      if (!response) return void 0;
      if (response.status !== 200) return void 0;
      const result = await response.json();
      if (!result) return void 0;
      return result[0].payload.data.students.data[0];
    }
  };

  // src/libs/clipboard.js
  var Clipboard = {
    async Copy(text) {
      const type = "text/plain";
      const clipboardItemData = {
        [type]: text
      };
      const clipboardItem = new ClipboardItem(clipboardItemData);
      await navigator.clipboard.write([clipboardItem]);
    }
  };

  // src/html/nexus.html
  var nexus_default = '<hr class="my-5">\n<section class="text-gamma-700 text-sm font-medium">\n    <b>Extra Integraties</b>\n    <div class="extra-integration-div">\n        <div id="toSteamBtn" class="extra-integration-button"><span class="extra-integration-button-label">Stuur naar Steam</span></div>\n        <div id="toZohoBtn" class="extra-integration-button"><span class="extra-integration-button-label">Open in Zoho</span></div>\n        <div id="copyPostalBtn" class="extra-integration-button"><span class="extra-integration-button-label">Kopieer postcodecijfers</span></div>\n        <div id="copyPinBtn" class="extra-integration-button"><span class="extra-integration-button-label">Kopieer pincode</span></div>\n    </div>\n</section>';

  // src/css/nexus.css
  var nexus_default2 = ".extra-integration-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 5px;\n    background-color: #f56200;\n    border-radius: 8px;\n    cursor: pointer;\n    transition: background 0.2s;\n    flex: 1 40%;\n}\n\n.extra-integration-button:hover {\n    background-color: #f58f1b;\n    transition: background 0.2s;\n}\n\n.extra-integration-button-label {\n    color: #fff;\n    -webkit-touch-callout: none;\n    -webkit-user-select: none;\n    -khtml-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n}\n\n.extra-integration-div {\n    display: flex;\n    flex-flow: row wrap;\n    gap: 5px;\n    margin-top: 5px;\n}";

  // src/integrations/nexus.js
  var NexusIntegration = class extends Integration {
    urlRegex = /https:\/\/app\.studentaanhuis\.nl.*/;
    client;
    server;
    toasts;
    Execute() {
      console.log("Nexus integration active!");
      this.toasts = new ToastManager();
      this.toasts.Initialize();
      const host = "nexus";
      this.client = new TabClient(host);
      this.client.AddOnSendFailedHandler((toHost, path, payload) => this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));
      this.server = new TabServer(host);
      this.server.Map("error", (req) => this.toasts.Error(req.data.message));
      TamperMonkey.AddStyle(nexus_default2);
      const integration = new HtmlIntegration(nexus_default, "nexus-integrations", () => {
        const dialog = Nexus.GetDialog();
        if (!dialog) return void 0;
        return Nexus.GetContainer(dialog);
      }, true);
      integration.OnClick("toSteamBtn", async () => await this.SendDetailsToSteam());
      integration.OnClick("toZohoBtn", async () => await this.OpenCustomerZoho());
      integration.OnClick("copyPostalBtn", () => {
        const postalNums = Nexus.GetPostalCodeNums(Nexus.GetDialog());
        if (postalNums) {
          Clipboard.Copy(postalNums);
          this.toasts.Success("Postcodecijfers gekopieerd!");
        } else this.toasts.Error("Kon niet kopi\xEBren.");
      });
      integration.OnClick("copyPinBtn", () => {
        const pin = Nexus.GetPin(Nexus.GetDialog());
        if (pin) {
          Clipboard.Copy(pin);
          this.toasts.Success("Pin gekopieerd!");
        } else this.toasts.Error("Kon niet kopi\xEBren.");
      });
      this.client.Start();
      this.server.StartListen();
      integration.Enable();
    }
    async SendDetailsToSteam() {
      const student = await Nexus.GetStudent();
      if (!student || !student.success) {
        this.toasts.Error("Kon geen student gegevens verkrijgen!");
        return;
      }
      const studentNexusID = student.me.student_id;
      const studentDetails = await Nexus.GetStudentDetails(studentNexusID);
      if (!studentDetails) {
        this.toasts.Error("Kon geen student gegevens verkrijgen!");
        return;
      }
      const dialog = Nexus.GetDialog();
      const pin = Nexus.GetPin(dialog);
      const sections = Nexus.GetSections(dialog);
      const customer = Nexus.GetCustomerInfo(sections);
      const appointment = Nexus.GetAppointmentInfo(sections);
      if (!pin) {
        this.toasts.Error("Fout bij het ophalen van de werkbon pin!");
        return;
      }
      if (!customer) {
        this.toasts.Error("Fout bij het ophalen van klant gegevens!");
        return;
      }
      if (!appointment) {
        this.toasts.Error("Fout bij het ophalen van afspraak gegevens!");
        return;
      }
      const zohoQuery = `${customer.email} ${customer.phone}`;
      const request = {
        werkbonPin: pin,
        appointment,
        query: zohoQuery,
        route: customer.route,
        student: {
          name: studentDetails.firstName,
          lastName: studentDetails.lastName,
          studentNumber: studentDetails.studentNumber,
          id: studentNexusID
        }
      };
      this.client.SendTabRequest("zoho", "sendHoaAppointmentToSteam", request);
    }
    async OpenCustomerZoho() {
      const dialog = Nexus.GetDialog();
      const sections = Nexus.GetSections(dialog);
      const customer = Nexus.GetCustomerInfo(sections);
      if (!customer) {
        this.toasts.Error("Fout bij het ophalen van klant gegevens!");
        return;
      }
      const zohoQuery = `${customer.email} ${customer.phone}`;
      const request = {
        query: zohoQuery
      };
      this.toasts.Info("Aanvraag naar zoho verzonden...");
      this.client.SendTabRequest("zoho", "openCustomer", request);
    }
  };

  // src/libs/session.js
  var Session = {
    InstanceID: crypto.randomUUID()
  };

  // src/libs/main-tab.js
  var MainTabMonitor = class {
    LockKey = "unknown-main-tab";
    PromotionHandler = () => {
    };
    Channel = null;
    IsMainTab = false;
    constructor(lockKey) {
      this.LockKey = lockKey;
      this.Channel = new BroadcastChannel(this.LockKey);
    }
    OnPromote(onBecomeMainTab) {
      this.PromotionHandler = onBecomeMainTab;
    }
    Monitor() {
      navigator.locks.request(
        this.LockKey,
        {
          mode: "exclusive"
        },
        async () => {
          this.Promote();
          await new Promise(() => {
          });
        }
      );
    }
    Promote() {
      if (this.IsMainTab) {
        return;
      }
      this.IsMainTab = true;
      this.PromotionHandler();
      this.Channel.postMessage({
        type: "main",
        owner: Session.InstanceID
      });
    }
    Destroy() {
      this.Channel.close();
    }
  };

  // src/libs/zoho.js
  var Zoho = class {
    ApiBaseURL = "https://desk.zoho.eu/supportapi/zd/sahnl/api/v1/";
    OrgID = "20103286373";
    CurrentDepartmentID = "192005000000007061";
    Token = {};
    LoadToken(token) {
      this.Token = token;
    }
    async ZohoApiRequest(requestMethod, endpoint, payload) {
      const request = {
        method: requestMethod,
        body: JSON.stringify(payload),
        headers: {
          "accept": "*/*",
          "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,nl-NL;q=0.6",
          "content-type": "application/json",
          "currentdepartmentid": this.CurrentDepartmentID,
          "featureflags": "multiLayout,agentDeptOpt,pvtThread,ticketTeam,commentAttachment,spamDetails,taskReminder,showI18NFields,onholdTicketStatus,Blueprint,timeTracking,sharedDepartments,secondaryContacts,truncateContent,customChannels,apiName,blockQuoteContent,reactChanges,newHistoryFormat,getVisitorInfo,sanitizedName,sanitizedDeptNameOpt,handleClosedStatusPermission,providePHIDetails,contact,showIsNested,requestFromNewClient",
          "orgid": this.OrgID,
          "priority": "u=1, i",
          "x-murphy-session-id": this.Token.murphySession,
          "x-murphy-span-id": this.Token.murphySpan,
          "x-murphy-tab-id": this.Token.murphyTab,
          "x-murphy-trace-id": this.Token.murphyTrace,
          "x-zcsrf-token": this.Token.zcsrfToken
        },
        "referrer": window.location.href,
        "mode": "cors",
        "credentials": "include"
      };
      console.log(request);
      return await fetch(`${this.ApiBaseURL}${endpoint}`, request);
    }
    async ZohoApiRequestWithoutPayload(requestMethod, endpoint) {
      return await fetch(`${this.ApiBaseURL}${endpoint}`, {
        method: requestMethod,
        headers: {
          "accept": "*/*",
          "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,nl-NL;q=0.6",
          "content-type": "application/json",
          "currentdepartmentid": this.CurrentDepartmentID,
          "featureflags": "multiLayout,agentDeptOpt,pvtThread,ticketTeam,commentAttachment,spamDetails,taskReminder,showI18NFields,onholdTicketStatus,Blueprint,timeTracking,sharedDepartments,secondaryContacts,truncateContent,customChannels,apiName,blockQuoteContent,reactChanges,newHistoryFormat,getVisitorInfo,sanitizedName,sanitizedDeptNameOpt,handleClosedStatusPermission,providePHIDetails,contact,showIsNested,requestFromNewClient",
          "orgid": this.OrgID,
          "priority": "u=1, i",
          "x-murphy-session-id": this.Token.murphySession,
          "x-murphy-span-id": this.Token.murphySpan,
          "x-murphy-tab-id": this.Token.murphyTab,
          "x-murphy-trace-id": this.Token.murphyTrace,
          "x-zcsrf-token": this.Token.zcsrfToken
        },
        "referrer": window.location.href,
        "mode": "cors",
        "credentials": "include"
      });
    }
    async GlobalSearch(query) {
      if (!query) return void 0;
      return await this.ZohoApiRequest("POST", "globalSearch", {
        "module": "contacts",
        "departmentId": this.CurrentDepartmentID,
        "pattern": "1",
        "queries": [{ "value": [`${query}`], "condition": "starts with", "fieldName": "All" }],
        "from": 0,
        "limit": 10,
        "isFetchCategory": false,
        "sortBy": "-relevance",
        "includePreference": true,
        "ziaSearch": false,
        "source": "globalSearch"
      });
    }
    async GetCustomerDetails(customerID) {
      const response = await this.ZohoApiRequestWithoutPayload("GET", `contacts/${customerID}?include=accounts,owner`);
      return await response.json();
    }
    async SearchCustomers(query) {
      const klantOpties = await (await this.GlobalSearch(query)).json();
      if (!klantOpties || klantOpties.data.length < 1) {
        return [];
      }
      const results = [];
      for (let i = 0; i < klantOpties.data.length; i++) results.push(klantOpties.data[i].id);
      return results;
    }
    GetCurrentCustomerID() {
      const klantIDSelectorRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl\/.+\/klanten\/details\/([0-9]*)/;
      const res = klantIDSelectorRegex.exec(window.location.href);
      if (!res) return void 0;
      const klantZohoID = res[1];
      if (!klantZohoID) return void 0;
      return klantZohoID;
    }
  };

  // src/libs/zoho-token-collector.js
  var TokenCollector = class {
    featureFlags = void 0;
    //featureFlags
    zcsrfToken = void 0;
    //X-ZCSRF-TOKEN
    murphySession = void 0;
    //x-murphy-session-id
    murphyTrace = void 0;
    //x-murphy-trace-id
    murphyTab = void 0;
    //x-murphy-tab-id
    murphySpan = void 0;
    //x-murphy-span-id
    CollectToken(onTokenCollected) {
      const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
      const tokenCollector = this;
      XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        switch (name) {
          case "featureFlags":
            if (tokenCollector.featureFlags === void 0) tokenCollector.featureFlags = value;
            break;
          case "X-ZCSRF-TOKEN":
            if (tokenCollector.zcsrfToken === void 0) tokenCollector.zcsrfToken = value;
            break;
          case "x-murphy-session-id":
            if (tokenCollector.murphySession === void 0) tokenCollector.murphySession = value;
            break;
          case "x-murphy-trace-id":
            if (tokenCollector.murphyTrace === void 0) tokenCollector.murphyTrace = value;
            break;
          case "x-murphy-tab-id":
            if (tokenCollector.murphyTab === void 0) tokenCollector.murphyTab = value;
            break;
          case "x-murphy-span-id":
            if (tokenCollector.murphySpan === void 0) tokenCollector.murphySpan = value;
            break;
        }
        if (tokenCollector.AllHeadersCaptured.bind(tokenCollector)()) {
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
      if (!this.featureFlags) return false;
      if (!this.zcsrfToken) return false;
      if (!this.murphySession) return false;
      if (!this.murphyTrace) return false;
      if (!this.murphyTab) return false;
      if (!this.murphySpan) return false;
      return true;
    }
  };

  // src/css/zoho.css
  var zoho_default = '.integration-button {\n    cursor: var(--zdr-cursor-pointer);\n    border-color: rgb(71, 157, 255);\n    color: rgb(71, 157, 255);\n    border: 1px solid;\n    border-radius: 4px;\n    padding: 5px;\n    margin-bottom: 5px;\n    font-family: var(--zd-font-family, ""), var(--zd_fallback_font, ZDLato);\n    font-weight: var(--zd-fw-semibold);\n    font-size: var(--zd_font_size13);\n    transition: color 1s ease;\n    transition: border-color 1s ease;\n}\n\n.integration-button:hover {\n    border-color: hsl(212, 64%, 79%);\n    color: hsl(212, 64%, 79%);\n    transition: color 1s ease;\n    transition: border-color 1s ease;\n}';

  // src/html/zoho.html
  var zoho_default2 = '<div id="extra-integrations" class="zd_v2-customerprofile-customerFieldsSec">\n    <div class="zd_v2-assign-assign zd_v2-assign-pointer zd_v2-customerprofile-customFieldSpace zd_v2-accountprofile-assignFieldSpace zd_v2ff266bc91b zd_v273a3ca0b12 zd_v2166972493c"\n        data-test-id="contacts_Extra Integrations" data-id="contacts_Extra Integrations" data-selector-id="container">\n        <div class="zd_v2-assign-assignTitle zd_v2577c9fa95f" data-test-id="boxComponent" data-id="boxComponent"\n            data-selector-id="box">\n            <div class="zd_v2ff266bc91b zd_v273a3ca0b12 zd_v2fd3b1bbb3b zd_v2bd11ce84cf"\n                data-test-id="containerComponent" data-id="containerComponent" data-selector-id="container"><label\n                    class="zd_v2-label-label zd_v2-label-varClass zd_v2-label-subtitle zd_v2-label-small zd_v2-labelcolors-secondary zd_v2-label-font_default zd_v2-label-cursor zd_v2-assign-dotted zd_v24af66c9aeb zd_v2-assign-assigneeLabel"\n                    data-title="Extra Integrations" data-id="extraIntegrations" data-test-id="extraIntegrations"\n                    data-selector-id="label">Extra Integrations</label></div>\n        </div>\n        <div id="integration-buttons" class="integrations">\n            <div id="toSteamBtn" class="integration-button"><div class="integration-button-label">Send to Steam</div></div>\n            <div id="toNexusBtn" class="integration-button"><div class="integration-button-label">Send to Nexus</div></div>\n        </div>\n    </div>\n</div>';

  // src/integrations/zoho.js
  var ZohoIntegration = class extends Integration {
    urlRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl.*/;
    toasts;
    client;
    server;
    zoho;
    Execute() {
      console.log("Zoho integration active!");
      this.toasts = new ToastManager();
      this.toasts.Initialize();
      this.zoho = new Zoho();
      const collector = new TokenCollector();
      collector.CollectToken((token) => this.zoho.LoadToken(token));
      const host = "zoho";
      this.client = new TabClient(host);
      this.client.AddOnSendFailedHandler((toHost, path, payload) => this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));
      const mainTab = new MainTabMonitor("ZOHO-MAIN-TAB-LOCK");
      mainTab.OnPromote(() => {
        this.server = new TabServer(host);
        this.server.Map("openCustomer", async (req) => await this.OpenCustomer(req));
        this.server.Map("sendHoaAppointmentToSteam", async (req) => await this.SendHOAAppointmentToSteam(req));
        this.server.StartListen();
      });
      mainTab.Monitor();
      TamperMonkey.AddStyle(zoho_default);
      const integration = new HtmlIntegration(zoho_default2, "zoho-integrations", () => {
        const customerPanel = document.querySelector("aside[aria-label='Contact Information']");
        if (!customerPanel) return void 0;
        return customerPanel.querySelector(".zd_v2-customerprofile-staticSectionCnt");
      }, false);
      integration.OnClick("toSteamBtn", async () => await this.SendCurrentToSteam());
      integration.OnClick("toNexusBtn", async () => await this.SendCurrentToNexus());
      this.client.Start();
      integration.Enable();
    }
    async GetCustomerID(req) {
      const query = req.data.query;
      const customers = await this.zoho.SearchCustomers(query);
      if (customers.length < 1) {
        const error = "Klant kan niet gevonden worden! (no results)";
        this.client.SendTabRequest(req.fromHost, "error", { message: error });
        this.toasts.Error(error);
        return [false, null];
      }
      if (customers.length > 1) {
        const error = "Meerdere klanten gevonden met dezelfde gegevens. Zoek de klant handmatig op.";
        this.client.SendTabRequest(req.fromHost, "error", { message: error });
        this.toasts.Error(error);
        return [false, null];
      }
      const customerID = customers[0];
      return [true, customerID];
    }
    async OpenCustomer(req) {
      if (!req || !req.data) return;
      const [success, customerID] = await this.GetCustomerID(req);
      if (!success) return;
      const url = `https://desk.zoho.eu/agent/sahnl/sahnl/klanten/details/${customerID}`;
      if (Config.Get("general.zohonewtab")) window.open(url);
      else window.location.href = url;
    }
    async SendHOAAppointmentToSteam(req) {
      if (!req || !req.data) return;
      const [success, customerID] = await this.GetCustomerID(req);
      if (!success) return;
      const customer = await this.zoho.GetCustomerDetails(customerID);
      const request = {
        formType: "HOA",
        formData: {
          appointmentData: req.data,
          customerData: customer
        }
      };
      this.client.SendTabRequest("steam", "fillForm", request);
    }
    async SendCurrentToSteam() {
      const customerID = this.zoho.GetCurrentCustomerID();
      if (!customerID) {
        this.toasts.Error("Kan klant niet naar steam sturen, klant ID ongeldig");
        return;
      }
      const customer = await this.zoho.GetCustomerDetails(customerID);
      if (!customer) {
        this.toasts.Error("Kan klant niet naar steam sturen, klant niet gevonden.");
        return;
      }
      const request = {
        formType: "General",
        formData: {
          customerData: customer
        }
      };
      this.client.SendTabRequest("steam", "fillForm", request);
    }
    async SendCurrentToNexus() {
      const customerID = this.zoho.GetCurrentCustomerID();
      if (!customerID) {
        this.toasts.Error("Kan klant niet naar nexus sturen, klant ID ongeldig");
        return;
      }
      const customer = await this.zoho.GetCustomerDetails(customerID);
      if (!customer) {
        this.toasts.Error("Kan klant niet naar nexus sturen, klant niet gevonden.");
        return;
      }
      const customerNumber = customer?.cf?.cf_customer_number;
      if (!customerNumber) {
        this.toasts.Error("Kan klant niet naar nexus sturen, klantnummer niet gevonden.");
        return;
      }
      Object.assign(document.createElement("a"), {
        target: "_blank",
        rel: "noopener noreferrer",
        href: `https://app.studentaanhuis.nl/?search=${customerNumber}`
      }).click();
    }
  };

  // src/integrations/global.js
  var GlobalIntegration = class extends Integration {
    ShouldActivate() {
      return true;
    }
    Execute() {
      console.log("Global integration active!");
    }
  };

  // src/libs/config-defaults.js
  var ConfigDefaults = {
    RegisterAll() {
      Config.Register("general.enabled", true);
      Config.Register("general.zohonewtab", true);
      Config.Register("hoa.template.note", "Afspraak\n{problem}\n{description}\n{note}\nWerkbon\n\n{postcode}\n{pin}\nTeamviewer\n\n");
      Config.Register("hoa.template.desc", "");
      Config.Register("hoa.template.exec", "");
      Config.Register("hoa.template.advice", "");
    }
  };

  // src/main.js
  async function main() {
    ConfigDefaults.RegisterAll();
    await Config.Load();
    if (!Config.Get("general.enabled")) return;
    const integrations = [new GlobalIntegration(), new SteamIntegration(), new NexusIntegration(), new ZohoIntegration()];
    integrations.forEach((x) => {
      if (!x.ShouldActivate()) return;
      x.Execute();
    });
  }
  main();
})();
