import { ColorPalette } from "../graphic/Graphic";
export default class PaletteUtil {
    static asHexStrings(palette: ColorPalette) {
        const strings: Array<string> = [];
        for (const color of palette) {
            strings.push(color.asHexRGBA());
        }
        return strings;
    }
}