import { VibrationData } from "../input/devices/interfaces/ControllerData";
import Input from "../input/Input";

export default class Haptic {
    public static ENABLED:boolean = true;
    // for android users who are cool and can have haptics unlike ios users who are sad and hate fun
    public static vibrate(data: VibrationData) {
        if (!Haptic.ENABLED) {
            return;
        }
        if (Haptic.supported() && data.durationMS !== undefined) {
            navigator.vibrate([data.durationMS]);
        }
        Input.CONTROLLERS.forEach((controller)=>{
            controller.vibrate(data)
        })
    }

    public static supported():boolean {
        return "vibrate" in navigator;
    }
}