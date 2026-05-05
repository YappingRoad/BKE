import PannerSound from "../../../audio/PannerSound";
import Sample from "../../../audio/Sample";
import Dimensions from "../../../math/Dimensions";
import Vector2 from "../../../math/Vector2";
import WebSound from "./WebSound";


/* Sound object with volume controls and XYZ panning */
export default class WebPannerSound extends WebSound implements PannerSound {
    protected pannerNode: PannerNode;
    constructor(sample: Sample) {
        super(sample);
        this.pannerNode = WebSound.context.createPanner();
    }

    override initializeNodes(): void {
        this.pannerNode.panningModel = "equalpower";
        this.pannerNode.coneOuterAngle = 360;

        this.panZ = -64;
        this.pannerNode.distanceModel = "inverse"
        //         this.pannerNode.rolloffFactor = (16/9);

        this.pannerNode.rolloffFactor = 0;
    }

    override connectNodes() {
        this.source.connect(this.pannerNode);
        this.pannerNode.connect(super.getRootNode());
        super.getRootNode().connect(WebSound.context.destination);
    }

    override getRootNode(): AudioNode {
        return this.pannerNode;
    }

    private _panX: number = 0;

    get panX(): number {
        return this._panX;
    }

    set panX(value: number) {
        const UIRect = Dimensions.UIRect()

        value += Math.abs(UIRect.x)
        this._panX = value;
        this.pannerNode.positionX.value = this._panX - (UIRect.width * 0.5);
    }

    private _panY: number = 0;

    get panY(): number {
        return this._panY;
    }

    set panY(value: number) {
        const UIRect = Dimensions.UIRect()


        value += Math.abs(UIRect.y)
        this._panY = value;
        this.pannerNode.positionY.value = this._panY - (UIRect.height * 0.5);
    }

    // todo, wtf would be the proper formula for this

    private _panZ: number = 0;

    get panZ(): number {
        return this._panZ;
    }

    set panZ(value: number) {
        this._panZ = value;
        this.pannerNode.positionZ.value = value;
    }

    public updatePanFromSprite(sprite: Vector2) {
        // this.pannerNode.refDistance = (UIRect.width * 0.1 );

        this.panX = sprite.x;
        this.panY = sprite.y;
        // this.panZ = -((UIRect.width+UIRect.height) * 0.5);
    }
}