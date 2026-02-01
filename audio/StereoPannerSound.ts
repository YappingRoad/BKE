import MathUtil from "../utilities/MathUtil";
import { Sprite } from "../Sprite";
import Sound from "./Sound";
import Dimensions from "../math/Dimensions";
/* Sound object with volume controls and LR panning */
export default class StereoPannerSound extends Sound {
    protected stereoPannerNode: StereoPannerNode;

    constructor(buffer: AudioBuffer) {
        super(buffer);
        this.stereoPannerNode = Sound.context.createStereoPanner();
    }

    override getRootNode(): AudioNode {
        return this.stereoPannerNode;
    }

    override connectNodes() {
        this.source.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(super.getRootNode());
        super.getRootNode().connect(Sound.context.destination);
    }


    get pan(): number {
        return this.stereoPannerNode.pan.value;
    }

    set pan(value: number) {
        this.stereoPannerNode.pan.setValueAtTime(value, Sound.context.currentTime)
    }


    public updatePanFromSprite(sprite: Sprite) {
        this.pan = MathUtil.normalize(sprite.x, 0, Dimensions.GAME_WIDTH, -1.0, 1.0);
    }
}