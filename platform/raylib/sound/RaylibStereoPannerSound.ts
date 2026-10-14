import { AudioContext, StereoPannerNode, AudioBuffer, GainNode } from 'node-web-audio-api';
import { Vector2 } from "raylib";
import { IStereoPannerSound } from "../../../audio/IStereoPannerSound";
import Dimensions from "../../../math/Dimensions";
import MathUtil from "../../../utilities/MathUtil";
import RaylibSound from "./RaylibSound";

/* Sound object with volume controls and LR panning */
export default class RaylibStereoPannerSound extends RaylibSound implements IStereoPannerSound {
    protected stereoPannerNode: StereoPannerNode;

    constructor(buffer: AudioBuffer) {
        super(buffer);
        this.stereoPannerNode = RaylibSound.context.createStereoPanner();
    }

    override getRootNode(): AudioNode {
        return this.stereoPannerNode;
    }

    override connectNodes() {
        this.source.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(super.getRootNode());
        super.getRootNode().connect(RaylibSound.context.destination);
    }


    get pan(): number {
        return this.stereoPannerNode.pan.value;
    }

    set pan(value: number) {
        this.stereoPannerNode.pan.setValueAtTime(value, RaylibSound.context.currentTime)
    }


    public updatePanFromSprite(sprite: Vector2) {
        this.pan = MathUtil.normalize(sprite.x, 0, Dimensions.GAME_WIDTH, -1.0, 1.0);
    }
}