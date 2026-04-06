import Graphic, { ColorPalette } from "../Graphic";
import HTMLImageGraphic from "./HTMLImageGraphic";
import ImageBitmapGraphic from "./ImageBitmapGraphic";

export default class WebGLGraphic extends ImageBitmapGraphic {
    texture: WebGLTexture | null = null;


    override async clone(): Promise<Graphic> {
        const graphic = new WebGLGraphic(this.blob);
        await graphic.load();
        return graphic;
    }



}