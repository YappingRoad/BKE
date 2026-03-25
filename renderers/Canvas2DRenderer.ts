import Rectangle from "../math/Rectangle";
import { Sprite } from "../Sprite";
import Vector2 from "../math/Vector2";
import Renderer, { ComplexSpriteDrawData, ConicGradientDrawData, ConicGradientPoint, IRenderer, TextDrawData } from "./Renderer";
import Dimensions from "../math/Dimensions";
import RendererUtil from "../utilities/RendererUtil";
import ComplexSprite from "../objects/sprites/ComplexSprite";
import Color from "../math/Color";
import Input from "../input/Input";
import BrowserUtil from "../utilities/BrowserUtil";
import Graphic from "../graphic/Graphic";
import MathUtil from "../utilities/MathUtil";
import ImageBitmapGraphic from "../graphic/types/ImageBitmapGraphic";

export default class Canvas2DRenderer implements IRenderer {
    holder: HTMLDivElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;


    private static IMAGE_DEBUG: boolean = true;

    createGraphic(blob: Blob): Graphic {
        return new ImageBitmapGraphic(blob);
    }

    constructor() {
        this.holder = document.createElement("div");
        this.holder.id = "canvasholder";
        document.body.appendChild(this.holder)


        this.canvas = document.createElement("canvas");
        this.canvas.id = "gamecanvas";
        this.holder.appendChild(this.canvas);
        this.canvas.addEventListener("contextmenu", (ev) => {
            Input.MOUSE.updateMouse(ev);
            ev.preventDefault();
        });
        this.ctx = this.canvas.getContext("2d", {
            alpha: true,
            desynchronized: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            xrCompatible: true,
            willReadFrequently: false,
        }) as CanvasRenderingContext2D;
    }

    getName(): string {
        return "Canvas2D";
    }
    renderDeviceName: string = "Unknown (likely software)";

    getRenderDeviceName(): string {
        if ("gpu" in navigator && (this.renderDeviceName === "Unknown (likely software)")) {
            this.renderDeviceName = "Loading...";
            ((navigator.gpu as any).requestAdapter as () => Promise<any>)().then((adapter) => {
                let adapterInfo = adapter.info;
                this.renderDeviceName = (adapterInfo.vendor as string).toUpperCase();
            });
        }
        return this.renderDeviceName;
    }

    supportsPointerLock(): boolean {
        return true && !BrowserUtil.isSafari();
    }

    lockPointer(rawInput: boolean): void {
        // only chromium browsers and firefox seem to support this
        if (rawInput && BrowserUtil.isChrome() || BrowserUtil.isFirefox()) {
            document.body.requestPointerLock({ unadjustedMovement: rawInput }).catch(() => {
                // not all platforms support raw input
                document.body.requestPointerLock();
            })
        }
        else {
            document.body.requestPointerLock();
        }
    }

    unlockPointer(): void {
        document.exitPointerLock();
    }

    pointerLocked(): boolean {
        return document.pointerLockElement !== null;
    }

    setPixelRaw(vec: Vector2, color: Color): void {
        this.drawRectangleRaw({ x: vec.x, y: vec.y, width: 1, height: 1 }, color)
    }

    public clearCanvas(): void {

        this.ctx.globalAlpha = 1.0;
        const ratio: number = Math.min(Dimensions.getWidth() / Dimensions.GAME_WIDTH, Dimensions.getHeight() / Dimensions.GAME_HEIGHT);
        const scaledWidth = Math.trunc(Dimensions.GAME_WIDTH * ratio);
        const scaledHeight = Math.trunc(Dimensions.GAME_HEIGHT * ratio);

        const offset = this.getSafeAreaOffset();

        this.canvas.width = Dimensions.getWidth() * devicePixelRatio;
        this.canvas.height = Dimensions.getHeight() * devicePixelRatio;


        this.canvas.style.width = `${Dimensions.getWidth()}px`;
        this.canvas.style.height = `${Dimensions.getHeight()}px`;

        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(offset.x, offset.y)

        this.ctx.imageSmoothingEnabled = false;
    }

    public paintCanvas(): void {
        //     const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height, { pixelFormat: "rgba-unorm8" });
        //     const data = imageData.data;
        //     for (let i = 0; i < data.length; i += 4) {

        //         const r = data[i], // red
        //             g = data[i + 1], // green
        //             b = data[i + 2]; // blue

        //         const mod = i % 8 === 0;
        //         data[i] = mod ? r + 10 : r;
        //         data[i + 1] = mod ? g + 10 : g;
        //         data[i + 2] = mod ? b + 10 : b;
        //     }
        //     this.ctx.putImageData(imageData, 0, 0);

    }


