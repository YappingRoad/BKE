import Callback from "../../Callback";
import Dimensions from "../../math/Dimensions";
import Rectangle from "../../math/Rectangle";
import Vector2 from "../../math/Vector2";
import Renderer from "../../renderers/Renderer";
import BrowserUtil from "../../utilities/BrowserUtil";
import MathUtil from "../../utilities/MathUtil";
import Input from "../Input";
import MouseData, { ButtonData } from "./interfaces/MouseData";

// Note: this also handles Touch, should we seperate that? todo:
export default class Mouse {

    public SENSITIVITY: number = 0.5;
    public LOCK_ON_CLICK: boolean = false;
    public LOCKED_RAW_INPUT: boolean = true;
    onMousePoll: Callback<MouseData>;
    onLock: Callback<void>;

    lastData: MouseData = {
        x: 0,
        y: 0,
        rawX: 0,
        rawY: 0,
        deltaX: 0,
        deltaY: 0,
        rawDeltaX: 0,
        rawDeltaY: 0,
        left: false,
        middle: false,
        right: false,
        back: false,
        forward: false,
        scroll: 0,
        locked: false
    };

    currentData: MouseData = {
        x: 0,
        y: 0,
        rawX: 0,
        rawY: 0,
        deltaX: 0,
        deltaY: 0,
        rawDeltaX: 0,
        rawDeltaY: 0,
        left: false,
        middle: false,
        right: false,
        back: false,
        forward: false,
        scroll: 0,
        locked: false
    };

    touchEvent: boolean = false;

    lastTouchEventType: TouchEventType = TouchEventType.END;
    constructor() {
        this.onMousePoll = new Callback();
        this.onLock = new Callback();
        // for some reason compiler just decided to give me errors without document as any, i have no idea why
        if ("onpointerrawupdate" in document) {
            (window as any).addEventListener("pointerrawupdate", (ev: PointerEvent) => {
                if (this.touchEvent) return;

                if (Renderer.CURRENT.pointerLocked()) {
                    this.pointerLockedInputUpdate(ev);
                }
                else {
                    this.updateMouse(ev);
                }
            });
        }
        else {
            (window as any).addEventListener("pointermove", (ev: PointerEvent) => {
                if (this.touchEvent) return;

                if (Renderer.CURRENT.pointerLocked()) {
                    this.pointerLockedInputUpdate(ev);
                }
                else {
                    this.updateMouse(ev);
                }
            });
        }

        (window as any).addEventListener("pointerdown", (ev: PointerEvent) => {
            if (this.touchEvent) return;
            if (Renderer.CURRENT.pointerLocked()) {
                this.pointerLockedInputUpdate(ev, false);
            }
            else {
                this.updateMouse(ev);
            }
        });

        (window as any).addEventListener("pointerup", (ev: PointerEvent) => {
            if (this.touchEvent) return;

            if (Renderer.CURRENT.pointerLocked()) {
                this.pointerLockedInputUpdate(ev, false);
            }
            else {
                this.updateMouse(ev);
            }
        });

        window.addEventListener("touchstart", (ev) => {
            this.touchEvent = true;


            this.touch(ev.touches[0], TouchEventType.START);

            // can throw errors in chrome
            if (BrowserUtil.isChrome()) return;
            try {
                // to stop scrolling in you guessed it, iOS SAFARI!!!
                ev.preventDefault();
            }
            catch (e) { }
        });

        window.addEventListener("touchmove", (ev) => {
            this.touchEvent = true;
            this.touch(ev.touches[0], TouchEventType.MOVE);

            // can throw errors in chrome
            if (BrowserUtil.isChrome()) return;

            try {
                // to stop scrolling in you guessed it, iOS SAFARI!!!
                ev.preventDefault();
            }
            catch (e) { }
        });

        window.addEventListener("touchend", (ev) => {
            this.touchEvent = true;


            this.touch(ev.touches[0], TouchEventType.END);

            // can throw errors in chrome
            if (BrowserUtil.isChrome()) return;

            try {
                // to stop scrolling in you guessed it, iOS SAFARI!!!
                ev.preventDefault();
            }
            catch (e) { }
        });

        window.addEventListener("wheel", (ev) => {
            this.currentData.scroll = ev.deltaY * -0.01;
            this.poll(this.currentData)
            ev.preventDefault()
        })
    }

