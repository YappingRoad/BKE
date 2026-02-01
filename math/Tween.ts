import Callback from "../Callback";
import MathUtil from "../utilities/MathUtil";
import Ease, { EaseFunction } from "./Ease";
import Time from "./Time";

export default class Tween {
    private static tweens: Array<Tween> = [];

    current: number;
    destination: number;
    duration: number;
    ease: EaseFunction;
    onUpdate: (v: number) => void;

    onComplete: Callback<void> = new Callback();

    started: boolean = false;

    private startTime: number = -1;

    /* 0.0 to 1.0 how completed is this tween */
    completed: number = 0.0;

    value: number = 0.0;

    public options: TweenOptions;
    constructor(options: TweenOptions) {
        this.options = options;

        this.current = this.options.current;
        this.value = this.current;

        this.destination = this.options.destination;
        this.duration = this.options.duration;
        this.ease = this.options.ease === undefined ? Ease.linear : this.options.ease;
        this.onUpdate = this.options.onUpdate;

    }

    get inProgress(): boolean {
        return this.started && (this.completed !== 1.0);
    }

    public start() {
        this.completed = 0;

        this.startTime = Time.get();

        this.current = this.options.current;
        this.value = this.current;
        this.destination = this.options.destination;
        this.duration = this.options.duration;
        this.ease = this.options.ease === undefined ? Ease.linear : this.options.ease;
        this.onUpdate = this.options.onUpdate;

        this.started = true;
        Tween.tweens.push(this);
    }

    public static from(options: TweenOptions): Tween {
        return new Tween(options);
    }

    public tick() {
        if (!this.started || this.completed === 1.0) { return };
        let currentTime = Time.get();
        let totalElapsed = currentTime - this.startTime;

        let percentage = MathUtil.bound(totalElapsed / this.duration, 0.0, 1.0);

        this.value = this.current + ((this.destination - this.current) * this.ease(percentage));
        this.onUpdate(this.value);
        if (percentage >= 1.0 && 1.0 > this.completed) {
            this.complete();
        }
        this.completed = percentage;
    }

    public stop() {
        this.started = false;
        let index = Tween.tweens.indexOf(this);
        if (index != -1) {
            Tween.tweens.splice(index, 1);
        }
    }


    public complete(broadcast: boolean = true) {
        this.value = this.destination;
        this.completed = 1.0;
        if (broadcast) {
            this.onUpdate(this.value);
            this.onComplete.dispatch();
            this.onComplete.removeAll();
        }
        let index = Tween.tweens.indexOf(this);
        if (index != -1) {
            Tween.tweens.splice(index, 1);
        }
    }

    public static update() {
        for (const tween of Tween.tweens) {
            tween.tick();
        }
    }
}

export interface TweenOptions {
    current: number,
    destination: number,
    duration: number,
    ease?: EaseFunction,
    onUpdate: (v: number) => void
}

