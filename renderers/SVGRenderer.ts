import Renderer, { ComplexSpriteDrawData, IRenderer, TextDrawData } from "./Renderer";
import { Sprite } from "../Sprite";
import Vector2 from "../math/Vector2";
import Rectangle from "../math/Rectangle";
import Dimensions from "../math/Dimensions";
import ComplexSprite from "../objects/sprites/ComplexSprite";
import RendererUtil from "../utilities/RendererUtil";
import Color from "../math/Color";
import BrowserUtil from "../utilities/BrowserUtil";
import Input from "../input/Input";
import Graphic from "../graphic/Graphic";
import SVGGraphic from "../graphic/types/SVGGraphic";

// Smallest Renderer out of all of them, but also runs like shit
export default class SVGRenderer implements IRenderer {
    canvas: SVGElement;
    objects: SVGDefsElement;
    createGraphic(blob: Blob): Graphic {
        const image = new SVGGraphic(blob);
        this.objects.appendChild(image.svgImage)
        return image;
    }

    static readonly namespace = "http://www.w3.org/2000/svg";
    constructor() {
        this.canvas = document.createElementNS(SVGRenderer.namespace, "svg");
        this.canvas.id = "canvasholder";
        document.body.appendChild(this.canvas);

        this.objects = document.createElementNS(SVGRenderer.namespace, "defs");
        this.canvas.appendChild(this.objects)

        this.canvas.style.position = "fixed";
        this.canvas.style.top = "50%";
        this.canvas.style.left = "50%";
        this.canvas.style.transform = "translate(-50%, -50%)";
        this.canvas.style.overflow = "none";
        // this.canvas.autocorrect = false;
        this.canvas.addEventListener("contextmenu", (ev) => {
            Input.MOUSE.updateMouse(ev);
            ev.preventDefault();
        });
        this.measureElem = document.createElement("div");
        this.measureElem.id = "measureElem";
        this.measureElem.style.opacity = "0";
        this.measureElem.style.userSelect = "none";
        document.body.appendChild(this.measureElem);
    }

    getName(): string {
        return "DOM";
    }

    renderDeviceName: string = "Unknown (likely software)";
    setPixelRaw(vector: Vector2, color: Color): void {
        this.drawRectangleRaw({ x: vector.x, y: vector.x, width: 1, height: 1 }, color)
    }
    getRenderDeviceName(): string {
        if ("gpu" in navigator && (this.renderDeviceName === "Unknown (likely software)")) {
            this.renderDeviceName = "Loading...";
            ((navigator.gpu as any).requestAdapter as () => Promise<any>)().then((adapter) => {
                const adapterInfo = adapter.info;
                this.renderDeviceName = (adapterInfo.vendor as string).toUpperCase();
            });
        }
        return this.renderDeviceName;
    }


    public supportsPointerLock(): boolean {
        return false;
    }

    public lockPointer(rawInput: boolean = true): void {

    }

    public unlockPointer(): void {

    }
    public pointerLocked(): boolean {
        return false;
    }

    queue: Array<Element> = [];

    public clearCanvas(): void {
        const ratio: number = Math.min(Dimensions.getWidth() / Dimensions.GAME_WIDTH, Dimensions.getHeight() / Dimensions.GAME_HEIGHT);
        const scaledWidth = Math.trunc(Dimensions.GAME_WIDTH * ratio);
        const scaledHeight = Math.trunc(Dimensions.GAME_HEIGHT * ratio);

        const offset = this.getSafeAreaOffset();

        this.canvas.setAttribute(`width`, `${Dimensions.getWidth() * devicePixelRatio}`);
        this.canvas.setAttribute(`height`, `${Dimensions.getHeight() * devicePixelRatio}`);



        this.canvas.style.width = `${Dimensions.getWidth()}px`;
        this.canvas.style.height = `${Dimensions.getHeight()}px`;

        this.canvas.setAttribute("viewBox", `0 0 ${Dimensions.getWidth() * devicePixelRatio} ${Dimensions.getHeight() * devicePixelRatio}`)
        for (const elem of this.queue) {
            elem.remove();
        }
        this.queue = [];
        // this.canvas.innerText = "";
    }

    public drawSprite(sprite: Sprite, image: Graphic): void {
        if (image != null) {
            this.drawImageRotatable(image, sprite.x, sprite.y, sprite.angle, image.width * sprite.scale.x, image.height * sprite.scale.y, sprite.alpha, sprite.origin.x, sprite.origin.y)
        }
    }

    public drawImage(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {

        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;

        this.drawImageRaw(image, x * xScale, y * yScale, width * xScale, height * yScale, alpha);
    }

    public drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        const offset = this.getSafeAreaOffset();
        x += offset.x;
        y += offset.y;

        const img: SVGUseElement = document.createElementNS(SVGRenderer.namespace, 'use');
        img.setAttribute("href", `#${(image as SVGGraphic).id}`);
        img.setAttribute("x", `${x}`);
        img.setAttribute("y", `${y}`);
        img.setAttribute("width", `${width}`);
        img.setAttribute("height", `${height}`);
        this.queue.push(img);
    }

