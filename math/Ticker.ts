import Callback from "../Callback";
import Updatable from "../interfaces/Updatable";

export default class Ticker implements Updatable {
    interval: number;

    constructor(interval: number) {
        this.interval = interval;
    }

    timer: number = 0.00;

    last: number = 0;
    callback: Callback<void> = new Callback();

    update(elapsed: number): void {
        this.timer += elapsed;

        let current = Math.trunc(this.timer / this.interval);
        if (current > this.last) {
            this.callback.dispatch();
        }

        this.last = current;
    }

}
