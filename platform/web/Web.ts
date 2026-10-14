import Main from "../../../Main";
import { IMusicSound } from "../../audio/IMusicSound";
import { IPannerSound } from "../../audio/IPannerSound";
import { ISound } from "../../audio/ISound";
import { IStereoPannerSound } from "../../audio/IStereoPannerSound";
import WebMusicSound from "./sound/WebMusicSound";
import WebPannerSound from "./sound/WebPannerSound";
import WebSound from "./sound/WebSound";
import WebStereoPannerSound from "./sound/WebStereoPannerSound";
import MouseData, { ButtonData } from "../../input/devices/interfaces/MouseData";
import { TouchEventType } from "../../input/devices/Mouse";
import Input from "../../input/Input";
import { PreloadAsset, SoundMode } from "../../interfaces/PreloadRequestable";
import Dimensions from "../../math/Dimensions";
import Renderer, { IRenderer } from "../../renderers/Renderer";
import Platform, { IStorage } from "../Platform";
import Canvas2DRenderer from "./renderers/Canvas2DRenderer";
import DOMRenderer from "./renderers/DOMRenderer";
import WebGLRenderer from "./renderers/WebGLRenderer";
export default class Web extends Platform {

    detailsArr: Array<string> = [];
    constructor() {

        super()

        if ("chrome" in window) {
            this.detailsArr.push("chrome");
        }


        if ("netscape" in window) {
            this.detailsArr.push("firefox");
        }

        // Is Safari
        if (!("chrome" in window) && !("netscape" in window) && 'WebkitAppearance' in document.documentElement.style) {
            this.detailsArr.push("safari")
        }

        if ("androidAPI" in window) {
            this.detailsArr.push("android")
        }

        if (("standalone" in window.navigator && window.navigator.standalone == true && 'WebkitAppearance' in document.documentElement.style)) {
            this.detailsArr.push("iospwa")
        }


        if ("electronAPI" in window) {
            this.detailsArr.push("electron");
        }

        document.addEventListener("keydown", (ev) => {
            this.onKeyDown.dispatch(ev.code);
        });

        document.addEventListener("keyup", (ev) => {
            this.onKeyUp.dispatch(ev.code);
        });


    }

    // TODO: make this a callback instead of hooking in to live engine code!
    //#region MOUSE
    updateMouse(ev: PointerEvent | MouseEvent) {
        Input.MOUSE.mousePoll(ev.clientX, ev.clientY, {
            left: this.getPressedRaw(ev, 0),
            middle: this.getPressedRaw(ev, 2),
            right: this.getPressedRaw(ev, 1),
            back: this.getPressedRaw(ev, 3),
            forward: this.getPressedRaw(ev, 5),
        })
    }

    touch(ev: Touch, type: TouchEventType = TouchEventType.MOVE) {


        Input.MOUSE.lastTouchEventType = type;
        let ratio: number = Math.min(window.innerWidth / Dimensions.GAME_WIDTH, window.innerHeight / Dimensions.GAME_HEIGHT);

        let realGameWidth = (Dimensions.GAME_WIDTH * ratio);

        let width_space = 0;
        let height_space = 0;
        if (Math.ceil(realGameWidth) === window.innerWidth) {
            width_space = (window.innerWidth - (Dimensions.GAME_WIDTH * ratio));
            height_space = (window.innerHeight - (Dimensions.GAME_HEIGHT * ratio)) / 2;
        }
        else {
            width_space = (window.innerWidth - (Dimensions.GAME_WIDTH * ratio)) / 2;
            height_space = (window.innerHeight - (Dimensions.GAME_HEIGHT * ratio));
        }
        let data: MouseData;


        if (type != TouchEventType.END) {

            let dx = type === TouchEventType.START ? 0 : (ev.clientX - Input.MOUSE.currentData.rawX);
            let dy = type === TouchEventType.START ? 0 : (ev.clientY - Input.MOUSE.currentData.rawY);
            data = {
                x: ((ev.clientX - width_space) / ratio),
                y: ((ev.clientY - height_space) / ratio),
                rawX: ev.clientX,
                rawY: ev.clientY,
                deltaX: dx / ratio,
                deltaY: dy / ratio,
                rawDeltaX: dx,
                rawDeltaY: dy,
                left: false,
                middle: false,
                right: false,
                back: false,
                forward: false,
                scroll: 0,
                locked: false
            };


        }
        else {

            data = {
                x: Input.MOUSE.currentData.x,
                y: Input.MOUSE.currentData.y,
                rawX: Input.MOUSE.currentData.rawX,
                rawY: Input.MOUSE.currentData.rawY,
                deltaX: 0,
                deltaY: 0,
                rawDeltaX: 0,
                rawDeltaY: 0,
                left: false,
                middle: false,
                right: false,
                back: false,
                forward: false,
                scroll: 0,
                locked: false
            }
        }

        Input.MOUSE.poll(data)
    }

