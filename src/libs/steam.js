export const Steam = {
    SetBox(PID, content) {
        if(!content) return false;
        const box = document.getElementById(`boxPID_${PID}`);
        if(!box) {
            console.error(`Box with PID ${PID} could not be found!`);
            return false;
        }
        if(box.value && box.value.length > 0) return;
        box.value += content;
        box.dispatchEvent(new Event("input", { bubbles: true }));
        box.dispatchEvent(new Event("change", { bubbles: true }));
    },

    SetDropdowns(values) {
        const dropdowns = this.GetDropdowns();
        if(!dropdowns) return;
        for(let i = 0; i < dropdowns.length; i++) {
            const dropdown = dropdowns[i];
            if(!dropdown) continue;
            const label = this.GetDropdownLabel(dropdown);
            if(!label) continue;
            const value = values[label];
            if(value) {
                this.SetDropdownValue(dropdown, value);
                continue;
            }
        }
    },

    SetTextAreas(values) {
        const textAreas = this.GetTextAreas();
        if(!textAreas) return;
        for(let i = 0; i < textAreas.length; i++) {
            const textArea = textAreas[i];
            if(!textArea) continue;
            const label = this.GetTextAreaLabel(textArea);
            if(!label) continue;
            const value = values[label];
            if(value) {
                this.SetTextArea(textArea, value);
                continue;
            }
        }
    },

    GetDropdowns() {
        return document.querySelectorAll("select.boxSelectlist");
    },

    GetDropdownLabel(dropdown) {
        if(!dropdown) return;
        const caption = dropdown.parentElement.querySelector(".boxCaption");
        if(!caption) return;
        return caption.innerText;
    },

    SetDropdownValue(dropdown, value) {
        if(!dropdown) return;
        dropdown.value = value;
        dropdown.dispatchEvent(new Event("input", { bubbles: true }));
        dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    },

    GetTextAreas() {
        return document.querySelectorAll(".boxInput.boxTextarea");
    },

    GetTextAreaLabel(textArea) {
        if(!textArea) return;
        const caption = textArea.parentElement.querySelector(".boxCaption");
        if(!caption) return;
        return caption.innerText;
    },

    SetTextArea(textArea, value) {
        if(!textArea) return;
        if(textArea.value && textArea.value.length > 0) return;
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