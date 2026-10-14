import Graphic from "../../graphic/Graphic";
import Color from "../../math/Color";
import Rectangle from "../../math/Rectangle";
import Vector2 from "../../math/Vector2";
import ComplexSprite from "../../objects/sprites/ComplexSprite";
import Renderer, { ComplexSpriteDrawData, IRenderer, TextDrawData } from "../../renderers/Renderer";
import { Sprite } from "../../Sprite";
import * as r from "raylib";
import Platform from "../Platform";
import Raylib from "./Raylib";
import { Worker } from "node:worker_threads";
import MathUtil from "../../utilities/MathUtil";
import RaylibGraphic from "./RaylibGraphic";
import Dimensions from "../../math/Dimensions";
import BKE from "../../BKE";
import RaylibSound from "./sound/RaylibSound";
import fs from "node:fs";
export class RaylibRenderer implements IRenderer {
    constructor() {
        console.log("-- RENDERER -- : INITALIZING")

        const screenWidth = 640;
        const screenHeight = 360;
        r.SetWindowState(r.FLAG_WINDOW_RESIZABLE | r.FLAG_WINDOW_HIGHDPI)

        r.InitWindow(screenWidth, screenHeight, "Bill Kolumbert")
        r.SetTargetFPS(9999)




    }


    public newFrame() {
        // if (BKE.LOADING_SCREEN_DRAW) {
        //     const rafCallback = (Platform.getCurrent() as Raylib).rafCallback;

        //     if (rafCallback !== null) {
        //         // console.log("update")
        //         rafCallback(0.1);

        //         (Platform.getCurrent() as Raylib).rafCallback = null;
        //     }
        //     return;
        // }
        r.BeginDrawing()
        // r.rlViewport(0,0,Dimensions.getWidth(),Dimensions.getHeight())
        r.ClearBackground(r.BLACK)
        const rafCallback = (Platform.getCurrent() as Raylib).rafCallback;
        if (rafCallback !== null) {
            // console.log("update")
            rafCallback(r.GetFrameTime());

            (Platform.getCurrent() as Raylib).rafCallback = null;
        }

        // r.DrawText("FPS:" + (1 / r.GetFrameTime()).toFixed(2), 120, 200, 20, r.LIGHTGRAY)

        r.EndDrawing()

        if (r.WindowShouldClose()) {
            r.CloseWindow()
            RaylibSound.context.close()
        }
    }
    private static colorToRL(color: Color): r.Color {
        return { r: color.red, g: color.green, b: color.blue, a: color.alpha };
    }


