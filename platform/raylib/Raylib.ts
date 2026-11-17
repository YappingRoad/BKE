import Main from "../../../Main";
import Renderer, { IRenderer } from "../../renderers/Renderer";
import Platform, { IStorage } from "../Platform";
import { RaylibRenderer } from "./RaylibRenderer";
import * as r from "raylib";
import RaylibStorage from "./RaylibStorage";
import fs from "node:fs";
import { BufferSource } from "node:stream/web";
import { IMusicSound } from "../../audio/IMusicSound";
import { IPannerSound } from "../../audio/IPannerSound";
import { ISound } from "../../audio/ISound";
import { IStereoPannerSound } from "../../audio/IStereoPannerSound";
import Input from "../../input/Input";
import MouseData from "../../input/devices/interfaces/MouseData";
import { Worker } from "node:worker_threads";
import RaylibSound from "./sound/RaylibSound";
import RaylibPannerSound from "./sound/RaylibPannerSound";
import RaylibStereoPannerSound from "./sound/RaylibStereoPannerSound";
import RaylibMusicSound from "./sound/RaylibMusicSound";
import { RaylibMouseWorkerData } from "./RaylibMouseWorker";
import { Key } from "../../input/devices/Keyboard";
import Dimensions from "../../math/Dimensions";

export default class Raylib extends Platform {
    rafCallback: ((ts: number) => void) | null = null;
    keymap: Map<number, Key> = new Map()
    constructor() {
        super();

        this.keymap.set(r.KEY_A, Key.A);
        this.keymap.set(r.KEY_B, Key.B);
        this.keymap.set(r.KEY_C, Key.C);
        this.keymap.set(r.KEY_D, Key.D);
        this.keymap.set(r.KEY_E, Key.E);
        this.keymap.set(r.KEY_F, Key.F);
        this.keymap.set(r.KEY_G, Key.G);
        this.keymap.set(r.KEY_H, Key.H);
        this.keymap.set(r.KEY_I, Key.I);
        this.keymap.set(r.KEY_J, Key.J);
        this.keymap.set(r.KEY_K, Key.K);
        this.keymap.set(r.KEY_L, Key.L);
        this.keymap.set(r.KEY_M, Key.M);
        this.keymap.set(r.KEY_N, Key.N);
        this.keymap.set(r.KEY_O, Key.O);
        this.keymap.set(r.KEY_P, Key.P);
        this.keymap.set(r.KEY_Q, Key.Q);
        this.keymap.set(r.KEY_R, Key.R);
        this.keymap.set(r.KEY_S, Key.S);
        this.keymap.set(r.KEY_T, Key.T);
        this.keymap.set(r.KEY_U, Key.U);
        this.keymap.set(r.KEY_V, Key.V);
        this.keymap.set(r.KEY_W, Key.W);
        this.keymap.set(r.KEY_X, Key.X);
        this.keymap.set(r.KEY_Y, Key.Y);
        this.keymap.set(r.KEY_Z, Key.Z);
        this.keymap.set(r.KEY_ESCAPE, Key.Escape)
        this.keymap.set(r.KEY_ENTER, Key.Enter)
        this.keymap.set(r.KEY_LEFT, Key.ArrowLeft)
        this.keymap.set(r.KEY_RIGHT, Key.ArrowRight)
        this.keymap.set(r.KEY_UP, Key.ArrowUp)
        this.keymap.set(r.KEY_DOWN, Key.ArrowDown)
        this.keymap.set(r.KEY_SPACE, Key.Space)

        Main.init()

        // const inputWorker = new Worker(__dirname + "/RaylibMouseWorker.js");
        // inputWorker.on("message", (data: RaylibMouseWorkerData) => {

        //     Input.MOUSE.mousePoll(data.x, data.y, data.buttons)
        // })



    }


    renderer!: RaylibRenderer;
    getDefaultRenderer(): IRenderer {
        this.renderer = new RaylibRenderer();

        return this.renderer;
    }


    getArgs(): string {
        return "";
    }


    override getMemoryUsed(): number {
        return process.memoryUsage().rss;
    }

    getStorage(): IStorage {
        return new RaylibStorage();
    }

    /* Replacement for BrowserUtil. Returns any extra details the game should know about, for web it returns what browsers its running on */
    getPlatformDetails(): Array<string> {
        return ["raylib"]
    }

    restart(): void { }

    override requestAnimationFrame(callback: (ts: number) => void): void {
        // DONT USE PROCESS NEXT TICK HERE EVER AGAIN!
        setImmediate(() => {
            this.rafCallback = callback;

            const but = {
                left: r.IsMouseButtonDown(r.MOUSE_BUTTON_LEFT),
                middle: r.IsMouseButtonDown(r.MOUSE_BUTTON_MIDDLE),
                right: r.IsMouseButtonDown(r.MOUSE_BUTTON_RIGHT),
                back: r.IsMouseButtonDown(r.MOUSE_BUTTON_BACK),
                forward: r.IsMouseButtonDown(r.MOUSE_BUTTON_FORWARD),
            }
            Input.MOUSE.mousePoll(r.GetMouseX(), r.GetMouseY(), but)


            for (const [rkey, bkey] of this.keymap) {
                if (r.IsKeyPressed(rkey)) {
                    this.onKeyDown.dispatch(bkey)
                }
                if (r.IsKeyReleased(rkey)) {
                    this.onKeyUp.dispatch(bkey)
                }
            }



            this.renderer.newFrame()

        })


    }

    /** 
    Returns the current time in milliseconds.
    Note that this is not the real world time, rather the timestep that is used for calculating animations.
    */
    override timeMS(): number {
        return r.GetTime() * 1000.0;
    }


    override async loadPathAsBlob(path: string): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            resolve(new Blob([Buffer.from(fs.readFileSync(path))]))

        })


    }



    override async loadPathAsArrayBuffer(path: string): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {

            resolve(Buffer.from(fs.readFileSync(path)).buffer)

        })
    }


    override async loadPathAsText(path: string): Promise<string> {
        return r.LoadFileText(path)
    }



    override isFocused(): boolean {
        return r.IsWindowFocused();
    }


    async loadSound(buffer: ArrayBuffer): Promise<ISound> {

        const audbuffer = await RaylibSound.context.decodeAudioData(buffer)
        return new RaylibSound(audbuffer);
    }
    async loadPannerSound(buffer: ArrayBuffer): Promise<IPannerSound> {
        const audbuffer = await RaylibSound.context.decodeAudioData(buffer)
        return new RaylibPannerSound(audbuffer);

    }
    async loadStereoPannerSound(buffer: ArrayBuffer): Promise<IStereoPannerSound> {
        const audbuffer = await RaylibSound.context.decodeAudioData(buffer)
        return new RaylibStereoPannerSound(audbuffer);

    }

    async loadMusicSound(buffer: ArrayBuffer): Promise<IMusicSound> {
        const audbuffer = await RaylibSound.context.decodeAudioData(buffer)
        return new RaylibMusicSound(audbuffer);

    }

    override getFullscreen(): boolean {
        return r.IsWindowFullscreen();
    }


    override setFullscreen(b: boolean): void {
        const isFullscreen = this.getFullscreen()
        
        // Am i dumb or can we do this better
        if (b) {
            if (!isFullscreen) {
                r.ToggleFullscreen()
            }
        }
        else {
            if (isFullscreen) {
                r.ToggleFullscreen()
            }
        }
        Dimensions.recalculate()
    }
}

