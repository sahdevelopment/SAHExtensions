export const TamperMonkey = {
    SetValue(name, value) {
        GM_setValue(name, value);
    },
    GetValue(name) {
        return GM_getValue(name);
    },
    DeleteValue(name) {
        GM_deleteValue(name);
    },
    //Listener format: (name, oldValue, newValue) => {}
    AddValueChangeListener(name, listener) {
        GM_addValueChangeListener(name, listener);
    },
    RemoveValueChangeListener(name, listener) {
        GM_removeValueChangeListener(name, listener);
    },
    AddStyle(css) {
        GM_addStyle(css);
    },
    AddElement(type, properties) {
        GM_addElement(type, properties);
    }
};