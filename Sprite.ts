import Drawable from "./interfaces/Drawable";
import Updatable from "./interfaces/Updatable";
import Vector2 from "./math/Vector2";
import PreloadRequestable, { PreloadAsset } from "./interfaces/PreloadRequestable";
import Destroyable from "./interfaces/Destroyable";
import Rectangle from "./math/Rectangle";
import Color from "./math/Color";
import Dimensions from "./math/Dimensions";
import Input from "./input/Input";
import Graphic from "./graphic/Graphic";
import Renderer from "./renderers/Renderer";

export class Sprite extends Vector2 implements Updatable, Drawable, PreloadRequestable, Destroyable {
    public angle: number = 0;
    public alpha: number = 1.0;

    public scale: Vector2;
    public hitbox: Vector2;
    public origin: Vector2;

    index: number;


    goto(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
    }

    centerOnPoint(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
        this.x -= this.origin.x;
        this.y -= this.origin.y;
    }


    constructor(x: number = 0, y: number = 0, index: number = 0) {
        super(x, y);
        this.index = index;
        this.scale = new Vector2(1.0, 1.0);
        this.hitbox = new Vector2(0.0, 0.0);
        this.origin = new Vector2(0.0, 0.0);
    }


    public preload(): Array<PreloadAsset> {
        return [];
    }

    public postPreload(): void {

    }

    public draw(): void {

        //Renderer.CURRENT.drawSprite(this);
    }

    public debugDraw(): void {
        Renderer.CURRENT.drawRectangle(this.getRect(), Color.RED);
    }

    public update(elapsed: number): void {
    }

    public destroy(): void {

    }

    public updateHitbox(image: Graphic) {
        if (image === null) {
            return;
        }
        this.hitbox.x = Math.abs(image.width * this.scale.x);

        this.hitbox.y = Math.abs(image.height * this.scale.y);


        this.centerOrigin();
    }

    public centerOrigin() {
        this.origin.x = 0.5 * this.hitbox.x;
        this.origin.y = 0.5 * this.hitbox.y;
    }

    public screenCenter() {
        this.x = this.getScreenCenterX();
        this.y = this.getScreenCenterY();
    }

    // https://github.com/HaxeFlixel/flixel/blob/da667aec41eace769cd2360155809835c121ddb5/flixel/FlxSprite.hx#L720
    /**
     * Helper function to set the graphic's dimensions by using `scale`, allowing you to keep the current aspect ratio
     * should one of the numbers be `<= 0`. It might make sense to call `updateHitbox()` afterwards!
     *
     * @param   width    How wide the graphic should be. If `<= 0`, and `height` is set, the aspect ratio will be kept.
     * @param   height   How high the graphic should be. If `<= 0`, and `width` is set, the aspect ratio will be kept.
     */
    public setGraphicSize(image: Graphic, dimensions: Vector2) {
        if (dimensions.x <= 0 && dimensions.y <= 0)
            return;
        let newScaleX: number = dimensions.x / image.width;
        let newScaleY: number = dimensions.y / image.height;
        this.scale = { x: newScaleX, y: newScaleY };

        if (dimensions.x <= 0)
            this.scale.x = newScaleY;
        else if (dimensions.y <= 0)
            this.scale.y = newScaleX;

    }

    public getScreenCenterX() {
        return (Dimensions.GAME_WIDTH / 2) - (this.hitbox.x / 2);
    }


    public getScreenCenterY() {
        return (Dimensions.GAME_HEIGHT / 2) - (this.hitbox.y / 2);
    }

    public mouseOver(): boolean {
        let m = Input.MOUSE.currentData;
        return m.x >= this.x && m.x <= this.x + this.hitbox.x && m.y >= this.y && m.y <= this.y + this.hitbox.y;
    }


    public overlaps(sprite: Sprite) {
        // Check for overlap on the x-axis
        const xOverlap = this.x < (sprite.x + sprite.hitbox.x) && (this.x + this.hitbox.x) > sprite.x;

        // Check for overlap on the y-axis
        const yOverlap = this.y < (sprite.y + sprite.hitbox.y) && (this.y + this.hitbox.y) > sprite.y;

        // If both x and y axes overlap, the rectangles intersect
        return xOverlap && yOverlap;
    }


    public spriteCenter(to: Sprite, axis: Axes = Axes.XY): void {
        if (axis === Axes.XY) {
            this.x = to.x + (to.hitbox.x / 2) - (this.hitbox.x / 2);
            this.y = to.y + (to.hitbox.y / 2) - (this.hitbox.y / 2);
        }
        else if (axis === Axes.X)
            this.x = to.x + (to.hitbox.x / 2) - (this.hitbox.x / 2);
        else if (axis === Axes.Y)
            this.y = to.y + (to.hitbox.y / 2) - (this.hitbox.y / 2);
    }

    public getCenter(): Vector2 {
        return { x: this.x + this.hitbox.x / 2, y: this.y + this.hitbox.y / 2 };
    }

    set visible(b: Boolean) {
        // To ensure alpha data stays until hidden
        if (b && this.alpha > 0.0) {
            return;
        }
        this.alpha = b ? 1.0 : 0.0;
    }

    get visible() {
        return this.alpha > 0.0;
    }


    public setRect(rect: Rectangle): void {
        this.x = rect.x;
        this.y = rect.y;
        this.hitbox.x = rect.width;
        this.hitbox.y = rect.height;
    }

    public getRect(): Rectangle {
        return { x: this.x, y: this.y, width: this.hitbox.x, height: this.hitbox.y };
    }
}

export enum Axes {
    XY,
    X,
    Y
}