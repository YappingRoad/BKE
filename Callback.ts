import MathUtil from "./utilities/MathUtil";

export type CallbackID = number;
export default class Callback<T> {
    private idCallbacks: Map<number, (val: T) => void> = new Map();
    private callbacks: Array<(val: T) => void> = [];
    private idOnceCallbacks: Map<number, (val: T) => void> = new Map();
    private onceCallbacks: Array<(val: T) => void> = [];
    constructor() { }

    private static CALLBACKS_LOADED: number = 0;

    dispatch(value: T) {
        for (const callback of this.idCallbacks.values()) {
            callback(value);
        }
        for (const callback of this.callbacks) {
            callback(value);
        }

        for (const callback of this.idOnceCallbacks.values()) {
            callback(value);
        }
        this.idOnceCallbacks.clear()
        for (const callback of this.onceCallbacks) {
            callback(value);
        }
        this.onceCallbacks = [];


    }


    private getID(): CallbackID {
        let num = MathUtil.getRandomID();
        if (this.idCallbacks.has(num)) {
            return this.getID();
        }
        return num;
    }

    addID(callback: (val: T) => void): CallbackID {
        let id = this.getID();
        this.idCallbacks.set(id, callback);
        return id;
    }

    add(callback: (val: T) => void) {
        this.callbacks.push(callback);
    }


    addIDOnce(callback: (val: T) => void): CallbackID {
        let id = this.getID();
        this.idOnceCallbacks.set(id, callback);
        return id;

    }

    addOnce(callback: (val: T) => void) {
        this.onceCallbacks.push(callback);

    }

    remove(callback: (val: T) => void) {
        if (this.callbacks.includes(callback)) {
            this.callbacks.splice(this.callbacks.indexOf(callback), 1);
            return;
        }

        if (this.onceCallbacks.includes(callback)) {
            this.onceCallbacks.splice(this.onceCallbacks.indexOf(callback), 1);
            return;
        }

    }

    removeID(id: CallbackID) {
        if (this.idCallbacks.delete(id)) {
        }

    }

    removeAll() {
        this.callbacks = [];
        this.onceCallbacks = [];

        this.idOnceCallbacks.clear();
        this.idCallbacks.clear();


    }

    // ive written this accidentally so many times that im just going to make it an alias
    clear() {
        this.removeAll();
    }
}