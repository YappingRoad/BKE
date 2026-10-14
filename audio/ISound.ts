import Destroyable from "../interfaces/Destroyable";
import Updatable from "../interfaces/Updatable";
import { SoundChannel } from "./SoundChannel";

export interface ISound extends Destroyable {
    getChannel(): SoundChannel;
    create(): void;
    clone():ISound;
    ignoreChannel: boolean;
    volume: number;
    speed: number;
    loop: boolean;
    detune: number;

    readonly currentTime: number;
    readonly trackDuration:number;

    play():void;
    stop():void;
}
