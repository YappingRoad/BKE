import Renderer, { IRenderer } from "../renderers/Renderer";

export default class Platform {

    constructor() {
        this.setPlatform()
    }

    setPlatform() {
        (globalThis as any)._BK_PLATFORM = this;
    }

    getDefaultRenderer():IRenderer {
        return ({} as IRenderer)
    }

    public static getCurrent():Platform {
        return (globalThis as any)._BK_PLATFORM;
    }
    
}