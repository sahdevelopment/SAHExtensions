import { ErrorHandler } from "./error-handler";

export class Zoho {
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
        return await fetch(`${this.ApiBaseURL}${endpoint}`, request);
    }

    async ZohoApiRequestWithoutPayload(requestMethod, endpoint) {
        const request = {
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
        };
        return await fetch(`${this.ApiBaseURL}${endpoint}`, request);
    }

    async GetTicket(ticketID) {
        if(!ticketID) {
            ErrorHandler.Error("Failed to fetch ticket, no id was provided");
            return undefined;
        }
        const response = await this.ZohoApiRequestWithoutPayload("GET", `tickets/${ticketID}?include=secondaryContacts,departments,contacts,products,assignee,team,contract,source,skills,isRead`);
        
        if(!response) {
            ErrorHandler.Error("Failed to perform ticket fetch. Response == null");  
            return undefined;
        }
        
        if(response.status !== 200) {
            ErrorHandler.Error(`Failed to perform ticket fetch. ${response.status}: ${response.statusText}`);
            return undefined;
        }
        
        const result = await response.json();

        if(!result) {
            ErrorHandler.Error("Failed to perform ticket fetch. Response is not valid JSON");
            return undefined;
        }

        return result;
    }

    async GlobalSearch(query) {
        if(!query) {
            ErrorHandler.Error("Failed to perform global search. No query was provided");
            return undefined;
        }
        
        const response = await this.ZohoApiRequest("POST", "globalSearch", {
            "module":"contacts",
            "departmentId":this.CurrentDepartmentID,
            "pattern":"1",
            "queries":[{"value":[`${query}`],"condition":"starts with","fieldName":"All"}],
            "from":0,
            "limit":10,
            "isFetchCategory":false,
            "sortBy":"-relevance",
            "includePreference":true,
            "ziaSearch":false,
            "source":"globalSearch"
        });

        if(!response) {
            ErrorHandler.Error("Failed to perform global search. Response == null");  
            return undefined;
        }
        
        if(response.status !== 200) {
            ErrorHandler.Error(`Failed to perform global search. ${response.status}: ${response.statusText}`);
            return undefined;
        }
        
        const result = await response.json();

        if(!result) {
            ErrorHandler.Error("Failed to perform global search. Response is not valid JSON");
            return undefined;
        }

        return result;
    }

    async GetCustomerDetails(customerID) { 
        const response = await this.ZohoApiRequestWithoutPayload("GET", `contacts/${customerID}?include=accounts,owner`);
        if(!response) {
            ErrorHandler.Error("Failed to perform customer fetch. Response == null");  
            return undefined;
        }
        
        if(response.status !== 200) {
            ErrorHandler.Error(`Failed to perform customer fetch. ${response.status}: ${response.statusText}`);
            return undefined;
        }
        
        const result = await response.json();

        if(!result) {
            ErrorHandler.Error("Failed to perform customer fetch. Response is not valid JSON");
            return undefined;
        }

        return result;
    }

    async SearchCustomers(query) {
        const klantOpties = await this.GlobalSearch(query);

        if(!klantOpties || klantOpties.data.length < 1) {
            return [];
        }

        const results = [];
        for(let i = 0; i < klantOpties.data.length; i++) results.push(klantOpties.data[i].id);
        
        return results;
    }

    GetCurrentTicketID() {
        const regex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl\/sahnl\/tickets\/details\/([0-9]+)/;
        const groups = regex.exec(window.location.href);
        if(!groups) return undefined;
        if(groups.length < 2) return undefined;
        const id = groups[1];
        if(!id) return undefined;
        return id;
    }

    async GetCurrentCustomerID() {
        const isTicket = /.+\/tickets\/.+/.test(window.location.href);
        if(isTicket) {
            const ticketID = this.GetCurrentTicketID();
            const ticket = await this.GetTicket(ticketID);
            if(!ticket) {
                ErrorHandler.Error("Could not fetch ticket details");
                return undefined;
            }
            return ticket.contactId;
        }

        const klantIDSelectorRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl\/.+\/klanten\/details\/([0-9]*)/;
        const res = klantIDSelectorRegex.exec(window.location.href);
        if(!res) return undefined;
        const klantZohoID = res[1];
        if(!klantZohoID) return undefined;
        return klantZohoID;
    }
};