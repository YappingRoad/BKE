import Callback from "../Callback";
import Renderer, { IRenderer } from "../renderers/Renderer";
export interface IStorage {
    /**
     * The **`length`** read-only property of the Storage interface returns the number of data items stored in a given Storage object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/length)
     */
    readonly length: number;
    /**
     * The **`clear()`** method of the Storage interface clears all keys stored in a given Storage object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/clear)
     */
    clear(): void;
    /**
     * The **`getItem()`** method of the Storage interface, when passed a key name, will return that key's value, or null if the key does not exist, in the given Storage object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/getItem)
     */
    getItem(key: string): string | null;
    /**
     * The **`key()`** method of the Storage interface, when passed a number n, returns the name of the nth key in a given Storage object. The order of keys is user-agent defined, so you should not rely on it.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/key)
     */
    key(index: number): string | null;
    /**
     * The **`removeItem()`** method of the Storage interface, when passed a key name, will remove that key from the given Storage object if it exists. The Storage interface of the Web Storage API provides access to a particular domain's session or local storage.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/removeItem)
     */
    removeItem(key: string): void;
    /**
     * The **`setItem()`** method of the Storage interface, when passed a key name and value, will add that key to the given Storage object, or update that key's value if it already exists.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/setItem)
     */
    setItem(key: string, value: string): void;
    [name: string]: any;
}

export default class Platform {

    constructor() {
        this.setPlatform()
    }

    setPlatform() {
        (globalThis as any)._BK_PLATFORM = this;
    }

    getDefaultRenderer(): IRenderer {
        return ({} as IRenderer)
    }


    getArgs(): string {
        return "";
    }


    getMemoryUsed(): number {
        return 0;
    }
    /* Replacement for BrowserUtil. Returns any extra details the game should know about, for web it returns what browsers its running on */
    getPlatformDetails(): Array<string> {
        return []
    }

    restart(): void {

    }

    getStorage(): IStorage {
        return ({} as IStorage);
    }


    requestAnimationFrame(callback: (ts: number) => void): void {
        callback(0);
    }

    /** 
    Returns the current time in milliseconds.
    Note that this is not the real world time, rather the timestep that is used for calculating animations.
    */
    timeMS(): number {
        return 0;
    }


    onKeyDown: Callback<string> = new Callback()
    onKeyUp: Callback<string> = new Callback()


    public static getCurrent(): Platform {
        return (globalThis as any)._BK_PLATFORM;
    }

}