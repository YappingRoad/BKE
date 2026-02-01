import Vector2 from "./Vector2";

export default class Line {
    x1: number = 0;
    x2: number = 0;
    y1: number = 0;
    y2: number = 0;
    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }

    get pointA(): Vector2 {
        return { x: this.x1, y: this.y1 };
    }

    get pointB(): Vector2 {
        return { x: this.x2, y: this.y2 };
    }

    get midpoint(): Vector2 {
        return { x: (this.x1 + this.x2) / 2, y: (this.y1 + this.y2) / 2 };
    }

    public static fromPoints(pointA: Vector2, pointB: Vector2): Line {
        return new Line(pointA.x, pointA.y, pointB.x, pointB.y);
    }
}