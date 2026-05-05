import Destroyable from "../interfaces/Destroyable";
import Sample from "./Sample";
import { SoundChannel } from "./SoundChannel";


/* Simple sound object with volume controls */
export default abstract class Sound implements Destroyable {
    static sounds: Array<Sound> = [];
    public static CHANNELS: Map<SoundChannel, number> = new Map();
    sample: Sample;
    constructor(sample: Sample) {
        this.sample = sample;
    }


    public getChannel(): SoundChannel {
        return SoundChannel.SOUND;
    }

    public abstract create(): void;

    abstract clone(): Sound;


    public ignoreChannel: boolean = false;

    public abstract volume: number;
    public abstract speed: number;
    public abstract loop: boolean;
    public abstract detune: number;
    public abstract currentTime: number;
    public abstract trackDuration: number;

    public abstract play(): void;


    public abstract stop(): void;

    public abstract destroy(): void;

}