    public drawSprite(sprite: Sprite, image: Graphic): void {
        if (image != null) {
            this.drawImageRotatable(image, sprite.x, sprite.y, sprite.angle, image.width * sprite.scale.x, image.height * sprite.scale.y, sprite.alpha, sprite.origin.x, sprite.origin.y)
        }
    }

    public drawImage(image: Graphic, x: number = 0, y: number = 0, width: number = 0, height: number = 0, alpha: number = 1.0) {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;

        this.drawImageRaw(image, x * xScale, y * yScale, width * xScale, height * yScale, alpha);
    }

    public drawImageRaw(image: Graphic, x: number = 0, y: number = 0, width: number = 0, height: number = 0, alpha: number = 1.0) {
        this.ctx.globalAlpha = alpha;
        if (0 >= width) {
            width = image.width;
        }
        if (0 >= height) {
            height = image.height;
        }
        if (Canvas2DRenderer.IMAGE_DEBUG) {
            this.drawTextRaw(`c:${image.getColorPalette().length}|w:${image.width}|h:${image.height}`, x, y - 10, { color: Color.MAGENTA, font: "Lato", size: 10 })
            this.drawCircleRaw(x, y, 3, Color.RED)

        }
        this.ctx.drawImage((image as ImageBitmapGraphic).bitmap, x, y, width, height);
    }


    public drawImageRotatable(image: Graphic, x: number = 0, y: number = 0, angle: number = 0, width: number = 0, height: number = 0, alpha: number = 1.0, originX: number, originY: number) {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;

        this.drawImageRotatableRaw(image, x * xScale, y * yScale, angle, width * xScale, height * yScale, alpha, originX * xScale, originY * yScale);
    }

    public drawImageRotatableRaw(image: Graphic, x: number = 0, y: number = 0, angle: number = 0, width: number = 0, height: number = 0, alpha: number = 1.0, originX: number, originY: number) {
        this.ctx.globalAlpha = alpha;
        if (0 >= width) {
            width = image.width;
        }
        if (0 >= height) {
            height = image.height;
        }

        const angleRad = angle * (Math.PI / 180);

        const drawX = x + originX;
        const drawY = y + originY;


        this.ctx.translate(drawX, drawY);
        this.ctx.rotate(angleRad);

        this.ctx.drawImage((image as ImageBitmapGraphic).bitmap, -originX, -originY, width, height);
        this.ctx.rotate(-(angleRad));
        this.ctx.translate(-drawX, -drawY);
        if (Canvas2DRenderer.IMAGE_DEBUG) {
            this.drawTextRaw(`c:${image.getColorPalette().length}|w:${image.width}|h:${image.height}`, x, y - 10, { color: Color.MAGENTA, font: "Lato", size: 10 })

            this.drawCircleRaw(drawX, drawY, 3, Color.RED)
        }
    }

    public drawComplexSprite(sprite: ComplexSprite, image: Graphic): void {
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
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        data.width *= xScale;
        data.height *= yScale;
        data.origin.x *= xScale;
        data.origin.y *= yScale;
        // we dont need to adjust crop size because source image is not scaled, the destination is
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage/canvas_drawimage.jpg
        this.drawImageComplexRaw(image, x, y, data);
    }
    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        if (0 >= data.width) {
            data.width = image.width;
        }
        if (0 >= data.height) {
            data.height = image.height;
        }

        const angleRad = data.rotateZ * (Math.PI / 180);
        const drawX = x + data.origin.x;
        const drawY = y + data.origin.y;

