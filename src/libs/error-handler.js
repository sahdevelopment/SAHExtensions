import { Toast } from "./toast-output";

export const ErrorHandler = {
    Error(message) {
        console.error(message);
        Toast.Error(message);
    }
};