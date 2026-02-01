export default class StorageHandler {
    private static storage: Storage;
    
    static init() {
        StorageHandler.storage = window.localStorage;
        // for security reasons so no one starts hacking bill accounts noooo
        delete (window as any).localStorage;
    }

    static clear(): void {
        StorageHandler.storage.clear();
    }

    static key(index: number): string | null {
        return StorageHandler.storage.key(index);
    }

    static removeItem(key: string): void {
        StorageHandler.storage.removeItem(key);
    }

    static setItem(key: string, value: string): void {
        StorageHandler.storage.setItem(key, value);
    }

    static getItem(key: string): string | null {
        return StorageHandler.storage.getItem(key);
    }

}