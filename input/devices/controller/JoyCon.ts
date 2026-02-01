import Callback from "../../../Callback";
import Timeout from "../../../math/Timeout";
import Vector2 from "../../../math/Vector2";
import Vector3 from "../../../math/Vector3";
import MathUtil from "../../../utilities/MathUtil";
import Controller, { ControllerType } from "../Controller";
import { ControllerCursorInputMode, Stick, VibrationData } from "../interfaces/ControllerData";
import HIDController from "./HIDController";

export default class JoyCon extends HIDController {
    constructor(device: HIDDevice) {
        super(device)
    }

    buttons1: number = 0x0;
    buttons2: number = 0x0;
    buttons3: number = 0x0;

    isLeft: boolean = false;
    override open() {
        this.isLeft = this.device.productId === 0x2006;
        this.GYRO_DEADZONE = (7 / 12);
        this.DEADZONE = 0.15;
        // this.cursorInputMode = ControllerCursorInputMode.JOYSTICK;
        // Enable gyro
        this.sendCommand(Features.PLAYER_LIGHT, 0x01).then(() => {
           this.sendCommand(Features.INPUT_MODE, Report.STANDARD_INPUT).then(() => {
                // Standard input mode
                this.toggleGyro(true)
            })
        })

    }

    protected override async toggleGyro(state: boolean): Promise<void> {
        await this.sendCommand(Features.GYRO, state ? State.ON : State.OFF)
        return super.toggleGyro(state);
    }

    vibrationTimer: Timeout = new Timeout(() => { }, 0)
    allowNextRumble: boolean = true;
    override vibrate(data: VibrationData): void {
        if (!this.allowNextRumble) {
            return;
        }
        this.vibrationTimer.destroy();
        this.onVibrationRecieve.clear();
        this.sendCommand(Features.RUMBLE, State.ON).then(() => {
            const lf = data.lowFreq === undefined ? 0 : data.lowFreq;
            const hf = data.highFreq === undefined ? 0 : data.highFreq;
            this.rumble(lf, hf, MathUtil.mean(data.weakMagnitude === undefined ? 1 : data.weakMagnitude, data.strongMagnitude === undefined ? 1 : data.strongMagnitude)).then(() => {
                this.onVibrationRecieve.addOnce(() => {
                    this.allowNextRumble = true;

                    this.vibrationTimer = new Timeout(() => {
                        this.sendCommand(Features.RUMBLE, State.OFF)
                    }, data.durationMS)
                })
            })

        });
    }


    override update(): void {
        super.update();
    }


    second: JoyCon | null = null;
    connectSecond(joycon: JoyCon) {
        if (this.second !== null) {
            return;
        }
        this.second = joycon;
        this.second.onPoll.add((data) => {
            this.poll(data)
        })
    }

    private rumble(
        lowFrequency: number,
        highFrequency: number,
        amplitude: number
    ) {
        const data = new Uint8Array(9);

        data[0] = 0x00;

        let lf: number = lowFrequency === 0 ? 0 : MathUtil.clamp(lowFrequency, 40.875885, 626.286133);
        let hf: number = highFrequency === 0 ? 0 : MathUtil.clamp(highFrequency, 81.75177, 1252.572266);

        hf = (Math.round(32 * Math.log2(hf * 0.1)) - 0x60) * 4;
        lf = Math.round(32 * Math.log2(lf * 0.1)) - 0x40;

        const amp: number = MathUtil.clamp(amplitude, 0, 1.0);

        let hfAmp: number;
        if (amp === 0) {
            hfAmp = 0;
        } else if (amp < 0.117) {
            hfAmp = (Math.log2(amp * 1000) * 32 - 0x60) / (5 - amp ** 2) - 1;
        } else if (amp < 0.23) {
            hfAmp = Math.log2(amp * 1000) * 32 - 0x60 - 0x5c;
        } else {
            hfAmp = (Math.log2(amp * 1000) * 32 - 0x60) * 2 - 0xf6;
        }

        let lfAmp: number = Math.round(hfAmp) * 0.5;
        const parity: number = lfAmp % 2;
        if (parity > 0) {
            --lfAmp;
        }
        lfAmp = lfAmp >> 1;
        lfAmp += 0x40;
        if (parity > 0) {
            lfAmp |= 0x8000;
        }

        data[1] = hf & 0xff;
        data[2] = hfAmp + ((hf >> 8) & 0xff);
        data[3] = lf + ((lfAmp >> 8) & 0xff);
        data[4] = lfAmp & 0xff;

        for (let i = 0; i < 4; i++) {
            data[5 + i] = data[1 + i];
        }

        return this.device.sendReport(Report.DATA, data);
    }

    private sendCommand(...command: Array<number>) {
        const data = [
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            ...command
        ];
        return this.device.sendReport(Report.DATA, new Uint8Array(data));
    }

    onVibrationRecieve: Callback<void> = new Callback();

    static readonly gyroCoeff = 0.0001694;
    static readonly gyroLower = 1;

    private lStick: Vector2 = Vector2.zero();
    private rStick: Vector2 = Vector2.zero();

