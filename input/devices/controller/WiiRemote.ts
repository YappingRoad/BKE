import { Input } from "dualsense-ts";
import Vector2 from "../../../math/Vector2";
import Vector3 from "../../../math/Vector3";
import MathUtil from "../../../utilities/MathUtil";
import Controller, { ControllerType } from "../Controller";
import { ControllerCursorInputMode, VibrationData } from "../interfaces/ControllerData";
import Timeout from "../../../math/Timeout";
import HIDController from "./HIDController";

export default class WiiRemote extends HIDController {

    // most hacked together pile of shit that actually works
    constructor(device: HIDDevice) {
        super(device)

    }

    override open() {
        this.openAsync().then(() => {
            super.open()
        })
    }

    async openAsync() {
        const sensitivity = IRSensitivity.LEVEL_0;
        const sensitivityBlock = IRSensitivity.BLOCK_0;
        const dataType = IRDataType.EXTENDED;

        await this.device.sendReport(0x12, this.createBuffer(0x00, 0x33));
        await this.device.sendReport(0x13, this.createBuffer(0x04));


        await this.device.sendReport(0x1a, this.createBuffer(0x04));
        await this.writeRegister(RegisterType.CONTROL, 0xb00030, [0x08])

        //set sensitivity block part 1
        await this.writeRegister(RegisterType.CONTROL, 0xb00000, sensitivity)

        //Set sensitivity block part 2
        await this.writeRegister(RegisterType.CONTROL, 0xb0001a, sensitivityBlock)

        //Set data mode number 
        await this.writeRegister(RegisterType.CONTROL, 0xb00033, [dataType])

        await this.writeRegister(RegisterType.CONTROL, 0xb00030, [0x08])
    }

    override getType(): ControllerType {
        return ControllerType.WIIMOTE
    }

    buttons1: number = 0x0;
    buttons2: number = 0x0;
    lastValidPoint: Vector2 = Vector2.zero();
    override onData(reportID: number, data: DataView) {

        this.cursorInputMode = ControllerCursorInputMode.RIGHT_TOUCHPAD_TO_SCREEN;
        this.pollsThisSecond++;
        if (reportID === 0x33) {
            this.buttons1 = data.getUint8(0);
            this.buttons2 = data.getUint8(1);
            this.decodePoints(data.buffer.slice(5) as ArrayBuffer)

            if (this.trackedPoints.length >= 2) {
                const point = Vector2.midpoint(...this.trackedPoints);

                this.lastValidPoint = point;
            }

            let x = MathUtil.normalize(this.lastValidPoint.x, ((1023 - 640) / 2), 1023 - ((1023 - 640) / 2), 1.0, -1.0);
            let y = MathUtil.normalize(this.lastValidPoint.y, ((767 - 480) / 2), 767 - ((767 - 480) / 2), -1.0, 1.0);
            this.poll({
                LS: { x: 0.0, y: 0.0, pressed: false },
                RS: { x: 0.0, y: 0.0, pressed: false },

                DPAD: {
                    left: this.on(this.buttons1, WiiButtons.LEFT),
                    up: this.on(this.buttons1, WiiButtons.UP),
                    down: this.on(this.buttons1, WiiButtons.DOWN),
                    right: this.on(this.buttons1, WiiButtons.RIGHT),
                },
                BPAD: {
                    left: this.on(this.buttons2, WiiButtons.ONE),
                    up: this.on(this.buttons2, WiiButtons.TWO),
                    down: this.on(this.buttons2, WiiButtons.A),
                    right: this.on(this.buttons2, WiiButtons.B)
                },
                VIEW: this.on(this.buttons2, WiiButtons.MINUS),
                MENU: this.on(this.buttons1, WiiButtons.PLUS),
                L_TOUCHPAD: { x: 0, y: 0, pressed: false, contact: false, multifinger: false },
                R_TOUCHPAD: { x: x, y: y, pressed: false, contact: this.trackedPoints.length >= 2, multifinger: false },
                L_SHOULDER: { bumper: this.on(this.buttons1, WiiButtons.PLUS), trigger: 0.0 },
                R_SHOULDER: { bumper: this.on(this.buttons2, WiiButtons.MINUS), trigger: 0.0 },
                GYRO: Vector3.zero(),
                ACCEL: Vector3.zero()
            })
        }

        // console.log(reportID.toString(16), data)
    }

    trackedPoints: Vector3[] = [];

