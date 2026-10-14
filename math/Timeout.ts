import Destroyable from "../interfaces/Destroyable";
import MathUtil from "../utilities/MathUtil";

export default class Timeout implements Destroyable {
    id: number;
    callback: VoidFunction;
    _tick: any;
    constructor(callback: VoidFunction, ms: number = 5000) {
        this.id = MathUtil.getRandomID()
        this.callback = callback;
        this._tick = setTimeout(() => {
            this.callback();
        }, ms);
    }


    destroy() {
        clearTimeout(this._tick)
    }
}