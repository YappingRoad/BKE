import Destroyable from "../interfaces/Destroyable";
import Color from "../math/Color";
import Vector2 from "../math/Vector2";
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

    // https://github.com/HaxeFlixel/flixel/blob/da667aec41eace769cd2360155809835c121ddb5/flixel/FlxSprite.hx#L720
    /**
     * Helper function to set the graphic's dimensions by using `scale`, allowing you to keep the current aspect ratio
     * should one of the numbers be `<= 0`. It might make sense to call `updateHitbox()` afterwards!
     *
     * @param   width    How wide the graphic should be. If `<= 0`, and `height` is set, the aspect ratio will be kept.
     * @param   height   How high the graphic should be. If `<= 0`, and `width` is set, the aspect ratio will be kept.
     */
    public scale(dimensions: Vector2): Vector2 {
        if (dimensions.x <= 0 && dimensions.y <= 0)
            return Vector2.zero();
        let newScaleX: number = dimensions.x / this.width;
        let newScaleY: number = dimensions.y / this.height;
        let scale: Vector2 = { x: newScaleX, y: newScaleY };

        if (dimensions.x <= 0)
            scale.x = newScaleY;
        else if (dimensions.y <= 0)
            scale.y = newScaleX;

        return ({ x: this.width * scale.x, y: this.height * scale.y })
    }

    async clone(): Promise<Graphic> {
        const graphic = new Graphic(this.blob);
        await graphic.load();
        return graphic;
    }
}