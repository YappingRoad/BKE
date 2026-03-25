import Color from "../../math/Color";
import Graphic, { ColorPalette, OffscreenContext } from "../Graphic";

export default class ImageBitmapGraphic extends Graphic {
    public img!: HTMLImageElement;
    public bitmap!: ImageBitmap;
    override load() {
        this.src = URL.createObjectURL(this.blob)
        return new Promise<void>((resolve, reject) => {
            this.img = new Image();
            this.img.crossOrigin = "anonymous";
            this.img.addEventListener("load", (ev) => {

                createImageBitmap(this.img, {
                    // imageOrientation: "flipY",
                    premultiplyAlpha: "none",
                    resizeQuality: "pixelated",
                    colorSpaceConversion: "none",
                    resizeWidth: Math.ceil(this.width),
                    resizeHeight: Math.ceil(this.height)
                }
                ).then((val) => {
                    this.bitmap = val;
                    resolve()
                })
            });
            this.img.addEventListener("progress", (ev) => {
                // todo progress callback

            });
            this.img.addEventListener("error", (ev) => {
                reject();
            });

            this.img.src = this.src;
        })
    }

    override get width() {
        return this.img.width;
    }

    override get height() {
        return this.img.height;
    }

    override destroy(): void {
        URL.revokeObjectURL(this.src);
        this.bitmap.close()
        super.destroy();
    }


    private _cachedPalette: Array<Color> | null = null;

    private static _ctxForPalette: OffscreenContext;
    override getColorPalette(): ColorPalette {
        if (this._cachedPalette !== null) {
            return this._cachedPalette;
        }

        if (ImageBitmapGraphic._ctxForPalette === undefined) {
            ImageBitmapGraphic._ctxForPalette = Graphic.createOffscreen();
        }
        const ctx = ImageBitmapGraphic._ctxForPalette;
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;

        ctx.globalAlpha = 1.0;
        // setting the width and height effectively does this anyway
        // ctx.clearRect(0, 0, this.width, this.height)

        ctx.drawImage(this.bitmap, 0, 0, this.width, this.height)
        const data = ctx.getImageData(0, 0, this.width, this.height, { pixelFormat: "rgba-unorm8" }).data;


        const colorInts: Array<bigint> = []
        for (let i = 0; i < data.length; i += 4) {
            const bigint = BigInt(`0x${data[i].toString(16)}${data[i + 1].toString(16)}${data[i + 2].toString(16)}${data[i + 3].toString(16)}`);
            if (colorInts.indexOf(bigint) === -1) {
                colorInts.push(bigint);
            }
        }
        const colors: ColorPalette = []

        colorInts.forEach((bi) => {
            colors.push(Color.fromBigInt(bi))
        })
        colors.sort((a,b)=>{
            return (Number(a.asBigInt())) - (Number(b.asBigInt()))
        })
        this._cachedPalette = colors;
        return this._cachedPalette;
    }
}