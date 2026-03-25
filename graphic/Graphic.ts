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

    setColorPalette(palette: ColorPalette):Graphic {
        return new Graphic(new Blob())
    }

    protected static createOffscreen(): OffscreenContext {
        let ctx: OffscreenContext | null = null;
        if ("OffscreenCanvas" in window) {
            const octx = new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: true });
            ctx = octx;
        }

        if (ctx === null) {
            ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
        }



        ctx.imageSmoothingQuality = "low";
        ctx.imageSmoothingEnabled = false;

        return ctx;
    }

}