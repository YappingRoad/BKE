import { parentPort } from "node:worker_threads";


import * as r from "raylib";
export interface RaylibMouseWorkerData {
    x: number,
    y: number,
    buttons: ButtonData,
}
import * as robot from "robotjs";
import { ButtonData } from "../../input/devices/interfaces/MouseData";
import VectorDeltaTracker from "../../math/VectorDeltaTracker";
import Callback from "../../Callback";

class ButtonsTracker {
    value: ButtonData = {
        left: false,
        middle: false,
        right: false,
        back: false,
        forward: false,
    }
    onChange: Callback<ButtonData> = new Callback()
    update(buttonData: ButtonData) {
        if (this.value.left !== buttonData.left
            || this.value.middle !== buttonData.middle
            || this.value.right !== buttonData.right
            || this.value.back !== buttonData.back
            || this.value.forward !== buttonData.forward) {
            this.onChange.dispatch(buttonData)
        }
        this.value = buttonData;

    }
}






const pos: VectorDeltaTracker = new VectorDeltaTracker();

pos.onChange.add((vec) => {


    parentPort?.postMessage({ buttons: buttons.value, x: vec.x - r.GetWindowPosition().x, y: vec.y - r.GetWindowPosition().y } as RaylibMouseWorkerData)
})


const buttons = new ButtonsTracker()
buttons.onChange.add((data) => {
    if (pos.value !== null) {
        parentPort?.postMessage({ buttons: data, x: pos.value.x - r.GetWindowPosition().x, y: pos.value.y - r.GetWindowPosition().y } as RaylibMouseWorkerData)
    }
})


while (!r.WindowShouldClose()) {

    // TODO: input
    // Raylibs buttons still only update on frame, meaning if you got a 1000 hz polling rate mouse it wont matter because
    // raylib will only update at 60hz for example.
    const but = {
        left: r.IsMouseButtonDown(r.MOUSE_BUTTON_LEFT),
        middle: r.IsMouseButtonDown(r.MOUSE_BUTTON_MIDDLE),
        right: r.IsMouseButtonDown(r.MOUSE_BUTTON_RIGHT),
        back: r.IsMouseButtonDown(r.MOUSE_BUTTON_BACK),
        forward: r.IsMouseButtonDown(r.MOUSE_BUTTON_FORWARD),
    }
    buttons.update(but)
    pos.diffOf(robot.getMousePos())
}


