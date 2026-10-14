import { Vector2 } from "raylib";
import { ISound } from "./ISound";

export interface IStereoPannerSound extends ISound {
    pan: number;
    updatePanFromSprite(point: Vector2):void;
}