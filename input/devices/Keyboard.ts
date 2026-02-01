import Callback from "../../Callback";
import Input from "../Input";



export enum Key {
   A = "KeyA",
   B = "KeyB",
   C = "KeyC",
   D = "KeyD",
   E = "KeyE",
   F = "KeyF",
   G = "KeyG",
   H = "KeyH",
   I = "KeyI",
   J = "KeyJ",
   K = "KeyK",
   L = "KeyL",
   M = "KeyM",
   N = "KeyN",
   O = "KeyO",
   P = "KeyP",
   Q = "KeyQ",
   R = "KeyR",
   S = "KeyS",
   T = "KeyT",
   U = "KeyU",
   V = "KeyV",
   W = "KeyW",
   X = "KeyX",
   Y = "KeyY",
   Z = "KeyZ",
   Digit0 = "Digit0",
   Digit1 = "Digit1",
   Digit2 = "Digit2",
   Digit3 = "Digit3",
   Digit4 = "Digit4",
   Digit5 = "Digit5",
   Digit6 = "Digit6",
   Digit7 = "Digit7",
   Digit8 = "Digit8",
   Digit9 = "Digit9",
   Enter = "Enter",
   Escape = "Escape",
   Backspace = "Backspace",
   Tab = "Tab",
   Space = "Space",
   ArrowUp = "ArrowUp",
   ArrowDown = "ArrowDown",
   ArrowLeft = "ArrowLeft",
   ArrowRight = "ArrowRight",
   ShiftLeft = "ShiftLeft",
   ShiftRight = "ShiftRight",
   ControlLeft = "ControlLeft",
   ControlRight = "ControlRight",
   AltLeft = "AltLeft",
   AltRight = "AltRight",
   MetaLeft = "MetaLeft",
   MetaRight = "MetaRight",
   CapsLock = "CapsLock",
   F1 = "F1",
   F2 = "F2",
   F3 = "F3",
   F4 = "F4",
   F5 = "F5",
   F6 = "F6",
   F7 = "F7",
   F8 = "F8",
   F9 = "F9",
   F10 = "F10",
   F11 = "F11",
   F12 = "F12",
}

export default class Keyboard {

    public onKeyPoll: Callback<void> = new Callback();

    constructor() {
        document.addEventListener("keydown", (ev) => {
            this.onKeyDown(ev);
        });

        document.addEventListener("keyup", (ev) => {
            this.onKeyUp(ev);
        });
    }


    private last: Array<Key> = [];

    private pressed: Array<Key> = [];

    private onKeyDown(ev:KeyboardEvent) {
        this.last = [];
        for (const key of this.pressed) {
            this.last.push(key);
        }
        if (!this.pressed.includes(ev.code as Key)) {
            this.pressed.push(ev.code as Key);
        }
        this.onKeyPoll.dispatch();
        Input.poll()
    }

    private onKeyUp(ev:KeyboardEvent) {
        this.last = [];
        for (const key of this.pressed) {
            this.last.push(key);
        }
        if (this.pressed.includes(ev.code as Key)) {
            this.pressed.splice(this.pressed.indexOf(ev.code as Key), 1);
        }
        this.onKeyPoll.dispatch();
        Input.poll()
    }

    public isKeyDown(key:Key): boolean {
        return this.pressed.includes(key);
    }

    public justPressed(key:Key): boolean {
        return !this.last.includes(key) && this.pressed.includes(key);
    }

    public justReleased(key:Key): boolean {
        return this.last.includes(key) && !this.pressed.includes(key);
    }
}