    pointerLockedInputUpdate(ev: MouseEvent | PointerEvent, ignoreButtons: boolean = true) {

        let dx = ev.movementX * Input.MOUSE.SENSITIVITY;
        let dy = ev.movementY * Input.MOUSE.SENSITIVITY;
        this.deltaPoll(dx, dy, ignoreButtons ? Input.MOUSE.currentData : {
            left: this.getPressedRaw(ev, 0),
            middle: this.getPressedRaw(ev, 2),
            right: this.getPressedRaw(ev, 1),
            back: this.getPressedRaw(ev, 3),
            forward: this.getPressedRaw(ev, 5),
        })

    }

    deltaPoll(dx: number, dy: number, buttons: ButtonData, clamp: boolean = true) {
        let ratio: number = Math.min(window.innerWidth / Dimensions.GAME_WIDTH, window.innerHeight / Dimensions.GAME_HEIGHT);

        let x = Input.MOUSE.lastData.x + (dx / ratio);
        let y = Input.MOUSE.lastData.y + (dy / ratio);

        const UITop = Dimensions.getUITop();
        const UIBottom = Dimensions.getUIBottom();

        const UILeft = Dimensions.getUILeft();
        const UIRight = Dimensions.getUIRight();



        let data: MouseData = {
            x: clamp ? Math.min(Math.max(UILeft, x), UIRight) : x,
            y: clamp ? Math.min(Math.max(UITop, y), UIBottom) : y,
            rawX: Input.MOUSE.lastData.rawX + dx,
            rawY: Input.MOUSE.lastData.rawY + dy,
            deltaX: dx / ratio,
            deltaY: dy / ratio,
            rawDeltaX: dx,
            rawDeltaY: dy,
            left: buttons.left,
            middle: buttons.middle,
            right: buttons.right,
            back: buttons.back,
            forward: buttons.forward,
            scroll: 0,
            locked: true
        };
        Input.MOUSE.poll(data);

    }


    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons#javascript
    private getPressedRaw(event: MouseEvent, id: number): boolean {
        // Use binary `&` with the relevant power of 2 to check if a given button is pressed
        return Boolean(event.buttons & (1 << id));
    }