    touch(ev: Touch, type: TouchEventType = TouchEventType.MOVE) {
        Input.pollsThisSecond++;


        this.lastTouchEventType = type;
        let ratio: number = Math.min(window.innerWidth / Dimensions.GAME_WIDTH, window.innerHeight / Dimensions.GAME_HEIGHT);

        let realGameWidth = (Dimensions.GAME_WIDTH * ratio);

        let width_space = 0;
        let height_space = 0;
        if (Math.ceil(realGameWidth) === window.innerWidth) {
            width_space = (window.innerWidth - (Dimensions.GAME_WIDTH * ratio));
            height_space = (window.innerHeight - (Dimensions.GAME_HEIGHT * ratio)) / 2;
        }
        else {
            width_space = (window.innerWidth - (Dimensions.GAME_WIDTH * ratio)) / 2;
            height_space = (window.innerHeight - (Dimensions.GAME_HEIGHT * ratio));
        }
        let data: MouseData;


        if (type != TouchEventType.END) {

            let dx = type === TouchEventType.START ? 0 : (ev.clientX - this.currentData.rawX);
            let dy = type === TouchEventType.START ? 0 : (ev.clientY - this.currentData.rawY);
            data = {
                x: ((ev.clientX - width_space) / ratio),
                y: ((ev.clientY - height_space) / ratio),
                rawX: ev.clientX,
                rawY: ev.clientY,
                deltaX: dx / ratio,
                deltaY: dy / ratio,
                rawDeltaX: dx,
                rawDeltaY: dy,
                left: false,
                middle: false,
                right: false,
                back: false,
                forward: false,
                scroll: 0,
                locked: false
            };


        }
        else {

            data = {
                x: this.currentData.x,
                y: this.currentData.y,
                rawX: this.currentData.rawX,
                rawY: this.currentData.rawY,
                deltaX: 0,
                deltaY: 0,
                rawDeltaX: 0,
                rawDeltaY: 0,
                left: false,
                middle: false,
                right: false,
                back: false,
                forward: false,
                scroll: 0,
                locked: false
            }
        }

        this.poll(data)
    }

    pointerLockedInputUpdate(ev: MouseEvent | PointerEvent, ignoreButtons: boolean = true) {
        Input.pollsThisSecond++;

        let dx = ev.movementX * this.SENSITIVITY;
        let dy = ev.movementY * this.SENSITIVITY;
        this.deltaPoll(dx, dy, ignoreButtons ? this.currentData : {
            left: this.getPressedRaw(ev, 0),
            middle: this.getPressedRaw(ev, 2),
            right: this.getPressedRaw(ev, 1),
            back: this.getPressedRaw(ev, 3),
            forward: this.getPressedRaw(ev, 5),
        })

    }

    deltaPoll(dx: number, dy: number, buttons: ButtonData, clamp: boolean = true) {
        let ratio: number = Math.min(window.innerWidth / Dimensions.GAME_WIDTH, window.innerHeight / Dimensions.GAME_HEIGHT);

        let x = this.lastData.x + (dx / ratio);
        let y = this.lastData.y + (dy / ratio);

        const UITop = Dimensions.getUITop();
        const UIBottom = Dimensions.getUIBottom();

        const UILeft = Dimensions.getUILeft();
        const UIRight = Dimensions.getUIRight();



        let data: MouseData = {
            x: clamp ? Math.min(Math.max(UILeft, x), UIRight) : x,
            y: clamp ? Math.min(Math.max(UITop, y), UIBottom) : y,
            rawX: this.lastData.rawX + dx,
            rawY: this.lastData.rawY + dy,
            deltaX: dx / ratio,
            deltaY: dy / ratio,
            rawDeltaX: dx,
            rawDeltaY: dy,
            left: buttons.left,
            middle: buttons.middle,
            right: buttons.right,
            back: buttons.back,
            forward: buttons.forward,
            scroll: 0,
            locked: true
        };
        this.poll(data);

    }


    lock() {
        Renderer.CURRENT.lockPointer(this.LOCKED_RAW_INPUT);
        this.onLock.dispatch();
    }


    unlock() {
        Renderer.CURRENT.unlockPointer();
    }

