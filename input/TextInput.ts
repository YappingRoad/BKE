import Callback from "../Callback";
import Destroyable from "../interfaces/Destroyable";
import BrowserUtil from "../utilities/BrowserUtil";
import MathUtil from "../utilities/MathUtil";

export default class TextInput implements Destroyable {
    inputElem: HTMLInputElement;
    onText: Callback<string> = new Callback();
    onEnterKey: Callback<void> = new Callback();

    get autofilled() {
        return this.inputElem.matches(":autofill");
    }

    get value() {
        return this.inputElem.value;
    }

    set value(str:string) {
        this.inputElem.value = str;
    }


    constructor() {
        this.inputElem = document.createElement("input");
        this.inputElem.type = "text";
        this.inputElem.style.position = "fixed";
        this.inputElem.style.top = "-32px";
        this.inputElem.style.opacity = "0";
        this.inputElem.autocomplete = "off";
        this.inputElem.id = window.btoa(`${MathUtil.getRandomID()}`);
        this.inputElem.tabIndex = document.body.querySelectorAll('input[type="text"]').length + 1;
        document.body.appendChild(this.inputElem);
        this.inputElem.addEventListener("input", (ev) => {
            this.onText.dispatch(this.inputElem.value);
        })

        this.inputElem.addEventListener("keypress", (ev) => {
            if (ev.key === "Enter") {
                this.blur();
                this.onEnterKey.dispatch();
                ev.preventDefault();
                return;
            }

        })


        this.inputElem.addEventListener("focus", (ev) => {
            this.onText.dispatch(this.inputElem.value);
            // so we dont end up in an infinite loop
            this.focus(true);
        })

        this.inputElem.addEventListener("blur", (ev) => {
            // so we dont end up in an infinite loop
            this.blur(true);
        })
    }

    set characterLimit(v: number) {
        this.inputElem.maxLength = v;
    }

    get characterLimit(): number {
        return this.inputElem.maxLength;
    }

    //tysm https://stackoverflow.com/a/39779560
    get selected(): number[] {

        let start = this.inputElem.selectionStart;
        let end = this.inputElem.selectionEnd;
        if (start === null) {
            return [];
        }
        // make typescript happy
        if (end === null) {
            return [];
        }
        if (start >= 0 && start === end) {
            return [start];
        } else if (start >= 0) {
            return [start, end];
        }
        return [];
    }

    set selected(arr: number[]) {
        arr.sort((a, b) => {
            return a - b;
        });
        if (arr.length === 0) {
            this.inputElem.selectionStart = null;
            this.inputElem.selectionEnd = null;
        }
        else if (arr.length >= 1) {
            this.inputElem.selectionStart = arr[0];
            this.inputElem.selectionEnd = arr[(arr.length + 1) % 2];
        }

    }

    focused: boolean = false;

    focus(fromEvent: boolean = false) {

        //guh
        if (!fromEvent) {
            if (BrowserUtil.isSafari()) {
                this.inputElem.style.opacity = "1";
                this.inputElem.style.left = "10dvw";
                this.inputElem.style.width = "80dvw";
                this.inputElem.style.top = "10dvh";

                // weird desync so force the user to have to click somewhere else i guess
                if (!this.focused) {
                    this.inputElem.focus();
                }
            }
            else {
                this.inputElem.focus();
                this.inputElem.click();
            }
        }
        this.focused = true;
    }

    blur(fromEvent: boolean = false) {
        if (BrowserUtil.isSafari()) {
            this.inputElem.style.opacity = "0";
        }
        if (!fromEvent) {
            this.inputElem.blur();
        }
        this.focused = false;
    }


    destroy(): void {
        this.inputElem.blur();
        document.body.removeChild(this.inputElem);
        this.onText.removeAll();
        this.onEnterKey.removeAll();
    }




}