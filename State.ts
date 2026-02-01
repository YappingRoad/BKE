import { GameObject } from "./objects/GameObject";
import Destroyable from "./interfaces/Destroyable";
import Drawable from "./interfaces/Drawable";
import PreloadRequestable from "./interfaces/PreloadRequestable";
import Updatable from "./interfaces/Updatable";
import AssetLoader from "./registries/AssetLoader";
import SpriteGroup from "./SpriteGroup";
import Renderer from "./renderers/Renderer";

export default class State implements Drawable, Updatable, Destroyable {
    members: Array<GameObject>;

    public _preloaded = false;

    constructor() {
        this.members = [];
    }
    index: number = Number.MAX_SAFE_INTEGER;


    private i: number = 0;

    public add(object: GameObject) {
        this.members.push(object);
        if (this._preloaded && State.isPreloadRequestable(object)) {
            object.postPreload();
        }

        if (State.isDrawable(object)) {
            object.index = this.i;
        }
        this.i++;
    }

    remove(object: GameObject) {
        let i = this.members.indexOf(object);
        if (i != -1) {
            this.members.splice(i, 1);
        }
        this.i --;
    }

    preload() {
        this._preloaded = false;
        for (const member of this.members) {
            if (State.isPreloadRequestable(member)) {
                AssetLoader.addToQueue(member.preload());
            }
        }
        AssetLoader.preload(() => {
            this._preloaded = true;
            this.postPreload();
        });
    }

    postPreload() {
        for (const member of this.members) {
            if (State.isPreloadRequestable(member)) {
                if (member.postPreload != null) {
                    member.postPreload();
                }
            }
        }
    }

    public drawClear() {
        Renderer.CURRENT.clearCanvas();
    }

    public drawPaint() {
        Renderer.CURRENT.paintCanvas();
    }

    public draw(): void {
        this.drawClear();
        let drawables: Array<Drawable> = [];
        for (const member of this.members) {
            if (State.isDrawable(member)) {
                drawables.push(member);
            }
        }

        drawables.sort((a, b) => {
            return a.index - b.index;
        })

        for (const drawable of drawables) {
            drawable.draw();
        }

        this.drawPaint();
    }

    public update(elapsed: number): void {
        for (const member of this.members) {
            this.memberUpdate(elapsed, member);
        }
    }

    public pausedUpdate() { }

    public destroy(): void {
        for (const member of this.members) {
            if (State.isDestroyable(member)) {
                member.destroy();
            }
        }
        this.members = [];
    }

    protected memberUpdate(elapsed: number, member: GameObject) {
        if (State.isUpdatable(member)) {
            member.update(elapsed);
        }
    }

    static isDrawable(member: GameObject): member is Drawable {
        return (member as Drawable).draw !== undefined;
    }

    static isUpdatable(member: GameObject): member is Updatable {
        return (member as Updatable).update !== undefined;
    }

    static isPreloadRequestable(member: GameObject): member is PreloadRequestable {
        return (member as PreloadRequestable).preload !== undefined;
    }

    static isDestroyable(member: GameObject): member is Destroyable {
        return (member as Destroyable).destroy !== undefined;
    }
    static isSpriteGroup(member: GameObject): member is SpriteGroup {
        return (member as SpriteGroup).add !== undefined;
    }
} 