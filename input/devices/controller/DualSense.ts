import { Analog, Dpad, Dualsense as Driver, DualsenseHID, DualsenseHIDState, HIDProvider, InputEventType, TriggerMode, Unisense, WebHIDProvider } from "dualsense-ts";
import Controller, { ControllerType } from "../Controller";
import ControllerData, { Pad, Shoulder, Stick, VibrationData } from "../interfaces/ControllerData";
import Input from "../../Input";
import MathUtil from "../../../utilities/MathUtil";
import DeltaTracker from "../../../math/DeltaTracker";
import Dimensions from "../../../math/Dimensions";
import Callback from "../../../Callback";
export default class DualSense extends Controller {
    private driver!: Driver;
    index: number;
    gamepad: Gamepad;
    constructor(index: number) {
        super()
        this.index = index;
        this.gamepad = navigator.getGamepads()[this.index] as Gamepad;
        this.load()
    }


    async load() {
        const isWebHID = (provider: HIDProvider): provider is WebHIDProvider =>
            "getRequest" in provider;


        this.driver = new Driver();

        const requestPermission = isWebHID(this.driver.hid.provider)
            ? this.driver.hid.provider.getRequest()
            : () => console.log("WebHID is unavailable");

        requestPermission();
        // this.driver.hid.setRightTriggerFeedback(0x2, [20, 128, 20])

        this.driver.hid.register(() => {
            this.pollsThisSecond++;
            this.poll(DualSense.convert(this.driver.hid.state))
        })

    }

    override vibrate(data: VibrationData): void {
        this.gamepad = navigator.getGamepads()[this.index] as Gamepad;
        if (this.gamepad.vibrationActuator !== null) {
            this.gamepad.vibrationActuator.playEffect("dual-rumble", {
                duration: data.durationMS,
                leftTrigger: data.leftTrigger,
                rightTrigger: data.rightTrigger,
                startDelay: data.startDelayMS,
                strongMagnitude: data.strongMagnitude,
                weakMagnitude: data.weakMagnitude,
            })
        }
        // this.driver.hid.setRumble(data.strongMagnitude === undefined ? 0 : data.strongMagnitude,data.weakMagnitude === undefined ? 0 : data.weakMagnitude)
    }



    private static convert(state: DualsenseHIDState): ControllerData {
        return {
            // We need to flip the y to match other gamepads
            LS: { x: state.LX, y: -state.LY, pressed: state.L3 },
            RS: { x: state.RX, y: -state.RY, pressed: state.R3 },
            BPAD: { down: state.Cross, left: state.Square, right: state.Circle, up: state.Triangle },
            DPAD: { down: state.Down, left: state.Left, right: state.Right, up: state.Up },
            MENU: state.Options,
            VIEW: state.Create,
            L_TOUCHPAD: { x: state.TouchX0, y: state.TouchY0, pressed: state.TouchButton, contact: state.TouchContact0, multifinger: state.TouchContact1 },
            R_TOUCHPAD: { x: state.TouchX0, y: state.TouchY0, pressed: state.TouchButton, contact: state.TouchContact0, multifinger: state.TouchContact1 },
            L_SHOULDER: { bumper: state.L1, trigger: state.L2 },
            R_SHOULDER: { bumper: state.R1, trigger: state.R2 },
            GYRO: { x: state.GyroX, y: state.GyroY, z: state.GyroZ },
            ACCEL: { x: state.AccelX, y: state.AccelY, z: state.AccelZ }
        }
    }




    override getType(): ControllerType {
        return ControllerType.DUALSENSE;
    }

}