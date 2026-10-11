import Platform from "./platform/Platform";
import { IStorage } from "./platform/Platform";
export default class StorageHandler {
    private static storage: IStorage;
    
    static init() {
        StorageHandler.storage = Platform.getCurrent().getStorage();

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