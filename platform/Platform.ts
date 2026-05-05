
import MusicSound from "../audio/MusicSound";
import PannerSound from "../audio/PannerSound";
import Sample from "../audio/Sample";
import Sound from "../audio/Sound";
import StereoPannerSound from "../audio/StereoPannerSound";
import Renderer, { IRenderer } from "../renderers/Renderer";
import AudioBufferSample from "./web/audio/AudioBufferSample";

export default class Platform {

    constructor() {
        this.setPlatform()
    }

    setPlatform() {
        (globalThis as any)._BK_PLATFORM = this;
    }

    getDefaultRenderer(): IRenderer {
        return ({} as IRenderer)
    }

    createSample(buffer: ArrayBuffer): Sample {
        return new AudioBufferSample(buffer)
    }

    getSound(sample: Sample): Sound {
        return ({} as Sound)
    }

    getPannerSound(sample: Sample): PannerSound {
        return ({} as PannerSound)
    }

    getStereoPannerSound(sample: Sample): StereoPannerSound {
        return ({} as StereoPannerSound)
    }
    
    getMusicSound(sample: Sample): MusicSound {
        return ({} as MusicSound)
    }

    public static getCurrent(): Platform {
        return (globalThis as any)._BK_PLATFORM;
    }

}