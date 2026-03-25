import BKE from "../BKE";
import Updatable from "../interfaces/Updatable";
import Time from "../math/Time";
import { Sprite } from "../Sprite";
import MathUtil from "../utilities/MathUtil";

export default class PollStatistics implements Updatable {
    hz: number = 0;
    averageHz: number = 0;
    averageNums: number[] = [];


    pollsThisSecond: number = 0;

    pollElapsed: number = 0;
    lastTime: number = 0;
    poll() {
        this.pollsThisSecond++;
        this.updateElapsed()
    }

    updateElapsed() {
        const time = Time.getMS()
        this.pollElapsed = (time - this.lastTime)/1000;

        this.lastTime = time;
    }

    update(elapsed: number) {

        if (BKE._frameCounter === 1) {
        this.updateElapsed()

            this.hz = this.pollsThisSecond;
            if (this.hz !== 0) {
                this.averageNums.push(this.hz);
                if (this.averageNums.length >= 16) {
                    this.averageNums.splice(0, 1)
                }
                this.averageHz = (MathUtil.sum(this.averageNums)) / this.averageNums.length;
            }

            this.pollsThisSecond = 0;
        }
    }
}