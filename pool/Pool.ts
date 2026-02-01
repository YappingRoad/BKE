import MathUtil from "../utilities/MathUtil";

export default class Pool<T> {
    protected readonly map: Map<number, T>;
    constructor() {
        this.map = new Map();
    }

    add(obj: T): PoolID<T> {
        const id: PoolID<T> = MathUtil.getUniqueRandomID((x) => {
            return this.map.has(x);
        });
        this.set(id, obj)
        return id;
    }

    set(id: PoolID<T>, obj: T) {
        this.map.set(id, obj);
    }

    remove(id: PoolID<T>): void {
        this.map.delete(id);
    }

    clear(): void {
        this.removeAll();
    }

    removeAll(): void {
        this.map.clear();
    }

}

export type PoolID<T> = number;