import { Sprite } from "../Sprite";
import Sound from "./Sound";

export default interface StereoPannerSound extends Sound {
    pan: number;
    updatePanFromSprite(sprite: Sprite): void;
}