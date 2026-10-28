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
            "referrer": "https://desk.zoho.eu/agent/sahnl/sahnl/klanten/details/192005000052316587",
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
            "referrer": "https://desk.zoho.eu/agent/sahnl/sahnl/klanten/details/192005000052316587",
            "mode": "cors",
            "credentials": "include"
        });
    }

    async GlobalSearch(query) {
        if(!query) return undefined;
        return await this.ZohoApiRequest("POST", "globalSearch", {
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
    }

    async GetCustomerDetails(customerID) { 
        const response = await this.ZohoApiRequestWithoutPayload("GET", `contacts/${customerID}?include=accounts,owner`);
        //TODO add error handling
        return await response.json();
    }

    async SearchCustomers(query) {
        const klantOpties = await (await this.GlobalSearch(query)).json();
        //TODO add error handling
        if(!klantOpties || klantOpties.data.length < 1) {
            return [];
        }
        const results = [];
        for(let i = 0; i < klantOpties.data.length; i++) results.push(klantOpties.data[i].id);
        return results;
    }

    GetCurrentCustomerID() {
        const klantIDSelectorRegex = /https:\/\/desk\.zoho\.eu\/agent\/sahnl\/.+\/klanten\/details\/([0-9]*)/;
        const res = klantIDSelectorRegex.exec(window.location.href);
        if(!res) return undefined;
        const klantZohoID = res[1];
        if(!klantZohoID) return undefined;
        return klantZohoID;
    }
};