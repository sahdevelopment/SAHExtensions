// ==UserScript==
// @name         SAH Extensions
// @namespace    http://tampermonkey.net/
// @version      2026-08-31
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
//
// ==/UserScript==

(() => {
  // src/libs/usersettings.js
  var UserSettings = {
    General: {
      IntegrationEnabled: true,
      DetectIncomingCalls: true,
      //Automatically detects calls (will auto lookup phone numbers and fill fields in the future)
      ZohoOpensInNewTab: true
      //Open zoho in new tab instead of redirecting the main tab
    },
    KCC: {},
    HOA: {
      SteamNotitieTemplate: "{problem}\n{description}\n{note}\nWerkbon\n\n{postcode}\n{pin}",
      SteamOmschrijvingTemplate: void 0,
      SteamVerrichtTemplate: void 0,
      SteamAdviesTemplate: void 0
    },
    EXPERIMENTAL: {}
  };

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
        if (value) {
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
    },
    GetTasks() {
      return window.belscherm.taskbar.arrTask;
    },
    GetRecords() {
      return window.belscherm.arrRecord;
    },
    GetActiveRecord() {
      return window.belscherm.activeRecord;
    },
    HasRecordOpen() {
      return window.belscherm.userIsInCallRecord() || window.belscherm.userIsInWrapupRecord();
    },
    UserMessage(message) {
      window.belscherm.userMessage(message);
    },
    UserError(message) {
      window.belscherm.userMessage(message, true);
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

  // src/libs/sah-event.js
  var SAHEvent = class {
    name;
    listeners = /* @__PURE__ */ new Set();
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
      for (let i = 0; i < this.listeners.size; i++) {
        this.listeners[i](...params);
      }
    }
  };

  // src/libs/method-patcher.js
  var MethodPatcher = class {
    prototype;
    originals;
    prefixes;
    postfixes;
    patched;
    constructor(prototype) {
      this.prototype = prototype;
      this.originals = /* @__PURE__ */ new Map();
      this.prefixes = /* @__PURE__ */ new Map();
      this.postfixes = /* @__PURE__ */ new Map();
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
      const methods = /* @__PURE__ */ new Set([
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
      this.prototype[methodName] = function(...args) {
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
  };

  // src/libs/steam-monitor.js
  var SteamMonitor = class {
    patcher;
    onRecordActivated = new SAHEvent("OnRecordActivated");
    onRecordDeactivated = new SAHEvent("OnRecordDeactivated");
    constructor() {
      this.patcher = new MethodPatcher(Record.prototype);
      const monitor = this;
      this.patcher.AddPostfix("activate", () => {
        monitor.onRecordActivated.Invoke(this);
      });
      this.patcher.AddPostfix("deactivate", () => {
        monitor.onRecordDeactivated.Invoke(this);
      });
    }
    Enable() {
      this.patcher.Patch();
    }
    Disable() {
      this.patcher.Unpatch();
    }
  };

  // src/integrations/steam.js
  var SteamIntegration = class extends Integration {
    urlRegex = /https:\/\/studentaanhuis\.steam\.eu\.com\/.*/;
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
          Note: new Template(UserSettings.HOA.SteamNotitieTemplate),
          Description: new Template(UserSettings.HOA.SteamOmschrijvingTemplate),
          Executed: new Template(UserSettings.HOA.SteamVerrichtTemplate),
          Advice: new Template(UserSettings.HOA.SteamAdviesTemplate)
        }
      };
      this.toasts = new ToastManager();
      this.toasts.Initialize();
      const host = "steam";
      this.client = new TabClient(host);
      this.client.AddOnSendFailedHandler((toHost, path, payload) => this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));
      this.server = new TabServer(host);
      this.server.Map("fillForm", this.FillForm.bind(this));
      this.monitor = new SteamMonitor();
      this.monitor.Enable();
      this.server.StartListen();
      this.client.Start();
    }
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
      const templateData = {
        problem: appointment.appointment.problem,
        description: appointment.appointment.description,
        note: appointment.appointment.note,
        postcode: customer.zip.replace(/[^0-9]*/g, ""),
        pin: appointment.werkbonPin,
        email: customer.email,
        date: new Date(Date.now()).toLocaleDateString("nl-nl", { day: "numeric", month: "long" }),
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
    OrgID = 20103286373;
    CurrentDepartmentID = 192005000093612500;
    Token = {};
    LoadToken(token) {
      this.Token = token;
    }
    async ZohoApiRequest(requestMethod, endpoint, payload) {
      return await fetch(`${this.ApiBaseURL}${endpoint}`, {
        method: requestMethod,
        body: JSON.stringify(payload),
        headers: {
          "accept": "*/*",
          "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
          "content-type": "application/json",
          "currentdepartmentid": this.CurrentDepartmentID,
          "orgid": this.OrgID,
          "priority": "u=1, i",
          "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "featureFlags": this.Token.featureFlags,
          "X-ZCSRF-TOKEN": this.Token.zcsrfToken,
          "x-murphy-session-id": this.Token.murphySession,
          "x-murphy-trace-id": this.Token.murphyTrace,
          "x-murphy-tab-id": this.Token.murphyTab,
          "x-murphy-span-id": this.Token.murphySpan
        },
        "referrer": window.location.href,
        "mode": "cors",
        "credentials": "include"
      });
    }
    async ZohoApiRequestWithoutPayload(requestMethod, endpoint) {
      return await fetch(`${this.ApiBaseURL}${endpoint}`, {
        method: requestMethod,
        headers: {
          "accept": "*/*",
          "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
          "content-type": "application/json",
          "currentdepartmentid": this.CurrentDepartmentID,
          "orgid": this.OrgID,
          "priority": "u=1, i",
          "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "featureFlags": this.Token.featureFlags,
          "X-ZCSRF-TOKEN": this.Token.zcsrfToken,
          "x-murphy-session-id": this.Token.murphySession,
          "x-murphy-trace-id": this.Token.murphyTrace,
          "x-murphy-tab-id": this.Token.murphyTab,
          "x-murphy-span-id": this.Token.murphySpan
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
        "departmentId": "192005000093612502",
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
      if (UserSettings.General.ZohoOpensInNewTab) window.open(url);
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

  // src/main.js
  function main() {
    if (!UserSettings.General.IntegrationEnabled) return;
    const integrations = [new GlobalIntegration(), new SteamIntegration(), new NexusIntegration(), new ZohoIntegration()];
    integrations.forEach((x) => {
      if (!x.ShouldActivate()) return;
      x.Execute();
    });
  }
  main();
})();