    public drawImageRotatable(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;

        this.drawImageRotatableRaw(image, x * xScale, y * yScale, angle, width * xScale, height * yScale, alpha, originX * xScale, originY * yScale);
    }

    public drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        const offset = this.getSafeAreaOffset();
        x += offset.x;
        y += offset.y;

        const img: SVGUseElement = document.createElementNS(SVGRenderer.namespace, 'use');
        img.setAttribute("href", `#${(image as SVGGraphic).id}`);
        img.setAttribute("x", `${x}`);
        img.setAttribute("y", `${y}`);
        img.setAttribute("width", `${width}`);
        img.setAttribute("height", `${height}`);
        img.setAttribute("preserveAspectRatio", "none");
        img.style.transform = `rotateZ(${angle}deg)`;
        img.style.transformOrigin = `${x + originX}px ${y + originY}px`;
        img.style.opacity = `${alpha}`;
        this.queue.push(img);
        // const sprite: HTMLDivElement = document.createElement("div")
        // sprite.classList.add("dom_sprite");
        // sprite.style.backgroundImage = `url(${image.src})`
        // sprite.style.backgroundSize = `${width}px ${height}px`
        // sprite.style.transform = `translate(${x}px, ${y}px) rotateZ(${angle}deg)`;
        // sprite.style.transformOrigin = `${originX}px ${originY}px`;
        // sprite.draggable = false;
        // sprite.style.width = `${width}px`;
        // sprite.style.height = `${height}px`;
        // sprite.style.opacity = `${alpha}`;

        // this.queue.push(sprite);
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
        const offset = this.getSafeAreaOffset();
        x += offset.x;
        y += offset.y;

        const sprite: SVGUseElement = document.createElementNS(SVGRenderer.namespace, 'use');
        sprite.setAttribute("href", `#${(image as SVGGraphic).id}`);
        sprite.setAttribute("x", `${x}`);
        sprite.setAttribute("y", `${y}`);
        sprite.setAttribute("width", `${data.width}`);
        sprite.setAttribute("height", `${data.height}`);
        if (data.crop === undefined) {
            sprite.style.transform = `${RendererUtil.buildComplexSpriteDataTransformString(data)}`;
            sprite.style.filter = RendererUtil.buildComplexSpriteDataFilterString(data);
            sprite.style.transformOrigin = `${x + data.origin.x}px ${y + data.origin.y}px`;
            // sprite.draggable = false;
            sprite.style.opacity = `${data.alpha}`;

            this.queue.push(sprite);
        }
        else {
            // const sprite: HTMLDivElement = document.createElement("div");

            // sprite.style.backgroundImage = `url(${image.src})`;
            // sprite.style.backgroundPosition = `-${data.crop.x}px -${data.crop.y}px`
            // sprite.style.width = `${data.crop.width}px`;
            // sprite.style.height = `${data.crop.height}px`;

            sprite.style.transform = `${RendererUtil.buildComplexSpriteDataTransformString(data)}`;
            sprite.style.filter = RendererUtil.buildComplexSpriteDataFilterString(data, true);
            sprite.style.opacity = `${data.alpha}`;

            sprite.style.transformOrigin = `${x + data.origin.x}px ${y + data.origin.y}px`;
            // sprite.draggable = false;



            this.queue.push(sprite);
        }

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

    public drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        const offset = this.getSafeAreaOffset();
        x += offset.x;
        y += offset.y;

        const svgText = document.createElementNS(SVGRenderer.namespace, 'text');
        svgText.setAttribute('x', `${x}`);
        svgText.setAttribute('y', `${(y + data.size) - 4}`);
        svgText.setAttribute("text-rendering", `optimizeSpeed`)

        svgText.style.font = `${data.size}px ${data.font}`;
        svgText.style.verticalAlign = `top`;
        svgText.style.userSelect = "none";
        svgText.style.fill = data.color.asCSSRGB();
        svgText.style.opacity = `${data.color.alphaFloat}`;
        if (BrowserUtil.isFirefox()) {
            svgText.style.height = "100%"
        }
        else {
            svgText.style.overflowY = "visible"
        }

