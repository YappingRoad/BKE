import Main from "../../Main";
import Graphic from "../graphic/Graphic";
import Color from "../math/Color";
import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";
import ComplexSprite from "../objects/sprites/ComplexSprite";
import { Sprite } from "../Sprite";
import Canvas2DRenderer from "./Canvas2DRenderer";
import { ComplexSpriteDrawData, IRenderer, TextDrawData } from "./Renderer";

export default class DebugRenderer implements IRenderer {
    renderer: IRenderer;

    constructor(renderer: IRenderer) {
        this.renderer = renderer;
    }

    createGraphic(blob: Blob): Graphic {
        return this.renderer.createGraphic(blob)
    }
    supportsPointerLock(): boolean {
        return this.renderer.supportsPointerLock()
    }
    lockPointer(rawInput?: boolean): void {
        this.renderer.lockPointer(rawInput)
    }
    unlockPointer(): void {
        this.renderer.unlockPointer()
    }
    pointerLocked(): boolean {
        return this.renderer.pointerLocked()
    }
    clearCanvas(): void {
        this.renderer.clearCanvas()
    }
    paintCanvas(): void {
        this.renderer.paintCanvas()
    }
    drawSprite(sprite: Sprite, image: Graphic): void {
        this.renderer.drawSprite(sprite, image)
    }
    drawImage(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        this.renderer.drawImage(image, x, y, width, height, alpha);
    }
    drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        this.renderer.drawImageRaw(image, x, y, width, height, alpha);

        this.renderer.drawTextRaw(`c:${image.getColorPalette().length}|w:${image.width}|h:${image.height}`, x, y - 10, { color: Color.MAGENTA, font: "Lato", size: 10 })
        this.renderer.drawCircleRaw(x, y, 3, Color.RED)
    }
    drawImageRotatable(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        this.renderer.drawImageRotatable(image, x, y, angle, width, height, alpha, originX, originY);
    }
    drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        this.renderer.drawImageRotatableRaw(image, x, y, angle, width, height, alpha, originX, originY);

        this.renderer.drawTextRaw(`c:${image.getColorPalette().length}|w:${image.width}|h:${image.height}`, x, y - 10, { color: Color.MAGENTA, font: "Lato", size: 10 })
        const drawX = x + originX;
        const drawY = y + originY;
        this.renderer.drawCircleRaw(drawX, drawY, 3, Color.RED)
    }
    drawComplexSprite(sprite: ComplexSprite, image: Graphic): void {
        this.renderer.drawComplexSprite(sprite, image);
    }
    drawImageComplex(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        this.renderer.drawImageComplex(image, x, y, data);
    }
    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        this.renderer.drawImageComplexRaw(image, x, y, data);

        this.renderer.drawTextRaw(`c:${image.getColorPalette().length}|w:${image.width}|h:${image.height}`, x, y - 10, { color: Color.MAGENTA, font: "Lato", size: 10 })
        this.renderer.drawCircleRaw(x + data.origin.x, y + data.origin.y, 3, Color.RED)
    }
    drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        this.renderer.drawTextRaw(text, x, y, data);
    }
    drawText(text: string, x: number, y: number, data: TextDrawData): void {
        this.renderer.drawText(text, x, y, data);
    }
    measureTextRaw(text: string, data: TextDrawData): Vector2 {
        return this.renderer.measureTextRaw(text, data);
    }
    measureText(text: string, data: TextDrawData): Vector2 {
        return this.renderer.measureText(text, data);
    }
    setPixelRaw(vector: Vector2, color: Color): void {
        this.renderer.setPixelRaw(vector, color);
    }
    drawRectangle(rect: Rectangle, color: Color): void {
        this.renderer.drawRectangle(rect, color);
    }
    drawRectangleRaw(rect: Rectangle, color: Color): void {
        this.renderer.drawRectangleRaw(rect, color);
    }
    drawRoundedRectangle(rect: Rectangle, radius: number, color: Color): void {
        this.renderer.drawRoundedRectangle(rect, radius, color);
    }
    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        this.renderer.drawRoundedRectangleRaw(rect, radius, color);
    }
    drawCircle(x: number, y: number, radius: number, color: Color): void {
        this.renderer.drawCircle(x, y, radius, color)
    }
    drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        this.renderer.drawCircleRaw(x, y, radius, color)
    }
    getCanvasDimensions(): Vector2 {
        return this.renderer.getCanvasDimensions()
    }
    getName(): string {
        return this.renderer.getName() + " (DEBUG)";
    }
    getRenderDeviceName(): string {
        return this.renderer.getRenderDeviceName();
    }
    getSafeAreaDimensions(): Vector2 {
        return this.renderer.getSafeAreaDimensions()
    }
    getSafeAreaOffset(): Vector2 {
        return this.renderer.getSafeAreaOffset()
    }

}