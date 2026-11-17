import { IRenderer } from "../../renderers/Renderer";
import Platform from "../Platform";
import Web from "../web/Web";

export default class Android extends Web {
    constructor() {
        super()
        this.setPlatform()
    }
}