    private mouseInit() {

        // for some reason compiler just decided to give me errors without document as any, i have no idea why
        if ("onpointerrawupdate" in document) {
            (window as any).addEventListener("pointerrawupdate", (ev: PointerEvent) => {
                if (Input.MOUSE.touchEvent) return;

                if (Renderer.CURRENT.pointerLocked()) {
                    this.pointerLockedInputUpdate(ev);
                }
                else {
                    this.updateMouse(ev);
                }
            });
        }
        else {
            (window as any).addEventListener("pointermove", (ev: PointerEvent) => {
                if (Input.MOUSE.touchEvent) return;

                if (Renderer.CURRENT.pointerLocked()) {
                    this.pointerLockedInputUpdate(ev);
                }
                else {
                    this.updateMouse(ev);
                }
            });
        }

        (window as any).addEventListener("pointerdown", (ev: PointerEvent) => {
            if (Input.MOUSE.touchEvent) return;
            if (Renderer.CURRENT.pointerLocked()) {
                this.pointerLockedInputUpdate(ev, false);
            }
            else {
                this.updateMouse(ev);
            }
        });

        (window as any).addEventListener("pointerup", (ev: PointerEvent) => {
            if (Input.MOUSE.touchEvent) return;

            if (Renderer.CURRENT.pointerLocked()) {
                this.pointerLockedInputUpdate(ev, false);
            }
            else {
                this.updateMouse(ev);
            }
        });

        window.addEventListener("touchstart", (ev) => {
            Input.MOUSE.touchEvent = true;


            this.touch(ev.touches[0], TouchEventType.START);

            // can throw errors in chrome
            if (Platform.getCurrent().getPlatformDetails().includes("chrome")) return;
            try {
                // to stop scrolling in you guessed it, iOS SAFARI!!!
                ev.preventDefault();
            }
            catch (e) { }
        });

        window.addEventListener("touchmove", (ev) => {
            Input.MOUSE.touchEvent = true;
            this.touch(ev.touches[0], TouchEventType.MOVE);

            // can throw errors in chrome
            if (Platform.getCurrent().getPlatformDetails().includes("chrome")) return;

            try {
                // to stop scrolling in you guessed it, iOS SAFARI!!!
                ev.preventDefault();
            }
            catch (e) { }
        });

        window.addEventListener("touchend", (ev) => {
            Input.MOUSE.touchEvent = true;


            this.touch(ev.touches[0], TouchEventType.END);

            // can throw errors in chrome
            if (Platform.getCurrent().getPlatformDetails().includes("chrome")) return;

            try {
                // to stop scrolling in you guessed it, iOS SAFARI!!!
                ev.preventDefault();
            }
            catch (e) { }
        });

        window.addEventListener("wheel", (ev) => {
            Input.MOUSE.currentData.scroll = ev.deltaY * -0.01;
            Input.MOUSE.poll(Input.MOUSE.currentData)
            if (!("chrome" in window)) {
                ev.preventDefault()
            }

        })

    }
    //#endregion

    //#region GAMEPAD
    private BLACKLISTED_CONTROLLERS: string[] = [
        // No fucking clue what this is, shows up on my pc and does 0 input
        // Might be from some software like steam but i doubt its steam itself
        "Virtual Multitouch Device (Vendor: 001f Product: ba1c)",
        "PS5 Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)"
    ]
    initGamepad(): void {


        window.addEventListener("gamepadconnected", (ev) => {
            console.log("Controller connected:")
            console.log(ev.gamepad)

            if (this.BLACKLISTED_CONTROLLERS.indexOf(ev.gamepad.id) === -1) {
                Input.onRawGamepadConnect.dispatch(ev);
            }

            console.log(Input.CONTROLLERS)
        })

        window.addEventListener("gamepaddisconnected", (ev) => {
            console.log("Controller disconnected:")
            console.log(ev.gamepad)
        })


    }
    //#endregion




    override getDefaultRenderer(): IRenderer {
        // JANK: dont initialize input stuff here, we should add a post engine startup callback or something.
        //todo
        this.mouseInit()
        this.initGamepad()

        window.addEventListener("resize", (ev) => {
            Dimensions.recalculate()
        })
        window.addEventListener("orientationchange", (ev) => {
            Dimensions.recalculate()
        })
        // return new SVGRenderer();



        // for a reason only god himself knows why firefox really really doesnt like when you make web games
        // and every other renderer stutters really bad on high refresh displays
        // and dom renderer looks the smoothest on my monitor so we are just going to use that for firefox
        // firefox please for the love of god fix your rendering engine and i will switch
        if (this.detailsArr.includes("firefox")) {
            return new DOMRenderer();
        }
        if (this.detailsArr.includes("iospwa")) {
            // return new DOMRenderer()
            // return new WebGLRenderer("webgl2");
            return new Canvas2DRenderer();

        }
        if (this.detailsArr.includes("android")) {
            return new WebGLRenderer();
        }
        // if (Electron.isAvailable()) {
        //     return new WebGLRenderer("webgl2");
        // }


        // canvas 2d for web because flicker issues when hovering over browser ui 
        return new Canvas2DRenderer();

        //  return new WebGLRenderer("webgl2");
    }

    override getArgs(): string {
        return window.location.hash;
    }


    override getMemoryUsed(): number {
        return (window.performance as any).memory.totalJSHeapSize;
    }

    override getPlatformDetails(): Array<string> {
        return this.detailsArr;
    }

