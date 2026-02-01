import Callback from "../../Callback";
import Dimensions from "../../math/Dimensions";
import MathUtil from "../../utilities/MathUtil";
import Input from "../Input";

export default class Motion {

    orientationX: number = 0;
    orientationY: number = 0;
    orientationZ: number = 0;
    orientationDeltaX: number = 0;
    orientationDeltaY: number = 0;
    orientationDeltaZ: number = 0;
    cursorX: number = 0;
    cursorY: number = 0;
    cursorRotation: number = 0;
    available:boolean = false;

    public onMotionPoll: Callback<void>;
    constructor() {
        this.onMotionPoll = new Callback();
        this.request();
    }

    request() {
        if (!window.DeviceOrientationEvent) return;
        if ("requestPermission" in DeviceOrientationEvent) {
            (DeviceOrientationEvent.requestPermission as () => Promise<string>)().then((status) => {
                if (status === "granted") {
                    this.initializeMotionEvent();
                }
            });
        }
        else {
            this.initializeMotionEvent();
        }
    }

    private yDelta(prev: number, curr: number): number {
        let d = curr - prev;
        if (d > 90) d -= 180;
        else if (d <= -90) d += 180; 
        return d;
    }

    private delta180(prev: number, curr: number): number {
        let d = curr - prev;
        if (d > 180) d -= 360;
        else if (d <= -180) d += 360;
        return d;
    }


    initializeMotionEvent() {
        this.available = true;
        window.addEventListener("deviceorientation", (ev) => {
            if (ev.beta != null) {
                this.orientationDeltaX = this.delta180(this.orientationX, ev.beta);
                this.orientationX = ev.beta;
            }

            if (ev.gamma != null) {
                this.orientationDeltaY = this.yDelta(this.orientationY, ev.gamma);
                this.orientationY = ev.gamma;
            }
            
            if (ev.alpha != null) {
                // todo, is there literally any better way to do this
                let normalized = MathUtil.normalize((ev.alpha), 0, 360, -180, 180);
                if (normalized > 0) {
                    normalized = 180 - normalized;
                }
                else {
                    normalized = -(180 + normalized);
                }

                this.orientationDeltaZ = this.delta180(this.orientationZ, normalized);
                this.orientationZ = normalized;
                //  this.orientationZ = MathUtil.normalize((ev.alpha), 180, 360, 0.0, 1.0);
            }
            this.cursorX = (MathUtil.bound(this.orientationZ, -90, 90) / 90) * Dimensions.GAME_WIDTH + Dimensions.GAME_WIDTH / 2;
            this.cursorRotation = this.orientationY;
            this.cursorY = (MathUtil.bound(this.orientationX, -45, 45) / -45) * Dimensions.GAME_HEIGHT + Dimensions.GAME_HEIGHT / 2;
            this.onMotionPoll.dispatch();
            Input.poll()
        });

    }
}