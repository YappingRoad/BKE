// BK Engine

import { Key } from "./input/devices/Keyboard";
import Input from "./input/Input";
import Color from "./math/Color";
import Dimensions from "./math/Dimensions";
import Physics from "./math/Physics";
import Time from "./math/Time";
import Tween from "./math/Tween";
import AssetLoader from "./registries/AssetLoader";
import Renderer from "./renderers/Renderer";
import State from "./State";
import StorageHandler from "./StorageHandler";
import Plugin from "./Plugin";
import Callback from "./Callback";
import { Sprite } from "./Sprite";
import Platform from "./platform/Platform";
import SoundMixer from "./audio/SoundMixer";
import BouncyBill from "../game/objects/BouncyBill";


export default class BKE {
    // Entry point for literally everything (except platform, that is initialized before this)
    public static init() {
        StorageHandler.init();
        Input.init();

        if (Platform.getCurrent().getPlatformDetails().includes("electron")) {
            // BKE.DEBUG = true;
            Input.KEYBOARD.onKeyPoll.add(() => {
                let altDown = Input.KEYBOARD.isKeyDown(Key.AltLeft) || Input.KEYBOARD.isKeyDown(Key.AltRight);
                if (Input.KEYBOARD.justReleased(Key.F11) || (altDown && Input.KEYBOARD.justPressed(Key.Enter))) {
                    // Electron.toggleFullscreen();
                    // todo: make fullscreen something possible via platform

                }
            });
        }
        Dimensions.init();

        Renderer.init();
        BKE.loadingSprite = new BouncyBill()

    }

    public static PAUSE: boolean = false;

    public static get FOCUSED(): boolean {
        return Platform.getCurrent().isFocused();
    };

    public static STATE: State;

    public static start(state: State) {
        BKE.switchState(state);
        BKE.newUpdateFrame();

    }
    public static onStateSwitch: Callback<void> = new Callback();

    static lastTimestep: number = 0;
    static elapsed: number = 0;


    /* 30hz tick */
    static physTickFrames: number = 0;
    static physUpdateFrame: boolean = false;
    static physFramesToUpdate: number = 0;

    static CURRENT_FPS: number = 30;
    static totalSeconds: number = 0;
    static _frameCounter = 0;


    static loadstatus: string = "Loading...";

    static loadingSprite: Sprite | null = null;

    static LOADING_SCREEN_DRAW: boolean = false;

    static draw() {
        if (BKE.FOCUSED && !BKE.PAUSE) {
            Tween.update();
        }
        if (BKE.STATE != null && BKE.STATE._preloaded) {
            BKE.LOADING_SCREEN_DRAW = false;
            BKE.STATE.draw();
        }
        else {
            Renderer.CURRENT.clearCanvas();
            // do 1 whole second on electron because usually drives are fast unless you have a hdd @mista
            // BKE.LOADING_SCREEN_DRAW = Time.getMS() - AssetLoader.preloadStartTime > (Platform.getCurrent().getPlatformDetails().includes("electron") ? 1000 : 200)
            BKE.LOADING_SCREEN_DRAW = false;
            if (BKE.LOADING_SCREEN_DRAW) {
                BKE.drawLoading();
            }
            Renderer.CURRENT.paintCanvas();
        }
    }

    static drawLoading() {

        if (BKE.loadingSprite !== null) {
            BKE.loadingSprite.draw();
        }
    }

    static update(ts: number, isCapped: boolean = false) {

        BKE.elapsed = ((ts - BKE.lastTimestep) / 1000);
        let newTick: number = Math.trunc(ts / (1000 / 30));



        BKE.physFramesToUpdate = newTick - BKE.physTickFrames;
        BKE.physUpdateFrame = newTick > BKE.physTickFrames && BKE.physFramesToUpdate < 30;

        BKE.physTickFrames = newTick;

        let newSeconds: number = Math.trunc(ts / (1000));

        if (newSeconds > BKE.totalSeconds) {
            BKE.CURRENT_FPS = BKE._frameCounter;
            BKE._frameCounter = 0;
        }
        BKE._frameCounter++;
        BKE.totalSeconds = newSeconds;

        if ("window" in globalThis) {
            if (window.scrollY > 0) {
                window.scrollTo(0, 0);
            }
        }
        if (BKE.FOCUSED && !BKE.PAUSE) {
            for (const plugin of Plugin.plugins) {
                plugin.update(BKE.elapsed);
            }
            Input.update(BKE.elapsed)

            if (BKE.STATE != null && BKE.STATE._preloaded) {
                BKE.STATE.update(BKE.elapsed);

            }
        }
        else {
            BKE.STATE.pausedUpdate();
        }
        BKE.lastTimestep = ts;
    }

    static getTimestep(): number {
        return Time.getMS();
    }

    static newDrawFrame() {
        //requestAnimationFrame(BKE.draw);
    }

    public static FRAME_CAP: number = -1;

    public static framecapTicks: number = 0;


    static newUpdateFrame() {
        // needed as it can bug out if it changes mid frame
        let cap = BKE.FRAME_CAP;

        Platform.getCurrent().requestAnimationFrame((ts) => {
            let timestep = BKE.getTimestep();
            if (cap > 0) {
                let newTick: number = Math.trunc(timestep / (1000 / cap));

                if (newTick > BKE.framecapTicks) {

                    let framesToUpdate = (newTick - BKE.framecapTicks);


                    for (let i = 0; i < framesToUpdate; i++) {
                        if (BKE.FRAME_CAP == cap) {
                            return;
                        }
                        BKE.draw();
                        // this is for higher than display refresh rates
                        BKE.update(timestep + ((1 / (cap)) * i));
                        BKE.newUpdateFrame();
                    }


                }
                else {
                    BKE.draw();
                    // this is for higher than display refresh rates
                    BKE.update(timestep);
                    BKE.newUpdateFrame();
                }
                BKE.framecapTicks = newTick;

            }
            else {
                BKE.draw();
                BKE.update(timestep);
                BKE.newUpdateFrame();

            }
        });

    }

    static switchState(state: State) {

        if (BKE.STATE != null && !BKE.STATE._preloaded) {
            return;
        }
        if (BKE.STATE != null && BKE.STATE._preloaded) {
            BKE.onStateSwitch.dispatch();
            BKE.STATE.destroy();
            for (const sound of SoundMixer.SOUNDS) {
                sound.destroy();
            }
        }

        Physics.resetToDefault();
        BKE.STATE = state;

        BKE.STATE.preload();
    }
}