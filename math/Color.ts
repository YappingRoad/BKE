import MathUtil from "../utilities/MathUtil";
import StringUtil from "../utilities/StringUtil";

export default class Color {
    static get RED() { return Color.rgb(255, 0, 0); }
    static get ORANGE() { return Color.rgb(255, 165, 0); }
    static get YELLOW() { return Color.rgb(255, 255, 0); }
    static get GREEN() { return Color.rgb(0, 255, 0); }
    static get BLUE() { return Color.rgb(0, 0, 255); }
    static get INDIGO() { return Color.rgb(75, 0, 130); }
    static get VIOLET() { return Color.rgb(127, 0, 255); }
    static get BROWN() { return Color.rgb(165, 42, 42); }
    static get PINK() { return Color.rgb(255, 192, 203); }
    static get WHITE() { return Color.rgb(255, 255, 255); }
    static get GREY() { return Color.rgb(127, 127, 127); }
    static get LIGHT_GREY() { return Color.rgb(191, 191, 191); }
    static get DARK_GREY() { return Color.rgb(64, 64, 64); }


    static get BLACK() { return Color.rgb(0, 0, 0); }
    static get TRANSPARENT() { return Color.rgba(0, 0, 0, 0); }
    static get MAGENTA() { return Color.rgb(255, 0, 255); }

    private buffer: Uint8ClampedArray;
    constructor(r: number, g: number, b: number, a: number = 255) {
        // r, g, b, and a
        this.buffer = new Uint8ClampedArray([r, g, b, a]);
    }

    static rgb(r: number, g: number, b: number): Color {
        return new Color(r, g, b);
    }


    static fromBigInt(bigint: BigInt): Color {
        return new Color(
            (Number(bigint) >> 24) & 0xFF,
            (Number(bigint) >> 16) & 0xFF,
            (Number(bigint) >> 8) & 0xFF,
            (Number(bigint)) & 0xFF
        );
    }

    /* ALPHA MUST BE FLOAT */
    static rgba(r: number, g: number, b: number, a: number): Color {
        return new Color(r, g, b, a * 255);
    }

    static hsl(hue: number, saturation: number, lightness: number): Color {
        return Color.hsla(hue, saturation, lightness, 1.0);
    }

    static interpolate(colorA: Color, colorB: Color, amount: number) {
        const r = Math.trunc(MathUtil.lerp(colorA.red, colorB.red, amount));
        const g = Math.trunc(MathUtil.lerp(colorA.green, colorB.green, amount));
        const b = Math.trunc(MathUtil.lerp(colorA.blue, colorB.blue, amount));
        const a = Math.trunc(MathUtil.lerp(colorA.alphaFloat, colorB.alphaFloat, amount));

        return Color.rgba(r, g, b, a);
    }

    /* ALPHA MUST BE FLOAT */
    static hsla(hue: number, saturation: number, lightness: number, alpha: number): Color {
        // https://medium.com/@j622amilah/javascript-basics-53-491e71301eb4

        saturation /= 100;
        lightness /= 100;

        // From the [RGB_to_HSL calculation], s = C/(1 - Math.abs(2*l - 1)).
        // Solve for Chroma (C), the difference in maximum and minimum across rgb color values.
        const C = (1 - Math.abs(2 * lightness - 1)) * saturation;

        // Like a secondary rgb color value obtained from Hue (h).
        const x = C * (1 - Math.abs((hue / 60) % 2 - 1));

        // From the [RGB_to_HSL calculation], C = M - m and l = 1/2*(M+m).
        // Solve for the minimum across rgb color values (m).
        const m = lightness - C / 2;

        let r: number = 0;
        let g: number = 0;
        let b: number = 0;

        if (hue >= 0 && hue < 60) {
            // red (0deg), yellow (60deg)
            // r should be maximum difference of rgb values, C.
            r = C;
            g = x;
            b = 0;

        } else if (hue >= 60 && hue < 120) {
            // yellow (60deg), green (120deg)
            r = x;
            g = C;
            b = 0;

        } else if (hue >= 120 && hue < 180) {
            // green (120deg), cyan (180deg)
            r = 0;
            g = C;
            b = x;

        } else if (hue >= 180 && hue < 240) {
            // cyan (180deg), blue (240deg)
            r = 0;
            g = x;
            b = C;

        } else if (hue >= 240 && hue < 300) {
            // blue (240deg), magenta (300deg)
            r = x;
            g = 0;
            b = C;

        } else if (hue >= 300 && hue < 360) {
            // magenta (300deg), red (360deg)
            r = C;
            g = 0;
            b = x;
        }

        r = Math.trunc((r + m) * 255);
        g = Math.trunc((g + m) * 255);
        b = Math.trunc((b + m) * 255);

        return Color.rgba(r, g, b, alpha);
    }

