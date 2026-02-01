import Destroyable from "../interfaces/Destroyable";
import MathUtil from "../utilities/MathUtil";

export default class Graphic implements Destroyable {
    blob: Blob;
    src: string = "";

    constructor(blob: Blob) {
        this.blob = blob;
    }

    load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        })
    }

    get width():number {
        return 0;
    }
    
    get height():number {
        return 0;
    }

    destroy(): void {
    }


}