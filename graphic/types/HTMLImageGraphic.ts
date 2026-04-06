import Graphic from "../Graphic";

export default class HTMLImageGraphic extends Graphic {
    public img!: HTMLImageElement;
    override load() {
        this.src = URL.createObjectURL(this.blob)
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
        const graphic = new HTMLImageGraphic(this.blob);
        await graphic.load();
        return graphic;
    }
}