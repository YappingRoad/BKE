import { ISound } from "./ISound";
import { SoundChannel } from "./SoundChannel";

export default class SoundMixer {
    public static CHANNELS: Map<SoundChannel, number> = new Map();
    public static SOUNDS:ISound[] = [];
}