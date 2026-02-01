import Vector2 from "../../../math/Vector2";
import Vector3 from "../../../math/Vector3";

export type Button = boolean;


export type Bumper = Button;

// Most console triggers are analogue
export type Trigger = number;

export interface Shoulder {
    bumper: Bumper;
    trigger: Trigger;
}

export interface Stick extends Vector2 {
    pressed: boolean;
}

export interface Trackpad extends Stick {
    contact:boolean;
    multifinger:boolean;
}

export interface Pad {
    left: Button;
    up: Button;
    down: Button;
    right: Button;
}




// For the sake of genericness and simplicity, this is based off a Steam Controller (2026)
export default interface Controller {
    LS: Stick;
    RS: Stick;
    L_TOUCHPAD: Trackpad;
    R_TOUCHPAD: Trackpad;
    L_SHOULDER: Shoulder;
    R_SHOULDER: Shoulder;

    DPAD: Pad;
    BPAD: Pad;
    MENU: Button;
    VIEW: Button;
    GYRO: Vector3;
    ACCEL: Vector3;
}

export interface VibrationData {
    durationMS:number,
    lowFreq?:number,
    highFreq?:number,
    startDelayMS?:number,
    strongMagnitude?:number,
    weakMagnitude?:number,
    leftTrigger?:number,
    rightTrigger?:number
}


export enum ControllerCursorInputMode {
    NONE,
    SINGLE_TOUCHPAD,
    RIGHT_TOUCHPAD,
    RIGHT_TOUCHPAD_TO_SCREEN,
    GYRO,
    JOYSTICK,
    JOY_TO_SCREEN
}