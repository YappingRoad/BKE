import Destroyable from "../interfaces/Destroyable";

export default class Sample implements Destroyable {
    data: ArrayBuffer;
    constructor(data: ArrayBuffer) {
        this.data = data;
    }

    public async load() {}
    
    public destroy() {
    }
}