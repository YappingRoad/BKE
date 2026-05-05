import Callback from "../Callback";
import Updatable from "../interfaces/Updatable";
import Sound from "./Sound";

export default interface MusicSound extends Sound, Updatable  {


    beatsPerMeasure: number ;

    bpm: number;
    bps: number;
    // in seconds
    beatDuration: number;


    setMusicMeta(bpm: number):void;

    updateBPM():void;

    currentBeat: number;
    // i dont know what this is called but its 1/4th of a beat
    currentStep: number;


    onBeatHit: Callback<number>;
    onStepHit: Callback<number>;

    update(elapsed: number): void;
}