import { Vector2 } from "raylib";
import { ISound } from "./ISound";

export interface IPannerSound extends ISound {
    panX: number;
    panY: number;
    panZ: number;

    updatePanFromSprite(point: Vector2):void;
}