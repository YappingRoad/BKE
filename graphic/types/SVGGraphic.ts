import SVGRenderer from "../../renderers/SVGRenderer";
import MathUtil from "../../utilities/MathUtil";
import Graphic from "../Graphic";

export default class SVGGraphic extends Graphic {
    public img!: HTMLImageElement;
    public svgImage!: SVGImageElement;
    public id!: string;

    constructor(blob: Blob) {
        super(blob)

    }
    override load() {
        this.src = URL.createObjectURL(this.blob)
        this.id = `${MathUtil.getRandomID()}`;
        this.svgImage = document.createElementNS(SVGRenderer.namespace, 'image');
        this.svgImage.crossOrigin = "anonymous";
        this.svgImage.id = this.id;
        this.svgImage.setAttribute("href", this.src);
        this.svgImage.setAttribute("decoding", "async");
        this.svgImage.setAttribute("preserveAspectRatio", "none");
        this.svgImage.setAttribute("image-rendering", "optimizeSpeed")

        return new Promise<void>((resolve, reject) => {
            this.img = new Image();
            this.img.crossOrigin = "anonymous";
            this.img.addEventListener("load", (ev) => {


                resolve();
            });
            this.img.addEventListener("progress", (ev) => {
                // todo progress callback

            });
            this.img.addEventListener("error", (ev) => {
                reject();
            });
            this.img.src = this.src;
        })
    }

    override get width() {
        return this.img.width;
    }

    override get height() {
        return this.img.height;
    }

    override destroy(): void {
        URL.revokeObjectURL(this.src);
        super.destroy();
    }
    
    override async clone(): Promise<Graphic> {
        const graphic = new SVGGraphic(this.blob);
        await graphic.load();
        return graphic;
    }
}