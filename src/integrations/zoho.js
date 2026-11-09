import { Integration } from "../libs/integration";
import { TabServer, TabClient } from "../libs/tab-networking";
import { ToastManager } from "../libs/toasts";
import { HtmlIntegration } from "../libs/htmlintegration";
import { TamperMonkey as TM } from "../libs/tampermonkey";
import { MainTabMonitor } from "../libs/main-tab";
import { Zoho } from "../libs/zoho";
import { TokenCollector } from "../libs/zoho-token-collector";
import { Config } from "../libs/global-values";
import { Toast } from "../libs/toast-output.js";
import { ErrorHandler } from "../libs/error-handler.js";
import ZohoCSS from "../css/zoho.css";
import ZohoCustomerHTML from "../html/zohoCustomer.html";
import ZohoTicketHTML from "../html/zohoTicket.html";

export class ZohoIntegration extends Integration {
    urlRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl.*/;
    toasts;
    client;
    server;
    zoho;

    Execute() {
        console.log("Zoho integration active!");
        
        //Toasts
        this.toasts = new ToastManager();
        this.toasts.Initialize();
        Toast.ConnectTo(this.toasts);

        //Zoho
        this.zoho = new Zoho();
        const collector = new TokenCollector();
        let tokensCollected = false;
        let onTokensCollected = [];
        collector.CollectToken(token => {
            this.zoho.LoadToken(token);
            tokensCollected = true;
            for(let i = 0; i < onTokensCollected.length; i++) onTokensCollected[i]();
        });

        //Communication
        const host = "zoho";
        this.client = new TabClient(host);
        this.client.AddOnSendFailedHandler((toHost, path, payload) =>  ErrorHandler.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));

        const mainTab = new MainTabMonitor("ZOHO-MAIN-TAB-LOCK");
        mainTab.OnPromote(() => {
            this.server = new TabServer(host);

            this.server.Map("openCustomer", async(req) => await this.OpenCustomer(req));
            this.server.Map("sendHoaAppointmentToSteam", async(req) => await this.SendHOAAppointmentToSteam(req));

            this.server.StartListen();

            Toast.Info("Dit tabblad is gedetecteerd als hoofdtabblad. SAHExtensions gebruikt deze tab om gegevens op te vragen.");
        });
        mainTab.Monitor();

        //Integration
        TM.AddStyle(ZohoCSS);
        const isTicket = /.+\/tickets\/.+/.test(window.location.href);
        const integration = new HtmlIntegration(isTicket ? ZohoTicketHTML : ZohoCustomerHTML, "zoho-integrations", () => {
            if(isTicket) return document.querySelector(".zd_v2-ticketleftpanelform-propertiesSection");

            const customerPanel = document.querySelector("aside[aria-label='Contact Information']");
            if(!customerPanel) return undefined;
            return customerPanel.querySelector(".zd_v2-customerprofile-staticSectionCnt");
        }, false);

        integration.OnClick("toSteamBtn", async() => await this.SendCurrentToSteam());
        integration.OnClick("toNexusBtn", async() => await this.SendCurrentToNexus());

        if(isTicket) {
            integration.OnClick("toEditTicket", () => window.location.href = window.location.href.replace("details", "edit"));
            integration.OnClick("toEditCustomer", async() => await this.EditCustomer());

            let htmlInjected = false;
            integration.AddPostInjectionHandler(() => {
                htmlInjected = true;
                if(tokensCollected) this.UpdateCustomerProfileStatus();
            });
            onTokensCollected.push(() => {
                if(htmlInjected) this.UpdateCustomerProfileStatus();
            });
        }

