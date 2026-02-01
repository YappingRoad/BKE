import Callback from "../Callback";
import Updatable from "../interfaces/Updatable";
import Sound from "./Sound";
import { SoundChannel } from "./SoundChannel";

export default class MusicSound extends Sound implements Updatable {
    constructor(buffer: AudioBuffer) {
        super(buffer);
    }

    beatsPerMeasure: number = 4;

    bpm: number = 60;
    bps: number = 1;
    // in seconds
    beatDuration: number = 1;

    override getChannel(): SoundChannel {
        return SoundChannel.MUSIC;
    }


    setMusicMeta(bpm: number) {
        this.bpm = bpm;
        this.updateBPM();
    }

    updateBPM() {
        this.bps = ((this.bpm) / (60)) * this.speed;
        this.beatDuration = (1 / (this.bps));
    }

    currentBeat: number = -1;
    // i dont know what this is called but its 1/4th of a beat
    currentStep: number = -1;


    onBeatHit: Callback<number> = new Callback();
    onStepHit: Callback<number> = new Callback();

    update(elapsed: number): void {
        if (this.startTimestamp === -1) {
            return;
        }
        this.updateBPM();

        let curbeat = Math.trunc(this.currentTime / this.beatDuration) + 1;
        if (curbeat != this.currentBeat) {
            this.currentBeat = curbeat;
            this.onBeatHit.dispatch(this.currentBeat);
        }

        let curstep = Math.trunc(this.currentTime / ((this.beatDuration) / 4)) + 1;
        if (curstep != this.currentStep) {
            this.currentStep = curstep;
            this.onStepHit.dispatch(this.currentStep);
        }
    }
    override destroy(): void {
        this.onBeatHit.removeAll();
        this.onStepHit.removeAll();
        super.destroy();
    }
}