        // as any because otherwise its casted to a "never" type
        // idk, some weird typescript shit
        if ("filter" in (this.ctx as any)) {
            // using opacity in the filter string doesnt work here
            this.ctx.globalAlpha = data.alpha;
            this.ctx.filter = RendererUtil.buildComplexSpriteDataFilterString(data, true);
            this.ctx.translate(drawX, drawY);
            this.ctx.rotate(angleRad);
            if (data.crop != undefined) {
                this.ctx.drawImage((image as ImageBitmapGraphic).bitmap, data.crop.x, data.crop.y, data.crop.width, data.crop.height, -data.origin.x, -data.origin.y, data.width, data.height)
            }
            else {
                this.ctx.drawImage((image as ImageBitmapGraphic).bitmap, -data.origin.x, -data.origin.y, data.width, data.height);
            }
            this.ctx.rotate(-(angleRad));
            this.ctx.translate(-drawX, -drawY);
            this.ctx.filter = `none`;
        }
        else {
            //draw what we can (safari doesnt support filter)
            // todo: could we use shadow filter to somewhat polyfill?
            this.ctx.globalAlpha = data.alpha;
            this.ctx.translate(drawX, drawY);
            this.ctx.rotate(angleRad);
            if (data.crop != undefined) {
                this.ctx.drawImage((image as ImageBitmapGraphic).bitmap, data.crop.x, data.crop.y, data.crop.width, data.crop.height, -data.origin.x, -data.origin.y, data.width, data.height)
            }
            else {
                this.ctx.drawImage((image as ImageBitmapGraphic).bitmap, -data.origin.x, -data.origin.y, data.width, data.height);
            }
            this.ctx.rotate(-(angleRad));
            this.ctx.translate(-drawX, -drawY);
        }
        if (Canvas2DRenderer.IMAGE_DEBUG) {
            this.drawTextRaw(`c:${image.getColorPalette().length}|w:${image.width}|h:${image.height}`, x, y - 10, { color: Color.MAGENTA, font: "Lato", size: 10 })

            this.drawCircleRaw(drawX, drawY, 3, Color.RED)
        }
    }
    public drawText(text: string, x: number, y: number, data: TextDrawData): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        data.size *= (xScale + yScale) / 2;
        if (data.dropShadow != undefined) {
            data.dropShadow.offset.x *= xScale;
            data.dropShadow.offset.y *= yScale;
        }

        if (data.boundaries != undefined) {
            data.boundaries.width *= xScale;
            if (data.boundaries.lineHeight != undefined) {
                data.boundaries.lineHeight *= yScale;
            }
        }

        this.drawTextRaw(text, x, y, data);
    }

    public drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        this.ctx.textAlign = "left";

        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = data.color.asCSSRGBA();
        this.ctx.font = `${data.size}px ${data.font}`;
        this.ctx.textBaseline = "top";
        this.ctx.textRendering = "optimizeSpeed";

        if (data.dropShadow != undefined) {
            this.ctx.shadowColor = data.dropShadow.color.asCSSRGBA();
            this.ctx.shadowOffsetX = data.dropShadow.offset.x;
            this.ctx.shadowOffsetY = data.dropShadow.offset.y;
        }
        if (data.boundaries != undefined) {
            this.ctx.textAlign = data.boundaries.alignment;
            Canvas2DRenderer.wrapText(this.ctx, text, data.boundaries.noWrap ? Number.MAX_SAFE_INTEGER : data.boundaries.width, Math.trunc(x), Math.trunc(y), data.size, data.boundaries.lineHeight != undefined ? data.boundaries.lineHeight : data.size * 0.5);
        }
        else {
            if (data.allowPrecisePosition) {
                this.ctx.fillText(text, x, y);
            }
            else {
                this.ctx.fillText(text, Math.trunc(x), Math.trunc(y));
            }
        }

        if (data.dropShadow != undefined) {
            this.ctx.shadowColor = Color.TRANSPARENT.asCSSRGBA();
        }
    }

    public measureText(text: string, data: TextDrawData): Vector2 {
        const raw: Vector2 = this.measureTextRaw(text, data);
        const xScale = this.canvas.width / Dimensions.GAME_WIDTH;
        const yScale = this.canvas.height / Dimensions.GAME_HEIGHT;
        //     raw.x *= xScale;
        //     raw.y *= yScale;


        return raw;
    }

    public measureTextRaw(text: string, data: TextDrawData): Vector2 {
        this.ctx.font = `${data.size}px ${data.font}`;
        this.ctx.fillStyle = data.color.asCSSRGBA();
        const metrics = this.ctx.measureText(text);

        let width = Math.ceil(metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft);
        let height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
        if (data.allowPrecisePosition) {
            width = metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft;
            height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        }

        if (data.boundaries != undefined) {
            width = data.boundaries.width;
            if (data.dropShadow != undefined) {
                width += data.dropShadow.offset.x;
            }
            height = Canvas2DRenderer.wrapText(this.ctx, text, data.boundaries.noWrap ? Number.MAX_SAFE_INTEGER : data.boundaries.width, 0, 0, data.size, data.boundaries.lineHeight != undefined ? data.boundaries.lineHeight : data.size * 0.5, false).y;
        }

        if (data.allowPrecisePosition) {
            return { x: width, y: height };
        }
        return { x: Math.ceil(width), y: Math.ceil(height) };
    }

    drawRectangle(rect: Rectangle, color: Color): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        rect.x *= xScale;
        rect.y *= yScale;
        rect.width *= xScale;
        rect.height *= yScale;
        this.drawRectangleRaw(rect, color);
    }

    drawRectangleRaw(rect: Rectangle, color: Color): void {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = color.asCSSRGBA();
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    drawRoundedRectangle(rect: Rectangle, radius: number, color: Color): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        rect.x *= xScale;
        rect.y *= yScale;
        rect.width *= xScale;
        rect.height *= yScale;
        radius *= (xScale + yScale) / 2;
        this.drawRoundedRectangleRaw(rect, radius, color);
    }

    public drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = color.asCSSRGBA();
        this.ctx.beginPath();
        this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
        this.ctx.fill();
        this.ctx.closePath();
    }

    public drawCircle(x: number, y: number, radius: number, color: Color): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        radius *= (xScale + yScale) / 2;
        this.drawCircleRaw(x, y, radius, color);
    }

    public drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = color.asCSSRGBA();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }

    public drawConicGradientRaw(location: Vector2, data: ConicGradientDrawData, points: ConicGradientPoint[]) {
        const gradient = this.ctx.createConicGradient(MathUtil.toRad(0), location.x, location.y);

        gradient.addColorStop(0, data.startColor.asCSSRGBA())
        gradient.addColorStop(1, data.endColor.asCSSRGBA());

        for (const point of points) {

            // gradient.addColorStop(MathUtil.wrapAngle(point.start) / 360, Color.interpolate(data.startColor, data.endColor, MathUtil.wrapAngle(point.start) / 360).asCSSRGBA());

            gradient.addColorStop(MathUtil.wrapAngle(point.start) / 360, point.color.asCSSRGBA());

            gradient.addColorStop(MathUtil.wrapAngle(point.end) / 360, point.color.asCSSRGBA());

            // gradient.addColorStop(MathUtil.wrapAngle(point.end) / 360, Color.interpolate(data.startColor, data.endColor, MathUtil.wrapAngle(point.end) / 360).asCSSRGBA());

        }
        if (data.width === undefined) {
            data.width = this.canvas.width;
        }
        if (data.height === undefined) {
            data.height = this.canvas.height;
        }

        this.ctx.fillStyle = gradient;
        const offset = this.getSafeAreaOffset();
        this.ctx.fillRect(-offset.x, -offset.y, data.width, data.height);
    }

    public drawConicGradient(location: Vector2, data: ConicGradientDrawData, points: ConicGradientPoint[]) {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        const loc = Vector2.clone(location)
        loc.x *= xScale;
        loc.y *= yScale;
        const offset = this.getSafeAreaOffset();

        if (data.width !== undefined) {
            data.width *= xScale;
            data.width += offset.x;
        }
        if (data.height !== undefined) {
            data.height *= yScale;
            data.height += offset.y;
        }
        this.drawConicGradientRaw(loc, data, points);
    }

    public static wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number,
        x: number,
        y: number,
        size: number,
        lineHeight: number,
        draw: boolean = true,
    ): Vector2 {
        const words = text.split(' ');
        if (draw) {
            ctx.save();
            ctx.beginPath();
            let drawBounds = new Path2D();
            drawBounds.rect(ctx.textAlign === "center" ? x - maxWidth / 2 : x, y, ctx.textAlign === "center" ? maxWidth * 2 : maxWidth, ctx.canvas.height - y)
            ctx.clip(drawBounds);
        }

        let line = '';
        if (ctx.textAlign === "center") {
            x += maxWidth / 2;
        }
        let largestWidth = 0;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth >= maxWidth && i > 0) {
                // Draw the line when it's too wide
                let w = ctx.measureText(line).width;
                if (w > largestWidth) {
                    largestWidth = w;
                }
                if (draw) {
                    ctx.fillText(line, x, y);
                }
                line = words[i] + ' ';
                y += size + lineHeight; // Move to the next line
            } else {
                // Add the word to the current line
                line = testLine;
            }
        }
        // Draw the last line
        if (draw) {
            // Draw the line when it's too wide
            let w = ctx.measureText(line).width;
            if (w > largestWidth) {
                largestWidth = w;
            }
            ctx.fillText(line, x, y);

            ctx.restore();
        }
        return { x: largestWidth, y: y + size + lineHeight };
    }

    public getCanvasDimensions(): Vector2 {
        return { x: this.canvas.width, y: this.canvas.height };
    }

    public getSafeAreaDimensions(): Vector2 {
        const ratio: number = Math.min((Dimensions.getWidth() * devicePixelRatio) / Dimensions.GAME_WIDTH, (Dimensions.getHeight() * devicePixelRatio) / Dimensions.GAME_HEIGHT);
        const scaledWidth = Math.trunc(Dimensions.GAME_WIDTH * ratio);
        const scaledHeight = Math.trunc(Dimensions.GAME_HEIGHT * ratio);
        return { x: scaledWidth, y: scaledHeight }
    }

    public getSafeAreaOffset(): Vector2 {
        const safeAreaDimensions = this.getSafeAreaDimensions()
        let offsetX = (Dimensions.getWidth() * devicePixelRatio) - safeAreaDimensions.x;
        if (offsetX > 0) {
            offsetX /= 2;
        }

        let offsetY = (Dimensions.getHeight() * devicePixelRatio) - safeAreaDimensions.y;
        if (offsetY > 0) {
            offsetY /= 2;
        }
        return { x: offsetX, y: offsetY };
    }

}