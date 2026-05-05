import Sample from "../../../audio/Sample";
import StereoPannerSound from "../../../audio/StereoPannerSound";
import Dimensions from "../../../math/Dimensions";
import { Sprite } from "../../../Sprite";
import MathUtil from "../../../utilities/MathUtil";
import WebSound from "./WebSound";

/* Sound object with volume controls and LR panning */
export default class WebStereoPannerSound extends WebSound implements StereoPannerSound {
    protected stereoPannerNode: StereoPannerNode;

    constructor(sample: Sample) {
        super(sample);
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


    public updatePanFromSprite(sprite: Sprite) {
        this.pan = MathUtil.normalize(sprite.x, 0, Dimensions.GAME_WIDTH, -1.0, 1.0);
    }
}