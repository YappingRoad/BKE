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
export class RaylibRenderer implements IRenderer {
    constructor() {
        const screenWidth = 640
        const screenHeight = 360;
        r.InitWindow(screenWidth, screenHeight, "Bill Kolumbert")
        r.SetTargetFPS(9999)

        // TODO: How to make this not freeze?
        r.BeginDrawing()
        r.ClearBackground(r.BLACK)
        const rafCallback = (Platform.getCurrent() as Raylib).rafCallback;
        if (rafCallback !== null) {
            rafCallback(r.GetFrameTime());
            (Platform.getCurrent() as Raylib).rafCallback = null;
        }
        r.EndDrawing()
        if (r.WindowShouldClose()) {
            r.CloseWindow()
        }
    }



    createGraphic(blob: Blob): Graphic {
        throw new Error("Method not implemented.");
    }
    supportsPointerLock(): boolean {
        throw new Error("Method not implemented.");
    }
    lockPointer(rawInput?: boolean): void {
        throw new Error("Method not implemented.");
    }
    unlockPointer(): void {
        throw new Error("Method not implemented.");
    }
    pointerLocked(): boolean {
        throw new Error("Method not implemented.");
    }
    clearCanvas(): void {
        throw new Error("Method not implemented.");
    }
    paintCanvas(): void {
        throw new Error("Method not implemented.");
    }
    drawSprite(sprite: Sprite, image: Graphic): void {
        throw new Error("Method not implemented.");
    }
    drawImage(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        throw new Error("Method not implemented.");
    }
    drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        throw new Error("Method not implemented.");
    }
    drawImageRotatable(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        throw new Error("Method not implemented.");
    }
    drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        throw new Error("Method not implemented.");
    }
    drawComplexSprite(sprite: ComplexSprite, image: Graphic): void {
        throw new Error("Method not implemented.");
    }
    drawImageComplex(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        throw new Error("Method not implemented.");
    }
    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        throw new Error("Method not implemented.");
    }
    drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        throw new Error("Method not implemented.");
    }
    drawText(text: string, x: number, y: number, data: TextDrawData): void {
        throw new Error("Method not implemented.");
    }
    measureTextRaw(text: string, data: TextDrawData): Vector2 {
        throw new Error("Method not implemented.");
    }
    measureText(text: string, data: TextDrawData): Vector2 {
        throw new Error("Method not implemented.");
    }
    setPixelRaw(vector: Vector2, color: Color): void {
        throw new Error("Method not implemented.");
    }
    drawRectangle(rect: Rectangle, color: Color): void {
        throw new Error("Method not implemented.");
    }
    drawRectangleRaw(rect: Rectangle, color: Color): void {
        throw new Error("Method not implemented.");
    }
    drawRoundedRectangle(rect: Rectangle, radius: number, color: Color): void {
        throw new Error("Method not implemented.");
    }
    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        throw new Error("Method not implemented.");
    }
    drawCircle(x: number, y: number, radius: number, color: Color): void {
        throw new Error("Method not implemented.");
    }
    drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        throw new Error("Method not implemented.");
    }
    getCanvasDimensions(): Vector2 {
        throw new Error("Method not implemented.");
    }
    getName(): string {
        throw new Error("Method not implemented.");
    }
    getRenderDeviceName(): string {
        throw new Error("Method not implemented.");
    }
    getSafeAreaDimensions(): Vector2 {
        throw new Error("Method not implemented.");
    }
    getSafeAreaOffset(): Vector2 {
        throw new Error("Method not implemented.");
    }

    
}