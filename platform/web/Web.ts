import Android from "../../android/Android";
import Electron from "../../electron/Electron";
import { IRenderer } from "../../renderers/Renderer";
import BrowserUtil from "../../utilities/BrowserUtil";
import Platform from "../Platform";
import Canvas2DRenderer from "./renderers/Canvas2DRenderer";
import DOMRenderer from "./renderers/DOMRenderer";
import WebGLRenderer from "./renderers/WebGLRenderer";

export default class Web extends Platform {
    constructor() {
        super()    
    }
    getDefaultRenderer(): IRenderer {
        // return new SVGRenderer();



        // for a reason only god himself knows why firefox really really doesnt like when you make web games
        // and every other renderer stutters really bad on high refresh displays
        // and dom renderer looks the smoothest on my monitor so we are just going to use that for firefox
        // firefox please for the love of god fix your rendering engine and i will switch
        if (BrowserUtil.isFirefox()) {
            return new DOMRenderer();
        }
        if (BrowserUtil.isiOSPWA()) {
            return new Canvas2DRenderer()
            // return new WebGLRenderer("webgl2");
        }
        if (Android.isAvailable()) {
            return new WebGLRenderer();
        }
        if (Electron.isAvailable()) {
            return new WebGLRenderer("webgl2");
        }


        // canvas 2d for web because flicker issues when hovering over browser ui 
        return new Canvas2DRenderer();
    }
}