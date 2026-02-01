import Destroyable from "../interfaces/Destroyable";
import MathUtil from "../utilities/MathUtil";

export default class Timeout implements Destroyable {
    id: string;
    callback: VoidFunction;
    _tick: number;
    constructor(callback: VoidFunction, ms: number = 5000) {
        this.id = window.btoa(`${MathUtil.getRandomID()}`);
        this.callback = callback;
        this._tick = window.setTimeout(() => {
            this.callback();
        }, ms);
    }


    destroy() {
        window.clearTimeout(this._tick)
    }
}