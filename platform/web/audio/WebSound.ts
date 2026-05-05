import Sample from "../../../audio/Sample";
import Sound from "../../../audio/Sound";
import { SoundChannel } from "../../../audio/SoundChannel";
import AudioBufferSample from "./AudioBufferSample";


/* Simple sound object with volume controls */
export default class WebSound extends Sound {

    public static context: AudioContext;
    public source!: AudioBufferSourceNode;

    protected gainNode!: GainNode;

    buffer!: AudioBuffer;
    constructor(sample: Sample) {

        super(sample)

    }


    public getChannel(): SoundChannel {
        return SoundChannel.SOUND;
    }

    public create() {
        this.buffer = (this.sample as AudioBufferSample).buffer;
        this.source = WebSound.context.createBufferSource();
        this.source.buffer = this.buffer;


        // For volume
        this.gainNode = WebSound.context.createGain();
        Sound.sounds.push(this);
        this.initializeNodes();
        this.connectNodes();
        this.reinitializeSource();
    }

    clone() {
        let sound = new WebSound(this.sample);
        sound.create();
        return sound;
    }

    protected initializeNodes() {
    }

    protected connectNodes() {
        this.source.connect(this.gainNode);
        this.gainNode.connect(WebSound.context.destination);
    }

    protected getRootNode(): AudioNode {
        return this.gainNode;
    }


    protected reinitializeSource() {
        this.source.disconnect(this.getRootNode());
        let newSource = WebSound.context.createBufferSource();
        newSource.buffer = this.source.buffer;
        newSource.loop = this.source.loop;
        newSource.playbackRate.value = this.source.playbackRate.value;
        newSource.detune.value = this.source.detune.value;
        newSource.connect(this.getRootNode());
        this.source = newSource;
    }
    public ignoreChannel: boolean = false;

    private vol: number = 1.0;
    get volume(): number {
        return this.vol;
    }

    set volume(value: number) {
        this.vol = value;

        let v = Sound.CHANNELS.get(this.getChannel());
        if (v == undefined) {
            v = 1.0;
        }

        this.gainNode.gain.setValueAtTime(this.vol * (this.ignoreChannel ? 1 : v), WebSound.context.currentTime)
    }



    get speed(): number {
        return this.source.playbackRate.value;
    }

    set speed(value: number) {
        this.source.playbackRate.value = value;
    }

    get loop(): boolean {
        return this.source.loop;
    }

    set loop(value: boolean) {
        this.source.loop = value;
    }

    get detune(): number {
        return this.source.detune.value;
    }

    set detune(value: number) {
        this.source.detune.setValueAtTime(value, WebSound.context.currentTime);
    }

    protected startTimestamp: number = -1;

    get currentTime(): number {
        if (this.source.buffer != null)
            return ((WebSound.context.currentTime) - (this.startTimestamp)) % (this.source.buffer.duration / this.speed);
        else {
            return -1;
        }
    }

    get trackDuration(): number {
        if (this.source.buffer != null) {
            return this.source.buffer.duration / this.speed;
        }
        else {
            return -1;
        }
    }

    public play() {
        this.stop();

        this.reinitializeSource();

        this.startTimestamp = WebSound.context.currentTime;
        this.source.start(0);
        this.source.addEventListener("ended", (ev) => {
            this.startTimestamp = -1;
        });
        this.volume = this.vol;
    }

    public stop() {
        if (this.startTimestamp != -1) {
            this.startTimestamp = -1;
            this.source.stop();
        }
    }

    public destroy() {
        this.stop();
        let i = Sound.sounds.indexOf(this);
        if (i != -1) {
            Sound.sounds.splice(i);
        }
    }
}