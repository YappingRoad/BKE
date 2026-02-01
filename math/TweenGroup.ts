import LogicUtil from "../utilities/LogicUtil";
import Tween, { TweenOptions } from "./Tween";

export default class TweenGroup {
    private tweens: Tween[];
    constructor(tweens: Tween[]) {
        this.tweens = tweens;
    }


    

    start() {
        for (const tween of this.tweens) {
            tween.start()
        }
    }

    get inProgress(): boolean {
        let bools = [];
        for (const tween of this.tweens) {
            bools.push(tween.inProgress);
        }
        return LogicUtil.and(bools);
    }


    complete(broadcast: boolean = true) {
        for (const tween of this.tweens) {
            tween.complete(broadcast)
        }
    }

    stop() {
        for (const tween of this.tweens) {
            tween.stop()
        }
    }

    clear(broadcast: boolean = true) {
        for (const tween of this.tweens) {
            tween.complete(broadcast)
        }
        this.tweens = []
    }


    public static from(...options: TweenOptions[]): TweenGroup {
        let tweens: Tween[] = [];
        for (const option of options) {
            tweens.push(Tween.from(option));
        }
        return new TweenGroup(tweens);
    }
}