import Vector2 from "../math/Vector2";
import { Sprite } from "../Sprite";
import Sound from "./Sound";


export default interface PannerSound extends Sound {
    panX: number;
    panY: number;
    panZ: number;
    updatePanFromSprite(Vector2: Vector2): void;
}