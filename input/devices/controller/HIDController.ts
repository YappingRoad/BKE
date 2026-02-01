import Callback, { CallbackID } from "../../../Callback";
import Input from "../../Input";
import Controller from "../Controller";

export default class HIDController extends Controller {
    device: HIDDevice;
    _disconnectListener:CallbackID;
    constructor(device: HIDDevice) {
        super()
        this.device = device;
        this.device.open().then(() => {
            this.open()
            this.device.addEventListener("inputreport", (ev) => {
                this.onData(ev.reportId, ev.data);
            })
        })

        this._disconnectListener = Input.onHidDisconnect.addID((device)=>{
            if (this.device === device) {
                this.destroy();
            }
        })
    }

    public on(value: number, check: number) {
        return (value & check) === check;
    }

    open() {
    }

    onData(reportID: number, data: DataView) {
    }

    override destroy(): void {
        Input.onHidDisconnect.removeID(this._disconnectListener);
        this.device.close().then(() => {
            super.destroy();
        })
    }
}