    override restart(): void {
        window.location.href += " ";
        window.sessionStorage.setItem("restarting", "yes")
    }

    override getStorage(): IStorage {
        return window.localStorage;
    }


    override requestAnimationFrame(callback: (ts: number) => void): void {
        window.requestAnimationFrame((time) => {
            callback(time);
        });
    }

    override timeMS(): number {
        return ("performance" in window) ? window.performance.now() : document.timeline.currentTime as number;
    }


    override loadPathAsBlob(path: string): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'blob';
            request.onload = function () {
                resolve(request.response as Blob);
            }
            request.onerror = function (err) {
                reject(err)
            }
            request.send()
        })
    }

    override loadPathAsArrayBuffer(path: string): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                resolve(request.response as ArrayBuffer);
            }
            request.onerror = function (err) {
                reject(err)
            }
            request.send()
        })
    }

    override loadPathAsText(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'text';
            request.onload = function () {
                resolve(request.response as string);
            }
            request.onerror = function (err) {
                reject(err)
            }
            request.send()
        })
    }

    override isFocused(): boolean {
        return document.hasFocus();
    }



    override loadSound(buffer: ArrayBuffer): Promise<ISound> {
        return new Promise<ISound>((resolve, reject) => {
            WebSound.context.decodeAudioData(buffer, function (buffer: any) {
                resolve(new WebSound(buffer))

            }, function (err) {
                reject(err)
            });
        });
    }
    override loadPannerSound(buffer: ArrayBuffer): Promise<IPannerSound> {
        return new Promise<IPannerSound>((resolve, reject) => {
            WebSound.context.decodeAudioData(buffer, function (buffer: any) {
                resolve(new WebPannerSound(buffer))

            }, function (err) {
                reject(err)
            });
        });
    }

    override loadStereoPannerSound(buffer: ArrayBuffer): Promise<IStereoPannerSound> {
        return new Promise<IStereoPannerSound>((resolve, reject) => {
            WebSound.context.decodeAudioData(buffer, function (buffer: any) {
                resolve(new WebStereoPannerSound(buffer))

            }, function (err) {
                reject(err)
            });
        });
    }

    override loadMusicSound(buffer: ArrayBuffer): Promise<IMusicSound> {
        return new Promise<IMusicSound>((resolve, reject) => {
            WebSound.context.decodeAudioData(buffer, function (buffer: any) {
                resolve(new WebMusicSound(buffer))

            }, function (err) {
                reject(err)
            });
        });
    }
}

function initialize() {
    // itch.io is uhhh annoying
    if (window.location.host.endsWith("itch.zone") && window.self !== window.top) {
        let url = window.location.href;
        let newTab = window.open(url, '_blank');
    }
    else {
        Main.init();
    }
}

(document.getElementById("audioFixImg") as HTMLButtonElement).addEventListener("click", (ev) => {

    initialize();
    (document.getElementById("audioFix") as HTMLDivElement).remove();
    (document.getElementById("canvasholder") as HTMLDivElement).style.display = "grid";
});


(document.getElementById("audioFixImg") as HTMLButtonElement).addEventListener("contextmenu", (ev) => {
    ev.preventDefault();

    let renderer: string = prompt(`Choose renderer (must be "dom", "webgl", "webgl2" or "canvas"`) as string;
    Main.init();
    (document.getElementById("audioFix") as HTMLDivElement).remove();
    (document.getElementById("canvasholder") as HTMLDivElement).style.display = "grid";
});

if ("electronAPI" in window || window.sessionStorage.getItem("restarting") === "yes") {
    window.sessionStorage.clear();

    initialize();
    (document.getElementById("audioFix") as HTMLDivElement).remove();
    (document.getElementById("canvasholder") as HTMLDivElement).style.display = "grid";
}
else {
    (document.getElementById("audioFix") as HTMLDivElement).style.display = "inherit";
}

window.addEventListener("error", function (ev) {
    alert(
        ev.error +
        "\n" +
        ev.message +
        "\n\nIf you are playtesting, please report in the #bugs channel of the Bill Kolumbert Discord!",
    );
    console.error(ev.error);
    ev.preventDefault();
});