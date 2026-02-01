import Vector2 from "./Vector2";

export default class Rectangle extends Vector2 {
    public width: number;
    public height: number;
    constructor(x: number, y: number, width: number, height: number) {
        super(x, y);
        this.width = width;
        this.height = height;
    }

    static getCenterPoint(rect:Rectangle): Vector2 {
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }
}