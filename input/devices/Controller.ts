import BKE from "../../BKE";
import Callback from "../../Callback";
import Destroyable from "../../interfaces/Destroyable";
import DeltaTracker from "../../math/DeltaTracker";
import Dimensions from "../../math/Dimensions";
import Time from "../../math/Time";
import Vector3 from "../../math/Vector3";
import Renderer from "../../renderers/Renderer";
import MathUtil from "../../utilities/MathUtil";
import Input from "../Input";
import ControllerData, { Button, ControllerCursorInputMode, Stick, Trigger, VibrationData } from "./interfaces/ControllerData";


export default class Controller implements Destroyable {
    currentData: ControllerData = {
        LS: { x: 0.0, y: 0.0, pressed: false },
        RS: { x: 0.0, y: 0.0, pressed: false },
        BPAD: { down: false, left: false, right: false, up: false },
        DPAD: { down: false, left: false, right: false, up: false },
        MENU: false,
        VIEW: false,
        L_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: true },
        R_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: true },

        L_SHOULDER: { bumper: false, trigger: 0.0 },
        R_SHOULDER: { bumper: false, trigger: 0.0 },
        GYRO: Vector3.zero(),
        ACCEL: Vector3.zero()
    };
    lastData: ControllerData = {
        LS: { x: 0.0, y: 0.0, pressed: false },
        RS: { x: 0.0, y: 0.0, pressed: false },
        BPAD: { down: false, left: false, right: false, up: false },
        DPAD: { down: false, left: false, right: false, up: false },
        MENU: false,
        VIEW: false,
        L_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: true },
        R_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: true },
        L_SHOULDER: { bumper: false, trigger: 0.0 },
        R_SHOULDER: { bumper: false, trigger: 0.0 },
        GYRO: Vector3.zero(),
        ACCEL: Vector3.zero()
    };
    onPoll: Callback<ControllerData>;
    onDisconnect: Callback<void>;

    constructor() {
        this.onPoll = new Callback();
        this.onDisconnect = new Callback();
    }

    vibrate(data: VibrationData) {

    }
    protected pollsThisSecond = 0;
    hz = 0;
    update() {
        if (BKE._frameCounter === 1) {
            this.hz = this.pollsThisSecond;
            this.pollsThisSecond = 0;
        }
        if (this.cursorInputMode === ControllerCursorInputMode.JOYSTICK) {
            this.pointerUpdate()
        }
    }

    destroy(): void {
        this.onDisconnect.dispatch();
        this.onDisconnect.clear();
        this.onPoll.clear();
        Input.CONTROLLERS.splice(Input.CONTROLLERS.indexOf(this), 1);
    }

    DEADZONE: number = 0.1;

    poll(data: ControllerData) {

        // Adjust controller deadzones
        data.LS = this.adjustStickDeadzone(data.LS);
        data.RS = this.adjustStickDeadzone(data.RS);

        this.lastData = this.currentData;
        this.currentData = data;
        this.onPoll.dispatch(this.currentData);
        Input.poll()

        if (this.cursorInputMode !== ControllerCursorInputMode.JOYSTICK) {
            this.pointerUpdate()
        }
    }

    adjustStickDeadzone(stick: Stick): Stick {
        return { x: Math.abs(stick.x) > this.DEADZONE ? stick.x : 0, y: Math.abs(stick.y) > this.DEADZONE ? stick.y : 0, pressed: stick.pressed }
    }

    protected x: DeltaTracker = new DeltaTracker();
    protected y: DeltaTracker = new DeltaTracker();

    private ox: number = 0;
    private oy: number = 0;

    public cursorInputMode: ControllerCursorInputMode = ControllerCursorInputMode.GYRO;


    pointerUpdate() {
        switch (this.cursorInputMode) {
            case ControllerCursorInputMode.NONE:
                break;
            case ControllerCursorInputMode.RIGHT_TOUCHPAD:
                this.touchpadToPointer()
                break;
            case ControllerCursorInputMode.RIGHT_TOUCHPAD_TO_SCREEN:
                this.touchToScreen()
                break;
            case ControllerCursorInputMode.SINGLE_TOUCHPAD:
                this.touchpadToPointer()
                break;
            case ControllerCursorInputMode.GYRO:
                this.gyroToPointer();
                break;
            case ControllerCursorInputMode.JOYSTICK:
                this.joyToPointer();
                break;
            case ControllerCursorInputMode.JOY_TO_SCREEN:
                this.joyToScreenPointer();
                break;
        }

    }

    touchToScreen() {
        if (this.currentData.R_TOUCHPAD.contact) {
            Input.MOUSE.mousePoll(
                MathUtil.normalize(this.currentData.R_TOUCHPAD.x, -1.0, 1.0, 0, window.innerWidth),
                MathUtil.normalize(this.currentData.R_TOUCHPAD.y, -1.0, 1.0, 0, window.innerHeight),
                Input.MOUSE.currentData
            )
        }
        else {
            this.deltaClear()
        }
    }

    touchpadToPointer() {
        if (this.currentData.R_TOUCHPAD.contact) {
            Input.MOUSE.mousePoll(
                Input.MOUSE.currentData.rawX + this.x.diffOf(MathUtil.normalize(this.currentData.R_TOUCHPAD.x, -1.0, 1.0, 0, window.innerWidth)),
                Input.MOUSE.currentData.rawY + this.y.diffOf(MathUtil.normalize(this.currentData.R_TOUCHPAD.y, -1.0, 1.0, 0, window.innerHeight)),
                Input.MOUSE.currentData
            )
        }
        else {
            this.deltaClear()
        }
    }

    GYRO_DEADZONE: number = 0.25;
    gyroToPointer() {
        let x = this.currentData.GYRO.y * 360;
        if (Math.abs(x) > this.GYRO_DEADZONE) {
            this.ox += x;
        }

        let y = this.currentData.GYRO.x * 360;
        if (Math.abs(y) > this.GYRO_DEADZONE) {
            this.oy += y;
        }

        Input.MOUSE.deltaPoll(
            this.x.diffOf(-this.ox),
            this.y.diffOf(-this.oy),
            Input.MOUSE.currentData,
            false
        )
        if (this.currentData.R_SHOULDER.bumper) {
            this.recenter()
        }
    }

    getType(): ControllerType {
        return ControllerType.GENERIC;
    }

    joyToPointer() {
        Input.MOUSE.mousePoll(
            Input.MOUSE.currentData.rawX + ((this.currentData.LS.x) * ((Input.MOUSE.SENSITIVITY * 10) * BKE.elapsed * 60)),
            Input.MOUSE.currentData.rawY + ((this.currentData.LS.y) * ((Input.MOUSE.SENSITIVITY * 10) * BKE.elapsed * 60)),
            Input.MOUSE.currentData
        )
    }

    private _gyro: boolean = false;
    set gyroEnabled(b: boolean) {
        if (this._gyro !== b) {
            this.toggleGyro(b);
        }
        this._gyro = b;
    }

    get gyroEnabled() {
        return this._gyro;
    }

    protected async toggleGyro(state: boolean) {
        this.gyroEnabled = state;
        return;
    }

    joyToScreenPointer() {
        const dimensions = Renderer.CURRENT.getSafeAreaDimensions()
        const offset = Renderer.CURRENT.getSafeAreaOffset()


        Input.MOUSE.mousePoll(
            MathUtil.normalize(this.currentData.LS.x, -1.0, 1.0, 0, Dimensions.getWidth()),
            MathUtil.normalize(this.currentData.LS.y, -1.0, 1.0, 0, Dimensions.getHeight()),
            Input.MOUSE.currentData,
        )
    }

    protected deltaClear() {
        this.x.clearValue()
        this.y.clearValue()
    }

    private recenter() {
        Input.MOUSE.mousePoll(window.innerWidth / 2, window.innerHeight / 2, Input.MOUSE.currentData)
    }

    public getStickDirection(side: ControllerSide, direction: Directions): number {
        let stick: Stick = this.currentData.LS;
        if (side === ControllerSide.RIGHT) {
            stick = this.currentData.RS;
        }

        switch (direction) {
            case Directions.LEFT:
                return Math.abs(MathUtil.clamp(stick.x, -1.0, 0));
            case Directions.UP:
                return Math.abs(MathUtil.clamp(stick.y, -1.0, 0));

            case Directions.DOWN:
                return Math.abs(MathUtil.clamp(stick.y, 0, 1.0));

            case Directions.RIGHT:
                return Math.abs(MathUtil.clamp(stick.x, 0, 1.0));

        }
    }

    public getButton(side: ControllerSide, button: Buttons): Button {
        if (side === ControllerSide.LEFT) {
            switch (button) {
                case Buttons.STICK:
                    return this.currentData.LS.pressed;
                case Buttons.PAD:
                    return this.currentData.L_TOUCHPAD.pressed;
                case Buttons.PAD_TOUCH:
                    return this.currentData.L_TOUCHPAD.contact;
                case Buttons.BUMPER:
                    return this.currentData.L_SHOULDER.bumper;
                case Buttons.TRIGGER:
                    return this.currentData.L_SHOULDER.trigger > 0.25;
                case Buttons.LEFT:
                    return this.currentData.DPAD.left;
                case Buttons.UP:
                    return this.currentData.DPAD.up;
                case Buttons.DOWN:
                    return this.currentData.DPAD.down;
                case Buttons.RIGHT:
                    return this.currentData.DPAD.right;
                case Buttons.SYSTEM:
                    return this.currentData.VIEW;
            }
        }
        else {
            switch (button) {
                case Buttons.STICK:
                    return this.currentData.RS.pressed;
                case Buttons.PAD:
                    return this.currentData.R_TOUCHPAD.pressed;
                case Buttons.PAD_TOUCH:
                    return this.currentData.R_TOUCHPAD.contact;
                case Buttons.BUMPER:
                    return this.currentData.R_SHOULDER.bumper;
                case Buttons.TRIGGER:
                    return this.currentData.R_SHOULDER.trigger > 0.25;
                case Buttons.LEFT:
                    return this.currentData.BPAD.left;
                case Buttons.UP:
                    return this.currentData.BPAD.up;
                case Buttons.DOWN:
                    return this.currentData.BPAD.down;
                case Buttons.RIGHT:
                    return this.currentData.BPAD.right;
                case Buttons.SYSTEM:
                    return this.currentData.MENU;
            }
        }
    }

    public getButtonAnalog(side: ControllerSide, button: Buttons): Trigger {
        if (side === ControllerSide.LEFT) {
            switch (button) {
                case Buttons.STICK:
                    return this.currentData.LS.pressed ? 1 : 0;
                case Buttons.PAD:
                    return this.currentData.L_TOUCHPAD.pressed ? 1 : 0;
                case Buttons.PAD_TOUCH:
                    return this.currentData.L_TOUCHPAD.contact ? 1 : 0;
                case Buttons.BUMPER:
                    return this.currentData.L_SHOULDER.bumper ? 1 : 0;
                case Buttons.TRIGGER:
                    return this.currentData.L_SHOULDER.trigger;
                case Buttons.LEFT:
                    return this.currentData.DPAD.left ? 1 : 0;
                case Buttons.UP:
                    return this.currentData.DPAD.up ? 1 : 0;
                case Buttons.DOWN:
                    return this.currentData.DPAD.down ? 1 : 0;
                case Buttons.RIGHT:
                    return this.currentData.DPAD.right ? 1 : 0;
                case Buttons.SYSTEM:
                    return this.currentData.VIEW ? 1 : 0;
            }
        }
        else {
            switch (button) {
                case Buttons.STICK:
                    return this.currentData.RS.pressed ? 1 : 0;
                case Buttons.PAD:
                    return this.currentData.R_TOUCHPAD.pressed ? 1 : 0;
                case Buttons.PAD_TOUCH:
                    return this.currentData.R_TOUCHPAD.contact ? 1 : 0;
                case Buttons.BUMPER:
                    return this.currentData.R_SHOULDER.bumper ? 1 : 0;
                case Buttons.TRIGGER:
                    return this.currentData.R_SHOULDER.trigger;
                case Buttons.LEFT:
                    return this.currentData.BPAD.left ? 1 : 0;
                case Buttons.UP:
                    return this.currentData.BPAD.up ? 1 : 0;
                case Buttons.DOWN:
                    return this.currentData.BPAD.down ? 1 : 0;
                case Buttons.RIGHT:
                    return this.currentData.BPAD.right ? 1 : 0;
                case Buttons.SYSTEM:
                    return this.currentData.MENU ? 1 : 0;
            }
        }
    }

}

export enum ControllerType {
    DUALSENSE,
    WIIMOTE,
    GENERIC,
    JOYCON,
}

export enum Directions {
    LEFT,
    UP,
    DOWN,
    RIGHT,
}

export enum ControllerSide {
    LEFT,
    RIGHT,
}


export enum Buttons {
    STICK,
    PAD,
    PAD_TOUCH,
    BUMPER,
    TRIGGER,
    LEFT,
    UP,
    DOWN,
    RIGHT,
    // Menu / View
    SYSTEM
}


export interface ControllerButton {
    side: ControllerSide;
    button: Buttons;
}

export interface StickDirection {
    side: ControllerSide;
    direction: Directions;
}