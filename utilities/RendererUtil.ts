import { ComplexSpriteDrawData, TextDrawData, TextDrawDataDropShadowData } from "../renderers/Renderer";

export default class RendererUtil {
    public static buildComplexSpriteDataFilterString(data: ComplexSpriteDrawData, removeOpacity:boolean = false): string {
        let defau1t: ComplexSpriteDrawData = new ComplexSpriteDrawData();
        let filter = ``;
        // seperated to avoid gpu blurring
        if (!removeOpacity && data.alpha != defau1t.alpha) {
            filter += `opacity(${data.alpha * 100}%) `;
        }

        if (data.hue != defau1t.hue) {
            filter += `hue-rotate(${data.hue}deg) `;
        }

        if (data.saturation != defau1t.saturation) {
            filter += `saturate(${data.saturation * 100}%)`;
        }

        if (data.brightness != defau1t.brightness) {
            filter += `brightness(${data.brightness * 100}%) `;
        }

        if (data.contrast != defau1t.contrast) {
            filter += `contrast(${data.contrast * 100}%) `;
        }

        if (data.blur != defau1t.blur) {
            filter += `blur(${data.blur}px)`;
        }

        if (filter === ``) {
            filter = `none`;
        }

        return filter;
    }

    public static buildComplexSpriteDataTransformString(data: ComplexSpriteDrawData): string {
        let defau1t: ComplexSpriteDrawData = new ComplexSpriteDrawData();
        let transform = ``;
        // seperated to avoid gpu blurring
        if (data.rotateX != defau1t.rotateX) {
            transform += `rotateX(${data.rotateX}deg) `;
        }

        if (data.rotateY != defau1t.rotateY) {
            transform += `rotateY(${data.rotateY}deg) `;
        }

        if (data.rotateZ != defau1t.rotateZ) {
            transform += `rotateZ(${data.rotateZ}deg)`;
        }

        if (data.crop != undefined) {
            transform += `scale(${data.width / data.crop.width}, ${data.height / data.crop.height})`
        }

        return transform;
    }

    public static createCacheID(o: Array<ObjectWithValues | any>): string {
        let id: string = "";
        for (const object of o) {
            id += RendererUtil.stringHashCode(RendererUtil.getCacheID(object));

        }
        return id;
    }

    public static getCacheID(o: any): string {
        let id = "";
        id += (typeof o);
        if (id === 'object') {
            for (const [key, value] of Object.entries(o)) {
                id += key + RendererUtil.getCacheID(value);
            }
        }
        else {
            id += o;
        }
        return id;
    }

    static stringHashCode(s: string): number {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            const char = s.charCodeAt(i);
            hash = (hash << 5) - hash + char; // Simple hash algorithm
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

}
type ObjectWithValues = { [s: string]: any; } | ArrayLike<any> | {}