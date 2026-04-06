import Destroyable from "../interfaces/Destroyable";
import Color from "../math/Color";
import MathUtil from "../utilities/MathUtil";
export type ColorPalette = Array<Color>;
export type OffscreenContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export default class Graphic implements Destroyable {
    blob: Blob;
    src: string = "";

    constructor(blob: Blob) {
        this.blob = blob;
    }

    load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        })
    }


    get width(): number {
        return 0;
    }

    get height(): number {
        return 0;
    }

    destroy(): void {
    }

    getColorPalette(): ColorPalette {
        return []
    }

    async setColorPalette(palette: ColorPalette): Promise<void> {

    }

    async clone(): Promise<Graphic> {
        const graphic = new Graphic(this.blob);
        await graphic.load();
        return graphic;
    }

    protected static createOffscreen(): OffscreenContext {
        let ctx: OffscreenContext | null = null;
        if ("OffscreenCanvas" in window) {
            const octx = new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: true, desynchronized: true, alpha: true });
            ctx = octx;
        }

        if (ctx === null) {
            ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true, desynchronized: true, alpha: true }) as CanvasRenderingContext2D;
        }



        ctx.imageSmoothingQuality = "low";
        ctx.imageSmoothingEnabled = false;

        return ctx;
    }

}