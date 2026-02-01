import { Sprite, Axes } from "../Sprite";
import Vector2 from "../math/Vector2";

export default class SpriteUtil {
    public static moveAngle(sprite: Sprite, steps: number, angle: number): void {
        let radians: number = (Math.PI / 180) * (angle);
        sprite.x += steps * Math.cos(radians);
        sprite.y += steps * Math.sin(radians);
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
     * Center a sprites center to another sprites center.
     * @param sprite sprite to center. 
     * @param to sprite to center to
     * @param axis center x or y
     */
    public static spriteCenter(sprite: Sprite, to: Sprite, axis: Axes = Axes.XY): void {
        if (axis === Axes.XY) {
            sprite.x = to.x + (to.hitbox.x / 2) - (sprite.hitbox.x / 2);
            sprite.y = to.y + (to.hitbox.y / 2) - (sprite.hitbox.y / 2);
        } else if (axis === Axes.X)
            sprite.x = to.x + (to.hitbox.x / 2) - (sprite.hitbox.x / 2);
        else if (axis === Axes.Y)
            sprite.y = to.y + (to.hitbox.y / 2) - (sprite.hitbox.y / 2);
    }
}
