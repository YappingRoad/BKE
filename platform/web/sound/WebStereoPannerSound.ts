import { Vector2 } from "raylib";
import { IStereoPannerSound } from "../../../audio/IStereoPannerSound";
import Dimensions from "../../../math/Dimensions";
import MathUtil from "../../../utilities/MathUtil";
import WebSound from "./WebSound";

/* Sound object with volume controls and LR panning */
export default class WebStereoPannerSound extends WebSound implements IStereoPannerSound {
    protected stereoPannerNode: StereoPannerNode;

    constructor(buffer: AudioBuffer) {
        super(buffer);
        this.stereoPannerNode = WebSound.context.createStereoPanner();
    }

    override getRootNode(): AudioNode {
        return this.stereoPannerNode;
    }

    override connectNodes() {
        this.source.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(super.getRootNode());
        super.getRootNode().connect(WebSound.context.destination);
    }


    get pan(): number {
        return this.stereoPannerNode.pan.value;
    }

    set pan(value: number) {
        this.stereoPannerNode.pan.setValueAtTime(value, WebSound.context.currentTime)
    }


    public updatePanFromSprite(sprite: Vector2) {
        this.pan = MathUtil.normalize(sprite.x, 0, Dimensions.GAME_WIDTH, -1.0, 1.0);
    }
}