        this.client.Start();
        integration.Enable();        
    }

    async GetCustomerID(req) {
        const query = req.data.query;
        const customers = await this.zoho.SearchCustomers(query);

        if(!customers) {
            const error = "Klant kan opgevraagd worden! Fout bij het verkrijgen van klantgegevens van zoho.";
            this.client.SendTabRequest(req.fromHost, "error", { message: error });
            ErrorHandler.Error(error);
            return [false, null];
        }

        if(customers.length < 1) {
            const error = "Klant kan niet gevonden worden! (no results)";
            this.client.SendTabRequest(req.fromHost, "error", { message: error });
            ErrorHandler.Error(error);
            return [false, null];
        }

        if(customers.length > 1) {
            const error = "Meerdere klanten gevonden met dezelfde gegevens. Zoek de klant handmatig op.";
            this.client.SendTabRequest(req.fromHost, "error", { message: error });
            ErrorHandler.Error(error);
            return [false, null];
        }

        const customerID = customers[0];
        return [true, customerID];
    }

    async OpenCustomer(req) {
        if(!req || !req.data) return;
        
        const [success, customerID] = await this.GetCustomerID(req);
        if(!success) return;

        const url = `https://desk.zoho.eu/agent/sahnl/sahnl/klanten/details/${customerID}`;
        if(Config.Get("general.zohonewtab")) window.open(url);
        else window.location.href = url;
    }

    async SendHOAAppointmentToSteam(req) {
        if(!req || !req.data) return;
        
        const [success, customerID] = await this.GetCustomerID(req);
        if(!success) return;

        const customer = await this.zoho.GetCustomerDetails(customerID);

        if(!customer) {
            const error = "Kan klantgegevens niet verkrijgen. Fout bij het opvragen van meer details (klantgegevens)";
            this.client.SendTabRequest(req.fromHost, "error", { message: error });
            ErrorHandler.Error(error);
            return;
        }

        const request = {
            formType: "HOA",
            formData: {
                appointmentData: req.data,
                customerData: customer
            }
        };
        this.client.SendTabRequest("steam", "fillForm", request);
    }

    async EditCustomer() {
        const customerID = await this.zoho.GetCurrentCustomerID();
        if(!customerID) {
            ErrorHandler.Error("Kan klant niet bewerken, kon klant ID niet verzamelen");
            return;
        }
        const editUrl = `https://desk.zoho.eu/agent/sahnl/sahnl/klanten/edit/${customerID}`;
        Object.assign(document.createElement("a"), {
            target: "_blank",
            rel: "noopener noreferrer",
            href: editUrl,
        }).click();
    }

    async SendCurrentToSteam() {
        const customerID = await this.zoho.GetCurrentCustomerID();
        if(!customerID) {
            ErrorHandler.Error("Kan klant niet naar steam sturen, klant ID ongeldig");
            return;
        }
        const customer = await this.zoho.GetCustomerDetails(customerID);
        if(!customer) {
            ErrorHandler.Error("Kan klant niet naar steam sturen, klant niet gevonden.");
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
        const customerID = await this.zoho.GetCurrentCustomerID();
        if(!customerID) {
            ErrorHandler.Error("Kan klant niet naar nexus sturen, klant ID ongeldig");
            return;
        }
        const customer = await this.zoho.GetCustomerDetails(customerID);
        if(!customer) {
            ErrorHandler.Error("Kan klant niet naar nexus sturen, klant niet gevonden.");
            return;
        }
        const customerNumber = customer?.cf?.cf_customer_number;
        if(!customerNumber) {
            ErrorHandler.Error("Kan klant niet naar nexus sturen, klantnummer niet gevonden.");
            return;
        }
        Object.assign(document.createElement("a"), {
            target: "_blank",
            rel: "noopener noreferrer",
            href: `https://app.studentaanhuis.nl/?search=${customerNumber}`,
        }).click();
    }

    async UpdateCustomerProfileStatus() {
        const customerID = await this.zoho.GetCurrentCustomerID();
        if(!customerID) {
            ErrorHandler.Error("Kan klant profiel niet vinden, klant ID ongeldig");
            return;
        }
        const customer = await this.zoho.GetCustomerDetails(customerID);
        if(!customer) {
            ErrorHandler.Error("Kan klant profiel niet laden, klant niet gevonden.");
            return;
        }

        const status = document.getElementById("sah-ticket-profile-status");
        const avg = document.getElementById("sah-ticket-avg-check");
        if(!status || !avg) {
            ErrorHandler.Error("Automatische klant check werkt niet omdat de HTML niet aan de pagina is toegevoegd.");
            return;
        }

        if(!this.ValidateCustomer(customer)) {
            status.classList.toggle("sah-ticket-status-bad");
            status.innerText = "Klant profiel incompleet";
            avg.innerText = "Vul het klantprofiel aan!";
            return;
        }

        status.innerText = "Klant profiel compleet";
        status.classList.toggle("sah-ticket-status-good");
        const houseNumberGetter = /.+\s([0-9]+.+)/;
        const results = houseNumberGetter.exec(customer.street);
        if(!results || results.length < 2 || !results[1]) {
            ErrorHandler.Error(`Kon huisnummer niet vinden in ${customer.street}`);
            return;
        }
        avg.innerText = `AVG Check: ${customer.zip}, ${results[1]}`;
    }

    ValidateCustomer(customer) {
        if(!customer) return false;
        if(!customer.firstName) return false;
        if(!customer.lastName) return false;
        if(!customer.email) return false;
        if(!customer.zip) return false;
        if(!customer.street) return false;
        if(!customer.city) return false;
        if(!customer.phone) return false;
        if(!customer.cf.cf_customer_number) return false;
        return true;
    }
}