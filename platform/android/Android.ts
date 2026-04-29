import { IRenderer } from "../../renderers/Renderer";
import Platform from "../Platform";
import Web from "../web/Web";

export default class Android extends Platform {

    web:Web;
    constructor() {
        super()
        this.web = new Web();
        this.setPlatform()
    }
    getDefaultRenderer(): IRenderer {
        return this.web.getDefaultRenderer()
    }
}