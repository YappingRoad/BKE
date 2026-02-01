import Vector3 from "../../../math/Vector3";
import Controller, { ControllerType } from "../Controller";
import { Button, Pad, Stick, Trigger } from "../interfaces/ControllerData";

export default class JSGamepad extends Controller {
    index: number;
    gamepad: Gamepad;
    constructor(index: number) {
        super()
        this.index = index;
        this.gamepad = navigator.getGamepads()[this.index] as Gamepad;
    }

    override update() {
        this.gamepad = navigator.getGamepads()[this.index] as Gamepad;

        if (this.gamepad === null) {
            return;
        }
        const timeSincePoll = (document.timeline.currentTime as number) - this.gamepad.timestamp;
        if (10000 > timeSincePoll) {
            this.poll({
                LS: this.convertToStick(0, 1, 10),
                RS: this.convertToStick(2, 3, 11),
                DPAD: this.convertToPad(14, 12, 13, 15),
                BPAD: this.convertToPad(2, 3, 0, 1),
                VIEW: this.convertToButton(8),
                MENU: this.convertToButton(9),
                L_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: true },
                R_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: true },
                L_SHOULDER: { bumper: this.convertToButton(4), trigger: this.convertToTrigger(6) },
                R_SHOULDER: { bumper: this.convertToButton(5), trigger: this.convertToTrigger(7) },
                GYRO: Vector3.zero(),
                ACCEL: Vector3.zero()
            })
        }
        super.update()
    }

    private convertToStick(x: number, y: number, button: number): Stick {
        return { x: this.gamepad.axes[x], y: this.gamepad.axes[y], pressed: this.gamepad.buttons[button].value > 0 };
    }

    private convertToPad(left: number, up: number, down: number, right: number): Pad {
        return { left: this.gamepad.buttons[left].pressed, up: this.gamepad.buttons[up].pressed, down: this.gamepad.buttons[down].pressed, right: this.gamepad.buttons[right].pressed };
    }

    private convertToButton(id: number): Button {
        return this.gamepad.buttons[id].pressed;
    }

    private convertToTrigger(id: number): Trigger {
        return this.gamepad.buttons[id].value;
    }

    override getType(): ControllerType {
        return ControllerType.GENERIC;
    }

}