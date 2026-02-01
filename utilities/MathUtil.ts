import Line from "../math/Line";
import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";

export default class MathUtil {
    public static EPSILON = 1e-9;
    /**
     * Scratch's sin() function, used for porting some old effects
     * @param n Input
     * @return number
     */
    public static sSin(n: number): number {
        return Math.sin((Math.PI * n) / 180);
    }

    public static normalize(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
        let outRange = outMax - outMin;
        let inRange = inMax - inMin;
        return (x - inMin) * outRange / inRange + outMin;
    }

    public static bound(x: number, min: number | null = null, max: number | null = null): number {
        let lowerBound: number = (min != null && x < min) ? min : x;
        return (max != null && lowerBound > max) ? max : lowerBound;
    }

    public static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    };

    public static mean(...values: Array<number>): number {
        let total = 0;
        for (const num of values) {
            total += num;
        }
        return total / values.length;
    }

    public static inBounds(x: number, min: number, max: number): boolean {
        return (x >= min) && (x <= max);
    }

    public static getRandomInt(min: number, max: number): number {
        const minCeiled = Math.ceil(min);
        return Math.floor(Math.random() * (Math.floor(max) - minCeiled + 1) + minCeiled)
    }

    public static getRandomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static getRandomID(): number {
        let arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        let num = arr[0];
        return num;
    }

    public static getUniqueRandomID(existsCheck: (x: number) => boolean): number {
        let arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        let num = arr[0];
        if (existsCheck(num)) {
            return MathUtil.getUniqueRandomID(existsCheck);
        }

        return num;
    }

    public static getRandomBool(): boolean {
        return Math.round(Math.random()) === 1;
    }

    public static lerp(x: number, y: number, a: number): number {
        return x * (1.0 - a) + y * a;
    }


    public static getRectangleSides(r: Rectangle): RectangleSides {
        return {
            left: new Line(r.x, r.y, r.x, r.y + r.height),
            right: new Line(r.x + r.width, r.y, r.x + r.width, r.y + r.height),
            bottom: new Line(r.x, r.y + r.height, r.x + r.width, r.y + r.height),
            top: new Line(r.x, r.y, r.x + r.width, r.y),
        };
    }

    public static toDeg(radians: number): number {
        return radians * (180 / Math.PI);
    }

    public static toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private static orientation(px: number, py: number, qx: number, qy: number, rx: number, ry: number): number {
        const val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
        if (val === 0) return 0; // collinear
        return val > 0 ? 1 : 2; // 1 = clockwise, 2 = counterclockwise
    }

    private static onSegment(px: number, py: number, qx: number, qy: number, rx: number, ry: number): boolean {
        return (
            qx <= Math.max(px, rx) &&
            qx >= Math.min(px, rx) &&
            qy <= Math.max(py, ry) &&
            qy >= Math.min(py, ry)
        );
    }

    static intersect(l1: Line, l2: Line): boolean {
        const { x1: p1x, y1: p1y, x2: q1x, y2: q1y } = l1;
        const { x1: p2x, y1: p2y, x2: q2x, y2: q2y } = l2;

        const o1 = MathUtil.orientation(p1x, p1y, q1x, q1y, p2x, p2y);
        const o2 = MathUtil.orientation(p1x, p1y, q1x, q1y, q2x, q2y);
        const o3 = MathUtil.orientation(p2x, p2y, q2x, q2y, p1x, p1y);
        const o4 = MathUtil.orientation(p2x, p2y, q2x, q2y, q1x, q1y);

        if (o1 !== o2 && o3 !== o4) return true;

        //Special Cases (collinear overlaps)
        if (o1 === 0 && MathUtil.onSegment(p1x, p1y, p2x, p2y, q1x, q1y)) return true;
        if (o2 === 0 && MathUtil.onSegment(p1x, p1y, q2x, q2y, q1x, q1y)) return true;
        if (o3 === 0 && MathUtil.onSegment(p2x, p2y, p1x, p1y, q2x, q2y)) return true;
        if (o4 === 0 && MathUtil.onSegment(p2x, p2y, q1x, q1y, q2x, q2y)) return true;

        return false;
    }

    public static rectsOverlap(a: Rectangle, b: Rectangle): boolean {
        // no horizontal overlap
        if (a.x >= b.x + b.width || b.x >= a.x + a.width) { return false; }

        // no vertical overlap
        if (a.y >= b.y + b.height || b.y >= a.y + a.height) { return false; }

        return true;
    }

    public static getCenterPoint(rect: Rectangle): Vector2 {
        return { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.5 };
    }

    public static growRect(rect: Rectangle, size: number): Rectangle {
        return { x: rect.x - size, y: rect.y - size, width: rect.width + size, height: rect.height + size }
    }

    public static getNumbersInRange(start: number, end: number) {
        const numbers = [];
        for (let i = start; i <= end; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    public static getClosestNumber(nums: number[], goal: number) {
        return nums.reduce((prev, curr) => {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
    }


    public static getClosestNumberMap(nums: MapIterator<number>, goal: number) {
        let arr: Array<number> = [];

        for (const num of nums) {
            arr.push(num);
        }
        arr.sort()

        return MathUtil.getClosestNumber(arr, goal);
    }

    public static roundToNearestMultiple(n: number, mult: number) {
        return Math.round(n / mult) * mult;
    }


    public static floorToNearestMultiple(n: number, mult: number) {
        return Math.floor(n / mult) * mult;
    }
    public static ceilToNearestMultiple(n: number, mult: number) {
        return Math.ceil(n / mult) * mult;
    }

    public static wrapAngle(n: number) {
        n %= 360;
        if (0 > n) {
            n = 360 + n;
        }
        return n;
    }
}


export type RectangleSides = {
    left: Line;
    top: Line;
    right: Line;
    bottom: Line;
}
