import { ToastManager } from "../libs/toasts";
import { TabServer, TabClient } from "../libs/tab-networking";
import { TamperMonkey as TM } from "../libs/tampermonkey";
import { UserSettings } from "../libs/usersettings";
import { Template } from "../libs/template";
import { Steam } from "../libs/steam";
import { Integration } from "../libs/integration";

export class SteamIntegration extends Integration {
    urlRegex = /https:\/\/studentaanhuis\.steam\.eu\.com\/.*/;
    abonnementRegex = /Standaard abonnement \| Actief \| [0-9]+\-[0-9]+\-[0-9]+/;
    toasts;
    client;
    server;
    templates;

    Execute() {
        console.log("Steam integration active!");
        //Templates
        this.templates = {
            HOA: {
                Note: new Template(UserSettings.HOA.SteamNotitieTemplate),
                Description: new Template(UserSettings.HOA.SteamOmschrijvingTemplate),
                Executed: new Template(UserSettings.HOA.SteamVerrichtTemplate),
                Advice: new Template(UserSettings.HOA.SteamAdviesTemplate)
            }
        };
                
        //Toasts
        this.toasts = new ToastManager();
        this.toasts.Initialize();

        //Communication
        const host = "steam";
        this.client = new TabClient(host);
        this.client.AddOnSendFailedHandler((toHost, path, payload) =>  this.toasts.Error(`Kon niet communiceren met ${toHost}, is het tabje open?`));

        this.server = new TabServer(host);

        this.server.Map("fillForm", this.FillForm.bind(this));

        this.server.StartListen();
        this.client.Start();
    }

    FillForm(req) {
        if(!req || !req.data) return;
        if(!req.data.formType || !req.data.formData) {
            this.toasts.Error("Invalid fillform request");
            return;
        }
        switch(req.data.formType) {
            case "HOA": this.FillHoaForm(req.data.formData); break;
            default: this.toasts.Error(`Deze versie van SAHExtensions ondersteunt fill form aanvragen voor '${req.data.formType}' niet!`);
        }
    }

    
    FillHoaForm(formData) {
        if(!formData) return;
        const appointment = formData.appointmentData;
        const customer = formData.customerData;
        if(!customer || !appointment) return;

        const abonnement = customer.customFields["Chargebee abonnementinformatie"];
        let hasAbonnement = false;
        if(abonnement && abonnement.match(this.abonnementRegex)) {
            hasAbonnement = true;
        }

        const templateData = { 
            problem: appointment.appointment.problem, 
            description: appointment.appointment.description, 
            note: appointment.appointment.note, 
            postcode: customer.zip.replace(/[^0-9]*/g, ""), 
            pin: appointment.werkbonPin,
            email: customer.email,
            date: (new Date(Date.now())).toLocaleDateString("nl-nl", { day: "numeric",  month: "long"}),
            startTime: appointment.appointment.startTime,
            endTime: appointment.appointment.endTime,
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: `${customer.street}, ${customer.zip} ${customer.city}`,
        };

        Steam.SetBox(9745, customer.phone);
        Steam.SetBox(9546, customer.cf.cf_customer_number);
        Steam.SetBox(14136, appointment.student.studentNumber);
        Steam.SetDropdowns({
            "Werkzaam via": 1402,
            "Type Afspraak": 1404,
            "Klant heeft abonnement": hasAbonnement ? 26 : undefined,
        });
        Steam.SetTextAreas({
            "Notitie voor jezelf": this.templates.HOA.Note.Execute(templateData),
            "Omschrijving probleem": this.templates.HOA.Description.Execute(templateData),
            "Verrichte werkzaamheden": this.templates.HOA.Executed.Execute(templateData),
            "(Vrijblijvend) advies/oplossing:": this.templates.HOA.Advice.Execute(templateData),
        });
    }
}