    get LOCKED() {
        return Renderer.CURRENT.pointerLocked();
    }

    updateMouse(ev: PointerEvent | MouseEvent) {
        Input.pollsThisSecond++;
        this.mousePoll(ev.clientX, ev.clientY, {
            left: this.getPressedRaw(ev, 0),
            middle: this.getPressedRaw(ev, 2),
            right: this.getPressedRaw(ev, 1),
            back: this.getPressedRaw(ev, 3),
            forward: this.getPressedRaw(ev, 5),
        })

    }

    mousePoll(x: number, y: number, buttons: ButtonData) {
        const UIRect = Dimensions.UIRect()


        let ratio: number = Math.min(window.innerWidth / UIRect.width, window.innerHeight / UIRect.height);

        let realGameWidth = (UIRect.width * ratio);

        let width_space = 0;
        let height_space = 0;
        if (Math.ceil(realGameWidth) === window.innerWidth) {
            width_space = (window.innerWidth - (UIRect.width * ratio));
            height_space = (window.innerHeight - (UIRect.height * ratio)) / 2;
        }
        else {
            width_space = (window.innerWidth - (UIRect.width * ratio)) / 2;
            height_space = (window.innerHeight - (UIRect.height * ratio));
        }


        // we have to do this because firefox is shit
        let dx = (x - this.lastData.rawX);
        let dy = (y - this.lastData.rawY);

        let data: MouseData = {
            x: ((x - width_space) / ratio) + UIRect.x,
            y: ((y - height_space) / ratio)+ UIRect.y,
            rawX: x,
            rawY: y,
            deltaX: dx / ratio,
            deltaY: dy / ratio,
            rawDeltaX: dx,
            rawDeltaY: dy,
            scroll: 0,
            left: buttons.left,
            middle: buttons.middle,
            right: buttons.right,
            back: buttons.back,
            forward: buttons.forward,
            locked: false
        };
        this.poll(data);
        if (this.LOCK_ON_CLICK && this.justPressedLeft()) {
            this.lock();
        }
    }

    poll(data: MouseData) {
        this.currentData = data;
        this.onMousePoll.dispatch(data);
        Input.poll()
        this.lastData = data;
    }

    isPressed(button: MouseButtons): boolean {
        switch (button) {
            case MouseButtons.LEFT:
                return this.currentData.left;
            case MouseButtons.MIDDLE:
                return this.currentData.middle;
            case MouseButtons.RIGHT:
                return this.currentData.right;
            case MouseButtons.BACK:
                return this.currentData.back;
            case MouseButtons.FORWARD:
                return this.currentData.forward;
        }
    }

    justPressedLeft(): boolean {
        return this.lastData.left === false && this.currentData.left === true;
    }

    justReleasedLeft(): boolean {
        return this.lastData.left === true && this.currentData.left === false;
    }

    justPressedMiddle(): boolean {
        return this.lastData.middle === false && this.currentData.middle === true;
    }

    justReleasedMiddle(): boolean {
        return this.lastData.middle === true && this.currentData.middle === false;
    }

    justPressedRight(): boolean {
        return this.lastData.right === false && this.currentData.right === true;
    }

    justReleasedRight(): boolean {
        return this.lastData.right === true && this.currentData.right === false;
    }

    justLocked(): boolean {
        return this.lastData.locked === false && this.currentData.locked === true;
    }

    justUnlocked(): boolean {
        return this.lastData.locked === true && this.currentData.locked === false;
    }
    // todo, actually use point detection instead of a 1px rect
    over(rect: Rectangle): boolean {
        return MathUtil.rectsOverlap({ x: this.currentData.x, y: this.currentData.y, width: 1, height: 1 }, rect);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons#javascript
    private getPressedRaw(event: MouseEvent, id: number): boolean {
        // Use binary `&` with the relevant power of 2 to check if a given button is pressed
        return Boolean(event.buttons & (1 << id));
    }

    getVector(): Vector2 {
        return new Vector2(this.currentData.x, this.currentData.y);
    }
}


export enum TouchEventType {
    START,
    MOVE,
    END
}

export enum MouseButtons {
    LEFT = 1,
    RIGHT = 2,
    MIDDLE = 3,
    BACK = 4,
    FORWARD = 5,
}