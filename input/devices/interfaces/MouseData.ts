export default interface MouseData extends ButtonData {
    x: number;
    y: number;
    rawX: number,
    rawY: number,
    deltaX: number;
    deltaY: number;
    rawDeltaX: number,
    rawDeltaY: number,

    scroll: number;
    locked: boolean;
}

export interface ButtonData {
    left: boolean;
    middle: boolean;
    right: boolean;
    back: boolean;
    forward: boolean;
}