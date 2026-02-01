import Destroyable from "./interfaces/Destroyable";
import Updatable from "./interfaces/Updatable";

export default class Plugin implements Updatable, Destroyable {
    static plugins: Array<Plugin> = [];
    constructor() {
        Plugin.plugins.push(this);
    }
    
    destroy(): void {
        Plugin.plugins.splice(Plugin.plugins.indexOf(this), 1);
    }

    update(elapsed: number): void {}
}