    private gyro: Vector3 = Vector3.zero()
    override onData(reportID: number, data: DataView): void {
        if (reportID === Report.SIMPLE_INPUT) {
            this.open()
            return;
        }
        if (reportID === Report.RUMBLE_ACTIVATED) {
            this.onVibrationRecieve.dispatch();
        }
        if (reportID === Report.STANDARD_INPUT) {
            this.pollsThisSecond++;

            this.buttons1 = data.getUint8(2);
            this.buttons2 = data.getUint8(3);
            this.buttons3 = data.getUint8(4);

            this.lStick = this.getStick(5, data);
            this.rStick = this.getStick(8, data);

            this.gyro.z = data.getInt16(30, true) * JoyCon.gyroCoeff;
             this.gyro.x = (this.isLeft ? -1 : 1) * data.getInt16(32, true) * JoyCon.gyroCoeff;
            this.gyro.y = (this.isLeft ? 1 : -1) * data.getInt16(34, true) * JoyCon.gyroCoeff;
            // this.gyro = ne  w Vector3(gyroY, gyroZ, gyroX);


            const accelX = data.getInt16(24, true) * JoyCon.gyroCoeff;
            const accelY = (this.isLeft ? -1 : 1) * data.getInt16(26, true) * JoyCon.gyroCoeff;
            const accelZ = (this.isLeft ? 1 : -1) * data.getInt16(28, true) * JoyCon.gyroCoeff;
        }
        this.poll({
            LS: { x: this.lStick.x, y: this.lStick.y, pressed: this.on(this.buttons2, JoyConButtons.LS) },
            RS: { x: this.rStick.x, y: this.rStick.y, pressed: this.on(this.buttons2, JoyConButtons.RS) },
            BPAD: {
                left: this.on(this.buttons1, JoyConButtons.Y),
                up: this.on(this.buttons1, JoyConButtons.X),
                down: this.on(this.buttons1, JoyConButtons.B),
                right: this.on(this.buttons1, JoyConButtons.A)
            },
            DPAD: {
                left: this.on(this.buttons3, JoyConButtons.LEFT),
                up: this.on(this.buttons3, JoyConButtons.UP),
                down: this.on(this.buttons3, JoyConButtons.DOWN),
                right: this.on(this.buttons3, JoyConButtons.RIGHT)
            },
            VIEW: this.on(this.buttons2, JoyConButtons.MINUS),

            MENU: this.on(this.buttons2, JoyConButtons.PLUS),
            L_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: false },
            R_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: false },
            L_SHOULDER: { bumper: this.on(this.buttons3, JoyConButtons.L), trigger: this.on(this.buttons3, JoyConButtons.ZL) ? 1 : 0 },
            R_SHOULDER: { bumper: this.on(this.buttons1, JoyConButtons.R), trigger: this.on(this.buttons1, JoyConButtons.ZR) ? 1 : 0 },
            GYRO: this.gyro,
            ACCEL: Vector3.zero()
        })
    }

    // TODO: get calibration data from the spi of joycon
    getStick(offset: number, data: DataView) {

        const stickData = [data.getUint8(offset), data.getUint8(offset + 1), data.getUint8(offset + 2)];
        let stick = Vector2.zero()
        if (stickData[0] !== 0 && stickData[1] !== 0 && stickData[2] !== 0) {

            const stickH = stickData[0] | ((stickData[1] & 0x0f) << 8) - 1930;
            const stickV = (stickData[1] >> 4) | (stickData[2] << 4) - 2067;

            //console.log(lStickH, lStickV);
            if (stickH < 0) {
                stick.x = stickH / 1117;
            } else {
                stick.x = stickH / 1204;
            }
            if (stickV < 0) {
                stick.y = stickV / 1103;
            } else {
                stick.y = stickV / 1134;
            }
            //console.log(lStickHNormalization, lStickVNormalization);
        }
        stick.y = -stick.y;
        stick = { x: MathUtil.clamp(stick.x, -1.0, 1.0), y: MathUtil.clamp(stick.y, -1.0, 1.0) }
        return stick;
    }

    override getType(): ControllerType {
        return ControllerType.JOYCON;
    }
}



enum JoyConButtons {
    // Byte 1
    RSL = 0x20,
    RSR = 0x10,
    R = 0x40,
    ZR = 0x80,
    A = 0x08,
    B = 0x04,
    X = 0x02,
    Y = 0x01,
    // Byte 2
    MINUS = 0x01,
    PLUS = 0x02,
    LS = 0x08,
    RS = 0x04,
    HOME = 0x10,
    CAPTURE = 0x20,
    // Byte 3
    ZL = 0x80,
    L = 0x40,
    LSL = 0x20,
    LSR = 0x10,
    LEFT = 0x08,
    RIGHT = 0x04,
    UP = 0x02,
    DOWN = 0x01,
}

enum Report {
    DATA = 0x01,
    DEVICE_INFO = 0x02,
    RUMBLE_ACTIVATED = 0x21,
    SIMPLE_INPUT = 0x3f,
    STANDARD_INPUT = 0x30
}

enum Features {
    REQUEST_DEVICE_INFO = 0x02,
    INPUT_MODE = 0x03,
    PLAYER_LIGHT = 0x30,
    GYRO = 0x40,
    RUMBLE = 0x48,
}

enum State {
    ON = 0x01,
    OFF = 0x00,
}

enum Calibration {
    XAxisCenter = 0x79f,
    YAxisCenter = 0x8a0,
    XAxisMinBelowCenter = 0x510,
    YAxisMinBelowCenter = 0x479,
    XAxisMaxBelowCenter = 0x4f7,
    YAxisMaxBelowCenter = 0x424,
}