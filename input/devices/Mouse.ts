import Callback from "../../Callback";
import Dimensions from "../../math/Dimensions";
import Rectangle from "../../math/Rectangle";
import Vector2 from "../../math/Vector2";
import Platform from "../../platform/Platform";
import Renderer from "../../renderers/Renderer";
import MathUtil from "../../utilities/MathUtil";
import Input from "../Input";
import MouseData, { ButtonData } from "./interfaces/MouseData";

// Note: this also handles Touch, should we seperate that? todo:
export default class Mouse {
    touchEvent: boolean = false;

    lastTouchEventType: TouchEventType = TouchEventType.END;
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


    constructor() {
        this.onMousePoll = new Callback();
        this.onLock = new Callback();

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



    mousePoll(x: number, y: number, buttons: ButtonData) {

        const UIRect = Dimensions.UIRect()
        const docSize = Renderer.CURRENT.getDocumentSize()

        let ratio: number = Math.min(docSize.x / UIRect.width, docSize.y / UIRect.height);

        let realGameWidth = (UIRect.width * ratio);

        let width_space = 0;
        let height_space = 0;
        if (Math.ceil(realGameWidth) === docSize.x) {
            width_space = (docSize.x - (UIRect.width * ratio));
            height_space = (docSize.y - (UIRect.height * ratio)) / 2;
        }
        else {
            width_space = (docSize.x - (UIRect.width * ratio)) / 2;
            height_space = (docSize.y - (UIRect.height * ratio));
        }


        // we have to do this because firefox is shit
        let dx = (x - this.lastData.rawX);
        let dy = (y - this.lastData.rawY);

        let data: MouseData = {
            x: ((x - width_space) / ratio) + UIRect.x,
            y: ((y - height_space) / ratio) + UIRect.y,
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

        if (this.lastData == data) {
            return;
        }
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