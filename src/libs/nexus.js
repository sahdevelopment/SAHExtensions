export const Nexus = {
    GetDialog() {
        let dialog = document.querySelector('[data-role="dialog"]');
        if(!dialog) return undefined;
        let title = dialog.querySelector("h2");
        if(!title || title.innerHTML !== "Hulp Op Afstand") return undefined;
        return dialog;
    },

    GetPostalCode(dialog) {
        if(!dialog) return undefined;
        const address = dialog.innerHTML.match(/<span>([^<]+)<\/span><\/div><a[^>]+>Routebeschrijving/);
        if(!address) return undefined;
        const postalCodeNums = address[1].match(/(\d{4}) ?[a-zA-Z]{2}/);
        if(!postalCodeNums) return undefined;
        return postalCodeNums[0];
    },

    GetPostalCodeNums(dialog) {
        if(!dialog) return undefined;
        const address = dialog.innerHTML.match(/<span>([^<]+)<\/span><\/div><a[^>]+>Routebeschrijving/);
        if(!address) return undefined;
        const postalCodeNums = address[1].match(/(\d{4}) ?[a-zA-Z]{2}/);
        if(!postalCodeNums) return undefined;
        return postalCodeNums[1];
    },

    GetPin(dialog) {
        if(!dialog) return undefined;
        const werkbonBtn = dialog.querySelector("footer");
        if(!werkbonBtn) return undefined;
        return werkbonBtn.innerHTML.match(/\((.+)\)/)[1];
    },

    GetContainer(dialog) {
        if(!dialog) return undefined;
        return dialog.querySelector("section");
    },

    GetSections(dialog) {
        if(!dialog) return undefined;
        return [].slice.call(dialog.querySelectorAll("section"),1);
    },

    GetCustomerInfo(sections) {
        if(!sections) return undefined;
        const klantInfoSection = sections[sections.length - 2];
        if(!klantInfoSection) return undefined;
        const klantInfos = klantInfoSection.querySelectorAll("a");
        if(!klantInfos) return undefined;
        if(klantInfos.length < 3) return undefined;
        const email = klantInfos[0].innerHTML;
        const phone = klantInfos[1].innerHTML;
        const route = klantInfos[2].href;
        return {
            email: email,
            phone: phone,
            route: route
        };
    },

    GetAppointmentInfo(sections) {
        if(!sections) return undefined;
        const afspraakInfoSection = sections[1];
        if (!afspraakInfoSection) return undefined;

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
        if(!timesSection) return undefined;
        const startTime = /\| ([^\s]+)/gm.exec(timesSection.innerHTML)[1].trim();
        const endTime = /- ([^\s]+)/gm.exec(timesSection.innerHTML)[1].trim();

        return { 
            problem: probInfo, 
            description: descInfo, 
            note: noteInfo, 
            startTime: startTime, 
            endTime: endTime 
        };
    },

    async GetStudent() {
        return await (await fetch("https://app.studentaanhuis.nl/api/auth/me")).json();
    },

    async GetStudentDetails(nexusStudentID)
    {
        const response = await fetch("https://app.studentaanhuis.nl/api/graphql", {
            "headers": {
                "accept": "*/*",
                "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Microsoft Edge\";v=\"150\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": window.location.href,
            "body": `[{\"query\":\"query GetStudentHeader($id: String) {\\n  students(id: $id) {\\n    data {\\n      ...StudentHeaderFragment\\n    }\\n  }\\n}\\n\\nfragment StudentHeaderFragment on Student {\\n  studentNumber\\n  firstName\\n  lastName\\n  active\\n  phoneNumber\\n}\",\"variables\":{\"id\":\"${nexusStudentID}\"}}]`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        if(!response) return undefined;
        if(response.status !== 200) return undefined;
        const result = await response.json();
        if(!result) return undefined;
        return result[0].payload.data.students.data[0];
    }
};