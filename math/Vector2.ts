import MathUtil from "../utilities/MathUtil";

export default class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static zero(): Vector2 {
        return { x: 0, y: 0 }
    }
    public static midpoint(...vectors: Vector2[]): Vector2 {
        let x = 0;
        let y = 0;
        for (const vector of vectors) {
            x += vector.x;
            y += vector.y;
        }
        return { x: (x / vectors.length), y: (y / vectors.length) }
    }

    public static lerp(a: Vector2, b: Vector2, percentage: number): Vector2 {
        if (percentage > 1) {
            return a;
        }
        let vec = Vector2.zero()
        vec.x = MathUtil.lerp(a.x, b.x, percentage)
        vec.y = MathUtil.lerp(a.y, b.y, percentage)
        return vec;
    }

    public static distanceToPoint(i: Vector2, ii: Vector2): number {
        let a = i.x - ii.x;
        let b = i.y - ii.y;
        return Math.sqrt(a * a + b * b);
    }

    // Does not use square root to determine raw distance
    // great for code that needs to be ran as fast as possible (physics)
    public static distanceToPointRaw(i: Vector2, ii: Vector2): number {
        let a = i.x - ii.x;
        let b = i.y - ii.y;
        return a * a + b * b;
    }

    /**
     * Returns the angle from point A to B in radians
     */
    public static atobR(a: Vector2, b: Vector2) {
        return Math.atan2(b.y - a.y, b.x - a.x)
    }


    /**
     * Returns the angle from point A to B in degrees from 0-360
     */
    public static atobD(a: Vector2, b: Vector2) {
        let deg = this.atobR(a,b) * (180/Math.PI);
        if (0 > deg) {
           deg = 360 + deg;
        }
        return deg
    }

    public static clone(vec:Vector2) {
        return {x: vec.x, y: vec.y}
    }


    public static mean(vec: Vector2) {
        return MathUtil.mean(vec.x, vec.y);
    }
    public static min(vec: Vector2) {
        return Math.min(vec.x, vec.y);
    }
    public static max(vec: Vector2) {
        return Math.max(vec.x, vec.y);
    }
}