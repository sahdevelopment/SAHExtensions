export class Zoho {
    ApiBaseURL = "https://desk.zoho.eu/supportapi/zd/sahnl/api/v1/";
    OrgID = 20103286373;
    CurrentDepartmentID = 192005000093612502;
    Token = {};

    LoadToken(token) {
        this.Token = token;
    }

    async ZohoApiRequest(requestMethod, endpoint, payload) {
        return await fetch(`${this.ApiBaseURL}${endpoint}`,{
            method: requestMethod,
            body: JSON.stringify(payload),
            headers: {
                "accept": "*/*",
                "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "application/json",
                "currentdepartmentid": this.CurrentDepartmentID,
                "orgid": this.OrgID,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Microsoft Edge\";v=\"150\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
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
        return await fetch(`${this.ApiBaseURL}${endpoint}`,{
            method: requestMethod,
            headers: {
                "accept": "*/*",
                "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "application/json",
                "currentdepartmentid": this.CurrentDepartmentID,
                "orgid": this.OrgID,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Microsoft Edge\";v=\"150\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
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
        if(!query) return undefined;
        return await this.ZohoApiRequest("POST", "globalSearch", {
            "module":"contacts",
            "departmentId":"192005000093612502",
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

    async GetCustomerDetails(customerID) { return await this.ApiRequestWithoutPayload("GET", `contacts/${customerID}?include=accounts,owner`); }

    async SearchCustomers(query) {
        const klantOpties = await (await this.GlobalSearch(query)).json();
        if(!klantOpties || klantOpties.data.length < 1) {
            return [];
        }
        const results = [];
        for(let i = 0; i < klantOpties.data.length; i++) results.push(klantOpties.data[i].id);
        return results;
    }
};