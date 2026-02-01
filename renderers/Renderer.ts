import ComplexSprite from "../objects/sprites/ComplexSprite";
import { Sprite } from "../Sprite";
import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";
import Color from "../math/Color";
import Graphic from "../graphic/Graphic";
import Android from "../android/Android";
import Electron from "../electron/Electron";
import BrowserUtil from "../utilities/BrowserUtil";
import Canvas2DRenderer from "./Canvas2DRenderer";
import DOMRenderer from "./DOMRenderer";
import WebGLRenderer from "./WebGLRenderer";
export default class Renderer {
    public static CURRENT: IRenderer;

    public static init(renderer: string = "") {
        if (renderer === "") {
            Renderer.CURRENT = Renderer.getDefaultRenderer();
        }
        else {
            Renderer.CURRENT = renderer.includes("webgl") ? new WebGLRenderer(renderer as ("webgl" | "webgl2")) : (renderer === "dom") ? new DOMRenderer() : new Canvas2DRenderer();
            //Input.MOUSE.sensitivity = Number.parseFloat(prompt("Pointer lock sensitivity: (must be a float otherwise game will crash!)") as string);
        }

    }
    private static getDefaultRenderer(): IRenderer {
        // return new SVGRenderer();



        // for a reason only god himself knows why firefox really really doesnt like when you make web games
        // and every other renderer stutters really bad on high refresh displays
        // and dom renderer looks the smoothest on my monitor so we are just going to use that for firefox
        // firefox please for the love of god fix your rendering engine and i will switch
        if (BrowserUtil.isFirefox()) {
            return new DOMRenderer();
        }
        if (BrowserUtil.isiOSPWA()) {
            return new Canvas2DRenderer()
            // return new WebGLRenderer("webgl2");
        }
        if (Android.isAvailable()) {
            return new WebGLRenderer();
        }
        if (Electron.isAvailable()) {
            return new WebGLRenderer("webgl2");
        }


        // canvas 2d for web because flicker issues when hovering over browser ui 
        return new Canvas2DRenderer();
    }
}
export interface IRenderer {
    /* GRAPHIC MANAGEMENT */
    createGraphic(blob: Blob): Graphic;

    /* MOUSE */

    /* If we support pointer lock in this renderer */
    supportsPointerLock(): boolean;
    /* Lock the mouse pointer */
    lockPointer(rawInput?: boolean): void;
    /* Unlock the mouse pointer */
    unlockPointer(): void;
    /* Check if that shit is locked */
    pointerLocked(): boolean;

    /* CANVAS */

    /* Clear the canvas */
    clearCanvas(): void;

    /* Paint the canvas (note that this is not specifically required to draw sprites but should be handled as such) */
    paintCanvas(): void;

    /* SPRITE */

    /* Draws a sprite scaled with the game */
    drawSprite(sprite: Sprite, image: Graphic): void;
    /* Draws an image scaled with the game */
    drawImage(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void;
    /* Draws an image raw on the canvas, not relying on game scale */
    drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void;
    /* Draws an image scaled with the game with rotation */
    drawImageRotatable(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void;
    /* Draws an image raw on the canvas, not relying on game scale with rotation */
    drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void;

    /* Draws a sprite scaled with the game */
    drawComplexSprite(sprite: ComplexSprite, image: Graphic): void;
    /* Draws a sprite with complex options, based on game scale */
    drawImageComplex(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void;
    /* Draws a sprite with complex options, not relying on game scale */
    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void;

    /* TEXT */

    /* Draws text on the canvas, not relying on game scale */
    drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void;
    /* Draw text based on game scale */
    drawText(text: string, x: number, y: number, data: TextDrawData): void;

    /* Measures text, not relying on game scale */
    measureTextRaw(text: string, data: TextDrawData): Vector2;
    /* Measures text based on game scale */
    measureText(text: string, data: TextDrawData): Vector2;

    /* SHAPES */

    /* Draw a rectangle based on game scale */
    drawRectangle(rect: Rectangle, color: Color): void;
    /* Draw a rectangle, not relying on game scale */
    drawRectangleRaw(rect: Rectangle, color: Color): void;
    /* Draw a rounded rectangle based on game scale */
    drawRoundedRectangle(rect: Rectangle, radius: number, color: Color): void;
    /* Draw a rectangle, not relying on game scale */
    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void;

    /* Draw a circle based on game scale */
    drawCircle(x: number, y: number, radius: number, color: Color): void;
    /* Draw a circle, not relying on game scale */
    drawCircleRaw(x: number, y: number, radius: number, color: Color): void;


    /* MATH */

    getCanvasDimensions(): Vector2;

    /* INFO */

    getName(): string;

    // the device being used to actually do the rendering
    getRenderDeviceName(): string;

    getSafeAreaDimensions(): Vector2;

    getSafeAreaOffset(): Vector2;
}

export interface TextDrawData {
    font: string,
    size: number,
    color: Color,
    allowPrecisePosition?: boolean
    boundaries?: TextDrawDataBoundaryData,
    dropShadow?: TextDrawDataDropShadowData,
}

export interface TextDrawDataBoundaryData {
    width: number,
    alignment: "left" | "center" | "right",
    lineHeight?: number,
    noWrap?: boolean
}
// lightly weathered waxed cut copper stairs
export interface TextDrawDataDropShadowData {
    offset: Vector2,
    color: Color,
}

export class ComplexSpriteDrawData {
    alpha: number = 1;
    rotateX: number = 0;
    rotateY: number = 0;
    rotateZ: number = 0;
    origin: Vector2 = { x: 0, y: 0 };
    width: number = 1;
    height: number = 1;
    // from 0.0 - 1.0
    brightness: number = 1.0;
    // from 0.0 - 1.0
    contrast: number = 1.0;
    // from 0.0 - 1.0
    saturation: number = 1.0;
    // 0 to 360
    hue: number = 0;
    // blur (px)
    blur: number = 0;

    // crop is based on the SOURCE image
    crop?: Rectangle = undefined;
}


export class ConicGradientDrawData {
    startColor: Color = Color.TRANSPARENT;
    endColor: Color = Color.TRANSPARENT;

    width?: number = undefined;
    height?: number = undefined;

}

export class ConicGradientPoint {
    start: number = 0;
    end: number = 0;
    color: Color = Color.TRANSPARENT;
}
