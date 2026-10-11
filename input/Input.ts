import BKE from "../BKE";
import Callback from "../Callback";
import AssetLoader from "../registries/AssetLoader";
import ArrayUtil from "../utilities/ArrayUtil";
import MathUtil from "../utilities/MathUtil";
import Controller, { ControllerType } from "./devices/Controller";
import DualSense from "./devices/controller/DualSense";
import JoyCon from "./devices/controller/JoyCon";
import JSGamepad from "./devices/controller/JSGamepad";
import WiiRemote from "./devices/controller/WiiRemote";
import { ControllerCursorInputMode } from "./devices/interfaces/ControllerData";
import Keyboard from "./devices/Keyboard";
import Motion from "./devices/Motion";
import Mouse from "./devices/Mouse";
import PollStatistics from "./PollStatistics";


export default class Input {
    static KEYBOARD: Keyboard;
    static MOUSE: Mouse;
    static MOTION: Motion;
    static CONTROLLERS: Array<Controller>;


    public static onRawGamepadConnect: Callback<GamepadEvent> = new Callback();
    public static init() {
        Input.KEYBOARD = new Keyboard();
        Input.MOUSE = new Mouse();
        Input.MOTION = new Motion();
        Input.CONTROLLERS = []



        // if ("hid" in navigator) {
        //     navigator.hid.addEventListener("connect", (ev) => {
        //         Input.onHidConnect(ev.device);
        //     })
        //     navigator.hid.addEventListener("disconnect", (ev) => {
        //         if (this.hidDevices.indexOf(ev.device) === -1) {
        //             return;
        //         }
        //         Input.onHidDisconnect.dispatch(ev.device)
        //         this.hidDevices.splice(this.hidDevices.indexOf(ev.device), 1);
        //     })
        // }
    }

    public static requestConnection(type: ControllerType) {

        switch (type) {
            case ControllerType.DUALSENSE:
                break;
            case ControllerType.WIIMOTE:
                // if ("hid" in navigator) {
                //     navigator.hid.requestDevice({ filters: [{ vendorId: 0x057e, productId: 0x0306 }] }).then((devices) => {
                //         for (const device of devices) {
                //             this.onHidConnect(device);
                //         }
                //     })
                // }
                break;
            case ControllerType.JOYCON:
                // if ("hid" in navigator) {
                //     navigator.hid.requestDevice({ filters: [{ vendorId: 0x057e, productId: 0x2006 }, { vendorId: 0x057e, productId: 0x2007 }] }).then((devices) => {
                //         for (const device of devices) {
                //             this.onHidConnect(device);
                //         }
                //     })
                // }
                break;
            case ControllerType.GENERIC:
                break;
        }
    }

    private static hidDevices: Array<HIDDevice> = []

    private static onHidConnect(device: HIDDevice) {
        if (this.hidDevices.indexOf(device) !== -1) {
            return;
        }
        console.log(device)
        // Wiimote
        if (device.productId === 0x0306 && device.vendorId === 0x057e) {
            Input.CONTROLLERS.push(new WiiRemote(device));
        }
        // Nintendo Joycon
        if ((device.productId === 0x2007 || device.productId === 0x2006) && device.vendorId === 0x057e) {
            Input.CONTROLLERS.push(new JoyCon(device));
        }
        this.hidDevices.push(device)
    }

    static onHidDisconnect: Callback<HIDDevice> = new Callback();
    static onPoll: Callback<void> = new Callback();


    public static setControllerPointerMode(mode: ControllerCursorInputMode) {
        for (const controller of Input.CONTROLLERS) {

            controller.cursorInputMode = mode;
        }
    }

    static pollStats: PollStatistics = new PollStatistics();

    // When any input device is polled
    public static poll() {
        this.pollStats.poll()

        Input.onPoll.dispatch();
    }

    // needed for gamepad api as you cant just add event listener and listen for gamepad polls
    // this probably makes gamepad api have input delay, which just adds to the sadness that gamepad api has nothing
    public static update(elapsed: number) {
        Input.pollStats.update(elapsed);
        // if ("hid" in navigator) {
        //     navigator.hid.getDevices().then((devices) => {
        //         devices.forEach((dev) => {
        //             Input.onHidConnect(dev);
        //         })
        //     })
        // }
        for (const controller of Input.CONTROLLERS) {
            controller.update()
        }
    }
}