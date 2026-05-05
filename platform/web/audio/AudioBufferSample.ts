import Sample from "../../../audio/Sample";
import WebSound from "./WebSound";

export default class AudioBufferSample extends Sample {
    buffer!:AudioBuffer;
    public override async load() {
        await super.load()
        this.buffer = await WebSound.context.decodeAudioData(this.data, (success)=>{
            console.log("loaded")
        }, (error)=>{
            console.log(error)
        });
    }
}