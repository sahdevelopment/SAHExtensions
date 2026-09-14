import { Integration } from "../libs/integration";
import { TabServer, TabClient } from "../libs/tab-networking";
import { ToastManager } from "../libs/toasts";
import { HtmlIntegration } from "../libs/htmlintegration";
import { TamperMonkey as TM } from "../libs/tampermonkey";
import { MainTabMonitor } from "../libs/main-tab";
import { Zoho } from "../libs/zoho";
import { TokenCollector } from "../libs/zoho-token-collector";
import ZohoCSS from "../css/zoho.css";
import ZohoHTML from "../html/zoho.html";
import { UserSettings } from "../libs/usersettings";

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

        //Zoho
        this.zoho = new Zoho();
        const collector = new TokenCollector();
        collector.CollectToken(token => this.zoho.LoadToken(token));

        //Communication
        const host = "zoho";
        this.client = new TabClient(host);
        this.client.AddOnSendFailedHandler((toHost, path, payload) =>  this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));

        const mainTab = new MainTabMonitor("ZOHO-MAIN-TAB-LOCK");
        mainTab.OnPromote(() => {
            this.server = new TabServer(host);

            this.server.Map("openCustomer", async(req) => await this.OpenCustomer(req));
            this.server.Map("sendHoaAppointmentToSteam", async(req) => await this.SendHOAAppointmentToSteam(req));

            this.server.StartListen();
        });
        mainTab.Monitor();

        //Integration
        TM.AddStyle(ZohoCSS);
        const integration = new HtmlIntegration(ZohoHTML, "zoho-integrations", () => {
            const customerPanel = document.querySelector("aside[aria-label='Contact Information']");
            if(!customerPanel) return undefined;
            return customerPanel.querySelector(".zd_v2-customerprofile-staticSectionCnt");
        }, false);

        this.client.Start();
        integration.Enable();        
    }

    async GetCustomerID(req) {
        const query = req.data.query;
        const customers = await this.zoho.SearchCustomers(query);

        if(customers.length < 1) {
            const error = "Klant kan niet gevonden worden! (no results)";
            this.client.SendTabRequest(req.fromHost, "error", { message: error });
            this.toasts.Error(error);
            return [false, null];
        }

        if(customers.length > 1) {
            const error = "Meerdere klanten gevonden met dezelfde gegevens. Zoek de klant handmatig op.";
            this.client.SendTabRequest(req.fromHost, "error", { message: error });
            this.toasts.Error(error);
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
        if(UserSettings.General.ZohoOpensInNewTab) window.open(url);
        else window.location.href = url;
    }

    async SendHOAAppointmentToSteam(req) {
        if(!req || !req.data) return;
        
        const [success, customerID] = await this.GetCustomerID(req);
        if(!success) return;

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
}