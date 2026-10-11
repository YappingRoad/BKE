import Main from "../../../Main";
import Renderer, { IRenderer } from "../../renderers/Renderer";
import Platform from "../Platform";
import { RaylibRenderer } from "./RaylibRenderer";

export default class Raylib extends Platform {
    rafCallback: ((ts: number) => void) | null = null;
    constructor() {
        super();


        Main.init()


    }


    getDefaultRenderer(): IRenderer {
        return new RaylibRenderer()
    }


    getArgs(): string {
        return "";
    }


    getMemoryUsed(): number {
        return 0;
    }



    /* Replacement for BrowserUtil. Returns any extra details the game should know about, for web it returns what browsers its running on */
    getPlatformDetails(): Array<string> {
        return []
    }

    restart(): void {

    }
    override requestAnimationFrame(callback: (ts: number) => void): void {
        this.rafCallback = callback;
    }

    
    override timeMS():number {
        return 0;
    }
}