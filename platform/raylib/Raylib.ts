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

export default class Raylib extends Platform {
    rafCallback: ((ts: number) => void) | null = null;

    constructor() {
        super();

        Main.init()

        const inputWorker = new Worker(__dirname + "/RaylibMouseWorker.js");
        inputWorker.on("message", (data: RaylibMouseWorkerData) => {

            Input.MOUSE.mousePoll(data.x, data.y, data.buttons)
        })



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

}

