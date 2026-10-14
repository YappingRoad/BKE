import Graphic, { ColorPalette } from "../../graphic/Graphic";
import * as r from "raylib";
import sharp from 'sharp';
import Color from "../../math/Color";

export default class RaylibGraphic extends Graphic {

    constructor(blob: Blob) {
        super(blob)
    }

    buffer!: ArrayBuffer;
    image!: r.Image;
    texture!: r.Texture2D;


    private pallete: ColorPalette = [];

    override async load(): Promise<void> {

        this.buffer = await this.blob.arrayBuffer()
        this.image = r.LoadImageFromMemory(".png", this.buffer, this.buffer.byteLength);
        console.log("Loaded Image")

        this.texture = r.LoadTextureFromImage(this.image);

        const data = ((await sharp(this.buffer).ensureAlpha().raw({ depth: "uchar" }).toUint8Array()));
        console.log(data)

        // Holy fuckery
        // data.reverse() converts to abgr to rgba (its reversed, probably different endian type)
        // we create a Uint32array because 32bit is 4bytes / 8bits * 4
        // creating a set uses the browser's runtime code instead of javascript (i think?)
        // to only include uniques and then we get each unique color in the image
        const set = new Set(new Uint32Array(data.data.reverse().buffer));
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
        this.pallete = colors;

    }


    override  get width(): number {
        return this.texture.width;
    }

    override  get height(): number {
        return this.texture.height;
    }

    override  destroy(): void {
        r.UnloadTexture(this.texture)
        r.UnloadImage(this.image)
    }

    override getColorPalette(): ColorPalette {
        return this.pallete;
    }

    override async setColorPalette(palette: ColorPalette): Promise<void> {
        // Shit but it works for now please optimize later unc!
        // todo: perf
        const originalColorPalette = this.getColorPalette();
        let intOriginalPalette: Array<bigint> = [];
        for (const color of originalColorPalette) {
            intOriginalPalette.push(color.asBigInt())
        }

        let intNewPalette: Array<bigint> = [];
        for (const color of palette) {
            intNewPalette.push(color.asBigInt())
        }
        const imgData = ((await sharp(this.buffer).ensureAlpha().raw({ depth: "uchar" }).toUint8Array()));

        for (let i = 0; i < imgData.data.length; i += 4) {
            const bigint = BigInt(`0x${this.toHex(imgData.data[i])}${this.toHex(imgData.data[i + 1])}${this.toHex(imgData.data[i + 2])}${this.toHex(imgData.data[i + 3])}`);
            const index = intOriginalPalette.indexOf(bigint);


            if (index !== -1) {
                const newData = Color.fromBigInt(intNewPalette[index]);
                imgData.data[i] = newData.red;
                imgData.data[i + 1] = newData.green;
                imgData.data[i + 2] = newData.blue;
                imgData.data[i + 3] = newData.alpha;
            }
        }

        const newImage = await sharp(imgData.data, { raw: { channels: 4, width: this.width, height: this.height, premultiplied: true } }).ensureAlpha().png().toBuffer()
        r.UnloadTexture(this.texture)
        r.UnloadImage(this.image)
        this.image = r.LoadImageFromMemory(".png", newImage, newImage.byteLength);
        console.log("Loaded Image")

        this.texture = r.LoadTextureFromImage(this.image);
    }

    private toHex(num: number): string {
        let str = num.toString(16);
        if (2 > str.length) {
            return "0" + str;
        }
        return str
    }
    override  async clone(): Promise<Graphic> {
        const graphic = new RaylibGraphic(this.blob);
        await graphic.load();
        return graphic;
    }
}