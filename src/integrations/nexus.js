import { Integration } from "../libs/integration";
import { TabListener } from "../libs/tablistener";
import { HtmlIntegration } from "../libs/htmlintegration";
import { TamperMonkey as TM } from "../libs/tampermonkey";
import { Nexus } from "../libs/libnexus";
import { Clipboard } from "../libs/clipboard";
import NexusHtml from "../html/nexus.html";
import NexusCss from "../css/nexus.css";
import { ToastManager } from "../libs/toasts";

export class NexusIntegration extends Integration {
    urlRegex = /https:\/\/app\.studentaanhuis\.nl.*/;
    listener;
    toasts;

    Execute() {
        console.log("Nexus integration active!");

        //Toasts
        this.toasts = new ToastManager();
        this.toasts.Initialize();

        //Communication
        this.listener = new TabListener("nexus");
        this.listener.AddOnSendFailedHandler((toHost, path, payload) =>  this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));
        this.listener.Map("ping", req => console.log("Pong!"));
        
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
                this.toasts.Success("Postcodecijfers gekopieerd!");
            } else this.toasts.Error("Kon niet kopiëren.");
        });
        integration.OnClick("copyPinBtn", () => {
            const pin = Nexus.GetPin(Nexus.GetDialog());
            if(pin) {
                Clipboard.Copy(pin);
                this.toasts.Success("Pin gekopieerd!");
            } else this.toasts.Error("Kon niet kopiëren.");
        });

        this.listener.StartListen();
        integration.Enable();
    }

    async SendDetailsToSteam() {
        const student = await Nexus.GetStudent();
        if(!student || !student.success) {
            this.toasts.Error("Kon geen student gegevens verkrijgen!");
            return;
        }

        const studentNexusID = student.me.student_id;
        const studentDetails = await Nexus.GetStudentDetails(studentNexusID);
        if(!studentDetails) {
            this.toasts.Error("Kon geen student gegevens verkrijgen!");
            return;
        }

        const dialog = Nexus.GetDialog();
        const pin = Nexus.GetPin(dialog);
        const sections = Nexus.GetSections(dialog);
        const customer = Nexus.GetCustomerInfo(sections);
        const appointment = Nexus.GetAppointmentInfo(sections);
        if(!pin) {
            this.toasts.Error("Fout bij het ophalen van de werkbon pin!");
            return;
        }
        if(!customer) {
            this.toasts.Error("Fout bij het ophalen van klant gegevens!");
            return;
        }
        if(!appointment) {
            this.toasts.Error("Fout bij het ophalen van afspraak gegevens!");
            return;
        }

        const zohoQuery = `${customer.email} ${customer.phone}`;
        const request = {
            werkbonPin: pin,
            afspraakInfo: appointment,
            query: zohoQuery,
            route: customer.route,
            student: {
                name: studentDetails.firstName,
                lastName: studentDetails.lastName,
                studentNumber: studentDetails.studentNumber,
                id: studentNexusID,
            }
        };
        
        this.toasts.Info("Aanvraag naar zoho verzonden...");
        this.listener.SendTabRequest("zoho", "sendAppointmentToSteam", request);
    }

    async OpenCustomerZoho() {
        const dialog = Nexus.GetDialog();
        const sections = Nexus.GetSections(dialog);
        const customer = Nexus.GetCustomerInfo(sections);
        if(!customer) {
            this.toasts.Error("Fout bij het ophalen van klant gegevens!");
            return;
        }

        const zohoQuery = `${customer.email} ${customer.phone}`;
        const request = {
            query: zohoQuery
        };

        this.toasts.Info("Aanvraag naar zoho verzonden...");
        this.listener.SendTabRequest("zoho", "openCustomer", request);
    }
}