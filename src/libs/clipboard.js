export const Clipboard = {
    async Copy(text) {
        const type = "text/plain";
        const clipboardItemData = {
            [type]: text,
        };
        const clipboardItem = new ClipboardItem(clipboardItemData);
        await navigator.clipboard.write([clipboardItem]);
    }
};