import Graphic from "../../graphic/Graphic";
import { PreloadAsset, PreloadAssetType } from "../../interfaces/PreloadRequestable";
import Ticker from "../../math/Ticker";
import AssetLoader from "../../registries/AssetLoader";
import Renderer from "../../renderers/Renderer";
import { Sprite } from "../../Sprite";
import ArrayUtil from "../../utilities/ArrayUtil";
import MathUtil from "../../utilities/MathUtil";
import ComplexSprite from "./ComplexSprite";


export default class AsepriteSprite extends ComplexSprite {
    data_asset: PreloadAsset;
    sheet_asset: PreloadAsset;


    constructor(path: string) {
        super();
        this.data_asset = { path: `${path}.json`, type: PreloadAssetType.TEXT };
        this.sheet_asset = { path: `${path}.png`, type: PreloadAssetType.IMAGE };
    }


    override preload(): PreloadAsset[] {
        return [this.data_asset, this.sheet_asset];
    }
    sheet!: Graphic;


    frames: Map<number, AsepriteFrameData> = new Map();

    // current time of the animation in millis
    animationTime: number = 0;
    // length of the animation in millis
    animationLength: number = 0;

    override postPreload(): void {
        let framesObj = JSON.parse(AssetLoader.getText(this.data_asset)).frames;
        for (const frame of Object.entries(framesObj)) {
            // let key: string = frame[0];
            let data: AsepriteFrameData = frame[1] as AsepriteFrameData;
            this.animationLength += data.duration;
            this.frames.set(this.animationLength, data);
        }
        this.sheet = AssetLoader.getGraphic(this.sheet_asset);

        this.updateFrame();
    }

    setFrame(data: AsepriteFrameData) {
        this.crop = { x: data.frame.x, y: data.frame.y, width: data.frame.w, height: data.frame.h }
        this.hitbox.x = data.sourceSize.w;
        this.hitbox.y = data.sourceSize.h;
    }

    override draw() {
        Renderer.CURRENT.drawComplexSprite(this, this.sheet);
        super.draw();
    }


    private updateFrame() {
        let closestFrame = MathUtil.getClosestNumber(ArrayUtil.getKeys(this.frames), this.animationTime);


        let data = this.frames.get(closestFrame);


        if (data != undefined) {
            this.setFrame(data);
        }
    }

    loop: boolean = false;
    pause: boolean = false;
    override update(elapsed: number): void {
        if (!this.pause) {
            this.animationTime += elapsed * 1000.0;
        }
        if (this.loop) {
            this.animationTime = this.animationTime % this.animationLength;
        }
        else if (this.animationTime >= this.animationLength) {
            this.animationTime = 0;
            this.pause = true;
        }

        this.updateFrame();

        super.update(elapsed);
    }

    reset() {
        this.animationTime = 0;
    }
}

export interface AsepriteFrameData {
    frame: AsepriteRect,
    // in milliseconds
    duration: number,
    sourceSize: AsepriteDimensions
}

export interface AsepriteRect {
    x: number,
    y: number,
    w: number,
    h: number,
}

export interface AsepriteDimensions {
    w: number,
    h: number,
}