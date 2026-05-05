import Main from "../../../Main";
import MusicSound from "../../audio/MusicSound";
import PannerSound from "../../audio/PannerSound";
import Sample from "../../audio/Sample";
import Sound from "../../audio/Sound";
import StereoPannerSound from "../../audio/StereoPannerSound";

import Electron from "../../electron/Electron";
import { IRenderer } from "../../renderers/Renderer";
import BrowserUtil from "../../utilities/BrowserUtil";
import Android from "../android/Android";
import Platform from "../Platform";
import AudioBufferSample from "./audio/AudioBufferSample";
import WebMusicSound from "./audio/WebMusicSound";
import WebPannerSound from "./audio/WebPannerSound";
import WebSound from "./audio/WebSound";
import WebStereoPannerSound from "./audio/WebStereoPannerSound";
import Canvas2DRenderer from "./renderers/Canvas2DRenderer";
import DOMRenderer from "./renderers/DOMRenderer";
import WebGLRenderer from "./renderers/WebGLRenderer";

export default class Web extends Platform {
    constructor() {
        function initialize() {
            WebSound.context = new AudioContext({ sampleRate: 48000 })
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

        if (Electron.isAvailable() || window.sessionStorage.getItem("restarting") === "yes") {
            window.sessionStorage.clear();

            initialize();
            (document.getElementById("audioFix") as HTMLDivElement).remove();
            (document.getElementById("canvasholder") as HTMLDivElement).style.display = "grid";
        }
        else {
            (document.getElementById("audioFix") as HTMLDivElement).style.display = "inherit";
        }
        super()
    }

    createSample(buffer: ArrayBuffer): Sample {
        return new AudioBufferSample(buffer)
    }
    getSound(sample: Sample): Sound {
        return new WebSound(sample)
    }
    getPannerSound(sample: Sample): PannerSound {
        return new WebPannerSound(sample)

    }
    getStereoPannerSound(sample: Sample): StereoPannerSound {
        return new WebStereoPannerSound(sample)

    }
    getMusicSound(sample: Sample): MusicSound {
        return new WebMusicSound(sample)

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
        if (Platform.getCurrent() instanceof Android) {
            return new WebGLRenderer();
        }
        if (Electron.isAvailable()) {
            return new WebGLRenderer("webgl2");
        }


        // canvas 2d for web because flicker issues when hovering over browser ui 
        return new Canvas2DRenderer();
    }
}