    get red(): number {
        return this.buffer[0];
    }

    /* Number MUST be from 0-255 */
    set red(v: number) {
        this.buffer[0] = Math.trunc(v);
    }

    get green(): number {
        return this.buffer[1];
    }

    /* Number MUST be from 0-255 */
    set green(v: number) {
        this.buffer[1] = Math.trunc(v);
    }

    get blue(): number {
        return this.buffer[2];
    }

    /* Number MUST be from 0-255 */
    set blue(v: number) {
        this.buffer[2] = Math.trunc(v);
    }

    get alpha(): number {
        return this.buffer[3];
    }

    /* Number MUST be from 0-255 */
    set alpha(v: number) {
        this.buffer[3] = Math.trunc(v);
    }

    get redFloat(): number {
        return this.red / 255;
    }

    set redFloat(v: number) {
        this.red = Math.min(255, Math.round(v * 255));
    }

    get greenFloat(): number {
        return this.green / 255;
    }

    set greenFloat(v: number) {
        this.green = Math.min(255, Math.trunc(v * 255));
    }

    get blueFloat(): number {
        return this.blue / 255;
    }

    set blueFloat(v: number) {
        this.blue = Math.min(255, Math.trunc(v * 255));
    }

    get alphaFloat(): number {
        return this.alpha / 255;
    }

    set alphaFloat(v: number) {
        this.alpha = Math.min(255, Math.trunc(v * 255));
    }

    asHSB(): HSBColorData {
        const r = this.redFloat;
        const g = this.greenFloat;
        const b = this.blueFloat;

        const v = Math.max(r, g, b);
        const n = v - Math.min(r, g, b);

        const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;

        return {
            hue: 60 * (h < 0 ? h + 6 : h),
            saturation: v && (n / v) * 100,
            brightness: v * 100
        };
    }


    asHex(): string {
        return `#${Color.numToHex(this.red)}${Color.numToHex(this.green)}${Color.numToHex(this.blue)}`;
    }

    asBigInt(): bigint {
        return BigInt(`0x${Color.numToHex(this.red)}${Color.numToHex(this.green)}${Color.numToHex(this.blue)}${Color.numToHex(this.alpha)}`)
    }

    asNumberArray(): Array<number> {
        return [this.red, this.green, this.blue, this.alpha]
    }

    asHexRGBA(): string {
        return `#${Color.numToHex(this.red)}${Color.numToHex(this.green)}${Color.numToHex(this.blue)}${Color.numToHex(this.alpha)}`;
    }

    asCSSRGBA(): string {
        return `rgba(${this.red},${this.green},${this.blue},${this.alphaFloat})`
    }

    asCSSRGB(): string {
        return `rgb(${this.red},${this.green},${this.blue})`
    }

    clone(): Color {
        return new Color(this.red, this.green, this.blue, this.alpha);
    }

    /* Returns clone of original color with different alpha */
    opacity(alphaFloat: number): Color {
        let cloned = this.clone();
        cloned.alphaFloat = alphaFloat;
        return cloned;
    }

    private static numToHex(num: number) {
        let hexString = num.toString(16);

        if (hexString.length === 1) {
            hexString = "0" + hexString;
        }

        return hexString;
    }
}

export type HSBColorData = {
    /* From 0-360 */
    hue: number,
    /* From 0-100 */
    saturation: number,
    /* From 0-100 */
    brightness: number,
}