        if (data.boundaries != undefined) {
            svgText.style.textAlign = data.boundaries.alignment;
            svgText.setAttribute('width', `${data.boundaries.width}`);
            // svgText.setAttribute('height', `${rect.height}`);
            svgText.style.width = `${data.boundaries.width}px`;
            const lh = (data.boundaries.lineHeight != undefined ? data.boundaries.lineHeight : data.size / 2);
            svgText.style.lineHeight = `${data.size + lh}px`;
            svgText.setAttribute('x', `${x}`);
            svgText.setAttribute('y', `${(y) - lh}`);

            if (data.boundaries.noWrap) {
                svgText.style.whiteSpace = "nowrap";
            }

        }
        if (data.dropShadow != undefined) {
            svgText.style.textShadow = `${data.dropShadow.offset.x}px ${data.dropShadow.offset.y}px ${data.dropShadow.color.asCSSRGBA()}`
        }
        svgText.innerHTML = text;
        this.queue.push(svgText);
    }



    public measureText(text: string, data: TextDrawData): Vector2 {
        // ok its working because this doesnt need scaling

        return this.measureTextRaw(text, data);
    }

    measureElem: HTMLDivElement = document.createElement("div");

    public measureTextRaw(text: string, data: TextDrawData): Vector2 {
        this.measureElem.style.position = `fixed`;

        this.measureElem.style.font = `${data.size}px ${data.font}`;
        this.measureElem.style.verticalAlign = `top`;
        this.measureElem.style.userSelect = "none";
        this.measureElem.style.color = data.color.asHexRGBA();
        this.measureElem.innerText = text;
        this.measureElem.style.width = `unset`;
        this.measureElem.style.height = `max-content`;

        if (data.boundaries != undefined) {
            this.measureElem.style.textAlign = data.boundaries.alignment;
            this.measureElem.style.width = `${data.boundaries.width}px`;
            if (data.boundaries.lineHeight != undefined) {
                this.measureElem.style.lineHeight = `${data.boundaries.lineHeight}px`;
            }
            else {
                this.measureElem.style.lineHeight = `${data.size + data.size * 0.5}px`;
            }
        }
        const size = this.measureElem.getBoundingClientRect();
        let w = size.width;
        let h = size.height;

        if (data.boundaries != undefined) {
            w = data.boundaries.width;
        }


        // if (text.includes("g") || text.includes("y") || text.includes("j") || text.includes("p")) {
        //     h += Math.trunc((data.size * (0.5)));
        // }
        // if (data.dropShadow != undefined) {
        //     w += data.dropShadow.offset.x;
        //     h -= data.dropShadow.offset.y;
        // }
        return { x: w, y: h };
    }

    public paintCanvas(): void {
        for (const elem of this.queue) {
            this.canvas.appendChild(elem);
        }
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
        const offset = this.getSafeAreaOffset();
        // what?
        rect.x += offset.x;
        rect.y += offset.y;
        const svgRect = document.createElementNS(SVGRenderer.namespace, 'rect');
        svgRect.setAttribute('x', `${rect.x}`);
        svgRect.setAttribute('y', `${rect.y}`);
        svgRect.setAttribute('width', `${rect.width}`);
        svgRect.setAttribute('height', `${rect.height}`);
        svgRect.setAttribute('fill', color.asHexRGBA());
        svgRect.setAttribute("shape-rendering", "crispEdges")

        this.queue.push(svgRect);

        // const elem: HTMLDivElement = document.createElement("div");
        // elem.style.position = "fixed";
        // // no clue why but i have to minus by 2px so it aligns with other renderers
        // elem.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
        // elem.style.width = `${rect.width}px`;
        // elem.style.height = `${rect.height}px`;
        // elem.style.backgroundColor = color.asCSSRGBA();
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

    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        const offset = this.getSafeAreaOffset();
        // what?
        rect.x += offset.x;
        rect.y += offset.y;
        const svgRect = document.createElementNS(SVGRenderer.namespace, 'rect');
        svgRect.setAttribute('x', `${rect.x}`);
        svgRect.setAttribute('y', `${rect.y}`);
        svgRect.setAttribute('width', `${rect.width}`);
        svgRect.setAttribute('height', `${rect.height}`);
        svgRect.setAttribute('rx', `${radius}`);
        svgRect.setAttribute('ry', `${radius}`);
        svgRect.setAttribute('fill', color.asHexRGBA());
        svgRect.setAttribute("shape-rendering", "crispEdges")

        this.queue.push(svgRect);
        // const elem: HTMLDivElement = document.createElement("div");
        // elem.style.position = "fixed";
        // elem.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
        // elem.style.width = `${rect.width}px`;
        // elem.style.height = `${rect.height}px`;
        // elem.style.borderRadius = `${radius}px`;
        // elem.style.backgroundColor = color.asCSSRGBA();
        // this.queue.push(elem);
    }

    drawCircle(x: number, y: number, radius: number, color: Color): void {
        const size = this.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        const yScale = size.y / Dimensions.GAME_HEIGHT;
        x *= xScale;
        y *= yScale;
        radius *= (xScale + yScale) / 2;
        this.drawCircleRaw(x, y, radius, color);
    }

    drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        const elem: HTMLDivElement = document.createElement("div");
        elem.style.position = "fixed";
        elem.style.transform = `translate(${x - radius}px, ${y - radius}px)`;
        elem.style.width = `${radius * 2}px`;
        elem.style.height = `${radius * 2}px`;
        elem.style.clipPath = `circle(${radius}px)`;
        elem.style.backgroundColor = color.asCSSRGBA();
        this.queue.push(elem);
    }

    public getCanvasDimensions(): Vector2 {
        return { x: this.canvas.getBoundingClientRect().width, y: this.canvas.getBoundingClientRect().height };
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