    createGraphic(blob: Blob): Graphic {
        // throw new Error("Method not implemented.");
        return new RaylibGraphic(blob)
    }
    supportsPointerLock(): boolean {
        return false;
    }
    lockPointer(rawInput?: boolean): void {
    }
    unlockPointer(): void {
        // throw new Error("Method not implemented.");
    }
    pointerLocked(): boolean {
        return false;
        // throw new Error("Method not implemented.");
    }
    clearCanvas(): void {
        r.ClearBackground(r.BLACK)

    }
    paintCanvas(): void {
        // throw new Error("Method not implemented.");
    }
    drawSprite(sprite: Sprite, image: Graphic): void {
        if (image != null) {
            this.drawImageRotatable(image, sprite.x, sprite.y, sprite.angle, image.width * sprite.scale.x, image.height * sprite.scale.y, sprite.alpha, sprite.origin.x, sprite.origin.y)
        }
    }
    drawImage(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;

        this.drawImageRaw(image, x * xScale, y * yScale, width * xScale, height * yScale, alpha);
    }
    drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        const graphic = image as RaylibGraphic;
        r.DrawTexturePro(graphic.texture, { x: 0, y: 0, width: graphic.width, height: graphic.height }, { x: x, y: y, width, height }, { x: 0, y: 0 }, 0, { r: 255, g: 255, b: 255, a: 255 * alpha })
    }
    drawImageRotatable(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;

        this.drawImageRotatableRaw(image, x * xScale, y * yScale, angle, width * xScale, height * yScale, alpha, originX * xScale, originY * yScale);
    }
    drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        const graphic = image as RaylibGraphic;
        r.DrawTexturePro(graphic.texture, { x: 0, y: 0, width: graphic.width, height: graphic.height }, { x: x + originX, y: y + originY, width, height }, { x: originX, y: originY }, angle, { r: 255, g: 255, b: 255, a: 255 * alpha })

    }
    drawComplexSprite(sprite: ComplexSprite, image: Graphic): void {
        const data: ComplexSpriteDrawData = {
            alpha: sprite.alpha,
            rotateX: sprite.rotateX,
            rotateY: sprite.rotateY,
            rotateZ: sprite.angle,
            origin: {
                x: sprite.origin.x,
                y: sprite.origin.y,
            },
            width: sprite.hitbox.x,
            height: sprite.hitbox.y,
            brightness: sprite.brightness,
            contrast: sprite.contrast,
            saturation: sprite.saturation,
            hue: sprite.hue,
            blur: sprite.blur,
            crop: sprite.crop === undefined ? undefined : {
                x: sprite.crop.x,
                y: sprite.crop.y,
                width: sprite.crop.width,
                height: sprite.crop.height
            }
        };
        this.drawImageComplex(image, sprite.x, sprite.y, data)
    }
    drawImageComplex(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        data.width *= xScale;
        data.height *= yScale;
        data.origin.x *= xScale;
        data.origin.y *= yScale;
        this.drawImageComplexRaw(image, x, y, data);
    }
    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        const graphic = image as RaylibGraphic;
        r.DrawTexturePro(graphic.texture, data.crop === undefined ? { x: 0, y: 0, width: graphic.width, height: graphic.height } : data.crop, { x: x + data.origin.x, y: y + data.origin.y, width: data.width, height: data.height }, { x: data.origin.x, y: data.origin.y }, data.rotateZ, { r: 255, g: 255, b: 255, a: 255 * data.alpha })

    }

    drawText(text: string, x: number, y: number, data: TextDrawData): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;
        data.size *= (xScale + yScale) / 2;
        x *= xScale;
        y *= yScale;
        if (data.dropShadow != undefined) {
            data.dropShadow.offset.x *= xScale;
            data.dropShadow.offset.y *= yScale;
        }

        if (data.boundaries != undefined) {
            data.boundaries.width *= xScale;
        }


        this.drawTextRaw(text, x, y, data)
    }

    static fontsLoaded: Map<string, r.Font> = new Map()

    drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        if (!RaylibRenderer.fontsLoaded.has(data.font)) {
            const buffer = fs.readFileSync(`assets/fonts/${data.font}.ttf`);
            const font = r.LoadFontFromMemory(`.ttf`, buffer, buffer.byteLength, 256, 0, 250);
            RaylibRenderer.fontsLoaded.set(data.font, font);
        }

        let font = RaylibRenderer.fontsLoaded.get(data.font);
        if (font === undefined || !r.IsFontValid(font)) {
            font = r.GetFontDefault()
        }

        r.DrawTextEx(font, text, { x, y }, data.size + 12, 0, RaylibRenderer.colorToRL(data.color))

    }

    measureText(text: string, data: TextDrawData): Vector2 {
        // throw new Error("Method not implemented.");
        return this.measureTextRaw(text, data)


    }
    measureTextRaw(text: string, data: TextDrawData): Vector2 {
        if (!RaylibRenderer.fontsLoaded.has(data.font)) {
            const buffer = fs.readFileSync(`assets/fonts/${data.font}.ttf`);
            const font = r.LoadFontFromMemory(`.ttf`, buffer, buffer.byteLength, 256, 0, 250);
            RaylibRenderer.fontsLoaded.set(data.font, font);
        }

        let font = RaylibRenderer.fontsLoaded.get(data.font);
        if (font === undefined || !r.IsFontValid(font)) {
            font = r.GetFontDefault()
        }

        return r.MeasureTextEx(font, text, data.size, 0)
    }

    setPixelRaw(vector: Vector2, color: Color): void {
        // r.SetPixelColor()
    }
    drawRectangle(rect: Rectangle, color: Color): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;
        rect.x *= xScale;
        rect.y *= yScale;
        rect.width *= xScale;
        rect.height *= yScale;

        this.drawRectangleRaw(rect, color);
    }
    drawRectangleRaw(rect: Rectangle, color: Color): void {
        r.DrawRectangle(rect.x, rect.y, rect.width, rect.height, { r: color.red, g: color.green, b: color.blue, a: color.alpha })

    }
    drawRoundedRectangle(rect: Rectangle, radius: number, color: Color): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;
        rect.x *= xScale;
        rect.y *= yScale;
        rect.width *= xScale;
        rect.height *= yScale;
        radius *= (xScale + yScale) / 2;
        this.drawRoundedRectangleRaw(rect, radius, color);
    }
    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        r.DrawRectangleRounded(rect, radius, 4, { r: color.red, g: color.green, b: color.blue, a: color.alpha })
    }
    drawCircle(x: number, y: number, radius: number, color: Color): void {
        const dimensions = this.getCanvasDimensions();
        const xScale = dimensions.x / Dimensions.GAME_WIDTH;
        const yScale = dimensions.y / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        radius *= (xScale + yScale) / 2;
        this.drawCircleRaw(x, y, radius, color);
    }
    drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        r.DrawCircle(x, y, radius, { r: color.red, g: color.green, b: color.blue, a: color.alpha })
    }

    getCanvasDimensions(): Vector2 {
        return { x: Dimensions.getWidth(), y: Dimensions.getHeight() }
    }

    getDocumentSize(): Vector2 {
        return { x: r.GetRenderWidth(), y: r.GetRenderHeight() }


    }

    getName(): string {
        return "Raylib";
    }
    getRenderDeviceName(): string {
        // throw new Error("Method not implemented.");
        return "raylib";
    }
    getSafeAreaDimensions(): Vector2 {
        const ratio: number = Math.min((Dimensions.getWidth() * this.getDevicePixelRatio()) / Dimensions.GAME_WIDTH, (Dimensions.getHeight() * this.getDevicePixelRatio()) / Dimensions.GAME_HEIGHT);
        const scaledWidth = Math.trunc(Dimensions.GAME_WIDTH * ratio);
        const scaledHeight = Math.trunc(Dimensions.GAME_HEIGHT * ratio);
        return { x: scaledWidth, y: scaledHeight }
    }
    getSafeAreaOffset(): Vector2 {
        const safeAreaDimensions = this.getSafeAreaDimensions()
        let offsetX = (Dimensions.getWidth() * this.getDevicePixelRatio()) - safeAreaDimensions.x;
        if (offsetX > 0) {
            offsetX /= 2;
        }

        let offsetY = (Dimensions.getHeight() * this.getDevicePixelRatio()) - safeAreaDimensions.y;
        if (offsetY > 0) {
            offsetY /= 2;
        }
        return { x: offsetX, y: offsetY };

        // throw new Error("Method not implemented.");
    }


    getDevicePixelRatio(): number {
        return (r.GetWindowScaleDPI().x + r.GetWindowScaleDPI().y) / 2;
    }

}