import Renderer, { ComplexSpriteDrawData, IRenderer, TextDrawData } from "./Renderer";
import Rectangle from "../math/Rectangle";
import { Sprite } from "../Sprite";
import Vector2 from "../math/Vector2";
import AssetLoader from "../registries/AssetLoader";
import { PreloadAssetType } from "../interfaces/PreloadRequestable";
import Dimensions from "../math/Dimensions";
import ComplexSprite from "../objects/sprites/ComplexSprite";
import GLTextureRenderer from "./gl/GLTextureRenderer";
import Matrix4 from "./gl/Matrix4";
import GLComplexTextureRenderer from "./gl/GLComplexTextureRenderer";
import Color from "../math/Color";
import RendererUtil from "../utilities/RendererUtil";
import Input from "../input/Input";
import BrowserUtil from "../utilities/BrowserUtil";
import Graphic from "../graphic/Graphic";
import HTMLImageGraphic from "../graphic/types/HTMLImageGraphic";
import WebGLGraphic from "../graphic/types/WebGLGraphic";

// one day
export default class WebGLRenderer implements IRenderer {
    canvas: HTMLCanvasElement;
    holder: HTMLDivElement;
    gl: WebGLRenderingContext;
    mode: "webgl" | "webgl2";

    textureRenderer: GLTextureRenderer;
    complexTextureRenderer: GLComplexTextureRenderer;


    // TODO: make WebGLImageGraphic
    createGraphic(blob: Blob): Graphic {
        return new WebGLGraphic(blob);
    }

    constructor(mode: "webgl" | "webgl2" = "webgl") {
        this.mode = mode;
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

        this.gl = this.canvas.getContext(this.mode, {
            alpha: false,
            antialias: false,
            desynchronized: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            xrCompatible: true,
            willReadFrequently: false,

        }) as WebGLRenderingContext;

        this.textureRenderer = new GLTextureRenderer(this.gl, this);
        this.complexTextureRenderer = new GLComplexTextureRenderer(this.gl, this);

        this.gl.disable(this.gl.DEPTH_TEST);

        // for blending
        this.gl.enable(this.gl.BLEND);

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        AssetLoader.onRemove.add((asset) => {
            if (asset.type === PreloadAssetType.IMAGE) {
                const texture = this.getTexture(AssetLoader.getGraphic(asset) as WebGLGraphic);
                this.gl.deleteTexture(texture);
            }
        });
    }

    getName(): string {
        return this.mode === "webgl" ? "WebGL (OpenGL ES 2.0)" : "WebGL 2.1 (OpenGL ES 3.0)";
    }
    debugInfo: WEBGL_debug_renderer_info | null = null;
    vendor: string = "";
    renderer: string = "";

    getRenderDeviceName(): string {
        if (this.debugInfo === null) {
            this.debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
            if (this.debugInfo != null) {
                this.vendor = this.gl.getParameter(this.debugInfo.UNMASKED_VENDOR_WEBGL);
                this.renderer = this.gl.getParameter(this.debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
        return this.vendor + " | " + this.renderer;
    }

    public createShader(type: number, source: string) {
        const shader = this.gl.createShader(type) as WebGLShader; // Create a new shader object
        this.gl.shaderSource(shader, source); // Attach the source code
        this.gl.compileShader(shader); // Compile the shader

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    public idCache: Map<string, WebGLTexture> = new Map();


    getTexture(image: WebGLGraphic): WebGLTexture {
        if (image.texture !== null) {
            return image.texture;
        }
        const tex: WebGLTexture = this.gl.createTexture();

        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image.img);

        // const's assume all images are not a power of 2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);


        image.texture = tex;
        return tex;
    }


    supportsPointerLock(): boolean {
        return true && !BrowserUtil.isSafari();
    }

    lockPointer(rawInput: boolean = true): void {
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

    clearCanvas(): void {
        const ratio: number = Math.min(Dimensions.getWidth() / Dimensions.GAME_WIDTH, Dimensions.getHeight() / Dimensions.GAME_HEIGHT);
        const scaledWidth = Math.trunc(Dimensions.GAME_WIDTH * ratio);
        const scaledHeight = Math.trunc(Dimensions.GAME_HEIGHT * ratio);

        const offset = this.getSafeAreaOffset();

        this.canvas.width = Dimensions.getWidth() * devicePixelRatio;
        this.canvas.height = Dimensions.getHeight() * devicePixelRatio;


        this.canvas.style.width = `${Dimensions.getWidth()}px`;
        this.canvas.style.height = `${Dimensions.getHeight()}px`;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)


        // tell webgl to cull faces
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.drawRectangleRaw({ x: 0, y: 0, width: this.canvas.width, height: this.canvas.height }, Color.BLACK);

    }

    public paintCanvas(): void { }


    public drawSprite(sprite: Sprite, image: Graphic): void {
        if (image != null) {
            this.drawImageRotatable(image, sprite.x, sprite.y, sprite.angle, image.width * sprite.scale.x, image.height * sprite.scale.y, sprite.alpha, sprite.origin.x, sprite.origin.y);
        }
    }

    public drawImage(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        this.drawImageRaw(image, x * xScale, y * yScale, width * xScale, height * yScale, alpha);
    }

    public drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        this.textureRenderer.drawImageRaw(image, x, y, width, height, alpha);
    }

    public drawImageRotatable(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        this.drawImageRotatableRaw(image, x * xScale, y * yScale, angle, width * xScale, height * yScale, alpha, originX * xScale, originY * yScale);
    }

    public drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        this.textureRenderer.drawImageRotatableRaw(image, x, y, angle, width, height, alpha, originX, originY);
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
            blur: sprite.blur
        };
        if (sprite.crop != undefined) {
            data.crop = {
                x: sprite.crop.x,
                y: sprite.crop.y,
                width: sprite.crop.width,
                height: sprite.crop.height
            }
        }
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
        this.drawImageComplexRaw(image, x, y, data);
    }

    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        this.complexTextureRenderer.drawImageComplexRaw(image, x, y, data);
    }


    public measureText(text: string, data: TextDrawData): Vector2 {
        const raw: Vector2 = this.measureTextRaw(text, data);

        return raw;
    }

    public measureTextRaw(text: string, data: TextDrawData): Vector2 {
        return this.textureRenderer.measureTextRaw(text, data);
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
        return this.textureRenderer.drawRectangleRaw(rect, color);
    }

    // todo: there are way better ways to draw shapes in webgl

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

    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        this.textureRenderer.drawRoundedRectangleRaw(rect, radius, color);
    }


    public drawText(text: string, x: number, y: number, data: TextDrawData): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
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


        this.drawTextRaw(text, x, y, data);
    }

    drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        this.textureRenderer.drawTextRaw(text, x, y, data);
    }


    drawCircle(x: number, y: number, radius: number, color: Color): void {
        const xScale = this.canvas.width / Dimensions.GAME_WIDTH;
        const yScale = this.canvas.height / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        radius *= (xScale + yScale) / 2;
        this.drawCircleRaw(x, y, radius, color);
    }

    drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        this.textureRenderer.drawCircleRaw(x, y, radius, color);
    }

    getCanvasDimensions(): Vector2 {
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


