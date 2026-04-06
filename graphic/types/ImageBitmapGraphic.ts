import Color from "../../math/Color";
import PaletteUtil from "../../utilities/PaletteUtil";
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
                    // resizeWidth: Math.ceil(this.width),
                    // resizeHeight: Math.ceil(this.height)
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
        if (this.bitmap !== undefined) {
            return this.bitmap.width;
        }
        return this.img.width;
    }

    override get height() {
        if (this.bitmap !== undefined) {
            return this.bitmap.height;
        }
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
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1.0;
        // setting the width and height effectively does this anyway
        // ctx.clearRect(0, 0, this.width, this.height)

        ctx.drawImage(this.bitmap, 0, 0, this.width, this.height)
        const data = ctx.getImageData(0, 0, this.width, this.height, { pixelFormat: "rgba-unorm8" }).data;

        // Holy fuckery
        // data.reverse() converts to abgr to rgba (its reversed, probably different endian type)
        // we create a Uint32array because 32bit is 4bytes / 8bits * 4
        // creating a set uses the browser's runtime code instead of javascript (i think?)
        // to only include uniques and then we get each unique color in the image
        const set = new Set(new Uint32Array(data.reverse().buffer));
        // then we can convert to bigint, but we dont need to, change this when we go through and optimise game
        const colorInts: Array<bigint> = []
        for (const color of set) {
            colorInts.push(BigInt(color));
        }

        const colors: ColorPalette = []

        colorInts.forEach((bi) => {
            colors.push(Color.fromBigInt(bi))
        })
        colors.sort((a, b) => {
            return (Number(a.asBigInt())) - (Number(b.asBigInt()))
        })

        this._cachedPalette = colors;

        return colors;
    }



    override async setColorPalette(palette: ColorPalette): Promise<void> {
        this.bitmap.close()
        this.bitmap = await createImageBitmap(this.img, {
            // imageOrientation: "flipY",
            premultiplyAlpha: "none",
            resizeQuality: "pixelated",
            colorSpaceConversion: "none",
            // resizeWidth: Math.ceil(this.width),
            // resizeHeight: Math.ceil(this.height)
        })
        this._cachedPalette = null;
        const originalColorPalette = this.getColorPalette();
        let intOriginalPalette: Array<bigint> = [];
        for (const color of originalColorPalette) {
            intOriginalPalette.push(color.asBigInt())
        }

        let intNewPalette: Array<bigint> = [];
        for (const color of palette) {
            intNewPalette.push(color.asBigInt())
        }
        console.log()

        if (ImageBitmapGraphic._ctxForPalette === undefined) {
            ImageBitmapGraphic._ctxForPalette = Graphic.createOffscreen();
        }
        const ctx = ImageBitmapGraphic._ctxForPalette;
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;

        ctx.globalAlpha = 1.0;
        ctx.drawImage(this.bitmap, 0, 0, this.width, this.height)

        const imgData = ctx.getImageData(0, 0, this.width, this.height, { pixelFormat: "rgba-unorm8" });




        for (let i = 0; i < imgData.data.length; i += 4) {
            const bigint = BigInt(`0x${imgData.data[i].toString(16)}${imgData.data[i + 1].toString(16)}${imgData.data[i + 2].toString(16)}${imgData.data[i + 3].toString(16)}`);
            const index = intOriginalPalette.indexOf(bigint);


            if (index !== -1) {
                const newData = Color.fromBigInt(intNewPalette[index]);
                imgData.data[i] = newData.red;
                imgData.data[i + 1] = newData.green;
                imgData.data[i + 2] = newData.blue;
                imgData.data[i + 3] = newData.alpha;
            }
        }
        
        this.bitmap.close()
        this.bitmap = await createImageBitmap(imgData, {
            // imageOrientation: "flipY",
            premultiplyAlpha: "none",
            resizeQuality: "pixelated",
            colorSpaceConversion: "none",
            // resizeWidth: Math.ceil(this.width),
            // resizeHeight: Math.ceil(this.height)
        });
        this._cachedPalette = palette;


    }


    override async clone(): Promise<Graphic> {
        const graphic = new ImageBitmapGraphic(this.blob);
        await graphic.load();
        return graphic;
    }
}