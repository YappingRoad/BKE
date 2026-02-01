import Vector2 from "./Vector2";

export default class Vector3 extends Vector2 {
    public z: number;

    constructor(x: number, y: number, z: number) {
        super(x, y);
        this.z = z;
    }

    public static zero(): Vector3 {
        return { x: 0, y: 0, z: 0 }
    }
}