    // Modified from: 
    // https://github.com/PicchiKevin/wiimote-webhid/blob/dd72f846159020d1dac665b29913b5bb34dd3e0c/src/wiimote.js#L156
    decodePoints(array: ArrayBuffer) {
        this.trackedPoints = [];
        const data = new DataView(array)
        for (let index = 0; index < 12; index += 3) {
            if (data.getUint8(index) != 255 && data.getUint8(index + 1) != 255 && data.getUint8(index + 2) != 255) {
                let x = data.getUint8(index)
                let y = data.getUint8(index + 1)
                let size = data.getUint8(index + 2)
                x |= (size & 0x30) << 4
                y |= (size & 0xc0) << 2

                this.trackedPoints.push({
                    x: x,
                    y: y,
                    z: size
                })
            }
        }
    }

    vibrationTimeout: Timeout = new Timeout(() => { }, 0);
    override vibrate(data: VibrationData): void {
        this.vibrationTimeout.destroy()

        if (data.startDelayMS !== undefined) {
            this.vibrationTimeout = new Timeout(() => {
                this.vibrateForMS(data.durationMS)
            }, data.startDelayMS)
        }
        else {
            this.vibrateForMS(data.durationMS)
        }
    }

    vibrateForMS(durationMS: number) {
        this.vibrationTimeout.destroy()
        durationMS = Math.max(40, durationMS)
        this.device.sendReport(0x10, this.createBuffer(0x01)).then(() => {
            this.vibrationTimeout = new Timeout(() => {
                this.device.sendReport(0x10, this.createBuffer(0x00));
            }, durationMS)
        });


    }





    private createBuffer(...v: number[]): Uint8Array<ArrayBuffer> {
        const buffer = new Uint8Array(v.length)

        buffer.set(v);

        // console.log(buffer)
        return buffer;
    }

    toBigEndian(n: number, size: number) {
        let buffer = new Array()

        n.toString(16).match(/.{1,2}/g)?.map(x => {
            let v = "0x" + x
            let a = Number(v);
            buffer.push(a)
        })

        return buffer
    }

    writeRegister(type: number, offset: number, data: number[]) {
        let offsetArr = this.toBigEndian(offset, 3);
        let dataLength = data.length;


        for (let index = 0; index < 16 - dataLength; index++) {
            data.push(0x00)
        }

        let total = [type, ...offsetArr, dataLength, ...data]
        this.device.sendReport(0x16, this.createBuffer(...total))
    }
}


enum WiiButtons {
    // Byte 1
    LEFT = 0x01,
    RIGHT = 0x02,
    DOWN = 0x04,
    UP = 0x08,
    PLUS = 0x10,
    // Byte 2
    MINUS = 0x10,
    ONE = 0x02, // awesome stuff
    TWO = 0x01,
    B = 0x04,
    A = 0x08,
    HOME = 0x80,
}

enum ReportMode {
    RUMBLE = 0x10,
    PLAYER_LED = 0x11,
    DATA_REPORTING = 0x12,
    IR_CAMERA_ENABLE = 0x13,
    SPEAKER_ENABLE = 0x14,
    STATUS_INFO_REQ = 0x15,
    MEM_REG_WRITE = 0x16,
    MEM_REG_READ = 0x17,
    SPEAKER_DATA = 0x18,
    SPEAKER_MUTE = 0x19,
    IR_CAMERA2_ENABLE = 0x1a
}
enum RegisterType {
    EEPROM = 0x00,
    CONTROL = 0x04
}
export const IRSensitivity = {
    LEVEL_0: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x0C],
    LEVEL_1: [0x02, 0x00, 0x00, 0x71, 0x01, 0x00, 0x64, 0x00, 0xFE],
    LEVEL_2: [0x02, 0x00, 0x00, 0x71, 0x01, 0x00, 0x96, 0x00, 0xb4],
    LEVEL_3: [0x02, 0x00, 0x00, 0x71, 0x01, 0x00, 0xaa, 0x00, 0x64],
    LEVEL_4: [0x02, 0x00, 0x00, 0x71, 0x01, 0x00, 0xc8, 0x00, 0x36],
    LEVEL_5: [0x07, 0x00, 0x00, 0x71, 0x01, 0x00, 0x72, 0x00, 0x20],

    BLOCK_0: [0x00, 0x00],
    BLOCK_1: [0xfd, 0x05],
    BLOCK_2: [0xb3, 0x04],
    BLOCK_3: [0x63, 0x03],
    BLOCK_4: [0x35, 0x03],
    BLOCK_5: [0x1f, 0x03],
}
enum IRDataType {
    BASIC = 0x1,
    EXTENDED = 0x3,
    FULL = 0x5
}