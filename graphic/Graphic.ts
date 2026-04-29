import Destroyable from "../interfaces/Destroyable";
import Color from "../math/Color";
import MathUtil from "../utilities/MathUtil";
export type ColorPalette = Array<Color>;
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
}