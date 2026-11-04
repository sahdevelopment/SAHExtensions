import { Integration } from "../libs/integration";
import { TabServer, TabClient } from "../libs/tab-networking";
import { HtmlIntegration } from "../libs/htmlintegration";
import { TamperMonkey as TM } from "../libs/tampermonkey";
import { Nexus } from "../libs/nexus";
import { Clipboard } from "../libs/clipboard";
import { ToastManager } from "../libs/toasts";
import { Toast } from "../libs/toast-output.js";
import { ErrorHandler } from "../libs/error-handler.js";
import NexusHtml from "../html/nexus.html";
import NexusCss from "../css/nexus.css";

export class NexusIntegration extends Integration {
    urlRegex = /https:\/\/app\.studentaanhuis\.nl.*/;
    client;
    server;
    toastManager;

    Execute() {
        console.log("Nexus integration active!");

        //Toasts
        this.toastManager = new ToastManager();
        this.toastManager.Initialize();
        Toast.ConnectTo(this.toastManager);

        //Communication
        const host = "nexus";
        this.client = new TabClient(host);
        this.client.AddOnSendFailedHandler((toHost, path, payload) =>  ErrorHandler.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));

        this.server = new TabServer(host);
        this.server.Map("error", req => ErrorHandler.Error(req.data.message));
        
        //Integration
        TM.AddStyle(NexusCss);
        const integration = new HtmlIntegration(NexusHtml, "nexus-integrations", () => {
            const dialog = Nexus.GetDialog();
            if(!dialog) return undefined;
            return Nexus.GetContainer(dialog);
        }, true);

        integration.OnClick("toSteamBtn", async () => await this.SendDetailsToSteam());
        integration.OnClick("toZohoBtn", async () => await this.OpenCustomerZoho());
        integration.OnClick("copyPostalBtn", () => {
            const postalNums = Nexus.GetPostalCodeNums(Nexus.GetDialog());
            if(postalNums) {
                Clipboard.Copy(postalNums);
                Toast.Success("Postcode cijfers gekopieerd!");
            } else ErrorHandler.Error("Kon postcode cijfers niet kopiëren.");
        });
        integration.OnClick("copyPinBtn", () => {
            const pin = Nexus.GetPin(Nexus.GetDialog());
            if(pin) {
                Clipboard.Copy(pin);
                Toast.Success("Pin gekopieerd!");
            } else ErrorHandler.Error("Kon werkbon pin niet kopiëren.");
        });

        this.client.Start();
        this.server.StartListen();
        integration.Enable();
    }

    async SendDetailsToSteam() {
        const student = await Nexus.GetStudent();
        if(!student || !student.success) {
            ErrorHandler.Error("Kon geen student gegevens verkrijgen!");
            return;
        }

        const studentNexusID = student.me.student_id;
        const studentDetails = await Nexus.GetStudentDetails(studentNexusID);
        if(!studentDetails) {
            ErrorHandler.Error("Kon geen student gegevens verkrijgen!");
            return;
        }

        const dialog = Nexus.GetDialog();
        const pin = Nexus.GetPin(dialog);
        const sections = Nexus.GetSections(dialog);
        const customer = Nexus.GetCustomerInfo(sections);
        const appointment = Nexus.GetAppointmentInfo(sections);
        if(!pin) {
            ErrorHandler.Error("Fout bij het ophalen van de werkbon pin!");
            return;
        }
        if(!customer) {
            ErrorHandler.Error("Fout bij het ophalen van klant gegevens!");
            return;
        }
        if(!appointment) {
            ErrorHandler.Error("Fout bij het ophalen van afspraak gegevens!");
            return;
        }

        const zohoQuery = `${customer.email} ${customer.phone}`;
        const request = {
            werkbonPin: pin,
            appointment: appointment,
            query: zohoQuery,
            route: customer.route,
            student: {
                name: studentDetails.firstName,
                lastName: studentDetails.lastName,
                studentNumber: studentDetails.studentNumber,
                id: studentNexusID,
            }
        };
        
        Toast.Info("Aanvraag naar zoho verzonden...");
        this.client.SendTabRequest("zoho", "sendHoaAppointmentToSteam", request);
    }

    async OpenCustomerZoho() {
        const dialog = Nexus.GetDialog();
        const sections = Nexus.GetSections(dialog);
        const customer = Nexus.GetCustomerInfo(sections);
        if(!customer) {
            ErrorHandler.Error("Fout bij het ophalen van klant gegevens!");
            return;
        }

        const zohoQuery = `${customer.email} ${customer.phone}`;
        const request = {
            query: zohoQuery
        };

        Toast.Info("Aanvraag naar zoho verzonden...");
        this.client.SendTabRequest("zoho", "openCustomer", request);
    }
}