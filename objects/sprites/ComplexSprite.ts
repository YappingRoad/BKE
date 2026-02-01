import { ComplexSpriteDrawData } from "../../renderers/Renderer";
import Rectangle from "../../math/Rectangle";
import { Sprite } from "../../Sprite";

export default class ComplexSprite extends Sprite /*implements ComplexSpriteDrawData*/ {
    /* Does not work on majority of renderers */
    rotateX: number = 0;
    /* Does not work on majority of renderers */
    rotateY: number = 0;
    /* 0 - 360 deg */
    hue: number = 0;
    /* 0.0 - 1.0 */
    saturation: number = 1.0;
    /* 0.0 - 1.0 */
    brightness: number = 1.0;
    /* 0.0 - 1.0 */
    contrast: number = 1.0;

    /* value in pixels */
    blur: number = 0;

    crop:Rectangle | undefined = undefined;
}