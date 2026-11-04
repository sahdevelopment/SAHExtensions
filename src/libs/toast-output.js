export const Toast = {
    toastManager: undefined,

    ConnectTo(toastManager) {
        this.toastManager = toastManager;
    },

    Error(message) {
        this.toastManager.Error(message);
    },

    Info(message) {
        this.toastManager.Info(message);
    },

    Success(message) {
        this.toastManager.Success(message);
    }
};