import Destroyable from "../../interfaces/Destroyable";
import Pool, { PoolID } from "../Pool";

export class DestroyablePool extends Pool<Destroyable> {

    override removeAll(): void {
        for (const obj of this.map.values()) {
            obj.destroy()
        }
        super.removeAll();
    }

    override remove(id: PoolID<Destroyable>): void {
        const obj = this.map.get(id);
        if (obj !== undefined) {
            obj.destroy()
        }
        super.remove(id);
    }
}